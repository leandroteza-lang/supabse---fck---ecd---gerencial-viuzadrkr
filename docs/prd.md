# PRD — BoardECD: Plataforma de Inteligência Contábil para SPED ECD

**Versão:** 1.0  
**Data:** 2026-04-24  
**Status:** Ativo

---

## 1. Visão Geral do Produto

### 1.1 Resumo Executivo

O **BoardECD** é uma aplicação web SaaS de inteligência contábil que transforma arquivos SPED ECD (Escrituração Contábil Digital) em dashboards interativos, relatórios analíticos e indicadores financeiros prontos para uso gerencial e estratégico.

O produto elimina a necessidade de exportar dados do sistema contábil para planilhas, executar cálculos manuais ou contratar ferramentas de BI caras. Com poucos cliques, contadores, CFOs e gestores financeiros obtêm uma visão completa e confiável da saúde financeira da empresa.

### 1.2 Proposta de Valor

> "Transforme arquivos SPED ECD em dashboards interativos, DREs analíticas e indicadores de performance em poucos cliques."

| Para quem | O problema | A solução |
|---|---|---|
| Contadores e BPOs | Perdem horas formatando planilhas para apresentar dados aos clientes | Geram relatórios visuais prontos diretamente do SPED |
| CFOs e Diretores Financeiros | Não têm acesso a indicadores em tempo real sem depender do contador | Visualizam KPIs atualizados assim que o SPED é importado |
| Gestores de PMEs | Não entendem os relatórios contábeis tradicionais | Interface acessível com explicações em linguagem simples |
| Auditores Internos | Precisam validar se os números do sistema batem com o arquivo oficial | Auditoria automática comparando Bloco I com Bloco J |

---

## 2. Objetivos do Produto

### 2.1 Objetivos de Negócio

1. Reduzir o tempo de preparação de relatórios gerenciais de horas para segundos.
2. Aumentar a percepção de valor dos serviços contábeis com entregáveis visuais profissionais.
3. Permitir que PMEs acessem análise financeira de nível empresarial sem custo de BI corporativo.

### 2.2 Métricas de Sucesso

| Métrica | Baseline | Meta |
|---|---|---|
| Tempo de importação e visualização de SPED | >30 min (planilha manual) | <2 min |
| Número de indicadores calculados automaticamente | 0 (manual) | 20+ indicadores |
| Precisão dos cálculos vs. Bloco J oficial | N/A | 100% (diferença < R$ 1,00) |
| Retenção mensal de usuários ativos | N/A | >70% |

---

## 3. Personas de Usuário

### Persona 1 — Ana, Contadora de BPO
- **Perfil:** Contadora com 10+ anos de experiência, atende 30+ clientes PME.
- **Dores:** Perde 2–3 horas por cliente para montar relatório gerencial no Excel. Clientes pedem visualizações, não só números.
- **Ganha com o BoardECD:** Importa o SPED do cliente em 1 minuto e entrega um painel completo com DRE, indicadores e gráficos de evolução.

### Persona 2 — Carlos, CFO de Empresa de Médio Porte
- **Perfil:** CFO sem formação contábil profunda, foco em estratégia e tomada de decisão.
- **Dores:** Depende do contador para obter indicadores. Quando recebe, já estão desatualizados.
- **Ganha com o BoardECD:** Acessa o dashboard atualizado a qualquer momento; entende os indicadores graças às explicações contextuais da interface.

### Persona 3 — Roberto, Auditor Interno
- **Perfil:** Analisa consistência de dados entre sistemas.
- **Dores:** Precisa cruzar manualmente os números do sistema ERP com o SPED entregue ao fisco.
- **Ganha com o BoardECD:** Aba de Auditoria compara automaticamente os saldos calculados (Bloco I) com os saldos oficiais (Bloco J) e sinaliza divergências.

---

## 4. Funcionalidades do Produto

### 4.1 Módulo de Autenticação

**Descrição:** Controle de acesso seguro via Supabase Auth.

**Fluxo:**
1. Usuário acessa `/login`.
2. Pode fazer **login** (email + senha) ou **cadastro** ("Cadastre-se grátis").
3. Após autenticação bem-sucedida, é redirecionado para a rota de origem ou `/`.
4. Sessão persiste via `localStorage` (token de refresh automático).

