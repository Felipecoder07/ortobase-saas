# Resumo das Últimas Atualizações do Sistema

Abaixo está o compilado de todas as implementações e correções críticas que realizamos recentemente no sistema. Utilize este documento como base para definir quais áreas você deseja refinar a seguir.

## 1. Pacientes e Prontuários (Perfil 360º)
- **Ações de Edição:** Inclusão de botões para editar dados de pacientes e dentistas existentes sem precisar recriá-los.
- **Perfil Exclusivo do Paciente:** Criação de uma página dedicada (`/dashboard/patients/:id`).
- **Histórico Unificado:** Na tela do paciente, agora é possível ver todo o histórico de consultas em ordem cronológica.
- **Status Integrado:** A lista de histórico de consultas mostra o cruzamento de dados com o financeiro em tempo real (ex: informa se a consulta está "Pendente" ou "Paga").
- **Anotações Clínicas:** Um bloco de texto dedicado e salvamento permanente para laudos, alergias e informações médicas do paciente.

## 2. Operacional e Agenda
- **Botões de Ação Rápida:** Adicionados botões diretos na lista da Agenda para marcar consultas como `Confirmada`, `Cancelada`, `Faltou` ou `Realizada` em apenas 1 clique.
- **Valor da Consulta na Origem:** O modal de "Nova Consulta" ou "Edição de Consulta" agora conta com o campo **Valor / Preço**. Assim, a clínica já fixa o preço base do procedimento no ato do agendamento.

## 3. Gestão Financeira Inteligente
- **Filtro de Relatórios:** Adição de um input de "Mês/Ano" na aba de relatórios. O sistema agora recalcula o faturamento e lista a inadimplência apenas referente àquele período escolhido, abandonando a limitação de mostrar sempre o mês atual.
- **Lógica de Descontos e Preservação de Histórico:** 
  - Ao clicar em "Receber" no financeiro, a caixa de valor **já vem pré-preenchida** com o Preço Base estipulado na Agenda.
  - Se o recepcionista alterar para um valor menor, o sistema registra um **Desconto** automático e salva o pagamento.
  - **Diferencial:** O preço original da consulta na Agenda **não é mais sobrescrito**, garantindo que as tabelas de preço histórico permaneçam corretas, mesmo quando houver choro ou cortes de valor no balcão.
- **Visibilidade de Métodos:** A aba "Pagos" agora traz uma coluna nova mostrando se a entrada de dinheiro foi por PIX, Dinheiro, ou Cartão. Se houver desconto no pagamento, uma mini etiqueta de alerta amarelo sinaliza a dedução.

## 4. Correções de Infraestrutura
- **Sessão Estendida:** A autenticação do sistema (JWT) que deslogava o usuário por inatividade e gerava "Token Inválido" teve a validade estendida de 30 minutos para 7 dias corridos, melhorando a fluidez de uso.

---
> [!TIP]
> Caso queira refinar a parte visual de algo (como mudar cores de tabelas), ou refinar alguma regra de negócio (como criar permissões para quem pode dar desconto), você pode me guiar com base nos itens acima!
