'use client'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Share2, User, Shield, Trash2, Plus, ExternalLink } from 'lucide-react'

interface Account {
  id: string
  username: string
  name: string
  followersCount?: number
  mediaCount?: number
  profilePicture?: string
  connectedAt: string
}

interface UserData {
  id: string
  name: string
  email: string
  createdAt: string
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then(r => r.json()),
      fetch('/api/accounts').then(r => r.json()),
    ]).then(([userData, accData]) => {
      if (userData.user) setUser(userData.user)
      setAccounts(accData.accounts || [])
    })
  }, [])

  const handleConnectInstagram = async () => {
    const res = await fetch('/api/instagram/connect')
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else toast.error(data.error || 'Configure o INSTAGRAM_APP_ID no .env.local')
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Configurações</h1>
        <p className="text-gray-400 text-sm mt-1">Gerencie sua conta e integrações</p>
      </div>

      {/* Perfil */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-xl bg-white/10">
            <User size={20} className="text-gray-300" />
          </div>
          <h2 className="text-lg font-semibold">Perfil</h2>
        </div>
        {user && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Nome</label>
              <div className="px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white">{user.name}</div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
              <div className="px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white">{user.email}</div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Membro desde</label>
              <div className="px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-gray-400 text-sm">
                {new Date(user.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contas Instagram */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl instagram-gradient">
              <Share2 size={20} className="text-white" />
            </div>
            <h2 className="text-lg font-semibold">Contas do Instagram</h2>
          </div>
          <button
            onClick={handleConnectInstagram}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/20 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-all"
          >
            <Plus size={14} />
            Conectar
          </button>
        </div>

        {accounts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm mb-3">Nenhuma conta conectada</p>
            <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-xl px-4 py-3 text-yellow-400 text-sm">
              Para conectar, configure <code className="bg-white/10 px-1 rounded">INSTAGRAM_APP_ID</code> e <code className="bg-white/10 px-1 rounded">INSTAGRAM_APP_SECRET</code> no arquivo <code className="bg-white/10 px-1 rounded">.env.local</code>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {accounts.map(acc => (
              <div key={acc.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                {acc.profilePicture ? (
                  <img src={acc.profilePicture} alt={acc.username} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full instagram-gradient flex items-center justify-center">
                    <Share2 size={18} className="text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm">@{acc.username}</p>
                  <p className="text-gray-500 text-xs">{acc.followersCount?.toLocaleString() || 0} seguidores • conectado {new Date(acc.connectedAt).toLocaleDateString('pt-BR')}</p>
                </div>
                <a
                  href={`https://instagram.com/${acc.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-gray-500 hover:text-white transition-colors"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Segurança */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-xl bg-white/10">
            <Shield size={20} className="text-gray-300" />
          </div>
          <h2 className="text-lg font-semibold">Segurança</h2>
        </div>
        <div className="space-y-3 text-sm text-gray-400">
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
            <span>Autenticação JWT</span>
            <span className="text-green-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> Ativo
            </span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
            <span>Rate limiting (60 req/min)</span>
            <span className="text-green-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> Ativo
            </span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
            <span>Cookies HTTP-only</span>
            <span className="text-green-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> Ativo
            </span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
            <span>Sessão expira em</span>
            <span className="text-gray-300">7 dias</span>
          </div>
        </div>
      </div>
    </div>
  )
}
