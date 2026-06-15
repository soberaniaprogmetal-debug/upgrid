# UpGrid 📱

Plataforma completa para gerenciar publicações do Instagram.

## Como rodar

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
Edite o arquivo `.env.local` com suas credenciais:

```env
JWT_SECRET=troque_por_string_aleatoria_longa
INSTAGRAM_APP_ID=seu_app_id
INSTAGRAM_APP_SECRET=seu_app_secret
INSTAGRAM_REDIRECT_URI=http://localhost:3000/api/instagram/callback
```

### 3. Rodar em desenvolvimento
```bash
npm run dev
```
Acesse: http://localhost:3000

### 4. Build para produção
```bash
npm run build
npm start
```

## Configurar Instagram API

1. Acesse [Meta for Developers](https://developers.facebook.com)
2. Crie um app do tipo "Business"
3. Adicione o produto "Instagram Graph API"
4. Configure o OAuth redirect URI: `http://localhost:3000/api/instagram/callback`
5. Copie o App ID e App Secret para o `.env.local`

## Funcionalidades

- ✅ Autenticação segura (JWT + cookies HTTP-only)
- ✅ Rate limiting por IP
- ✅ Headers de segurança
- ✅ Criar, editar e deletar posts
- ✅ Agendamento de publicações
- ✅ Dashboard com métricas
- ✅ Conexão com conta Instagram via OAuth
- ✅ Multi-contas
- ✅ Responsivo (mobile + desktop)

## Stack

- **Frontend**: Next.js 14, React, TailwindCSS
- **Backend**: Next.js API Routes
- **Auth**: JWT (jose), bcryptjs
- **Instagram**: Meta Graph API v19.0
