'use client'
import { useEffect, useState } from 'react'
import { BarChart2, TrendingUp, Heart, MessageCircle, Eye, Users } from 'lucide-react'

interface Post {
  id: string
  caption: string
  status: string
  likes?: number
  comments?: number
  createdAt: string
}

export default function AnalyticsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/posts')
      .then(r => r.json())
      .then(data => setPosts(data.posts || []))
      .finally(() => setLoading(false))
  }, [])

  const published = posts.filter(p => p.status === 'published')
  const totalLikes = published.reduce((sum, p) => sum + (p.likes || 0), 0)
  const totalComments = published.reduce((sum, p) => sum + (p.comments || 0), 0)
  const avgEngagement = published.length > 0 ? ((totalLikes + totalComments) / published.length).toFixed(1) : '0'

  const metrics = [
    { label: 'Posts publicados', value: published.length, icon: BarChart2, color: 'from-purple-500 to-pink-500' },
    { label: 'Total de curtidas', value: totalLikes, icon: Heart, color: 'from-red-500 to-pink-500' },
    { label: 'Total de comentários', value: totalComments, icon: MessageCircle, color: 'from-blue-500 to-cyan-500' },
    { label: 'Engajamento médio', value: avgEngagement, icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-pink-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Métricas</h1>
        <p className="text-gray-400 text-sm mt-1">Acompanhe o desempenho das suas publicações</p>
      </div>

      {/* Métricas gerais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-5 card-hover">
            <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${color} mb-3`}>
              <Icon size={20} className="text-white" />
            </div>
            <p className="text-3xl font-bold text-white">{value}</p>
            <p className="text-gray-400 text-sm mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Distribuição de status */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-5">Distribuição por status</h2>
        <div className="space-y-4">
          {[
            { label: 'Publicados', count: posts.filter(p => p.status === 'published').length, color: 'bg-green-500' },
            { label: 'Agendados', count: posts.filter(p => p.status === 'scheduled').length, color: 'bg-blue-500' },
            { label: 'Rascunhos', count: posts.filter(p => p.status === 'draft').length, color: 'bg-gray-500' },
            { label: 'Com falha', count: posts.filter(p => p.status === 'failed').length, color: 'bg-red-500' },
          ].map(({ label, count, color }) => {
            const pct = posts.length > 0 ? Math.round((count / posts.length) * 100) : 0
            return (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-300">{label}</span>
                  <span className="text-gray-400">{count} ({pct}%)</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${color} rounded-full transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Top posts */}
      {published.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-5">Posts publicados</h2>
          <div className="space-y-3">
            {published.map(post => (
              <div key={post.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">{post.caption || '(sem legenda)'}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{new Date(post.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1"><Heart size={14} className="text-red-400" />{post.likes || 0}</span>
                  <span className="flex items-center gap-1"><MessageCircle size={14} className="text-blue-400" />{post.comments || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {posts.length === 0 && (
        <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl">
          <div className="inline-flex p-4 rounded-2xl bg-white/5 mb-4">
            <BarChart2 size={32} className="text-gray-500" />
          </div>
          <p className="text-gray-400">Nenhum dado disponível ainda</p>
          <p className="text-gray-500 text-sm mt-1">Crie e publique posts para ver as métricas</p>
        </div>
      )}
    </div>
  )
}
