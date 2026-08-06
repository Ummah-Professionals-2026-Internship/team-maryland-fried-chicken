import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // 1. Get authenticated user session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Query user_roles -> roles join tables
    const { data: userRolesData, error: roleError } = await supabase
      .from("user_roles")
      .select(`
        role_id,
        roles (
          name
        )
      `)
      .eq("user_id", user.id)
      .single();

    if (roleError) {
      console.error("Error fetching user role:", roleError);
    }

    // Extract role name (e.g. 'admin' or 'staff') or fallback to 'user'
    // Handles single object return or nested array from relational query
    const roleObj = Array.isArray(userRolesData?.roles)
      ? userRolesData?.roles[0]
      : userRolesData?.roles;
      
    const userRole = roleObj?.name || "user";

    return NextResponse.json(
      {
        data: {
          userId: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.user_metadata?.name || "No Name Set",
          role: userRole,
          isVerified: user.email_confirmed_at ? true : false,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/users/me error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile details." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { name } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Name cannot be left blank." },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters long." },
        { status: 400 }
      );
    }

    // Update name in Supabase user metadata
    const { error: updateAuthError } = await supabase.auth.updateUser({
      data: { full_name: trimmedName, name: trimmedName },
    });

    if (updateAuthError) {
      return NextResponse.json(
        { error: updateAuthError.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Name updated successfully.", data: { name: trimmedName } },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH /api/users/me error:", error);
    return NextResponse.json(
      { error: "Failed to update profile name." },
      { status: 500 }
    );
  }
}