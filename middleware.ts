// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
  //   const redirectUrl = new URL('/login', req.url)
  //   return NextResponse.redirect(redirectUrl)
  // }

  return res
}

// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except:
//      * - /login
//      * - /api (API routes)
//      * - _next/static (static files)
//      * - _next/image (image optimization files)
//      * - favicon.ico
//      */
//     '/((?!api|_next/static|_next/image|favicon.ico|login).*)',
//   ],
// }

