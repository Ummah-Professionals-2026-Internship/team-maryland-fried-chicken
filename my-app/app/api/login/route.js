// app/api/login/route.js
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

// This function runs when the frontend sends an HTTP POST request
export async function POST(request) {
  // 1. Wake up and build our temporary, cookie-aware connection tool
  const supabase = createClient()



  try {

    
    // 2. Read the email and password sent over by the frontend fetch request
    const { email, password } = await request.json()
    // 3. If either is missing, send back a 400 error message
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      )
    }

    // 4. Ask Supabase Auth to verify the credentials
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    // 5. If Supabase says "No match!", send back a 400 error message
    if (error) {
      return NextResponse.json({ error: error.message + "112" }, { status: 400 })
    }

    // 6. If successful, return a clean message. 
    // (The connection tool handles saving the session cookie to the browser automatically!)
    return NextResponse.json({ message: 'Authenticated successfully!' }, { status: 200 })

  } catch (err) {
    // 7. Catch-all safety net in case something breaks completely
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}