import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function middleware(request) {
    // 🚧 TEMP DEV BYPASS — remove before merging.
    // Skips all auth checks when NEXT_PUBLIC_BYPASS_AUTH=true in .env
    if (process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true') {
        return NextResponse.next({ request: { headers: request.headers } })
    }

    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // 1. Initialize Supabase Client
    const supabase = createClient()

    // 2. Cryptographically extract the current authenticated session user
    const { data: { user } } = await supabase.auth.getUser()
    const currentPath = request.nextUrl.pathname

    // 3. Separate API endpoints from frontend Page files
    const isApiRequest = currentPath.startsWith('/api/')

    // 🔑 THE WHITELIST: Explicitly allow the login page and the login processing endpoint
    const isPublicRoute = currentPath === '/login' || currentPath === '/api/login' || currentPath === '/forms' || currentPath === '/' || currentPath === '/api/applicants' || currentPath === '/api/advisors/'  

    // 4. THE AUTHENTICATION SHIELD
    if (!user && !isPublicRoute) {

        // CASE A: It's an API route -> Kill it immediately with a 401 JSON status
        if (isApiRequest) {
            return NextResponse.json(
                { error: 'Unauthorized session token.' },
                { status: 401 }
            )
        }

        // CASE B: It's a frontend page view -> Redirect cleanly to /login
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('callbackUrl', currentPath)
        return NextResponse.redirect(loginUrl)
    }

    // Prevent logged-in users from manually navigating to the login page
    if (user && currentPath === '/login') {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return response
}

// 5. GLOBAL SHIELD CONFIGURATION
export const config = {
    /*
     * Matcher syntax protects absolutely everything by default EXCEPT:
     * - api/public/:path* (if you ever need to expose a completely public web-hook or API)
     * - static assets, text files, images, etc.
     */
    matcher: [
        '/((?!api/public|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}