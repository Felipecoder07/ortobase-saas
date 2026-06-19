# 🦷 Relatório de Avaliação Funcional (Por Setor)

Realizei uma varredura completa no nosso código-fonte (Banco de Dados, Rotas do Backend e Telas do Frontend) e cruzei com a nossa documentação oficial de **Módulos de Produção**. 

Abaixo está o mapeamento exato de onde estamos, o que pode ser melhorado no que já existe, e o que ainda precisamos construir para alcançar a visão do MVP e além.

---

## 1. ⚙️ Fundação & Autenticação (Módulo 1)
**Status Atual:** ✅ Concluído (Base Sólida)
Temos um sistema `Multi-tenant` robusto operando no banco. A autenticação via JWT com Bcrypt está implementada e o roteamento funciona por `tenantId`.

**O que pode melhorar:**
- **Recuperação de Senha:** Implementar o fluxo de "Esqueci minha senha" com disparo de e-mail (Nodemailer ou Resend).
- **Bloqueio de Segurança:** A tabela já tem `failedLoginAttempts`, mas falta garantir que IPs ou usuários sejam congelados temporariamente após 5 erros, e registrar logs de auditoria (quem acessou o que e quando).

## 2. 👥 Cadastros Básicos (Módulo 2)
**Status Atual:** ✅ Concluído
Pacientes, Dentistas e Procedimentos. Todos possuem CRUD operante, com inativação lógica (soft delete usando o `isActive`).

**O que pode melhorar:**
- **Busca Global:** Otimizar as buscas no backend para suportar paginação pesada quando a clínica tiver milhares de registros.
- **Validações Fortes:** Validar de fato o formato do CPF no Backend e garantir a formatação dinâmica no Frontend durante a digitação.
- **Fotos de Perfil:** Permitir o upload de avatares para dentistas e pacientes.

## 3. 📅 Agenda & Consultas (Módulo 3)
**Status Atual:** ✅ Concluído (Recém aprimorado)
A agenda visual funciona perfeitamente, com controle de status, checagem de conflitos de horário do dentista e o novíssimo suporte a **Múltiplos Procedimentos** numa única consulta.

**O que pode melhorar:**
- **Arrastar e Soltar (Drag-and-Drop):** Implementar um calendário interativo onde a recepcionista possa arrastar a consulta para reagendar.
- **Visualização Semanal/Mensal:** Atualmente focamos na visão diária, expandir o componente para a visão da semana completa.

## 4. 🩻 Prontuário Eletrônico (EHR / Clínico)
**Status Atual:** ✅ Concluído
O banco de dados possui as tabelas `Anamnesis`, `TreatmentPlan` (Planos de Tratamento), `ToothCondition` (Odontograma) e `PatientAttachment` (Anexos/Radiografias), totalmente integrados nas abas.

**O que já resolvemos com sucesso:**
- **Odontograma Visual:** UI 100% gráfica. O dentista interage com as faces dos dentes e colore conforme legendas dinâmicas e customizáveis.
- **Assinatura Digital:** Pacientes assinam orçamentos e anamneses na tela do PC, via leitura de QR Code no próprio celular (sincronizado em tempo real) ou via validação de CPF e Data de Nascimento (Aceite Eletrônico).
- **Upload de Arquivos:** Abas de anexos recebendo imagens e PDFs, hospedando localmente de forma segura.

## 5. 💰 Financeiro & Faturamento (Módulo 5)
**Status Atual:** 🟡 Em Andamento
A tabela `Payment` permite dividir o pagamento, calcular descontos, lidar com parcelas e métodos (Pix, Crédito, etc). O fluxo de caixa básico está desenhado.

**O que falta construir/melhorar:**
- **Integração de Pagamento:** Conectar uma API de Gateway de Pagamento (Asaas, Stripe, Mercado Pago) para gerar QR Codes PIX dinâmicos e aprovar cartões direto no sistema.
- **Comprovantes em PDF:** Geração de recibos em formato PDF prontos para impressão ou envio por WhatsApp.

## 6. 📊 Dashboard (Módulo 6)
**Status Atual:** ✅ Concluído
Temos os indicadores gerais na página principal (consultas, inadimplência e faturamento básico). 

**O que já resolvemos com sucesso:**
- **Exportação CSV:** Botões no Módulo Financeiro para o gestor e para a recepcionista exportarem planilhas do dia ou do mês inteiro.
- **Métricas de Conversão e Gráficos:** Integração com `recharts` para exibir relatórios avançados ("Adimplência vs Inadimplência" e "Status de Consultas") na aba de Relatórios.

---

## 🚀 O Grande Gap (O que falta construir do Zero)

Existem duas grandes áreas documentadas que ainda **não foram iniciadas**:

1. **M4 - Bot de Atendimento & WhatsApp:**
   A integração com a API da Meta para mandar lembretes ("Sua consulta é amanhã às 14h") e o bot de autoatendimento para o paciente marcar sozinho.
   
2. **M7 - Automações de Pós-Atendimento:**
   Tarefas agendadas (Cron Jobs) que rodam sozinhas de madrugada pesquisando quem fez aniversário e mandando parabéns, ou enviando link de pesquisa de satisfação após uma consulta ser marcada como "COMPLETED".

---

### Resumo do Próximo Passo Ideal
Até agora nós destruímos e completamos o **EHR Clínico Inteiro**, e criamos relatórios e **Gráficos Avançados**.

**O que falta atacar agora?**
A escolha é sua:
1. **Comprovantes PDF:** Geração de recibos financeiros em PDF prontos para impressão ou envio por WhatsApp.
2. **Gateway de Pagamentos:** Conectar Mercado Pago/Stripe para ler cartões ou emitir PIX Code diretamente no painel.
3. **Bot de WhatsApp / Meta API:** Começar a desenhar a comunicação automatizada de marcação de consultas.

O que você quer que eu ataque primeiro?

---

## 🔮 Visão de Futuro (Diferenciais Enterprise)
Quando o sistema principal estiver 100% operacional, estas são as 5 áreas que transformarão o SaaS em uma solução Premium (matadora de concorrência):

1. **📦 Controle de Estoque de Materiais:** Baixa automática de materiais (resina, anestésicos) ao finalizar procedimentos e alertas de estoque baixo.
2. **🧪 Gestão de Laboratório de Próteses:** Controle de envio, prazos de entrega e custos com laboratórios terceirizados. Bloqueio inteligente de agenda se a prótese não chegou.
3. **💸 Split de Pagamento e Comissão:** Regras dinâmicas de comissionamento de dentistas (ex: 40% descontando taxa de cartão) e geração de holerites/extratos automáticos.
4. **📄 Prescrição Eletrônica (Receituário):** Gerador de receitas em PDF (com logo e dados da clínica) integrado a banco de medicamentos (ex: Amoxicilina), pronto para impressão ou envio.
5. **🧾 Emissão de Nota Fiscal (NFS-e) Automática:** Integração com prefeituras (via FocusNFe/eNotas) para emissão automática após o recebimento no Financeiro.
