# 🦷 Bot Clínica Odontológica — Módulos de Produção

> Baseado na **Documentação de Requisitos v1.0 (2026)**  
> Estratégia: entregar módulo por módulo, avaliar e decidir o que mantemos antes de avançar.

---

## Visão Geral dos Módulos

| # | Módulo | Pacote alvo | Prioridade |
|---|--------|-------------|------------|
| M1 | Fundação Técnica (Infra + Auth + Multi-tenant) | Todos | 🔴 Crítico |
| M2 | Pacientes & Dentistas | Básico | 🔴 Crítico |
| M3 | Agenda | Básico | 🔴 Crítico |
| M4 | Bot de Atendimento + WhatsApp | Básico → Pro | 🔴 Crítico |
| M5 | Módulo Financeiro | Pro | 🟠 Alto |
| M6 | Dashboard & Relatórios | Pro → Premium | 🟠 Alto |
| M7 | Automações & Pós-atendimento | Pro → Premium | 🟡 Médio |
| M8 | Segurança Avançada | Premium | 🟡 Médio |
| M9 | Funcionalidades Premium+ | Premium+ | 🟢 Baixo |

---

## M1 — Fundação Técnica

> **Objetivo:** Criar a base que todos os módulos vão usar. Nada funciona sem isso.

### Escopo
- Configuração do projeto (repositório, CI/CD, Docker)
- Banco de dados multi-tenant (isolamento por clínica)
- Sistema de autenticação: login/senha + sessão com timeout 30 min
- Controle de perfis de acesso: **Administrador**, **Recepcionista**, **Dentista**
- Recuperação de senha via e-mail
- Bloqueio após 5 tentativas de login (RF-089 ao RF-096)
- HTTPS + TLS 1.2, criptografia AES-256 em repouso, hash bcrypt (RNF-007 ao RNF-014)
- Backup automático diário (RNF-012)
- Estrutura de API REST documentada com Swagger/OpenAPI (RNF-033)
- Webhooks de eventos básicos (RNF-034)

### Requisitos mapeados
`RF-089`, `RF-090`, `RF-091`, `RF-092`, `RF-093`, `RF-094`, `RF-095`, `RF-096`  
`RNF-001` a `RNF-014`, `RNF-025` a `RNF-030`, `RNF-033`, `RNF-034`  
`RG-034` a `RG-039`

### Critérios de aceite
- [ ] Login funciona com todos os 3 perfis
- [ ] Sessão expira em 30 min de inatividade
- [ ] Senha bloqueada após 5 tentativas
- [ ] Banco de dados isolado por clínica (multi-tenant)
- [ ] API com documentação Swagger acessível
- [ ] Backup automático rodando em produção

### ⚖️ Ponto de avaliação M1
> Antes de avançar: revisar arquitetura, stack tecnológica, custo de infraestrutura e se o modelo multi-tenant atende às necessidades iniciais.

---

## M2 — Módulo de Pacientes & Dentistas

> **Objetivo:** Permitir que a clínica gerencie seu cadastro base.

### Escopo — Pacientes
- Cadastro completo: nome, CPF, data nasc., telefone, e-mail, endereço
- Validação de CPF sem duplicidade
- Edição e inativação lógica
- Histórico de consultas e procedimentos
- Anotações clínicas (prontuário)
- Busca por nome, CPF ou telefone
- Listagem com paginação e filtros

### Escopo — Dentistas
- Cadastro: nome, CRO, especialidade, telefone, e-mail
- Múltiplos dentistas por clínica
- Configuração de horários de atendimento
- Inativação lógica

### Requisitos mapeados
**Pacientes:** `RF-001` a `RF-010`  
**Dentistas:** `RF-061` a `RF-067`  
**Regras:** `RG-034` a `RG-039` (perfis de acesso por módulo)

### Critérios de aceite
- [ ] Cadastro com validação de CPF duplicado
- [ ] Edição e inativação sem exclusão física
- [ ] Busca funcionando por nome, CPF e telefone
- [ ] Histórico de consultas vinculado ao paciente
- [ ] Dentista com agenda de horários configurada

