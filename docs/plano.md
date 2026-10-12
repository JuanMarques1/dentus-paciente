# PWA do paciente — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar uma aplicação instalável do paciente, fiel à referência, demonstrável enquanto o grupo prepara a API.

**Architecture:** Projeto independente em `outputs/pwa-paciente/`, com telas por funcionalidade, componentes compartilhados e uma interface única para dados de demonstração e HTTP. A API existente mantém autenticação, autorização, persistência e validação final das ações. Nenhum arquivo do sistema C# será alterado.

**Tech Stack:** React, TypeScript, Vite, React Router, Vitest e Testing Library. Versões compatíveis verificadas na documentação oficial na execução; dependências fixadas pelo arquivo de lock. CSS próprio para preservar a referência.

**Spec:** `outputs/escopo-pwa-paciente.md`, aprovado na conversa em 12/10/2026.

## Global Constraints

- Aplicação exclusiva do paciente, em React e TypeScript, em repositório separado do sistema da clínica.
- O grupo cuida da API C# e do banco existentes e da publicação posterior.
- Cancelamento: diálogo de confirmação e antecedência mínima de 24 horas. Exatamente 24 horas permite cancelar.
- PWA instalável quando publicada em ambiente compatível; internet obrigatória para dados e ações.
- Dados fictícios e modo de demonstração identificados explicitamente; falha na API real não ativa dados fictícios automaticamente.
- Sem cadastro público, novos agendamentos, notificações push ou prontuários offline.

## Review Focus

1. Fuso do dispositivo diferente do fuso da clínica: exibir a data da clínica sem deslocar o compromisso (tarefa 3).
2. Sessão expirada durante uma ação: limpar sessão e retornar ao login sem mostrar sucesso (tarefa 2).
3. Duplo toque ou resposta lenta: uma operação por vez, sucesso apenas depois da resposta (tarefa 3).
4. Erro de upload ou atualização: preservar campos e foto anterior, permitir nova tentativa (tarefa 5).
5. Atualização do service worker: não guardar respostas autenticadas ou perder campos digitados por recarga automática (tarefa 6).

## Estrutura de arquivos

Todos os caminhos abaixo são relativos a `outputs/pwa-paciente/`.

- `src/app/`: composição, rotas, sessão e estilos globais.
- `src/components/`: navegação, cartões, estados de tela e diálogo acessível.
- `src/features/auth/`, `appointments/`, `records/`, `profile/`: telas e regras de cada área.
- `src/services/`: tipos, interface, demonstração, cliente HTTP e mapeamento de contratos.
- `public/`: ícones, manifesto e service worker.
- `docs/contrato-api.md`: proposta de integração para o grupo, diferenciada da API existente.
- `README.md`, `.env.example`: execução, modo de demonstração e integração.

## Tarefa 1: Base navegável e contrato de dados

**Arquivos:** criar `package.json`, `package-lock.json`, `index.html`, `vite.config.ts`, configurações TypeScript, `src/main.tsx`, `src/app/App.tsx`, `src/app/styles.css`, `src/components/BottomNav.tsx`, `src/services/types.ts`, `src/services/PatientApi.ts`, `docs/contrato-api.md`, `.env.example` e `README.md`.

**Interfaces:** produzir os tipos e o contrato abaixo, usados pelas demais tarefas. `startsAt` é ISO 8601 com offset; `clinicTimeZone` identifica o fuso. Estados abaixo são internos e mapeados para o backend.

```ts
export type Session = { token: string; mustChangePassword: boolean };
export type Profile = { name: string; email: string; phone: string; photoUrl?: string };
export type Appointment = {
  id: string; procedure: string; dentist: string; startsAt: string;
  clinicTimeZone: string; status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  canConfirm: boolean; canCancel: boolean;
};
export type RecordSummary = { id: string; date: string; title: string; dentist: string; summary: string };
export type RecordDetails = RecordSummary & { instructions: string; treatmentPlan: string };
export interface PatientApi {
  login(email: string, password: string): Promise<Session>;
  changePassword(current: string, next: string): Promise<void>;
  getProfile(): Promise<Profile>;
  updateProfile(input: Pick<Profile, 'email' | 'phone'>): Promise<Profile>;
  uploadPhoto(file: File): Promise<Profile>;
  listAppointments(): Promise<Appointment[]>;
  confirmAppointment(id: string): Promise<Appointment>;
  cancelAppointment(id: string): Promise<Appointment>;
  listRecords(): Promise<RecordSummary[]>;
  getRecord(id: string): Promise<RecordDetails>;
}
```

