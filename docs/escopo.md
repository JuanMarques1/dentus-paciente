# PWA do paciente — escopo para revisão

Projeto acadêmico com prazo inferior a um mês. Aplicação exclusiva do paciente, em React e TypeScript, em repositório separado do sistema da clínica. O grupo cuida da API C# e do banco existentes e da publicação posterior. Este documento define a interface e suas dependências; não modifica o backend.

## Experiência e visual

Manter a referência enviada: bege, dourado e marrom, títulos serifados, cartões arredondados e navegação inferior com Consultas, Prontuário e Perfil. Interface adaptada ao celular e utilizável no computador, com textos legíveis, rótulos acessíveis e botões fáceis de tocar.

## Funcionalidades acordadas

- Login com e-mail e senha provisória entregue pela clínica; solicitar nova senha no primeiro acesso. Sem cadastro público.
- Consultas: mostrar procedimento, dentista, data, horário e status. Confirmar ou cancelar apenas agendamentos existentes; não oferecer novos agendamentos.
- Cancelamento: diálogo de confirmação e antecedência mínima de 24 horas. Exatamente 24 horas permite cancelar. Abaixo disso, orientar contato com a clínica. Backend valida prazo e propriedade da consulta usando o instante atual do servidor.
- Prontuário: histórico de atendimentos, planos e orientações disponibilizados pela clínica, com tela de detalhes. Sem edição pelo paciente.
- Perfil: editar e-mail, telefone e foto; nome mantido pela clínica. Trocar senha e sair. A recuperação de senha por e-mail fica fora desta primeira versão; acesso perdido depende da clínica.
- PWA instalável quando publicada em ambiente compatível; internet obrigatória para dados e ações. Cache apenas dos recursos da interface, sem prontuários ou respostas autenticadas para acesso offline.

## Estrutura proposta

Telas e componentes compartilhados separados da camada de acesso à API. Essa camada terá implementações de demonstração e de integração, com a mesma interface. Dados fictícios e modo de demonstração identificados explicitamente; falha na API real não ativa dados fictícios automaticamente.

Fluxo: React → API C# → banco existente. Endereço da API configurável por ambiente. Nenhuma conexão direta do navegador ao banco. A autenticação, identificação do paciente, autorização e persistência ficam na API.

## Contrato a combinar com o grupo

As rotas exatas ainda dependem do grupo; as operações necessárias são:

| Operação | Dados e comportamento necessários |
| --- | --- |
| Entrar | Credenciais; sessão, identificação do paciente e indicador de troca obrigatória da senha |
| Trocar senha | Senha atual e nova; validação e resposta de sucesso ou erro |
| Consultar perfil | Nome, e-mail, telefone e referência da foto do paciente conectado |
| Atualizar perfil | E-mail e telefone; atualização consistente com o e-mail de login |
| Atualizar foto | Envio da imagem e retorno de sua referência; formatos e tamanho limite documentados pelo grupo |
| Listar consultas | Identificador, procedimento, dentista, data/hora com fuso explícito, status e ações permitidas |
| Confirmar consulta | Identificador; validação de propriedade e estado; retorno atualizado |
| Cancelar consulta | Identificador; validação de propriedade, estado e prazo; retorno atualizado |
| Ler histórico e detalhes | Atendimentos, planos e orientações que a clínica disponibilizou ao paciente conectado |

Os formatos de sessão e erros devem ser documentados antes da integração real. A API deve impedir acesso a dados de outro paciente. As datas devem preservar o fuso da clínica; não presumir que o fuso do celular seja o da consulta. Estados específicos das consultas serão mapeados para os valores que o grupo definir.

## Estados e verificação

Cada tela terá estados de carregamento, vazio, erro e tentativa novamente. Sem internet, informar indisponibilidade e bloquear ações dependentes da API. Sessão expirada retorna ao login. Evitar envios duplicados, preservar dados digitados em falhas e só indicar confirmação ou cancelamento após sucesso da operação.

Validar navegação, primeiro acesso, perfil, detalhes, confirmação e cancelamento. Testar prazo acima, igual e abaixo de 24 horas, rejeição pelo servidor, erros e sessão expirada. Verificar layout no celular, teclado, foco dos diálogos e instalação após publicação. A demonstração visual pode ser concluída antes da API; a integração real depende das operações entregues pelo grupo.

## Ordem de entrega

1. Definir contratos e montar login, navegação e telas com dados fictícios.
2. Implementar interações e estados; conectar operações conforme a API ficar disponível.
3. Finalizar integração, configuração da PWA e testes, reservando os últimos dias para correções e apresentação.

Fora do escopo: área da equipe da clínica, criação de banco, alteração da API por nós, novo agendamento, notificações push e acesso offline aos dados.
