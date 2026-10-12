# Dentus — Portal do Paciente

PWA em React e TypeScript para o projeto acadêmico. Repositório independente da API C#. Visual inspirado no fluxo fornecido: Consultas, Prontuário e Perfil, com cores bege, dourado e marrom.

## Executar

Requer Node.js 22.12+ ou 24 e npm.

```sh
npm ci
npm run dev
```

Abra o endereço mostrado pelo Vite. O modo padrão é demonstração, com aviso visível de dados fictícios.

**Acesso fictício:** `paciente@demo.com` / `Clinica123`. No primeiro acesso, defina uma nova senha de pelo menos 8 caracteres. Os dados clínicos da demonstração ficam em memória. Com “Manter Logado” ativo, a sessão pode ser retomada por até 8 horas; apenas as credenciais fictícias da demonstração são guardadas para permitir essa retomada. Sair remove essa informação. Essas credenciais não pertencem ao banco real.

## Funcionalidades

- Login, troca obrigatória da senha provisória e troca voluntária.
- Consultas: confirmação e cancelamento com diálogo e limite de 24 horas.
- Histórico com detalhes das orientações e do plano disponibilizados pela clínica.
- Perfil: e-mail, telefone, foto (JPG, PNG, WebP até 5 MB) e saída.
- Estados de carregamento, erro, vazio, sessão expirada e falta de conexão.
- Manifesto, ícones e cache apenas de recursos estáticos para instalação.

## Integrar à API do grupo

Copie `.env.example` para `.env.local`, altere `VITE_API_MODE=http` e configure `VITE_API_BASE_URL`. Reinicie o servidor após mudanças. Configure CORS no backend para a origem do frontend.

Leia [o contrato proposto](docs/contrato-api.md). As rotas específicas do paciente ainda precisam ser implementadas pelo grupo. `src/services/httpApi.ts` centraliza rotas, envelope e mapeamento. Sem uma API que cumpra esse contrato, o modo HTTP informa o erro; não substitui dados reais por fictícios. O banco e o sistema da clínica não foram modificados.

O token é enviado via Bearer. Sem “Manter Logado”, fica apenas em memória. Quando a opção é escolhida, fica no armazenamento local por até 8 horas para retomar a sessão; 401 ou Sair remove o token. No modo HTTP, senhas e prontuários não são armazenados. O prazo e a revogação definitivos dependem da API. O backend valida propriedade de cada recurso, permissões, prazo de cancelamento e persistência. O cliente não garante essas regras sozinho.

## Verificar e gerar entrega

```sh
npm test
npm run typecheck
npm run build
npm run preview
```

O build cria `dist/`, incluindo o service worker com lista explícita dos arquivos estáticos. A API e os dados autenticados não entram no cache. O app mostra aviso de falta de conexão e bloqueia ações. A atualização do worker não força recarga de formulários.

## Publicação posterior

Hospede `dist/` por HTTPS na raiz do domínio. Configure fallback de rotas para `index.html`, sem transformar rotas `/api/` em HTML. A instalação depende do navegador e da plataforma; use a opção instalar/adicionar à tela inicial. Em iPhone, use Compartilhar → Adicionar à Tela de Início. Localhost também permite verificar o service worker.

O backend deve ser publicado em HTTPS e a URL de produção deve ser definida no ambiente de build. Variáveis `VITE_` são públicas: nunca colocar senhas do banco ou segredos JWT nelas. Ícones/nome Dentus são provisórios para o projeto e podem ser substituídos.

## Organização

`src/features/`: telas e regras por área; `src/components/`: navegação, diálogo e estados; `src/app/`: sessão e rotas; `src/services/`: contrato, demo e HTTP; `public/`: manifesto e recursos da PWA.

## Estado da entrega

Frontend demonstrável e adaptador HTTP preparado. A integração real, a validação contra o banco e a instalação no ambiente publicado dependem da API e da publicação realizadas pelo grupo.
