import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse request body
    const body = await request.json().catch(() => ({}));
    const { currentPassword, newPassword } = body;

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // 3. Verify current password securely
    if (currentPassword && user.email) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (signInError) {
        return NextResponse.json(
          { error: "Current password is incorrect." },
          { status: 400 }
        );
      }
    }

    // 4. Update password and turn OFF must_change_password flag in user_metadata
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
      data: {
        ...user.user_metadata,
        must_change_password: false,
      },
    });

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    // 5. Forcefully sign out of all other devices
    await supabase.auth.signOut({ scope: "others" });

    return NextResponse.json(
      { message: "Password updated successfully. Please log in again." },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/reset-password error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}