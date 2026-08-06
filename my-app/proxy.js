import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function proxy(request) {
    // 🚧 TEMP DEV BYPASS — remove before merging.
    if (process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true') {
        return NextResponse.next({ request: { headers: request.headers } })
    }

    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // 1. Initialize Supabase Client
    const supabase = await createClient()

    // 2. Cryptographically extract the current authenticated session user
    const { data: { user } } = await supabase.auth.getUser()
    const currentPath = request.nextUrl.pathname

    // 3. Separate API endpoints from frontend Page files
    const isApiRequest = currentPath.startsWith('/api/')

    // 🔑 THE WHITELIST: Public routes including reset password routes
    const isPublicRoute =
        currentPath === "/login" ||
        currentPath === "/api/login" ||
        currentPath === "/api/reset-password" ||
        currentPath === "/forms" ||
        currentPath === "/" ||
        (currentPath === "/api/applicants" && request.method === "POST") ||
        (currentPath === "/api/advisors" && request.method === "POST") ||
        currentPath === "/forms/applicants" ||
        currentPath === "/verify-account" ||
        (currentPath === "/api/verify-account" && request.method === "POST") ||
        currentPath === "/api/resend" ||
        currentPath === "/forms/advisors";

    // Read the reset password flag
    const mustChangePassword = Boolean(user?.user_metadata?.must_change_password)

    // 🔒 GUARD 1: Active session BUT must change password
    // Blocks them from accessing non-reset pages and APIs
    if (user && mustChangePassword) {
        const isAllowedResetRoute = 
            currentPath === "/reset-password" || 
            currentPath === "/api/reset-password"

        if (!isAllowedResetRoute) {
            if (isApiRequest) {
                return NextResponse.json(
                    { error: 'Password reset required before continuing.' },
                    { status: 403 }
                )
            }
            return NextResponse.redirect(new URL('/reset-password', request.url))
        }

        return response
    }

    // 🔒 GUARD 2: No active session trying to access a protected route
    if (!user && !isPublicRoute) {
        if (isApiRequest) {
            return NextResponse.json(
                { error: 'Unauthorized session token.' },
                { status: 401 }
            )
        }

        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('callbackUrl', currentPath)
        return NextResponse.redirect(loginUrl)
    }

    // Prevent fully authorized users (who don't need a reset) from manually visiting /login
    if (user && !mustChangePassword && currentPath === '/login') {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return response
}

// 5. GLOBAL SHIELD CONFIGURATION
export const config = {
    matcher: [
        '/((?!api/public|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}