import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // Create a confirmed user so email verification isn't required for demo/development.
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

    if (authError) {
      if (authError.message.includes("already registered")) {
        return NextResponse.json({ error: "Email already registered" }, { status: 409 });
      }
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    const userId = authData.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "User creation failed" }, { status: 500 });
    }

    // Insert the app-level profile with default role.
    const { error: profileError } = await supabaseAdmin
      .from("users")
      .insert({ id: userId, email, name, role: "staff" });

    if (profileError) {
      // Rollback auth user if profile insert fails.
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    return NextResponse.json({ id: userId, name, email });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Registration failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
