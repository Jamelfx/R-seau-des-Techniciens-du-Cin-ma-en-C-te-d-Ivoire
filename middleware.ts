import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Simple middleware that just passes through
  // Supabase session handling is done in the pages themselves
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
