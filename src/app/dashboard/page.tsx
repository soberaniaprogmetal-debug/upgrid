'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Share2, FileText, Calendar, TrendingUp, Plus, ExternalLink, AlertCircle } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'

interface Account {
  id: string
  username: string
  name: string
  followersCount?: number
  mediaCount?: number
  profilePicture?: string
}

interface Post {
  id: string
  caption: string
  status: string
  scheduledAt?: string
  publishedAt?: string
  createdAt: string
}

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()

  useEffect(() => {
    const success = searchParams.get('success')
    const error = searchParams.get('error')
    if (success === 'instagram_connected') toast.success('Instagram conectado com sucesso!')
    if (error) toast.error('Erro ao conectar Instagram. Tente novamente.')
  }, [searchParams])

  useEffect(() => {
    Promise.all([
      fetch('/api/accounts').then(r => r.json()),
      fetch('/api/posts').then(r => r.json()),
    ]).then(([accData, postData]) => {
      setAccounts(accData.accounts || [])
      setPosts(postData.posts || [])
    }).finally(() => setLoading(false))
  }, [])

  const handleConnectInstagram = async () => {
    const res = await fetch('/api/instagram/connect')
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      toast.error(data.error || 'Erro ao conectar Instagram')
    }
  }

  const stats = [
    { label: 'Contas conectadas', value: accounts.length, icon: Share2, color: 'from-purple-500 to-pink-500' },
    { label: 'Total de posts', value: posts.length, icon: FileText, color: 'from-blue-500 to-cyan-500' },
    { label: 'Agendados', value: posts.filter(p => p.status === 'scheduled').length, icon: Calendar, color: 'from-orange-500 to-yellow-500' },
    { label: 'Publicados', value: posts.filter(p => p.status === 'published').length, icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Visão geral</h1>
          <p className="text-gray-400 text-sm mt-1">Bem-vindo ao seu painel de gerenciamento</p>
        </div>
        <Link
          href="/dashboard/posts/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl instagram-gradient text-white font-medium text-sm hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Novo post
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-5 card-hover">
            <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${color} mb-3`}>
              <Icon size={20} className="text-white" />
            </div>
            <p className="text-3xl font-bold text-white">{value}</p>
            <p className="text-gray-400 text-sm mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Contas do Instagram */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold">Contas do Instagram</h2>
          <button
            onClick={handleConnectInstagram}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/20 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-all"
          >
            <Plus size={14} />
            Conectar
          </button>
        </div>

        {accounts.length === 0 ? (
          <div className="text-center py-10">
            <div className="inline-flex p-4 rounded-2xl bg-white/5 mb-4">
              <Share2 size={32} className="text-gray-500" />
            </div>
            <p className="text-gray-400 mb-2">Nenhuma conta conectada</p>
            <p className="text-gray-500 text-sm mb-4">Conecte seu Instagram para começar a gerenciar publicações</p>
            <div className="flex items-center justify-center gap-2 text-yellow-400 text-sm bg-yellow-400/10 rounded-lg px-4 py-3 max-w-sm mx-auto">
              <AlertCircle size={16} />
              <span>Configure INSTAGRAM_APP_ID no .env.local primeiro</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accounts.map(acc => (
              <div key={acc.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                {acc.profilePicture ? (
                  <img src={acc.profilePicture} alt={acc.username} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full instagram-gradient flex items-center justify-center">
                    <Share2 size={20} className="text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">@{acc.username}</p>
                  <p className="text-gray-400 text-sm">{acc.followersCount?.toLocaleString() || 0} seguidores</p>
                </div>
                <a
                  href={`https://instagram.com/${acc.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Posts recentes */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold">Posts recentes</h2>
          <Link href="/dashboard/posts" className="text-pink-400 hover:text-pink-300 text-sm transition-colors">
            Ver todos →
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-10">
            <div className="inline-flex p-4 rounded-2xl bg-white/5 mb-4">
              <FileText size={32} className="text-gray-500" />
            </div>
            <p className="text-gray-400 mb-4">Nenhum post criado ainda</p>
            <Link href="/dashboard/posts/new" className="px-4 py-2 rounded-xl instagram-gradient text-white text-sm font-medium hover:opacity-90 transition-opacity">
              Criar primeiro post
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.slice(0, 5).map(post => (
              <div key={post.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">{post.caption || '(sem legenda)'}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{new Date(post.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  post.status === 'published' ? 'bg-green-500/20 text-green-400' :
                  post.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                  post.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {post.status === 'published' ? 'Publicado' :
                   post.status === 'scheduled' ? 'Agendado' :
                   post.status === 'failed' ? 'Falhou' : 'Rascunho'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
