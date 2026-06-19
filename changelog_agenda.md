# Relatório de Atualizações: Módulo de Agenda e Consultas

Este documento consolida todas as funcionalidades, refatorações e correções de bugs implementadas recentemente no sistema, com foco no motor de agendamentos e na experiência visual do calendário.

## 1. Visões da Agenda (FullCalendar)
A tela de Agenda foi totalmente reconstruída para acomodar 3 tipos de visões distintas:
*   **Visão Diária (Lista):** Mantém o padrão original de lista para o dia atual, facilitando a visão de recepção.
*   **Visão Semanal (Grid de Horários):** Implementação do FullCalendar (`timeGridWeek`). Exibe a semana em colunas, permitindo visualização de horários ocupados e livres.
*   **Visão Mensal (Grid de Dias):** Implementação do FullCalendar (`dayGridMonth`). Mostra os dias do mês em blocos, com as consultas listadas sequencialmente em cada dia.

## 2. Motor de Arrastar e Soltar (Drag & Drop)
*   **Reschedule Visual:** Agora é possível remarcar consultas simplesmente "arrastando" o card de um dia/horário para outro na visão Semanal ou Mensal.
*   **Sincronização Automática:** Ao soltar o card, o sistema atualiza o banco de dados em tempo real e re-sincroniza (refresh) o Dashboard e as outras abas instantaneamente.
*   **Horários Quebrados:** Configuração de `snapDuration="00:05:00"`, permitindo que ao arrastar o mouse, a consulta possa ser agendada em intervalos precisos de 5 em 5 minutos (ex: 08:15, 08:55).

## 3. Design Visual e Estética dos Cards
*   **Layout Espaçoso:** A altura das linhas da tabela foi aumentada drasticamente (`height: 4em`), e os cards ganharam uma altura mínima garantida (`eventMinHeight={75}`). Isso garante que consultas muito curtas (ex: 15min) não espremam o texto.
*   **Estrutura de Informação (Semanal):** O card exibe sem amontoar: Horário (que nunca quebra a linha), Nome e Sobrenome do paciente (em negrito), Procedimento, e no rodapé o Prefixo e Primeiro Nome do dentista acompanhado de um ícone.
*   **Cores Dinâmicas:** As bordas e cores de fundo do calendário agora respeitam as cores exatas do "Status" da consulta (Azul para Agendada, Verde para Realizada, etc).
*   **Tooltips (Caixa Preta):** Adicionado `title` nativo. Ao passar o mouse por cima de qualquer consulta na visão Semanal ou Mensal, um balão preto exibe todos os detalhes completos, prevenindo perdas de informação em textos cortados.

## 4. Correção Global de Fuso Horário (Timezone Bug)
*   **Unificação UTC:** Havia um desalinhamento onde o banco salvava em UTC (horário global) e o FullCalendar lia em horário local (BRT), causando descompassos de horas entre o Modal, o Dashboard e o Calendário.
*   **Resolução:** Todo o frontend do calendário e os cálculos do Modal de edição foram forçados a interpretar a data diretamente em **UTC**, garantindo que se a consulta foi marcada para 10:00, ela aparecerá como 10:00 em absolutamente todas as telas e painéis.

## 5. Regras Rígidas de Conflito no Servidor
*   **Blindagem Matemática:** A lógica de backend foi reescrita utilizando cálculos de intersecção (`reqStart < blockedEnd && reqEnd > blockedStart`) que barram qualquer colisão de horários 100% das vezes.
*   **Consultas Paralelas (Múltiplos Dentistas):** O sistema agora entende de forma inteligente que consultas podem ocorrer no mesmo horário e dia, **desde que sejam para dentistas diferentes**.
*   **Bloqueio de Paciente em Múltiplos Horários:** O sistema agora impede que **o mesmo paciente** seja agendado para duas consultas diferentes (mesmo que com dentistas diferentes) no exato mesmo horário.
*   **Buffer Obrigatório (10 minutos):** Foi criada uma regra de intervalo compulsório. Para o mesmo dentista, uma consulta só pode ser agendada se houver uma "janela de respiro" de pelo menos 10 minutos após o término da consulta anterior e 10 minutos antes da próxima consulta.
*   **Bloqueio por Status:** Agora, *qualquer* consulta bloqueia o horário, incluindo as que já foram marcadas como "Realizadas" ou "Faltou". O horário só fica livre novamente se a consulta for expressamente "Cancelada".

## 6. Personalização de Dentistas (Gênero)
*   **Banco de Dados:** Atualização do Prisma Schema para incluir o campo `gender` na tabela de Dentistas.
*   **Cadastro:** Adição de uma caixa de seleção "Dr. / Dra." no formulário de Novo Dentista / Edição de Dentista.
*   **Aplicação Visual:** O sistema lê essa informação no banco e aplica de forma inteligente na leitura do calendário, imprimindo dinamicamente o prefixo correspondente (ex: Dra. Ana, Dr. Pedro) na visualização dos agendamentos.
