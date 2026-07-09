// app/api/users/route.js
import { createClient, createAdminClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

// Security firewall check using the standard cookie-aware user client
async function verifyAdminStatus(supabaseAdmin) {
  const supabaseUser = createClient()

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

    const { data: { users: authUsers }, error: authError } =
      await supabaseAdmin.auth.admin.listUsers()

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
        name:
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          'No Name Set',
        role: match?.roles?.name || 'staff'
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
    const { data: usersData, error: usersError } =
      await supabaseAdmin.auth.admin.listUsers()

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

    // Create the user in Supabase Auth
    const { data: authData, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: name
        }
      })

    if (createError || !authData?.user) {
      return NextResponse.json(
        {
          error: createError?.message || 'Failed to create user.'
        },
        { status: 400 }
      )
    }

    // Get the selected role
    const { data: roleRow, error: roleError } = await supabaseAdmin
      .from('roles')
      .select('id')
      .eq('name', role)
      .single()

    if (roleError || !roleRow) {
      // Delete the auth user since role assignment failed
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)

      return NextResponse.json(
        { error: 'Role not found.' },
        { status: 400 }
      )
    }

    // Assign the role
    const { error: insertError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role_id: roleRow.id
      })

    if (insertError) {
      // Delete the auth user since role assignment failed
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)

      return NextResponse.json(
        { error: insertError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Account created successfully for ${email}`
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Server processing error.' },
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

    const { error: deleteError } =
      await supabaseAdmin.auth.admin.deleteUser(userId)

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Account completely purged'
    })

  } catch {
    return NextResponse.json(
      { error: 'Server processing error' },
      { status: 500 }
    )
  }
}