- [ ] Criar o projeto e verificar instalação/build antes das telas.
- [ ] Criar as rotas `/entrar`, `/nova-senha`, `/consultas`, `/prontuario`, `/prontuario/:id`, `/perfil` e `/senha`; navegação inferior somente dentro da área autenticada.
- [ ] Aplicar paleta e estilo da imagem com tokens CSS, títulos serifados e botões legíveis. Navegação deve indicar seleção por texto e forma além da cor.
- [ ] Documentar cada operação acima como proposta; não afirmar que rotas novas já existem. Manter mapeamento HTTP centralizado para permitir adaptação às decisões do grupo.
- [ ] Verificar build e navegação por teclado e em largura de 360 px. Criar repositório Git local independente, sem publicar remotamente, e registrar a entrega se não houver restrição local.

## Tarefa 2: Demonstração, HTTP e acesso

**Arquivos:** criar `src/services/demoApi.ts`, `httpApi.ts`, `api.ts`, `ApiError.ts`, `src/app/SessionProvider.tsx`, `src/features/auth/LoginPage.tsx`, `PasswordPage.tsx`, `src/services/httpApi.test.ts` e `src/features/auth/auth.test.tsx`.

**Interfaces:** consumir `PatientApi`, `Session`. Produzir `useSession()` com `session`, `login`, `logout`, `completePasswordChange`; `ApiError` com `status` e mensagem; cliente com `request<T>(path: string, init?: RequestInit): Promise<T>`.

- [ ] Escrever teste da troca obrigatória e executar até confirmar falha:

```tsx
it('exige troca antes de abrir consultas', async () => {
  render(<AuthHarness initialSession={{token: 'demo', mustChangePassword: true}} />);
  expect(await screen.findByRole('heading', {name: /nova senha/i})).toBeVisible();
  expect(screen.queryByRole('heading', {name: 'Consultas'})).toBeNull();
});
```

`AuthHarness` será definido no próprio teste com provider, MemoryRouter e rotas reais.

- [ ] Implementar demonstração explícita, credenciais fictícias documentadas e dados em memória. Separar seleção `VITE_API_MODE=demo|http`; modo HTTP exige `VITE_API_BASE_URL` e não recorre ao demo em erros.
- [ ] Implementar login e senha com campos rotulados, envio único, erro legível e retorno ao login ao sair. Manter token em memória inicialmente; recarregar exige login. Formato real de sessão será adaptado ao contrato entregue pelo grupo.
- [ ] Testar 401, rede indisponível e senha rejeitada com cliente simulado. Para 401, verificar remoção da sessão e ausência de mensagem de sucesso. Senha rejeitada deve manter o usuário na troca obrigatória.
- [ ] Executar testes e build; registrar a entrega.

## Tarefa 3: Consultas e cancelamento

**Arquivos:** criar `src/features/appointments/AppointmentsPage.tsx`, `AppointmentCard.tsx`, `rules.ts`, `rules.test.ts`, `AppointmentsPage.test.tsx` e `src/components/ConfirmDialog.tsx`.

**Interfaces:** consumir `PatientApi` e `Appointment`. Produzir `canCancelAt(startsAt: string, now: number): boolean` e `formatAppointmentDate(appointment: Appointment): string`.

- [ ] Escrever os testes de limite antes da regra:

```ts
it.each([[86400001, true], [86400000, true], [86399999, false]])(
  'prazo de %i ms permite cancelar: %s', (remaining, expected) => {
    const now = Date.parse('2026-10-12T12:00:00Z');
    expect(canCancelAt(new Date(now + remaining).toISOString(), now)).toBe(expected);
  }
);
```

- [ ] Implementar regra por diferença de instantes; datas inválidas bloqueiam ação. Combinar prazo com permissão e status retornados pela API. Reavaliar ao abrir e confirmar diálogo; servidor continua sendo autoridade final.
- [ ] Montar cartões com status, dentista e horário. Confirmar e cancelar só atualizam a tela com resposta bem-sucedida. Bloquear ações durante requisição e sem internet.
- [ ] Implementar diálogo com foco contido, Escape, retorno do foco e botões Voltar/Cancelar consulta. Abaixo do prazo, explicar contato com a clínica, sem inventar telefone.
- [ ] Testar duplo clique com Promise pendente e verificar uma chamada; testar rejeição pelo servidor sem mudança de status. Fixar data `2026-10-13T00:30:00-03:00` e verificar dia 13 no fuso `America/Sao_Paulo`, mesmo com dispositivo em outro fuso.
- [ ] Executar testes, build e conferência visual dos cartões; registrar a entrega.