**Tela de login:**
- Formulário email + senha com validação de campos obrigatórios.
- Feedback de erro via toast: "Credenciais inválidas".
- Painel lateral promocional (desktop) com os 3 pilares do produto.

**Critérios de aceite:**
- [x] Login com credenciais válidas redireciona para o dashboard.
- [x] Login com credenciais inválidas exibe toast de erro sem travar a tela.
- [x] Cadastro cria conta e exige confirmação por e-mail.
- [x] Rota `/` protegida: sem autenticação, redireciona para `/login`.

---

### 4.2 Importação de Dados SPED ECD

**Descrição:** Parsing de arquivos `.txt` no formato SPED ECD (ISO-8859-1) diretamente no navegador, sem servidor intermediário.

**Registros SPED processados:**

| Registro | Conteúdo |
|---|---|
| `0000` | Informações da empresa (nome, CNPJ, período) |
| `I050` | Plano de contas (código, nome, natureza, tipo, nível, pai) |
| `I150` | Abertura de período contábil |
| `I155` | Saldo de conta no período (sldIni, D/C, débito, crédito, sldFin) |
| `I200` | Data do lançamento contábil (para Livro Razão) |
| `I250` | Linhas de lançamento contábil (conta, valor, D/C, histórico) |
| `J100` | Balanço patrimonial oficial (Bloco J — para auditoria) |
| `J150` | DRE oficial (Bloco J — para auditoria) |

**Comportamento:**
- Suporta **múltiplos arquivos simultâneos** (ex.: 12 meses carregados de uma vez).
- Parser executado no browser via `FileReader.readAsText()` — sem upload de arquivo para servidor.
- Cálculo de **rollup recursivo** para contas sintéticas (saldo = soma de todas as contas filhas).
- Após parsing, dados são salvos no Supabase (upsert) para sincronização multi-dispositivo.
- Configurações de layout (gráficos, mapeamentos) são **preservadas** ao importar novos meses.

**Critérios de aceite:**
- [x] Importação de arquivo único em <2 segundos (para arquivo de 1 MB).
- [x] Importação de múltiplos arquivos mescla períodos corretamente sem duplicatas.
- [x] Contas sintéticas exibem a soma correta das contas analíticas filhas.
- [x] Toast "Sincronizando" durante salvamento no Supabase; toast "Sucesso" ao concluir.
- [x] Em caso de erro de rede, toast destrutivo informa falha sem perder os dados locais.

---

### 4.3 Dashboard de Evolução

**Descrição:** Painel principal de visualização gráfica da evolução patrimonial e de resultado ao longo do tempo.

**Componentes:**

#### 4.3.1 Cards Macro (KPIs do Último Período)
- Exibe até **4 contas de nível hierárquico 1** (ex.: Ativo, Passivo, PL, Resultado).
- Mostra o saldo do último período com indicador de tendência (↑ positivo / ↓ negativo).
- Ícone colorido: verde quando positivo, vermelho quando negativo.

#### 4.3.2 Gráficos Comparativos (Linha / Barras / Área)
- Configuráveis pelo usuário: até **5 contas** por gráfico.
- Tipos disponíveis: Barras, Linhas, Área — alternáveis por ícone sem perda de dados.
- Filtro de período independente por gráfico (seletores "De" / "Até").
- Perspectiva por gráfico: **Mensal Isolado** ou **Acumulado**.
- Painel lateral de estatísticas por conta: crescimento do período (%) e pico registrado (R$).
- Múltiplos gráficos podem ser adicionados e removidos.
- Títulos editáveis inline.

#### 4.3.3 Gráficos de Pizza (Composição Livre)
- Até **15 contas** por gráfico de pizza.
- Busca de contas por código ou nome.
- Filtro de período independente (seletor "De" / "Até").
- Perspectiva por gráfico: Isolado ou Acumulado.
- Representatividade percentual de cada conta no total.
- Múltiplos gráficos podem ser adicionados e removidos.
- Títulos editáveis inline.

**Toggle global Mensal Isolado / Acumulado:**
- Afeta todas as abas (exceto Liquidez e Endividamento, que sempre usam saldo patrimonial).
- **Isolado:** contas de resultado calculadas por `|débito − crédito|` do período.
- **Acumulado:** todas as contas calculadas por `sldFin` (saldo final acumulado).

