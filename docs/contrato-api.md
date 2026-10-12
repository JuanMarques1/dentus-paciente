# Contrato proposto para a área do paciente

Documento para o grupo responsável pela API C#. **As rotas abaixo são propostas novas, não uma descrição das rotas atualmente existentes.** O adaptador `src/services/httpApi.ts` deve ser ajustado se o grupo escolher outros nomes ou formatos.

Base configurável: `VITE_API_BASE_URL`, incluindo `/api`. Autenticação: `Authorization: Bearer <token>`. A identidade vem da sessão; não aceitar um ID de paciente fornecido pelo navegador como prova de propriedade.

## Operações

| Método e caminho relativo | Corpo | Resposta útil |
|---|---|---|
| POST `/auth/login` | `{email, senha}` | `{token, mustChangePassword}` |
| PUT `/paciente/senha` | `{senhaAtual, novaSenha}` | 204 ou sucesso |
| GET `/paciente/perfil` | — | perfil |
| PATCH `/paciente/perfil` | `{email, phone}` | perfil atualizado |
| PUT `/paciente/foto` | multipart com campo `foto` | perfil com `photoUrl` atualizado |
| GET `/paciente/consultas` | — | lista de consultas |
| PUT `/paciente/consultas/{id}/confirmar` | — | consulta atualizada |
| PUT `/paciente/consultas/{id}/cancelar` | — | consulta atualizada |
| GET `/paciente/prontuario` | — | lista de resumos |
| GET `/paciente/prontuario/{id}` | — | detalhe disponibilizado |

O frontend aceita corpo útil direto, `{success:true,data:...}` ou `{sucesso:true,dados:...}`. Erros: status HTTP e `{message:"..."}` ou `{mensagem:"..."}`. Os campos dos objetos úteis abaixo têm os nomes exatos consumidos pelo frontend. Se a API mantiver outros nomes, mapear no adaptador.

```ts
type Profile = {name:string; email:string; phone:string; photoUrl?:string};
type Appointment = {
 id:string; procedure:string; dentist:string;
 startsAt:string; // ISO 8601 COM offset, por exemplo 2026-11-10T14:30:00-03:00
 clinicTimeZone:string; // nome IANA do fuso configurado na clínica
 status:'pending'|'confirmed'|'cancelled'|'completed';
 canConfirm:boolean; canCancel:boolean;
};
type RecordSummary = {id:string; date:string; title:string; dentist:string; summary:string};
// date: YYYY-MM-DD (data do atendimento na clínica).
type RecordDetails = RecordSummary & {instructions:string; treatmentPlan:string};
```

IDs normalizados como string. API atual pode usar inteiros; converter no adaptador. `canConfirm` e `canCancel` representam permissões atuais, além do status. Cliente aplica também o prazo; servidor revalida no momento da operação.

## Regras do servidor

- Clínica libera acesso vinculado ao paciente existente. Sem cadastro público.
- Senha provisória exige troca antes de liberar perfil, consultas ou prontuário.
- Pelo menos 24 horas entre o instante do servidor e o início da consulta permite cancelar; exatamente 24 horas permite. Menos que isso: rejeitar e orientar contato com a clínica. Datas têm fuso explícito.
- Cancelamento é automático e aparece no sistema da clínica; confirmar não cria agendamento.
- Confirmar/cancelar devem tratar requisições concorrentes e estados finais sem alterações inválidas; preferir resultado idempotente quando ação já concluída.
- Histórico expõe somente conteúdo disponibilizado ao paciente. Nunca expor notas internas ou dados de outros pacientes.
- E-mail alterado no perfil atualiza também o login de forma consistente; e-mail duplicado gera erro sem atualização parcial.
- Upload: proposta JPG/PNG/WebP até 5 MB. Validar conteúdo real, não só extensão; retornar URL acessível ao paciente. Se a foto exigir autenticação no download, adaptar cliente para fetch autenticado e URL temporária.
- Mudança de senha: validar política no servidor e documentar se token é renovado ou invalidado. O adaptador atual pressupõe que a sessão permanece válida; em 401 retorna ao login.
- Senha perdida: clínica libera recuperação, sem fluxo público por e-mail nesta entrega.

## Status esperados

400: dados inválidos; 401: sessão expirada/inválida; 403: operação sem permissão; 404: recurso ausente; 409: estado ou prazo incompatível; 413: foto grande demais; 5xx: falha na clínica. As mensagens devem ser adequadas ao paciente. A API deve usar HTTPS na publicação, CORS para a origem do frontend e respostas autenticadas sem cache público.

## Checklist de integração do grupo

1. Confirmar rotas, envelopes, propriedades e estados acima.
2. Disponibilizar usuário de teste vinculado a um paciente com consultas e registros fictícios.
3. Testar login inicial, senha, perfil, foto, confirmação e cancelamento com limite no servidor.
4. Verificar que um paciente não consegue acessar registros de outro.
5. Publicar API, configurar CORS/HTTPS e informar URL para build da PWA.

O modo demonstração é separado, com credenciais fictícias e estado em memória. Sua aprovação não comprova funcionamento do backend real.
