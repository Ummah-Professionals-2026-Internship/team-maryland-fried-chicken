// app/api/login/route.js
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient()
  
  // Use signUp instead of auth.admin.createUser
  const { data, error } = await supabase.auth.signUp({
    email: 'interns.ummah.professional@gmail.com',
    password: 'interns_UP_12',
    options: {
      // Passes your custom admin role flag cleanly inside app_metadata
      appMetadata: {
        role: 'admin',
      }
    }
  })

  if (error) {
    console.error('❌ Error creating admin:', error.message)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  console.log('✅ Admin created successfully!')
  return NextResponse.json({ 
    message: 'Admin account created!', 
    userId: data.user?.id 
  })
}