**Critérios de aceite:**
- [x] Cards macro exibem corretamente o saldo do último período disponível.
- [x] Gráficos renderizam com os dados do intervalo de períodos selecionado.
- [x] Tooltips customizados formatam valores monetários em pt-BR.
- [x] Adição e remoção de gráficos não afeta os outros existentes.
- [x] Sem contas selecionadas: exibe mensagem vazia, sem erro.

---

### 4.4 DRE Analítica & Subtotais

**Descrição:** Demonstração do Resultado do Exercício estruturada automaticamente a partir do plano de contas, seguindo o padrão CPC.

**Estrutura da DRE (14 linhas):**

| Linha | Rótulo |
|---|---|
| 1 | Receita Bruta de Vendas e Serviços |
| 2 | (-) Deduções da Receita Bruta |
| 3 | (=) Receita Líquida de Vendas |
| 4 | (-) Custos Operacionais (CMV/CPV) |
| 5 | (=) Lucro Bruto |
| 6.1 | (-) Despesas Operacionais (Pessoal) |
| 6.2 | (-) Despesas Operacionais (Administrativas/Gerais) |
| 6.3 | (-) Despesas Operacionais (Tributárias) |
| 6.4 | (-) Outras Despesas Operacionais |
| 7 | (+) Outras Receitas Operacionais |
| 8 | (=) Resultado Operacional (EBIT) |
| 9 | (+/-) Resultado Financeiro |
| 10 | (=) Resultado Antes dos Tributos (LAIR) |
| 11 | (-) Provisão para Tributos sobre Lucro |
| 12 | (=) Resultado Líquido antes Participações |
| 13 | (-) Participações e Contribuições |
| 14 | (=) Lucro/Prejuízo Líquido do Exercício |

**Classificação automática:** Baseada em prefixos de conta (`3.1.01`, `4.1.`, etc.) e palavras-chave no nome da conta (`CUSTO`, `CMV`, `RECEITA`, etc.).

**Mapeamento customizável:** Usuário pode sobrescrever a classificação automática de qualquer conta analítica via modal "Ajustar Mapeamento".

**Drill-down:** Grupos clicáveis expandem para mostrar as contas analíticas individuais.

**Exportação:** CSV com todas as linhas e períodos.

**Critérios de aceite:**
- [x] DRE estruturada corretamente para plano de contas padrão Brasil.
- [x] Subtotais calculados automaticamente a partir dos grupos.
- [x] Mapeamento customizado persiste na nuvem e no localStorage.
- [x] Exportação CSV inclui grupos e contas analíticas.
- [x] Quando Bloco J não está presente, a DRE dinâmica continua disponível.

---

### 4.5 Análise de EBITDA

**Descrição:** Cálculo e visualização do EBITDA pelos métodos Direto (Gerencial) e Indireto (Norma CVM), com reconciliação automática.

**KPIs exibidos (último período):**
- EBITDA (R$)
- Margem EBITDA (%)
- EBIT — Resultado Operacional (R$)
- Lucro Líquido Final (R$)

**Métodos de cálculo:**

| Método | Cálculo |
|---|---|
| **Direto (Gerencial)** | Receita Líquida − Custos − Despesas Operacionais + Outras Receitas + Reversão D&A |
| **Indireto (CVM)** | Lucro Líquido + Tributos (IRPJ/CSLL) ± Resultado Financeiro + Participações + Reversão D&A |

**Prova Real:** Diferença entre os dois métodos exibida por período; "BALANCEADO" em verde quando `|diferença| < R$ 0,05`.

**Configuração de D&A:** Modal "Configurar D&A" permite identificar manualmente contas de depreciação, amortização ou exaustão (além da detecção automática por palavras-chave como `DEPRECIA`, `AMORTIZ`, `EXAUSTAO`).

**Auditoria de D&A:** Painel informativo lista todas as contas de D&A detectadas automaticamente.

**Critérios de aceite:**
- [x] Métodos Direto e Indireto produzem resultado idêntico para um SPED balanceado.
- [x] Badge "BALANCEADO" ou diferença exibida por período na linha de prova real.
- [x] Contas de D&A não configuradas geram aviso em laranja.

---

### 4.6 Indicadores de Rentabilidade e Lucratividade

**Descrição:** Análise de margens e retorno sobre capital.

**Indicadores calculados (por período):**

