import { createAdminClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { sendVerificationEmail } from '@/utils/resend/resend'

export async function POST(request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required.' },
        { status: 400 }
      )
    }

    const supabaseAdmin = createAdminClient()

    // 1. Fetch users list to find the matching profile safely
    const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
    if (usersError) {
      return NextResponse.json({ error: usersError.message }, { status: 500 })
    }

    const user = usersData.users.find(
      u => u.email?.toLowerCase() === email.toLowerCase()
    )

    // Security practice: Return a fake success if user doesn't exist 
    // to prevent email enumeration attacks
    if (!user) {
      return NextResponse.json({ success: true, message: 'Verification email sent if account exists.' })
    }

    // 2. Do not resend if they are already verified
    if (user.email_confirmed_at) {
      return NextResponse.json(
        { error: 'This email is already verified. Please log in.' },
        { status: 400 }
      )
    }

    // 3. Resolve base configuration URL matching your POST logic
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const redirectUrl = `${baseUrl}/reset-password`

    // 4. Generate the fresh token link using 'signup'
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email: email,
      options: { redirectTo: redirectUrl }
    })

    if (linkError) {
      console.error('Error generating link:', linkError)
      return NextResponse.json({ error: linkError.message }, { status: 500 })
    }

    // 5. Dispatch email with your custom utility
    const tokenKey = linkData.properties.hashed_token
    const browserVerificationUrl = `${baseUrl}/verify-account?token=${tokenKey}&email=${encodeURIComponent(email)}`
    const name = user.user_metadata?.full_name || user.user_metadata?.name || 'User'

    await sendVerificationEmail(email, name, browserVerificationUrl)

    return NextResponse.json({ success: true, message: 'Verification email sent successfully.' })

  } catch (error) {
    console.error('Resend process error:', error)
    return NextResponse.json(
      { error: error.message || 'Server processing error.' },
      { status: 500 }
    )
  }
}
