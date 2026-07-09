// app/api/users/[id]/route.js
import { createClient, createAdminClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

// Security firewall check using the standard cookie-aware user client
async function verifyAdminStatus(supabaseAdmin) {
  const supabaseUser = createClient()

  const {
    data: { user },
    error: authError
  } = await supabaseUser.auth.getUser()

  if (authError || !user) return false

  const { data: mapping } = await supabaseAdmin
    .from('user_roles')
    .select('roles(name)')
    .eq('user_id', user.id)
    .single()

  return mapping?.roles?.name === 'admin'
}


// 1. GET: FETCH A SINGLE USER'S EXPANDED DETAILS (Admin Only)
export async function GET(request, { params }) {
  try {
    const supabaseAdmin = createAdminClient()

    const isAdmin = await verifyAdminStatus(supabaseAdmin)

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden. Admins only.' },
        { status: 403 }
      )
    }

    const { id: userId } = await params

    // Fetch auth identity
    const {
      data: authUser,
      error: authError
    } = await supabaseAdmin.auth.admin.getUserById(userId)

    if (authError || !authUser?.user) {
      return NextResponse.json(
        { error: 'User account not found.' },
        { status: 404 }
      )
    }

    // Fetch role assignment
    const { data: roleMapping } = await supabaseAdmin
      .from('user_roles')
      .select('roles(name)')
      .eq('user_id', userId)
      .maybeSingle()

    const userDetail = {
      userId: authUser.user.id,
      email: authUser.user.email,
      name:
        authUser.user.user_metadata?.full_name ||
        authUser.user.user_metadata?.name ||
        'No Name Set',
      role: roleMapping?.roles?.name || 'No Role Assigned',
      createdAt: authUser.user.created_at,
      lastSignIn: authUser.user.last_sign_in_at,
      confirmed: Boolean(authUser.user.email_confirmed_at)
    }

    return NextResponse.json({ data: userDetail })

  } catch {
    return NextResponse.json(
      { error: 'Server processing error' },
      { status: 500 }
    )
  }
}


// 2. PATCH: MODIFY USER ROLE (Admin Only)
export async function PATCH(request, { params }) {
  try {
    const supabaseAdmin = createAdminClient()

    const isAuthorized = await verifyAdminStatus(supabaseAdmin)

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Forbidden. Admins only.' },
        { status: 403 }
      )
    }

    const { id: userId } = await params

    const { roleName } = await request.json()

    if (!roleName) {
      return NextResponse.json(
        { error: 'Missing roleName parameter' },
        { status: 400 }
      )
    }


    // Convert role name to role id
    const {
      data: roleRow,
      error: roleError
    } = await supabaseAdmin
      .from('roles')
      .select('id')
      .eq('name', roleName)
      .single()


    if (roleError || !roleRow) {
      return NextResponse.json(
        { error: 'Role lookup failed' },
        { status: 400 }
      )
    }


    // Update existing role assignment only
    const {
      data,
      error: updateError
    } = await supabaseAdmin
      .from('user_roles')
      .update({
        role_id: roleRow.id
      })
      .eq('user_id', userId)
      .select()


    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      )
    }


    if (!data || data.length === 0) {
      return NextResponse.json(
        {
          error:
            'User does not have an existing role assignment. Use POST first.'
        },
        { status: 404 }
      )
    }


    return NextResponse.json({
      success: true,
      message: `Access role changed to ${roleName}`
    })


  } catch {
    return NextResponse.json(
      { error: 'Server processing error' },
      { status: 500 }
    )
  }
}


// 3. DELETE: PURGE USER ACCOUNT COMPLETELY (Admin Only)
export async function DELETE(request, { params }) {
  try {
    const supabaseAdmin = createAdminClient()

    const isAuthorized = await verifyAdminStatus(supabaseAdmin)

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Forbidden. Admins only.' },
        { status: 403 }
      )
    }


    const { id: userId } = await params


    // Prevent admin from deleting themselves
    const supabaseUser = createClient()

    const {
      data: { user: currentUser }
    } = await supabaseUser.auth.getUser()


    if (currentUser?.id === userId) {
      return NextResponse.json(
        { error: 'You cannot delete your own admin account.' },
        { status: 400 }
      )
    }


    // Verify user exists
    const {
      data: targetUser,
      error: userError
    } = await supabaseAdmin.auth.admin.getUserById(userId)


    if (userError || !targetUser?.user) {
      return NextResponse.json(
        { error: 'User account not found.' },
        { status: 404 }
      )
    }


    // Remove relational role mapping first
    const {
      error: roleDeleteError
    } = await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', userId)


    if (roleDeleteError) {
      return NextResponse.json(
        { error: roleDeleteError.message },
        { status: 400 }
      )
    }


    // Remove authentication account
    const {
      error: deleteError
    } = await supabaseAdmin.auth.admin.deleteUser(userId)


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