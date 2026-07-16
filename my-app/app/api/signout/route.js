import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
    const supabase = await createClient();

    console.log("[SIGNOUT] Attempting logout");

    const { data, error } = await supabase.auth.signOut({
        scope: "global",
    });

    console.log("[SIGNOUT] Result:", {
        data,
        error,
    });

    if (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }

    return NextResponse.json(
        { message: "Successfully signed out." },
        { status: 200 }
    );
}