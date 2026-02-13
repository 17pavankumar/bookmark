
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Verify the session was established
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const forwardedHost = request.headers.get('x-forwarded-host')
        const isLocalEnv = process.env.NODE_ENV === 'development'
        
        // Create redirect URL
        const redirectUrl = isLocalEnv 
          ? `${origin}${next}`
          : forwardedHost 
            ? `https://${forwardedHost}${next}`
            : `${origin}${next}`
        
        // Use NextResponse.redirect to ensure proper cookie handling
        const response = NextResponse.redirect(redirectUrl, {
          status: 303, // Use 303 See Other to force a GET request
        })
        
        return response
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