### ⚖️ Ponto de avaliação M2
> Antes de avançar: validar UX do cadastro, decidir se campos adicionais são necessários para o mercado-alvo, avaliar se a pré-triagem será inserida aqui ou no M4.

---

## M3 — Módulo de Agenda

> **Objetivo:** Coração operacional da clínica — agendamento, visualização e controle de consultas.

### Escopo
- Agendamento com seleção de serviço, dentista, data e horário disponível
- Reagendamento e cancelamento com registro de motivo
- Confirmação de consulta pelo paciente via WhatsApp
- Visualização de agenda: **diária**, **semanal** e **mensal**
- Bloqueio de horários e registro de férias/ausências
- Configuração de duração por tipo de consulta
- Impedimento de conflitos de horário (RG-001)
- Status da consulta: agendada / confirmada / cancelada / realizada / falta
- Envio de comprovante de agendamento via WhatsApp

### Requisitos mapeados
`RF-011` a `RF-024`  
`RG-001` a `RG-015` (regras de agendamento e cancelamento/no-show)

### Critérios de aceite
- [ ] Não permite dois agendamentos no mesmo horário/dentista
- [ ] Somente horários disponíveis do dentista aparecem
- [ ] Status muda corretamente conforme fluxo
- [ ] Cancelamento tardio (< 24h) é registrado como tal
- [ ] Paciente com 3+ cancelamentos tardios recebe alerta
- [ ] Comprovante enviado ao paciente após agendamento

### ⚖️ Ponto de avaliação M3
> Antes de avançar: validar com usuários reais (recepcionistas) a usabilidade da tela de agenda, revisar regras de negócio de cancelamento e no-show com o cliente.

---

## M4 — Bot de Atendimento + WhatsApp

> **Objetivo:** Automatizar o atendimento ao paciente via WhatsApp.

### Escopo — Bot
- Saudação personalizada e identificação do paciente (telefone/CPF)
- Menu de opções: agendar, reagendar, cancelar, FAQ
- Respostas automáticas: horário de funcionamento, endereço, convênios, formas de pagamento
- Fluxo de agendamento completo pelo bot (≤ 5 interações)
- Confirmação do agendamento com resumo
- Transferência para atendente humano (handoff)
- Mensagens fora do fluxo → encaminhamento humano
- Log de todos os atendimentos
- Encerramento automático após 15 min sem resposta (RG-027)
- Respeitar horário comercial (RG-029)

### Escopo — WhatsApp
- Integração com **API Oficial WhatsApp Business (Meta)**
- Lembretes automáticos: 24h antes e 2h antes
- Confirmação imediata após agendamento
- Notificação de cancelamento
- Registro de status de entrega de cada mensagem
- Fila de reenvio em caso de falha da API (RNF-017)

### Requisitos mapeados
**Bot:** `RF-025` a `RF-038`  
**WhatsApp:** `RF-039` a `RF-048`  
**Regras:** `RG-026` a `RG-033`, `RG-040` a `RG-045` (LGPD/comunicação)

### Critérios de aceite
- [ ] Bot responde em ≤ 3 segundos (RNF-002)
- [ ] Agendamento completo via bot em ≤ 5 interações (RNF-021)
- [ ] Transferência para humano funciona
- [ ] Lembretes enviados nos horários certos (atraso máx. 5 min — RNF-006)
- [ ] Fora do horário comercial, bot informa e não agenda
- [ ] Nenhuma mensagem enviada entre 22h e 8h (RG-044)
- [ ] Credenciais do WhatsApp não expostas no frontend (RNF-014)

### ⚖️ Ponto de avaliação M4
> Antes de avançar: testar fluxo completo do bot com pacientes reais, verificar custos da API Oficial Meta, decidir se integramos com API não-oficial temporariamente (avaliar riscos) ou se vamos direto para a oficial.

---

## M5 — Módulo Financeiro

> **Objetivo:** Registrar e controlar o faturamento da clínica.

