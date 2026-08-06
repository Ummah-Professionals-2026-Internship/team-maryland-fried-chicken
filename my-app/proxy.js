import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function proxy(request) {
    if (process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true') {
        return NextResponse.next({ request: { headers: request.headers } })
    }

    let response = NextResponse.next({
        request: { headers: request.headers },
    })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const currentPath = request.nextUrl.pathname
    const isApiRequest = currentPath.startsWith('/api/')

    // 🔑 THE WHITELIST: All routes accessible to logged-out users or users browsing public info
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

    const mustChangePassword = Boolean(user?.user_metadata?.must_change_password)

    // 🔒 GUARD 1: LIMBO HANDLING (User has a session but hasn't updated credentials)
    if (user && mustChangePassword) {
        const isAllowedResetRoute = 
            currentPath === "/reset-password" || 
            currentPath === "/api/reset-password" ||
            currentPath === "/api/signout"

        // If they try to leave public areas/forms and attempt to view full internal protected app pages:
        if (!isPublicRoute && !isAllowedResetRoute) {
            if (isApiRequest) {
                return NextResponse.json(
                    { error: 'Password reset required before continuing.' },
                    { status: 403 }
                )
            }

            // Route back safely to password reset view, clearing URL parameters
            const cleanResetUrl = new URL('/reset-password', request.url)
            cleanResetUrl.search = '' 
            return NextResponse.redirect(cleanResetUrl)
        }

        return response
    }

    // 🔒 GUARD 2: PROTECTED ROUTES (Logged out users trying to peek inside)
    if (!user && !isPublicRoute) {
        if (isApiRequest) {
            return NextResponse.json({ error: 'Unauthorized session token.' }, { status: 401 })
        }

        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('callbackUrl', currentPath)
        return NextResponse.redirect(loginUrl)
    }

    // Fully authenticated users who do not need a password change should not view the login screen
    if (user && !mustChangePassword && currentPath === '/login') {
        const cleanHomeUrl = new URL('/', request.url)
        cleanHomeUrl.search = '' 
        return NextResponse.redirect(cleanHomeUrl)
    }

    return response
}

export const config = {
    matcher: [
        '/((?!api/public|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}