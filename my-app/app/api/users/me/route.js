import { createClient, createAdminClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

// GET: /api/users/me
export async function GET() {
  try {
    // 1. Grab the standard client to extract the auto-sent cookie passport
    const supabase = await createClient()

    // Cryptographically decode the token to find out who "me" is
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // If the browser cookie is empty, expired, or tampered with, block them
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    // 2. Spin up the admin client to safely check their role assignment
    const supabaseAdmin = createAdminClient()

    const { data: roleMapping } = await supabaseAdmin
      .from('user_roles')
      .select('roles(name)')
      .eq('user_id', user.id)
      .maybeSingle()

    // 3. Extract the exact full_name as-is from raw_user_meta_data
    const fullName = user.user_metadata?.full_name || 'No Name Set'

    // 4. Construct the clean identity response profile
    const currentProfile = {
      userId: user.id,
      email: user.email,
      name: fullName,
      role: roleMapping?.roles?.name || 'staff'
    }

    return NextResponse.json({ data: currentProfile })

  } catch (globalError) {
    return NextResponse.json(
      { 
        error: 'Server processing error',
        details: globalError.message,
        stack: globalError.stack 
      },
      { status: 500 }
    )
  }
}