### Escopo
- Registro de pagamentos vinculados a consultas
- Métodos: **Pix**, **cartão crédito/débito**, **dinheiro**
- Valor de procedimento configurável por tipo e dentista
- Lista de consultas pagas e pendentes
- Descontos (somente Admin/Dentista, máx. 20% sem aprovação)
- Parcelamento em cartão (mínimo R$ 30/parcela)
- Relatórios: faturamento **diário**, **mensal** e **anual**
- Relatório de inadimplência
- Comprovante de pagamento enviado ao paciente via WhatsApp
- Estorno com registro de justificativa (consultas pagas não podem ser excluídas)
- Conformidade PCI-DSS (não armazenar dados completos de cartão)
- Integração com gateways certificados pelo Banco Central (RNF-032)

### Requisitos mapeados
`RF-049` a `RF-060`  
`RG-016` a `RG-025`

### Critérios de aceite
- [ ] Pagamento vinculado corretamente à consulta
- [ ] Pix e cartão integrados via gateway certificado
- [ ] Desconto só aplicável por Admin ou Dentista
- [ ] Relatório de faturamento correto por período
- [ ] Comprovante enviado via WhatsApp
- [ ] Dados de cartão não armazenados (PCI-DSS)

### ⚖️ Ponto de avaliação M5
> Antes de avançar: avaliar qual gateway de pagamento usar (Asaas, PagSeguro, Stripe, etc.), confirmar fluxo de estorno com a clínica cliente, decidir se relatório anual vai para este módulo ou para o M6.

---

## M6 — Dashboard & Relatórios

> **Objetivo:** Dar visibilidade gerencial à clínica.

### Escopo
- Cards principais: total de pacientes, consultas do dia/semana/mês, cancelamentos, faltas (no-show)
- Gráficos: consultas por mês, faturamento mensal, novos pacientes por mês
- Relatório de desempenho com indicadores avançados
- Exportação de relatórios em **PDF** e **Excel**
- Taxa de conversão de novos pacientes
- Resumo diário enviado ao dentista via WhatsApp (RF-066)
- Autenticação do Admin para exportar relatórios > R$ 10.000 (RG-023)

### Requisitos mapeados
`RF-068` a `RF-079`

### Critérios de aceite
- [ ] Dashboard carrega em ≤ 3 segundos (RNF-005)
- [ ] Gráficos corretos com dados reais
- [ ] Exportação em PDF e Excel funcionando
- [ ] Resumo diário chegando ao dentista via WhatsApp
- [ ] Exportação de alto valor exige re-autenticação

### ⚖️ Ponto de avaliação M6
> Antes de avançar: validar quais métricas são mais relevantes para o usuário final, considerar se BI externo (Metabase, Power BI) seria mais adequado do que relatórios internos para clientes Premium.

---

## M7 — Automações & Pós-atendimento

> **Objetivo:** Manter o paciente engajado após a consulta e automatizar follow-ups.

### Escopo
- Pesquisa de satisfação enviada após consulta
- Solicitação de avaliação no Google após consulta
- Mensagem de retorno automático: **6 meses** e **1 ano**
- Mensagem em datas comemorativas (aniversário do paciente)
- Alerta para pacientes sem retorno há > 12 meses
- Mensagem de reengajamento para pacientes no-show
- Registro e exibição de nota média das pesquisas
- **Pré-triagem digital** enviada após confirmação de agendamento:
  - Questionário: alergias, doenças sistêmicas, anticoagulantes, gestação
  - Alerta ao dentista para pacientes de risco
  - Vinculação ao prontuário do paciente

### Requisitos mapeados
`RF-080` a `RF-088`  
`RG-013`, `RG-046` a `RG-050`

### Critérios de aceite
- [ ] Pesquisa de satisfação chega após a consulta
- [ ] Mensagem de retorno agendada para 6m e 1 ano
- [ ] Pré-triagem enviada automaticamente após confirmação
- [ ] Dentista vê alerta de paciente de risco antes da consulta
- [ ] Pacientes sem retorno há > 12 meses recebem mensagem

### ⚖️ Ponto de avaliação M7
> Antes de avançar: testar taxa de abertura e resposta da pesquisa de satisfação, avaliar se a pré-triagem precisa de assinatura digital (abre discussão sobre o M9), definir política de envio para conformidade com LGPD.

