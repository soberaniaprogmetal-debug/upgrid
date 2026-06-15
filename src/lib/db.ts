// Banco de dados PostgreSQL via Neon (serverless)
import { neon } from '@neondatabase/serverless'
import bcrypt from 'bcryptjs'

function getDb() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL não configurada')
  return neon(url)
}

export interface User {
  id: string
  name: string
  email: string
  passwordHash: string
  createdAt: string
}

export interface Post {
  id: string
  userId: string
  accountId: string
  caption: string
  mediaUrl?: string
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  status: 'draft' | 'scheduled' | 'published' | 'failed'
  scheduledAt?: string
  publishedAt?: string
  instagramPostId?: string
  likes?: number
  comments?: number
  createdAt: string
}

export interface InstagramAccount {
  id: string
  userId: string
  instagramUserId: string
  username: string
  name: string
  accessToken: string
  profilePicture?: string
  followersCount?: number
  followingCount?: number
  mediaCount?: number
  connectedAt: string
}

// Inicializa as tabelas se não existirem
export async function initDb() {
  const sql = getDb()
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      account_id TEXT NOT NULL,
      caption TEXT DEFAULT '',
      media_url TEXT,
      media_type TEXT DEFAULT 'IMAGE',
      status TEXT DEFAULT 'draft',
      scheduled_at TIMESTAMPTZ,
      published_at TIMESTAMPTZ,
      instagram_post_id TEXT,
      likes INTEGER DEFAULT 0,
      comments INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS instagram_accounts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      instagram_user_id TEXT NOT NULL,
      username TEXT NOT NULL,
      name TEXT NOT NULL,
      access_token TEXT NOT NULL,
      profile_picture TEXT,
      followers_count INTEGER DEFAULT 0,
      following_count INTEGER DEFAULT 0,
      media_count INTEGER DEFAULT 0,
      connected_at TIMESTAMPTZ DEFAULT NOW()
    )
  `
}

// --- USERS ---
export async function findUserByEmail(email: string): Promise<User | undefined> {
  const sql = getDb()
  const rows = await sql`SELECT * FROM users WHERE email = ${email.toLowerCase()} LIMIT 1`
  if (!rows[0]) return undefined
  const r = rows[0]
  return { id: r.id, name: r.name, email: r.email, passwordHash: r.password_hash, createdAt: r.created_at }
}

export async function findUserById(id: string): Promise<User | undefined> {
  const sql = getDb()
  const rows = await sql`SELECT * FROM users WHERE id = ${id} LIMIT 1`
  if (!rows[0]) return undefined
  const r = rows[0]
  return { id: r.id, name: r.name, email: r.email, passwordHash: r.password_hash, createdAt: r.created_at }
}

export async function createUser(name: string, email: string, password: string): Promise<User> {
  const sql = getDb()
  const existing = await findUserByEmail(email)
  if (existing) throw new Error('Email já cadastrado')

  const passwordHash = await bcrypt.hash(password, 12)
  const id = `user_${Date.now()}_${Math.random().toString(36).slice(2)}`
  await sql`
    INSERT INTO users (id, name, email, password_hash)
    VALUES (${id}, ${name.trim()}, ${email.toLowerCase().trim()}, ${passwordHash})
  `
  return { id, name: name.trim(), email: email.toLowerCase().trim(), passwordHash, createdAt: new Date().toISOString() }
}

export async function validateUser(email: string, password: string): Promise<User | null> {
  const user = await findUserByEmail(email)
  if (!user) return null
  const valid = await bcrypt.compare(password, user.passwordHash)
  return valid ? user : null
}

// --- POSTS ---
export async function getPostsByUser(userId: string): Promise<Post[]> {
  const sql = getDb()
  const rows = await sql`SELECT * FROM posts WHERE user_id = ${userId} ORDER BY created_at DESC`
  return rows.map(r => ({
    id: r.id, userId: r.user_id, accountId: r.account_id,
    caption: r.caption, mediaUrl: r.media_url, mediaType: r.media_type,
    status: r.status, scheduledAt: r.scheduled_at, publishedAt: r.published_at,
    instagramPostId: r.instagram_post_id, likes: r.likes, comments: r.comments,
    createdAt: r.created_at,
  }))
}

export async function getPostById(id: string): Promise<Post | undefined> {
  const sql = getDb()
  const rows = await sql`SELECT * FROM posts WHERE id = ${id} LIMIT 1`
  if (!rows[0]) return undefined
  const r = rows[0]
  return {
    id: r.id, userId: r.user_id, accountId: r.account_id,
    caption: r.caption, mediaUrl: r.media_url, mediaType: r.media_type,
    status: r.status, scheduledAt: r.scheduled_at, publishedAt: r.published_at,
    instagramPostId: r.instagram_post_id, likes: r.likes, comments: r.comments,
    createdAt: r.created_at,
  }
}

export async function createPost(data: Omit<Post, 'id' | 'createdAt'>): Promise<Post> {
  const sql = getDb()
  const id = `post_${Date.now()}_${Math.random().toString(36).slice(2)}`
  await sql`
    INSERT INTO posts (id, user_id, account_id, caption, media_url, media_type, status, scheduled_at)
    VALUES (
      ${id}, ${data.userId}, ${data.accountId}, ${data.caption || ''},
      ${data.mediaUrl || null}, ${data.mediaType || 'IMAGE'}, ${data.status || 'draft'},
      ${data.scheduledAt || null}
    )
  `
  return { ...data, id, createdAt: new Date().toISOString() }
}

export async function updatePost(id: string, data: Partial<Post>): Promise<Post | null> {
  const sql = getDb()
  await sql`
    UPDATE posts SET
      caption = COALESCE(${data.caption ?? null}, caption),
      media_url = COALESCE(${data.mediaUrl ?? null}, media_url),
      status = COALESCE(${data.status ?? null}, status),
      scheduled_at = COALESCE(${data.scheduledAt ?? null}, scheduled_at),
      published_at = COALESCE(${data.publishedAt ?? null}, published_at),
      likes = COALESCE(${data.likes ?? null}, likes),
      comments = COALESCE(${data.comments ?? null}, comments)
    WHERE id = ${id}
  `
  return getPostById(id) ?? null
}

export async function deletePost(id: string): Promise<boolean> {
  const sql = getDb()
  await sql`DELETE FROM posts WHERE id = ${id}`
  return true
}

// --- INSTAGRAM ACCOUNTS ---
export async function getAccountsByUser(userId: string): Promise<InstagramAccount[]> {
  const sql = getDb()
  const rows = await sql`SELECT * FROM instagram_accounts WHERE user_id = ${userId}`
  return rows.map(r => ({
    id: r.id, userId: r.user_id, instagramUserId: r.instagram_user_id,
    username: r.username, name: r.name, accessToken: r.access_token,
    profilePicture: r.profile_picture, followersCount: r.followers_count,
    followingCount: r.following_count, mediaCount: r.media_count,
    connectedAt: r.connected_at,
  }))
}

export async function upsertAccount(data: Omit<InstagramAccount, 'id' | 'connectedAt'>): Promise<InstagramAccount> {
  const sql = getDb()
  const existing = await sql`
    SELECT * FROM instagram_accounts
    WHERE user_id = ${data.userId} AND instagram_user_id = ${data.instagramUserId}
    LIMIT 1
  `

  if (existing[0]) {
    await sql`
      UPDATE instagram_accounts SET
        username = ${data.username}, name = ${data.name},
        access_token = ${data.accessToken},
        profile_picture = ${data.profilePicture || null},
        followers_count = ${data.followersCount || 0},
        following_count = ${data.followingCount || 0},
        media_count = ${data.mediaCount || 0}
      WHERE id = ${existing[0].id}
    `
    return { ...data, id: existing[0].id, connectedAt: existing[0].connected_at }
  }

  const id = `acc_${Date.now()}_${Math.random().toString(36).slice(2)}`
  await sql`
    INSERT INTO instagram_accounts
      (id, user_id, instagram_user_id, username, name, access_token, profile_picture, followers_count, following_count, media_count)
    VALUES
      (${id}, ${data.userId}, ${data.instagramUserId}, ${data.username}, ${data.name},
       ${data.accessToken}, ${data.profilePicture || null}, ${data.followersCount || 0},
       ${data.followingCount || 0}, ${data.mediaCount || 0})
  `
  return { ...data, id, connectedAt: new Date().toISOString() }
}
