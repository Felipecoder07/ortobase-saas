# Documentação de Atualizações e Alterações (SaaS Odonto)

Este documento centraliza todas as modificações recentes feitas no sistema, tanto no que diz respeito às regras de negócio e interface, quanto à arquitetura profunda de banco de dados (especialmente o módulo financeiro fracionado).

---

## 1. Melhorias Gerais e de Interface

- **Autenticação (Segurança):** 
  - Remoção do uso inseguro de `localStorage` para controle de rotas.
  - Implementação da decodificação do JWT (`atob`) diretamente no `App.tsx` para validação real de `role` (ADMIN, RECEPTIONIST, DENTIST).
- **Agenda (Layout e UX):**
  - Reversão do layout semanal para a versão mais legível aprovada pelo usuário: Escala de 15 minutos, altura de 75px, e informações divididas em 4 linhas de texto.
  - Ocultação do slot de "All Day" (Dia inteiro) que ficava no topo do calendário.
  - Formatação de todas as horas para o padrão Brasileiro 24h (ex: `09:00` em vez de `9am`).
- **Agenda (Regras de Negócio):**
  - **Drag and Drop:** Ao arrastar e soltar uma consulta na agenda, o sistema agora arredonda os minutos matematicamente para **múltiplos de 5** (ex: 13:32 vira 13:30/13:35), facilitando o encaixe visual.
  - **Buffer de Segurança:** O intervalo mínimo de bloqueio exigido pelo sistema entre consultas no mesmo dentista caiu de **10 minutos para 5 minutos**.

---

## 2. Refatoração do Módulo Financeiro (Pagamentos Fracionados)

Esta foi a maior e mais profunda alteração recente, permitindo que as recepcionistas dividam o pagamento de uma consulta em vários métodos diferentes (ex: Metade Cartão, Metade PIX).

### 2.1 Banco de Dados (Prisma)
- **Remoção da Trava `@unique`:** O campo `appointmentId` no model `Payment` (`schema.prisma`) não possui mais a trava única. Isso transformou o relacionamento de **1-para-1** (uma consulta = um pagamento) para **1-para-N** (uma consulta = lista de pagamentos).
- **Recriação do Banco de Dados:** Como o SQLite (banco de desenvolvimento local) não suporta remoção de Constraints via migração, o comando `db push` resetou a estrutura das tabelas locais. Os dados do ambiente de testes voltaram a ser zero.

### 2.2 Backend (Regras Financeiras)
- **Validação de Saldo (`createPayment`):** Antes de registrar um novo pagamento via PIX, Cartão ou Dinheiro, o Backend agora soma todo o histórico de pagamentos daquela consulta. 
  - Se a soma for maior que o valor total da consulta, ele bloqueia por segurança (Excede o Saldo Devedor).
- **Atualização de Queries (Buscas):**
  - Todos os locais do Backend (`appointmentController.ts`, `financeController.ts`, `patientController.ts`) que buscavam a palavra `payment` (singular) foram reescritos para ler `payments` (plural - Array), evitando o erro 500 que estava "derrubando" e zerando as telas na interface.
  - A busca por **Inadimplentes** foi atualizada: Agora ela procura consultas concluídas onde a contagem de `payments` é zero (usando `payments: { none: {} }`).

### 2.3 Frontend (Recepcionista)
- **Listagem de Pendentes (`Finance.tsx`):**
  - A tabela agora calcula dinamicamente o saldo. Se uma consulta de R$ 500 recebeu R$ 200, ela **não some** da lista de pendentes. Ela passa a mostrar um selo visual: *"Já pago: R$ 200,00"*.
  - A consulta só é transferida para a aba de "Pagos" quando o total pago (redução de array) bater com o preço total do procedimento.
- **Modal de Recebimento (`openPayModal`):**
  - Quando a recepcionista clica para receber, o sistema calcula `Total - Pago`. O valor já vem pré-preenchido com o **Saldo Restante**, impedindo que a recepcionista acidentalmente cobre o valor integral de novo.
- **Tabela de Pagos:**
  - O método de pagamento agora exibe *"Múltiplos"* se a pessoa tiver pago com mais de um método diferente.
- **Dashboard e Perfil do Paciente:**
  - O gráfico de pizza do dashboard (`Dashboard.tsx`) e a tag visual na linha do tempo do paciente (`PatientProfile.tsx`) foram atualizados para rodarem a função `isFullyPaid()`, que soma as parcelas, em vez de dependerem de um pagamento único.

---

## 3. Próximos Passos (A Resolver)

Conforme alinhamento com o usuário, existem alguns pequenos **bugs ou polimentos lógicos residuais** provenientes dessa mudança estrutural pesada no financeiro que precisaremos endereçar a seguir, antes de prosseguir com novas funcionalidades de segurança na agenda.
