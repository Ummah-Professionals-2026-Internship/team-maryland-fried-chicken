import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { token, email } = await request.json()

    if (!token || !email) {
      return NextResponse.json(
        { error: 'Missing token or email parameters.' },
        { status: 400 }
      )
    }

    // Initialize your standard cookie-aware Supabase server client
    const supabase = await createClient()

    // Execute the verifyOtp check on the server
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'signup'
    })

    if (error) {
      console.error('Server-side verifyOtp failure:', error.message)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Success! The server client automatically attaches the Set-Cookie headers to this response
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Internal server crash in verification route:', error)
    return NextResponse.json(
      { error: 'Internal server error during verification.' },
      { status: 500 }
    )
  }
}