| Indicador | Fórmula |
|---|---|
| Margem Bruta | Lucro Bruto / Receita Líquida × 100 |
| Margem Operacional | EBIT / Receita Líquida × 100 |
| Margem Líquida | Lucro Líquido / Receita Líquida × 100 |
| ROE (Retorno sobre PL) | Lucro Líquido / Patrimônio Líquido × 100 |
| ROA (Retorno sobre Ativo) | Lucro Líquido / Ativo Total × 100 |

**Visualização:** Gráfico de linhas com os 5 indicadores em paralelo + tabela detalhada com as variáveis base (R$).

**Cores dos KPIs:** Verde (≥ 0%) / Vermelho (< 0%).

**Critérios de aceite:**
- [x] Indicadores calculados corretamente para cada período disponível.
- [x] Gráfico de evolução renderiza todas as 5 séries com cores distintas.

---

### 4.7 Indicadores de Liquidez

**Descrição:** Análise da capacidade de pagamento de obrigações.

**Indicadores calculados (por período):**

| Indicador | Fórmula |
|---|---|
| Liquidez Corrente | Ativo Circulante / Passivo Circulante |
| Liquidez Seca | (Ativo Circulante − Estoque) / Passivo Circulante |
| Liquidez Imediata | Disponível / Passivo Circulante |
| Liquidez Geral | (AC + RLP) / (PC + PNC) |

**Lógica de identificação de contas:**
- Ativo Circulante: prefixo `1.1`
- Passivo Circulante: prefixo `2.1`
- Estoque: prefixos `1.1.04`, `1.1.4`, `1.1.03.01`
- Disponível: prefixo `1.1.01`
- Realizável LP: prefixo `1.2`
- Passivo Não Circulante: prefixo `2.2`

**Sinalização automática:** Verde (≥ 1), Amarelo (0,5–0,99), Vermelho (< 0,5) por indicador.

**Critérios de aceite:**
- [x] Indicadores calculados corretamente usando saldos patrimoniais (independente do toggle Isolado/Acumulado).
- [x] Sinalização de cores reflete as faixas corretas por indicador.

---

### 4.8 Análise de Endividamento

**Descrição:** Análise da estrutura de capital e dependência de terceiros.

**Indicadores calculados (por período):**

| Indicador | Fórmula |
|---|---|
| Endividamento Geral | Passivo Total / Ativo Total × 100 |
| Composição do Endividamento | Passivo Circulante / Passivo Total × 100 |
| Imobilização do PL | Ativo Não Circulante / PL × 100 |
| Alavancagem Financeira | Ativo Total / PL |

**Critérios de aceite:**
- [x] Indicadores calculados para todos os períodos disponíveis.

---

### 4.9 Indicadores de Atividade (Ciclo Operacional)

**Descrição:** Análise da eficiência operacional e gestão de capital de giro.

**Indicadores calculados:**

| Indicador | Fórmula |
|---|---|
| PMR — Prazo Médio de Recebimento | Contas a Receber / Receita Bruta × 30 (dias) |
| PMP — Prazo Médio de Pagamento | Contas a Pagar / Custo Operacional × 30 (dias) |
| Giro do Ativo | Receita Líquida / Ativo Total |

**Critérios de aceite:**
- [x] Indicadores calculados em dias (PMR, PMP) ou vezes (Giro).

---

### 4.10 Balancete Comparativo

**Descrição:** Tabela analítica completa do plano de contas com todos os saldos lado a lado por período.

**Funcionalidades:**

- **Filtro de Períodos:** Dropdown multi-seleção; opções "Selecionar Todos" / "Limpar".
- **Filtro de Contas:** Modal com árvore hierárquica do plano de contas; seleção/desmarca em cascata (selecionar conta sintética seleciona todos os filhos).
- **Presets de Visão:** Salvar combinação de contas + períodos como preset nomeado; aplicar preset com 1 clique.
- **AV% (Análise Vertical):** Percentual de cada conta em relação ao total do grupo raiz.
- **AH% (Análise Horizontal):** Variação percentual em relação ao período anterior.
- **Coluna Acumulado:** Soma das movimentações (modo Isolado) ou saldo final do último período (modo Acumulado).
- **Pesquisa:** Campo de busca por código ou nome de conta.
- **Livro Razão (Drill-down):** Clique em conta analítica abre modal com todos os lançamentos individuais do Supabase.
- **Exportação CSV.**

