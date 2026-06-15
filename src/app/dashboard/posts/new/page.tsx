'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { ArrowLeft, Send, Save, Calendar, Image, FileText } from 'lucide-react'

interface Account {
  id: string
  username: string
  name: string
}

interface PostForm {
  caption: string
  mediaUrl: string
  accountId: string
  scheduledAt: string
}

export default function NewPostPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(false)
  const [charCount, setCharCount] = useState(0)
  const router = useRouter()

  const { register, handleSubmit, watch, formState: { errors } } = useForm<PostForm>()
  const caption = watch('caption', '')

  useEffect(() => {
    setCharCount(caption?.length || 0)
  }, [caption])

  useEffect(() => {
    fetch('/api/accounts')
      .then(r => r.json())
      .then(data => setAccounts(data.accounts || []))
  }, [])

  const onSubmit = async (data: PostForm, isDraft = false) => {
    if (accounts.length === 0) {
      toast.error('Conecte uma conta do Instagram primeiro')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          status: isDraft ? 'draft' : data.scheduledAt ? 'scheduled' : 'draft',
          mediaType: 'IMAGE',
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success(isDraft ? 'Rascunho salvo!' : 'Post criado com sucesso!')
      router.push('/dashboard/posts')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/posts" className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Novo post</h1>
          <p className="text-gray-400 text-sm">Crie uma nova publicação para o Instagram</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(d => onSubmit(d, false))} className="space-y-5">
        {/* Conta */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Conta do Instagram
          </label>
          {accounts.length === 0 ? (
            <div className="flex items-center gap-2 text-yellow-400 text-sm bg-yellow-400/10 rounded-xl px-4 py-3">
              <FileText size={16} />
              <span>Nenhuma conta conectada. Vá em <Link href="/dashboard" className="underline">Visão geral</Link> para conectar.</span>
            </div>
          ) : (
            <select
              {...register('accountId', { required: 'Selecione uma conta' })}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-pink-500 transition-colors"
            >
              <option value="" className="bg-gray-900">Selecione uma conta</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id} className="bg-gray-900">@{acc.username}</option>
              ))}
            </select>
          )}
          {errors.accountId && <p className="text-red-400 text-xs mt-1">{errors.accountId.message}</p>}
        </div>

        {/* URL da mídia */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <span className="flex items-center gap-2"><Image size={16} /> URL da imagem / vídeo</span>
          </label>
          <input
            {...register('mediaUrl')}
            type="url"
            placeholder="https://exemplo.com/minha-imagem.jpg"
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 transition-colors"
          />
          <p className="text-gray-500 text-xs mt-2">A imagem precisa ser acessível publicamente para publicação no Instagram</p>
        </div>

        {/* Legenda */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <span className="flex items-center gap-2"><FileText size={16} /> Legenda</span>
          </label>
          <textarea
            {...register('caption', { maxLength: { value: 2200, message: 'Máximo 2200 caracteres' } })}
            rows={5}
            placeholder="Escreva sua legenda aqui... #hashtags"
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 transition-colors resize-none"
          />
          <div className="flex justify-between mt-2">
            {errors.caption && <p className="text-red-400 text-xs">{errors.caption.message}</p>}
            <span className={`text-xs ml-auto ${charCount > 2000 ? 'text-red-400' : 'text-gray-500'}`}>
              {charCount}/2200
            </span>
          </div>
        </div>

        {/* Agendamento */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <span className="flex items-center gap-2"><Calendar size={16} /> Agendar publicação (opcional)</span>
          </label>
          <input
            {...register('scheduledAt')}
            type="datetime-local"
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-pink-500 transition-colors"
          />
          <p className="text-gray-500 text-xs mt-2">Deixe em branco para salvar como rascunho</p>
        </div>

        {/* Botões */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSubmit(d => onSubmit(d, true))}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-white/20 text-gray-300 hover:text-white hover:bg-white/10 transition-all font-medium disabled:opacity-60"
          >
            <Save size={16} />
            Salvar rascunho
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl instagram-gradient text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            <Send size={16} />
            {loading ? 'Salvando...' : 'Criar post'}
          </button>
        </div>
      </form>
    </div>
  )
}
