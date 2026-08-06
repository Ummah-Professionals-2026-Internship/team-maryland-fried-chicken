import { createClient, createAdminClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { sendVerificationEmail } from '@/utils/resend/resend'

// Security firewall check using the standard cookie-aware user client
async function verifyAdminStatus(supabaseAdmin) {
  const supabaseUser = await createClient()
  const { data: { user }, error: authError } = await supabaseUser.auth.getUser()
  if (authError || !user) return false

  const { data: mapping } = await supabaseAdmin
    .from('user_roles')
    .select('roles(name)')
    .eq('user_id', user.id)
    .single()

  return mapping?.roles?.name === 'admin'
}

// GET ALL USERS (Admin Only)
export async function GET() {
  try {
    const supabaseAdmin = createAdminClient()
    const isAdmin = await verifyAdminStatus(supabaseAdmin)

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden. Admins only.' },
        { status: 403 }
      )
    }

    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select(`
        user_id,
        roles ( name )
      `)

    if (roleError) {
      return NextResponse.json(
        { error: roleError.message },
        { status: 400 }
      )
    }

    const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    const mappings = authUsers.map(user => {
      const match = roleData.find(row => row.user_id === user.id)
      return {
        userId: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name || 'No Name Set',
        role: match?.roles?.name || 'staff',
        isVerified: Boolean(user.email_confirmed_at)
      }
    })

    return NextResponse.json({ data: mappings })

  } catch {
    return NextResponse.json(
      { error: 'Server processing error' },
      { status: 500 }
    )
  }
}

// CREATE A BRAND NEW USER AND ASSIGN THEIR SYSTEM ROLE (Admin Only)
export async function POST(request) {
  try {
    const supabaseAdmin = createAdminClient()
    const isAuthorized = await verifyAdminStatus(supabaseAdmin)

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Forbidden. Admins only.' },
        { status: 403 }
      )
    }

    const { name, email, password, role } = await request.json()

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields.' },
        { status: 400 }
      )
    }

    // Check if an account with this email already exists
    const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
    if (usersError) {
      return NextResponse.json(
        { error: usersError.message },
        { status: 500 }
      )
    }

    const emailExists = usersData.users.some(
      user => user.email?.toLowerCase() === email.toLowerCase()
    )
    if (emailExists) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 400 }
      )
    }

    // 1. Create the unverified user (email_confirm: false keeps email_confirmed_at null)
    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: { full_name: name }
    })
    if (createError) throw createError

    // ✨ VERCEL DYNAMIC ENVIRONMENT URL RESOLVER:
    // Priority 1: Manual Production/Staging Env variable
    // Priority 2: Vercel automated system deployment domain (manually prefixing https:// host requirement)
    // Priority 3: Localhost fallback
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
      ? `https://${process.env.NEXT_PUBLIC_APP_URL}`
      : 'http://localhost:3000';


    // 2. Generate the verification link pointing to the password reset endpoint fallback target
    const redirectUrl = `${baseUrl}/reset-password`

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email: email,
      password: password,
      options: { redirectTo: redirectUrl }
    })

    if (linkError) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      console.error('Error generating verification link:', linkError)
      return NextResponse.json({ error: linkError.message }, { status: 500 })
    }

    // 3. Dispatch your custom service function with completely dynamic link targets
    try {
      const tokenKey = linkData.properties.hashed_token

      // The email button link is now generated completely dynamically relative to the environment platform host
      const browserVerificationUrl = `${baseUrl}/verify-account?token=${tokenKey}&email=${encodeURIComponent(email)}`

      await sendVerificationEmail(email, name, browserVerificationUrl)
    } catch (emailError) {
      // Safe rollback if email dispatch fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      console.error('Error sending verification email:', emailError)
      return NextResponse.json({ error: `Email failed to send: ${emailError.message}` }, { status: 500 })
    }

    // 4. Get the selected role
    const { data: roleRow, error: roleError } = await supabaseAdmin
      .from('roles')
      .select('id')
      .eq('name', role)
      .single()

    if (roleError || !roleRow) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: 'Role not found.' },
        { status: 400 }
      )
    }

    // 5. Assign the role
    const { error: insertError } = await supabaseAdmin
      .from('user_roles')
      .insert({ user_id: authData.user.id, role_id: roleRow.id })

    if (insertError) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: insertError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, message: `Account created successfully for ${email}` })

  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Server processing error.' },
      { status: 500 }
    )
  }
}

// DELETE USER COMPLETELY (Admin Only)
export async function DELETE(request) {
  try {
    const supabaseAdmin = createAdminClient()
    const isAuthorized = await verifyAdminStatus(supabaseAdmin)

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Forbidden. Admins only.' },
        { status: 403 }
      )
    }

    const { userId } = await request.json()
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing target userId' },
        { status: 400 }
      )
    }

    const { error: roleDeleteError } = await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', userId)

    if (roleDeleteError) {
      return NextResponse.json(
        { error: roleDeleteError.message },
        { status: 400 }
      )
    }

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, message: 'Account completely purged' })

  } catch {
    return NextResponse.json(
      { error: 'Server processing error' },
      { status: 500 }
    )
  }
}
