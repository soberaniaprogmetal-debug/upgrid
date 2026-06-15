'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, Clock, Plus } from 'lucide-react'

interface Post {
  id: string
  caption: string
  status: string
  scheduledAt?: string
  createdAt: string
}

export default function SchedulePage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/posts')
      .then(r => r.json())
      .then(data => {
        const scheduled = (data.posts || []).filter((p: Post) => p.status === 'scheduled' && p.scheduledAt)
        scheduled.sort((a: Post, b: Post) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime())
        setPosts(scheduled)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-pink-500 border-t-transparent" />
      </div>
    )
  }

  // Agrupar por data
  const grouped: Record<string, Post[]> = {}
  posts.forEach(post => {
    if (!post.scheduledAt) return
    const date = new Date(post.scheduledAt).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
    if (!grouped[date]) grouped[date] = []
    grouped[date].push(post)
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Agendamentos</h1>
          <p className="text-gray-400 text-sm mt-1">{posts.length} posts agendados</p>
        </div>
        <Link
          href="/dashboard/posts/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl instagram-gradient text-white font-medium text-sm hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Agendar post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl">
          <div className="inline-flex p-4 rounded-2xl bg-white/5 mb-4">
            <Calendar size={32} className="text-gray-500" />
          </div>
          <p className="text-gray-400 mb-2">Nenhum post agendado</p>
          <p className="text-gray-500 text-sm mb-4">Agende publicações para manter consistência no feed</p>
          <Link
            href="/dashboard/posts/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl instagram-gradient text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus size={14} />
            Agendar post
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, datePosts]) => (
            <div key={date}>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 capitalize">{date}</h2>
              <div className="space-y-3">
                {datePosts.map(post => (
                  <div key={post.id} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl card-hover">
                    <div className="flex-shrink-0 w-12 text-center">
                      <p className="text-pink-400 font-bold text-lg leading-none">
                        {new Date(post.scheduledAt!).getHours().toString().padStart(2, '0')}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {new Date(post.scheduledAt!).getMinutes().toString().padStart(2, '0')}h
                      </p>
                    </div>
                    <div className="w-px h-10 bg-white/10" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{post.caption || '(sem legenda)'}</p>
                      <span className="inline-flex items-center gap-1 mt-1 text-xs text-blue-400">
                        <Clock size={10} />
                        Agendado
                      </span>
                    </div>
                    <Link
                      href={`/dashboard/posts/${post.id}/edit`}
                      className="px-3 py-1.5 rounded-lg border border-white/20 text-gray-400 hover:text-white text-xs transition-all"
                    >
                      Editar
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
