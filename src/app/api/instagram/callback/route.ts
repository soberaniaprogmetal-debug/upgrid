import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { exchangeCodeForToken, getIGProfile } from '@/lib/instagram'
import { upsertAccount, initDb } from '@/lib/db'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(new URL('/dashboard?error=instagram_auth_failed', request.url))
  }

  try {
    await initDb()
    const tokenData = await exchangeCodeForToken(code)
    const profile = await getIGProfile(tokenData.access_token)

    await upsertAccount({
      userId: session.userId,
      instagramUserId: profile.id,
      username: profile.username,
      name: profile.name,
      accessToken: tokenData.access_token,
      profilePicture: profile.profile_picture_url,
      followersCount: profile.followers_count,
      followingCount: profile.follows_count,
      mediaCount: profile.media_count,
    })

    return NextResponse.redirect(new URL('/dashboard?success=instagram_connected', request.url))
  } catch (err) {
    console.error('Instagram callback error:', err)
    return NextResponse.redirect(new URL('/dashboard?error=instagram_connection_failed', request.url))
  }
}