## Tarefa 4: Histórico e detalhes

**Arquivos:** criar `src/features/records/RecordsPage.tsx`, `RecordDetailsPage.tsx`, `records.test.tsx`, `src/components/ScreenState.tsx`.

**Interfaces:** consumir `listRecords()` e `getRecord(id)`; produzir páginas com links identificados pelo título do atendimento e botão de voltar.

- [ ] Criar teste que abre um atendimento e verifica orientações e plano; testar registro inexistente com mensagem e retorno ao histórico.
- [ ] Implementar lista e detalhes de leitura; conteúdo vem exclusivamente do contrato do paciente. Estados vazio, carregando e erro oferecem mensagens específicas e tentativa novamente.
- [ ] Verificar que falha de carregamento não exibe dados antigos de outro registro; testar navegação entre IDs e resposta fora de ordem, ignorando resposta obsoleta.
- [ ] Executar testes e build, verificar leitura e rolagem no celular; registrar a entrega.

## Tarefa 5: Perfil, foto e senha

**Arquivos:** criar `src/features/profile/ProfilePage.tsx`, `ProfileForm.tsx`, `PhotoInput.tsx`, `profile.test.tsx`.

**Interfaces:** consumir perfil, atualização, upload e sessão; reutilizar `PasswordPage` em modo de troca voluntária.

- [ ] Testar alteração de e-mail/telefone, nome somente para leitura e erro de atualização que preserva os campos.
- [ ] Implementar formulário, avatar e upload com prévia. Limites visuais de demonstração: JPEG/PNG/WebP, até 5 MB; registrar esses valores como proposta no contrato, adaptáveis ao backend. Revogar URLs temporárias de prévia ao substituir ou sair.
- [ ] Testar upload rejeitado: foto anterior permanece e mensagem permite tentar novamente. Testar arquivo inválido sem chamar API. Não anunciar sucesso antes da resposta.
- [ ] Implementar troca voluntária da senha e saída limpando sessão e estado carregado do paciente.
- [ ] Executar testes e build; verificar edição e seletor de foto no celular; registrar a entrega.

## Tarefa 6: PWA, documentação e entrega

**Arquivos:** criar `public/manifest.webmanifest`, `public/icons/icon-192.png`, `icon-512.png`, `public/sw.js`, `src/app/registerServiceWorker.ts`, `src/app/OfflineNotice.tsx`; atualizar README, contrato e index.

**Interfaces:** produzir manifesto com nome provisório `Portal do Paciente`, start URL da aplicação e display standalone. Service worker registra somente no build de produção.

- [ ] Implementar cache apenas de recursos estáticos da mesma origem, com lista explícita ou gerada do build. Não interceptar API, requisições autenticadas ou uploads. Não forçar atualização e recarga enquanto usuário edita formulário.
- [ ] Testar a política de cache com URLs de API e requisições contendo Authorization: nenhuma entrada deve ser gravada. Verificar aviso sem internet e bloqueio das ações.
- [ ] Produzir ícones e verificar manifesto, escopo, instalação e inicialização em build servido localmente; registrar limitações que exigem HTTPS após publicação.
- [ ] Executar suite completa, verificação TypeScript e build. Testar fluxos principais em 360 px e desktop, incluindo teclado e diálogos.
- [ ] Finalizar README com comandos de execução, credenciais demo, configuração HTTP e lista de operações pendentes do grupo. Entregar frontend demonstrável, distinguindo claramente integração preparada de integração real testada.
- [ ] Registrar entrega final; publicação remota fica para etapa posterior combinada com o usuário.

## Dependências externas e critério de conclusão

O frontend pode ser entregue e demonstrado antes do backend. Integração real só está concluída após testar as operações do grupo com paciente autenticado, prazo validado pelo servidor, edição persistida e isolamento dos dados. Rotas, formato de sessão, estados, upload e fuso da clínica serão confirmados com o grupo através do contrato; não precisam bloquear as telas.

## Execução proposta

Recomendada: execução direta nesta conversa, por etapas, com testes nas regras e fluxos críticos. Alternativa: agentes separados por tarefa com revisão independente, se o usuário escolher essa abordagem. A revisão final deve conferir o escopo aprovado e informar qualquer dependência ainda não entregue pela API.
