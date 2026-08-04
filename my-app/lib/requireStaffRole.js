import {
  createAdminClient,
  createClient,
} from "@/utils/supabase/server";

const ALLOWED_ROLES = new Set(["admin", "staff"]);

export async function requireAdminOrStaff() {
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.NEXT_PUBLIC_BYPASS_AUTH === "true"
  ) {
    return {
      admin: createAdminClient(),
      role: "development",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      error: "Unauthorized. Please log in.",
      status: 401,
    };
  }

  const admin = createAdminClient();

  const { data: roleMapping, error: roleError } =
    await admin
      .from("user_roles")
      .select("roles(name)")
      .eq("user_id", user.id)
      .maybeSingle();

  if (roleError) {
    return {
      error: roleError.message,
      status: 500,
    };
  }

  const relation = Array.isArray(roleMapping?.roles)
    ? roleMapping.roles[0]
    : roleMapping?.roles;

  const role = relation?.name ?? null;

  if (!role || !ALLOWED_ROLES.has(role)) {
    return {
      error: "Only administrators and staff can delete records.",
      status: 403,
    };
  }

  return {
    admin,
    role,
    user,
  };
}