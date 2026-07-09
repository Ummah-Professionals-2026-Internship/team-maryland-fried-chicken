export async function verifyAccess(currentPath, requireAdmin, routerReplace) {
  try {
    const res = await fetch('/api/users/me')

    // Scenario 1: Any non-200 status (unauthorized, session expired, or bad request)
    if (!res.ok) {
      routerReplace(`/login?callbackUrl=${encodeURIComponent(currentPath)}`)
      return
    }

    const { data: profile } = await res.json()

    // Scenario 2: Admin required but they are just staff
    if (requireAdmin && profile?.role !== 'admin') {
      routerReplace('/unauthorized')
      return
    }

    // Scenario 3: Everything is clean! Just exit out and let the component mount.
    return
  } catch {
    // Catch-all: Fallback to login if the fetch itself fails network resolution
    routerReplace(`/login?callbackUrl=${encodeURIComponent(currentPath)}`)
  }
}