---

## M8 — Segurança Avançada

> **Objetivo:** Adicionar camadas extras de segurança para clientes Premium.

### Escopo
- Autenticação em dois fatores (2FA) para Administrador
- Log de auditoria imutável de todas as operações sensíveis
- Monitoramento de uptime com alertas automáticos (RNF-018)
- Failover automático em caso de falha do servidor (RNF-016)
- RTO < 4 horas (RNF-019)
- Suspensão automática de usuários inativos há > 90 dias (RG-038)

### Requisitos mapeados
`RF-096`, `RNF-011`, `RNF-015` a `RNF-019`  
`RG-038`, `RG-039`

### Critérios de aceite
- [ ] 2FA funcionando via autenticador ou SMS
- [ ] Logs imutáveis disponíveis para o Admin
- [ ] Monitoramento de uptime configurado com alertas
- [ ] Usuário inativo há > 90 dias é suspenso automaticamente

### ⚖️ Ponto de avaliação M8
> Antes de avançar: avaliar necessidade de penetration testing antes do lançamento do plano Premium, definir ferramenta de monitoramento (Datadog, UptimeRobot, etc.).

---

## M9 — Funcionalidades Premium+

> **Objetivo:** Funcionalidades avançadas para clínicas de grande porte.  
> ⚠️ **Prioridade Baixa** — implementar somente após validar mercado com os módulos anteriores.

### Escopo
- IA generativa integrada (ChatGPT / Claude) para respostas avançadas
- Integração com **Instagram Direct** e **Facebook Messenger**
- Sincronização com **Google Calendar**
- Assinatura digital de documentos
- Relatórios analíticos com apoio de IA
- Gestão de **múltiplas unidades** (multitenant por clínica/filial)
- **App mobile** para iOS e Android
- **Teleconsulta** (videochamada integrada)
- Reconhecimento de comandos de voz
- Suporte **multilíngue**: Português, Inglês e Espanhol

### Requisitos mapeados
`RF-097` a `RF-106`

### Critérios de aceite
- [ ] IA responde com contexto da clínica corretamente
- [ ] Integração Instagram/Facebook testada e aprovada pela Meta
- [ ] Google Calendar sincronizado bidirecionalmente
- [ ] App mobile publicado nas lojas
- [ ] Teleconsulta com qualidade mínima de vídeo HD

### ⚖️ Ponto de avaliação M9
> Avaliar ROI de cada funcionalidade antes de implementar. Algumas (ex.: app mobile, teleconsulta) podem ser terceirizadas ou integradas via SDK ao invés de desenvolvidas do zero.

---

## Ordem de Entrega Recomendada

```
M1 → M2 → M3 → M4 → [AVALIAÇÃO MVP] → M5 → M6 → M7 → M8 → [AVALIAÇÃO PRO] → M9
```

### MVP Comercializável (Pacote Básico)
Após M1 + M2 + M3 + M4 o produto já é vendável no **Pacote Básico** (R$ 2.500 – 4.000 + R$ 150–250/mês).

### Produto Profissional (Pacote Pro)
Após M5 + M6 + M7 o produto atinge o **Pacote Pro** (R$ 6.000 – 8.000 + R$ 350–500/mês).

### Produto Premium
Após M8 + parte do M9 o produto atinge o **Pacote Premium** (R$ 12.000–20.000 + R$ 700–1.200/mês).

---

## Regras Transversais (Aplicadas em Todos os Módulos)

> Estas regras devem ser respeitadas **desde o M1**:

- **LGPD:** Consentimento explícito para marketing, direito ao esquecimento, retenção de dados (5 anos para consultas, 1 ano para logs de acesso)
- **Horário de envio:** Nenhuma mensagem automática entre 22h e 8h (exceto confirmações imediatas)
- **Desempenho:** Interface web ≤ 2s, Bot ≤ 3s, Dashboard ≤ 3s
- **Disponibilidade:** SLA mínimo de 99,5%
- **Escalabilidade:** Mínimo 50 atendimentos simultâneos (Básico), 200 (Premium)
