// Integração com Meta Graph API para Instagram
const GRAPH_API_BASE = 'https://graph.facebook.com/v19.0'

export interface IGMedia {
  id: string
  caption?: string
  media_type: string
  media_url?: string
  thumbnail_url?: string
  permalink: string
  timestamp: string
  like_count?: number
  comments_count?: number
}

export interface IGProfile {
  id: string
  username: string
  name: string
  biography?: string
  profile_picture_url?: string
  followers_count?: number
  follows_count?: number
  media_count?: number
}

// Busca perfil do usuário Instagram
export async function getIGProfile(accessToken: string): Promise<IGProfile> {
  const res = await fetch(
    `${GRAPH_API_BASE}/me?fields=id,username,name,biography,profile_picture_url,followers_count,follows_count,media_count&access_token=${accessToken}`
  )
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error?.message || 'Erro ao buscar perfil')
  }
  return res.json()
}

// Busca posts do usuário
export async function getIGMedia(
  igUserId: string,
  accessToken: string,
  limit = 12
): Promise<{ data: IGMedia[]; paging?: { cursors: { after: string; before: string }; next?: string } }> {
  const fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count'
  const res = await fetch(
    `${GRAPH_API_BASE}/${igUserId}/media?fields=${fields}&limit=${limit}&access_token=${accessToken}`
  )
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error?.message || 'Erro ao buscar mídia')
  }
  return res.json()
}

// Cria container de mídia (passo 1 de publicação)
export async function createMediaContainer(
  igUserId: string,
  accessToken: string,
  params: {
    imageUrl?: string
    videoUrl?: string
    caption?: string
    mediaType?: 'IMAGE' | 'VIDEO' | 'REELS'
  }
): Promise<string> {
  const body: Record<string, string> = {
    access_token: accessToken,
    caption: params.caption || '',
  }

  if (params.mediaType === 'VIDEO' || params.mediaType === 'REELS') {
    body.media_type = params.mediaType
    body.video_url = params.videoUrl || ''
  } else {
    body.image_url = params.imageUrl || ''
  }

  const res = await fetch(`${GRAPH_API_BASE}/${igUserId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || 'Erro ao criar container de mídia')
  return data.id
}

// Publica o container criado (passo 2)
export async function publishMediaContainer(
  igUserId: string,
  accessToken: string,
  creationId: string
): Promise<string> {
  const res = await fetch(`${GRAPH_API_BASE}/${igUserId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ creation_id: creationId, access_token: accessToken }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || 'Erro ao publicar mídia')
  return data.id
}

// Gera URL de autorização OAuth do Instagram
export function getInstagramAuthUrl(): string {
  const appId = process.env.INSTAGRAM_APP_ID
  const redirectUri = encodeURIComponent(process.env.INSTAGRAM_REDIRECT_URI || '')
  const scope = 'instagram_basic,instagram_content_publish,instagram_manage_insights,pages_show_list,pages_read_engagement'
  return `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`
}

// Troca código por access token
export async function exchangeCodeForToken(code: string): Promise<{
  access_token: string
  token_type: string
}> {
  const params = new URLSearchParams({
    client_id: process.env.INSTAGRAM_APP_ID || '',
    client_secret: process.env.INSTAGRAM_APP_SECRET || '',
    redirect_uri: process.env.INSTAGRAM_REDIRECT_URI || '',
    code,
    grant_type: 'authorization_code',
  })

  const res = await fetch(`${GRAPH_API_BASE}/oauth/access_token`, {
    method: 'POST',
    body: params,
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || 'Erro ao trocar código por token')
  return data
}

// Busca insights (métricas) de uma mídia
export async function getMediaInsights(
  mediaId: string,
  accessToken: string
): Promise<{ name: string; value: number }[]> {
  const metrics = 'engagement,impressions,reach,saved'
  const res = await fetch(
    `${GRAPH_API_BASE}/${mediaId}/insights?metric=${metrics}&access_token=${accessToken}`
  )
  const data = await res.json()
  if (!res.ok) return []
  return data.data || []
}