**Livro Razão — Filtros disponíveis:**
- Texto livre (histórico, valor, data).
- Intervalo de datas (de / até).
- Intervalo de valor (mín / máx).
- Tipo D/C (Débito / Crédito / Todos).
- Ordenação por data ou valor (crescente/decrescente).

**Critérios de aceite:**
- [x] Tabela renderiza corretamente com centenas de contas sem travar o navegador.
- [x] AV% e AH% calculados corretamente por período.
- [x] Drill-down (Razão) abre com transações filtradas pelo período selecionado na tabela.
- [x] Presets são salvos na nuvem e restaurados na próxima sessão.

---

### 4.11 Top 20 Despesas

**Descrição:** Ranking das 20 maiores despesas e custos operacionais de um período selecionado.

**Funcionalidades:**
- Seletor de período (qualquer um dos meses importados).
- Agrupamento personalizado de contas: usuário pode criar grupos nomeados e vincular contas a eles, permitindo que contas relacionadas sejam somadas como um único item no ranking.
- Gráfico de barras horizontal com as 20 maiores despesas.
- Clique em uma barra abre painel de evolução mensal daquela despesa/grupo.
- Exportação CSV.

**Critérios de aceite:**
- [x] Ranking calculado corretamente para o período selecionado.
- [x] Agrupamento personalizado persiste na nuvem e localStorage.
- [x] Clique na barra exibe painel de evolução mensal da despesa selecionada.

---

### 4.12 Auditoria e Validação SPED

**Descrição:** Comparação automática entre os saldos calculados dinamicamente (Bloco I) e os demonstrativos oficiais do contador (Bloco J).

**Validações realizadas:**

| Item | Fonte A (Calculado) | Fonte B (Oficial) | Tolerância |
|---|---|---|---|
| Ativo Total | Cálculo do Bloco I | Bloco J100 | < R$ 1,00 |
| Passivo Total + PL | Cálculo do Bloco I | Bloco J100 | < R$ 1,00 |
| Lucro/Prejuízo Líquido | DRE dinâmica | Bloco J150 | < R$ 1,00 |

**Status:** "✅ Saldos Batem" (verde) ou "⚠ R$ X,XX de diferença" (vermelho).

**Quando Bloco J não existe:** Exibe aviso informativo; as análises dinâmicas continuam disponíveis.

**Auditoria de Indicadores:** Painel de notas técnicas explicando a lógica dos cálculos (convenções de sinais, identificação de estoque, validação dupla do EBITDA).

**Critérios de aceite:**
- [x] Para SPED balanceado, todos os 3 itens exibem "Saldos Batem".
- [x] Diferença de R$ 0,01 ou mais aciona o alerta vermelho.
- [x] Sem Bloco J, a aba exibe aviso e não gera erro.

---

### 4.13 Configuração e Persistência

**Descrição:** Mecanismo de auto-save e exportação/importação de layouts.

**Auto-save:**
- `localStorage` (chave `boardecd_config`): instantâneo a cada alteração de estado.
- Supabase `user_configs`: debounce de 2 segundos; vinculado a `user_id + company_id`.

**Campos persistidos:**
- Configurações de gráficos comparativos (contas, tipo, título, período, perspectiva).
- Configurações de gráficos de pizza (contas, título, período, perspectiva).
- Mapeamento DRE customizado (`customMapping`).
- Mapeamento D&A customizado (`customDaMapping`).
- Grupos de despesas customizados (`customExpenseGroups`, `expenseAccountToGroup`).
- Período padrão Top 20 Despesas (`expenseRange`).
- Presets de visão do Balancete (`viewPresets`).

**Exportação/Importação manual:** Botões no cabeçalho permitem baixar e carregar um arquivo `.json` com todas as configurações.

**Critérios de aceite:**
- [x] Configurações são restauradas ao reabrir o sistema.
- [x] Importar novo SPED não apaga as configurações de layout.
- [x] Exportar e importar `.json` restaura exatamente o estado anterior.

---

## 5. Arquitetura Técnica

### 5.1 Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + TypeScript |
| Build | Vite |
| Estilização | Tailwind CSS + Shadcn UI (Radix UI) |
| Roteamento | React Router DOM |
| Gráficos | Recharts |
| Backend / Auth / DB | Supabase (PostgreSQL + Auth + PostgREST) |
| Formulários | React Hook Form + Zod |
| Ícones | Lucide React |

