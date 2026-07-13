// app/api/users/me/route.js
import { createClient, createAdminClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

// GET: /api/users/me
export async function GET() {
  try {
    // 1. Grab the standard client to extract the auto-sent cookie passport
    const supabase = createClient()

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
    // (This avoids having to maintain public read RLS policies on user_roles)
    const supabaseAdmin = createAdminClient()

    const { data: roleMapping } = await supabaseAdmin
      .from('user_roles')
      .select('roles(name)')
      .eq('user_id', user.id)
      .maybeSingle()

    // 3. Construct the clean identity response profile
    const currentProfile = {
      userId: user.id,
      email: user.email,
      name:
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        'No Name Set',
      role: roleMapping?.roles?.name || 'staff' // Default to baseline access if unassigned
    }

    return NextResponse.json({ data: currentProfile })

  } catch (globalError) {
    // CRITICAL DEBUGGING: Returns the raw error text string to your browser tab
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