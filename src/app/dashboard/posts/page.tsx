'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Plus, Trash2, Edit, Image, FileText, Clock, CheckCircle, XCircle } from 'lucide-react'

interface Post {
  id: string
  caption: string
  mediaUrl?: string
  mediaType: string
  status: string
  scheduledAt?: string
  publishedAt?: string
  createdAt: string
}

const statusConfig: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  draft: { label: 'Rascunho', icon: FileText, className: 'bg-gray-500/20 text-gray-400' },
  scheduled: { label: 'Agendado', icon: Clock, className: 'bg-blue-500/20 text-blue-400' },
  published: { label: 'Publicado', icon: CheckCircle, className: 'bg-green-500/20 text-green-400' },
  failed: { label: 'Falhou', icon: XCircle, className: 'bg-red-500/20 text-red-400' },
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetch('/api/posts')
      .then(r => r.json())
      .then(data => setPosts(data.posts || []))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Remover este post?')) return
    const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setPosts(posts.filter(p => p.id !== id))
      toast.success('Post removido')
    } else {
      toast.error('Erro ao remover post')
    }
  }

  const filtered = filter === 'all' ? posts : posts.filter(p => p.status === filter)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-pink-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Publicações</h1>
          <p className="text-gray-400 text-sm mt-1">{posts.length} posts no total</p>
        </div>
        <Link
          href="/dashboard/posts/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl instagram-gradient text-white font-medium text-sm hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Novo post
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'Todos' },
          { key: 'draft', label: 'Rascunhos' },
          { key: 'scheduled', label: 'Agendados' },
          { key: 'published', label: 'Publicados' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === key
                ? 'instagram-gradient text-white'
                : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl">
          <div className="inline-flex p-4 rounded-2xl bg-white/5 mb-4">
            <FileText size={32} className="text-gray-500" />
          </div>
          <p className="text-gray-400 mb-2">Nenhum post encontrado</p>
          <Link
            href="/dashboard/posts/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl instagram-gradient text-white text-sm font-medium hover:opacity-90 transition-opacity mt-2"
          >
            <Plus size={14} />
            Criar post
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(post => {
            const sc = statusConfig[post.status] || statusConfig.draft
            const StatusIcon = sc.icon
            return (
              <div key={post.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4 card-hover">
                {/* Thumbnail ou ícone */}
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/10 flex-shrink-0 flex items-center justify-center">
                  {post.mediaUrl ? (
                    <img src={post.mediaUrl} alt="media" className="w-full h-full object-cover" />
                  ) : (
                    <Image size={22} className="text-gray-500" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {post.caption || '(sem legenda)'}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-gray-500 text-xs">
                      {new Date(post.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    {post.scheduledAt && (
                      <span className="text-gray-500 text-xs flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(post.scheduledAt).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${sc.className}`}>
                    <StatusIcon size={12} />
                    {sc.label}
                  </span>
                  <Link
                    href={`/dashboard/posts/${post.id}/edit`}
                    className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <Edit size={16} />
                  </Link>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