### 5.2 Modelo de Dados (Supabase)

```
companies
  id          UUID PK
  user_id     UUID FK → auth.users
  cnpj        TEXT
  name        TEXT
  raw_sped_info JSONB   -- dados brutos do registro 0000 do SPED

accounts
  id          UUID PK
  company_id  UUID FK → companies
  code        TEXT        -- código da conta (ex: 1.1.01.001)
  name        TEXT
  type        TEXT        -- 'A' (analítica) | 'S' (sintética)
  level       INTEGER
  nature      TEXT        -- natureza contábil (ex: '01' ativo, '02' passivo, '04' resultado)
  parent_code TEXT

balances
  id                UUID PK
  account_id        UUID FK → accounts
  period            TEXT        -- ex: "01/01/2024 a 31/01/2024"
  initial_balance   NUMERIC
  initial_indicator TEXT        -- 'D' | 'C' | ''
  debit             NUMERIC
  credit            NUMERIC
  final_balance     NUMERIC
  final_indicator   TEXT

transactions
  id          UUID PK
  company_id  UUID FK → companies
  account_id  UUID FK → accounts
  date        DATE
  amount      NUMERIC
  indicator   TEXT        -- 'D' | 'C'
  history     TEXT

user_configs
  id          UUID PK
  user_id     UUID FK → auth.users
  company_id  UUID FK → companies
  config_data JSONB       -- configurações de layout (gráficos, mapeamentos, presets)
  updated_at  TIMESTAMPTZ

profiles
  id          UUID PK (= auth.users.id)
  email       TEXT
  full_name   TEXT
```

### 5.3 Funções RPC Disponíveis

| Função | Parâmetros | Retorno |
|---|---|---|
| `get_expense_distribution` | `p_company_id`, `p_periods[]` | `{group_name, total_value}[]` |
| `get_top_expenses` | `p_company_id`, `p_periods[]` | `{account_code, account_name, percentage, total_value}[]` |

### 5.4 Estrutura de Arquivos

```
src/
├── App.tsx                    # Rotas (/, /login) + ProtectedRoute + AuthProvider
├── pages/
│   ├── Index.tsx              # Componente principal (~8000 linhas) — toda a lógica do app
│   └── Login.tsx              # Tela de login/cadastro
├── hooks/
│   └── use-auth.tsx           # Contexto de autenticação (signIn, signUp, signOut, user)
├── lib/
│   └── supabase/
│       ├── client.ts          # Instância do cliente Supabase
│       └── types.ts           # Tipos TypeScript gerados do schema
└── components/
    ├── Layout.tsx             # Wrapper com <Outlet /> do React Router
    └── ui/                    # Componentes Shadcn UI (Button, Dialog, Table, Tooltip, etc.)
```

---

## 6. Fluxo de Usuário Principal

```
[Acesso à URL /]
       │
       ▼
[ProtectedRoute] ──── sem sessão ──▶ [/login] ──▶ signIn/signUp
       │
       │ com sessão
       ▼
[Index.tsx]
       │
       ├─ Carregamento automático: Supabase → companies → accounts → balances → user_configs
       │
       ├─ Sem dados:  Tela de boas-vindas com botão "Importar SPED"
       │
       └─ Com dados: Abas disponíveis
              │
              ├─ [Dashboard de Evolução]   ← aba padrão
              ├─ [DRE Analítica]
              ├─ [Análise de EBITDA]
              ├─ [Rentabilidade]
              ├─ [Liquidez]
              ├─ [Endividamento]
              ├─ [Atividade]
              ├─ [Balancete Comparativo]
              ├─ [Top 20 Despesas]
              └─ [Auditoria SPED]
```

---

## 7. Requisitos Não Funcionais

### 7.1 Performance

| Requisito | Meta |
|---|---|
| Parsing de arquivo SPED de 1 MB | < 2 segundos |
| Renderização inicial do dashboard com dados | < 1 segundo |
| Sincronização de configurações com Supabase | Assíncrona, debounce 2s — não bloqueia UI |
| Paginação de saldos (Supabase) | 1000 registros/página |

### 7.2 Segurança

