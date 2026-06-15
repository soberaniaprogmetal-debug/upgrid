import Link from 'next/link'
import { Share2, BarChart2, Calendar, Shield, Zap, Users } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950 text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl instagram-gradient">
            <Share2 size={22} className="text-white" />
          </div>
          <span className="text-xl font-bold">UpGrid</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/login" className="text-gray-300 hover:text-white transition-colors">
            Entrar
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 rounded-lg instagram-gradient text-white font-medium hover:opacity-90 transition-opacity"
          >
            Começar grátis
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="text-center py-24 px-6 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm mb-6">
          <Zap size={14} className="text-yellow-400" />
          <span>Plataforma completa para Instagram</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Gerencie seu{' '}
          <span className="instagram-gradient-text">Instagram</span>
          <br />
          com facilidade
        </h1>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          Agende publicações, acompanhe métricas e gerencie múltiplas contas em um único painel intuitivo.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="px-8 py-4 rounded-xl instagram-gradient text-white font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg"
          >
            Criar conta gratuita
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 rounded-xl border border-white/20 text-white font-semibold text-lg hover:bg-white/10 transition-colors"
          >
            Já tenho conta
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-14">Tudo que você precisa</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Calendar,
              title: 'Agendamento',
              desc: 'Programe suas publicações para o melhor horário e mantenha consistência no seu feed.',
            },
            {
              icon: BarChart2,
              title: 'Métricas',
              desc: 'Acompanhe engajamento, alcance, impressões e crescimento de seguidores em tempo real.',
            },
            {
              icon: Users,
              title: 'Multi-contas',
              desc: 'Gerencie várias contas do Instagram em um único painel centralizado.',
            },
            {
              icon: Shield,
              title: 'API Segura',
              desc: 'Autenticação JWT, rate limiting e criptografia. Seus dados estão protegidos.',
            },
            {
              icon: Share2,
              title: 'Integração oficial',
              desc: 'Usa a Meta Graph API oficial, garantindo conformidade e estabilidade.',
            },
            {
              icon: Zap,
              title: 'Rápido e simples',
              desc: 'Interface limpa e intuitiva. Publique e agende em segundos.',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-6 rounded-2xl bg-white/5 border border-white/10 card-hover">
              <div className="p-3 rounded-xl instagram-gradient inline-block mb-4">
                <Icon size={22} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto p-10 rounded-3xl bg-white/5 border border-white/10">
          <h2 className="text-3xl font-bold mb-4">Pronto para começar?</h2>
          <p className="text-gray-400 mb-8">Crie sua conta e conecte seu Instagram em menos de 2 minutos.</p>
          <Link
            href="/register"
            className="px-8 py-4 rounded-xl instagram-gradient text-white font-semibold text-lg hover:opacity-90 transition-opacity"
          >
            Criar conta grátis →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6 text-center text-gray-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Share2 size={16} />
          <span className="font-semibold text-white">UpGrid</span>
        </div>
        <p>© {new Date().getFullYear()} UpGrid. Todos os direitos reservados.</p>
      </footer>
    </div>
  )
}