- Autenticação obrigatória para toda a aplicação.
- Chaves do Supabase via variáveis de ambiente (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`) — nunca commitadas no repositório.
- Row Level Security (RLS) no Supabase garante isolamento de dados por `user_id`.
- Parsing de SPED ocorre 100% no navegador — dados financeiros nunca transitam por servidor próprio.

### 7.3 Acessibilidade e UX

- Interface responsiva: funciona em desktop, tablet e mobile.
- Tooltips explicativos em todos os KPIs e indicadores (linguagem acessível para não-contadores).
- Estados de loading, empty state e erro tratados visualmente em todas as abas.
- Formatação monetária em padrão pt-BR em toda a aplicação.

### 7.4 Compatibilidade

- Navegadores modernos (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+).
- Node.js 18+ para desenvolvimento local.

---

## 8. Restrições e Dependências

| Item | Descrição |
|---|---|
| Supabase | Serviço externo gerenciado. Downtime do Supabase impede login e sincronização, mas os dados já carregados ficam disponíveis via cache local. |
| Formato SPED ECD | O produto processa apenas o formato SPED ECD padrão da Receita Federal (codificação ISO-8859-1). Outros formatos (SPED Fiscal, SPED Contribuições) não são suportados. |
| Volume de dados | Arquivos de SPED muito grandes (>10 MB) podem causar lentidão no parsing no browser. |
| Plano de contas | A classificação automática da DRE presume um plano de contas brasileiro padrão. Planos altamente customizados podem exigir mapeamento manual. |
| Bloco J | A auditoria automática só funciona se o arquivo SPED contiver os registros J100 e J150. |

---

## 9. Roadmap Sugerido

| Prioridade | Feature | Justificativa |
|---|---|---|
| Alta | Suporte multi-empresa | Contadores precisam alternar entre clientes sem refazer o login |
| Alta | Refatoração do `Index.tsx` em componentes menores | Manutenibilidade — arquivo atual tem +8000 linhas |
| Alta | Ativar TypeScript strict mode (`@ts-nocheck` removido) | Reduzir risco de bugs em runtime |
| Média | Exportação PDF do dashboard | Relatório para apresentação a sócios e bancos |
| Média | Comparativo entre empresas (benchmarking) | Diferencial para BPOs com múltiplos clientes |
| Média | Alertas automáticos (ex.: margem caiu >X%) | Monitoramento proativo sem precisar acessar o sistema |
| Baixa | API pública para integração com ERPs | Atualização automática sem importação manual de SPED |
| Baixa | App mobile (React Native / PWA) | Acesso a KPIs em campo |

---

## 10. Glossário

| Termo | Definição |
|---|---|
| SPED ECD | Sistema Público de Escrituração Digital — Escrituração Contábil Digital. Arquivo `.txt` entregue à Receita Federal com toda a movimentação contábil da empresa. |
| Bloco I | Seção do SPED com os registros de saldo de conta (`I155`) e lançamentos (`I250`). |
| Bloco J | Seção do SPED com os demonstrativos contábeis oficiais (`J100` = Balanço, `J150` = DRE). |
| Conta Sintética | Conta "pai" que agrupa outras contas. Seu saldo é a soma dos filhos. |
| Conta Analítica | Conta "folha" com movimentações reais. Possui lançamentos no Livro Razão. |
| Rollup | Cálculo recursivo de saldo de contas sintéticas somando todos os descendentes analíticos. |
| DRE | Demonstração do Resultado do Exercício — relatório que apura o lucro ou prejuízo da empresa. |
| EBITDA | Earnings Before Interest, Taxes, Depreciation and Amortization — lucro operacional antes de juros, impostos, depreciação e amortização. |
| EBIT | Earnings Before Interest and Taxes — resultado operacional antes de juros e impostos. |
| ROE | Return on Equity — retorno sobre o patrimônio líquido. |
| ROA | Return on Assets — retorno sobre o ativo total. |
| AV% | Análise Vertical — porcentagem que uma conta representa do total do grupo. |
| AH% | Análise Horizontal — variação percentual de uma conta em relação ao período anterior. |
| PMR | Prazo Médio de Recebimento — quantos dias, em média, a empresa leva para receber de clientes. |
| PMP | Prazo Médio de Pagamento — quantos dias, em média, a empresa leva para pagar fornecedores. |
| D&A | Depreciação e Amortização — gastos não-desembolsáveis adicionados de volta no cálculo do EBITDA. |
| BPO | Business Process Outsourcing — empresa que terceiriza processos contábeis. |
