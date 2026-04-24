# Dashboard de Evolução

## Resumo Executivo

O **Dashboard de Evolução** é a aba principal do sistema de análise contábil SPED ECD. Seu objetivo é transformar arquivos de escrituração digital (SPED ECD, formato `.txt`) em painéis visuais interativos — com gráficos de barras, linhas, áreas e pizza —, permitindo que gestores e contadores acompanhem a evolução patrimonial e de resultado da empresa mês a mês, de forma rápida e sem necessidade de planilhas externas.

Toda a aplicação é uma **SPA (Single-Page Application)** em React. O "menu" Dashboard de Evolução é implementado como uma aba (`activeTab === 'dashboard'`) dentro de um único componente página (`src/pages/Index.tsx`). Não existe uma rota separada — a navegação entre abas ocorre por botões que chamam `setActiveTab(...)`.

---

## Principais Arquivos e Responsabilidades

| Arquivo | Responsabilidade |
|---|---|
| `src/pages/Index.tsx` | Componente principal (≈ 8000 linhas). Contém todo o estado, lógica de parsing SPED, computed data (`useMemo`), funções auxiliares e renderização de **todas** as abas, incluindo o Dashboard de Evolução. |
| `src/components/Layout.tsx` | Wrapper mínimo — apenas envolve o `<Outlet />` do React Router. Não contém lógica de negócio. |
| `src/App.tsx` | Define as rotas (`/login`, `/` → `<Index />`), proteção de rota (`ProtectedRoute`) e provedor de autenticação (`AuthProvider`). |
| `src/hooks/use-auth.tsx` | Hook e contexto de autenticação via Supabase Auth. Expõe `user`, `loading` e `signOut`. |
| `src/lib/supabase/client.ts` | Instância configurada do cliente Supabase (`createClient`). Lê URL e chave pública de variáveis de ambiente (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`). |
| `src/lib/supabase/types.ts` | Tipos TypeScript gerados automaticamente a partir do schema do Supabase (tabelas `companies`, `accounts`, `balances`, `transactions`, `user_configs`, `profiles`). |
| `src/components/ui/chart.tsx` | Wrapper Shadcn UI em torno do Recharts (`ChartContainer`, `ChartTooltip`, etc.). |

---

## Como o Usuário Chega no Menu

```
URL /  →  ProtectedRoute (verifica sessão)
            └─ Layout (wrapper)
                  └─ Index (SPA)
                        ├─ Cabeçalho com botões de abas (visíveis apenas após importação de dados)
                        ├─ [aba] Dashboard de Evolução  ← activeTab === 'dashboard'
                        ├─ [aba] DRE Analítica & Subtotais
                        ├─ [aba] Análise de EBITDA
                        ├─ [aba] Indicadores de Rentabilidade
                        ├─ [aba] Indicadores de Liquidez
                        ├─ [aba] Endividamento
                        ├─ [aba] Indicadores de Atividade
                        ├─ [aba] Balancete Comparativo
                        ├─ [aba] Top 20 Despesas
                        └─ [aba] Validação SPED
```

O usuário precisa estar autenticado. Se a sessão não existir, é redirecionado para `/login`. Ao acessar `/`, os botões de aba ficam ocultos até que existam dados (`data.length > 0`). O Dashboard de Evolução é a **aba padrão** (`activeTab` inicializado como `'dashboard'`).

---

## Fluxo de Dados Ponta a Ponta

### 1. Carregamento Inicial (a partir do Supabase)

Na montagem do componente, o `useEffect` de inicialização executa:

```
user (Supabase Auth)
  └─ supabase.from('companies').select('*').eq('user_id', user.id).limit(1)
        └─ supabase.from('accounts').select('*').eq('company_id', company.id)
        └─ supabase.from('balances').select('*, accounts!inner(company_id)') [paginado 1000/pág]
              → reconstrói registros no formato interno { periodo, conta, nome, tipo, nivel,
                natureza, sldIni, indDcIni, debito, credito, sldFin, indDcFin }
              → setData(reconstructedData)  +  setCompanyInfo(...)
        └─ supabase.from('user_configs').select('config_data')
              → restaura charts, pieCharts, períodos, mapeamentos, presets
```

**Tabelas lidas**: `companies`, `accounts`, `balances`, `user_configs`  
**Funções RPC utilizadas em outras abas** (não no Dashboard de Evolução, mas disponíveis no schema): `get_expense_distribution`, `get_top_expenses`

### 2. Importação de Arquivo SPED ECD

O usuário pode importar um ou mais arquivos `.txt` (SPED ECD) clicando em **"Importar Dados"**:

```
handleFileUpload(files[])
  │
  ├─ Para cada arquivo: FileReader.readAsText(file, 'ISO-8859-1')
  │    Parsing linha a linha por registro SPED:
  │    ├─ |0000| → info empresa (nome, cnpj, dtIni, dtFin)
  │    ├─ |I050| → plano de contas (conta, pai, nome, natureza, tipo, nivel)
  │    ├─ |I150| → abre período (ex: "01/01/2024 a 31/01/2024")
  │    ├─ |I155| → saldo de conta no período (sldIni, indDcIni, debito, credito, sldFin, indDcFin)
  │    ├─ |I200| → data do lançamento contábil
  │    ├─ |I250| → linha de lançamento (conta, valor, D/C, histórico)
  │    ├─ |J100| / |J150| → blocos do balanço patrimonial/DRE do SPED
  │    └─ computeRollup() → calcula saldos das contas sintéticas (rollup recursivo)
  │
  ├─ Mescla resultados de múltiplos arquivos
  ├─ Ordena por data de período + código de conta
  ├─ setData(allExtracted)  +  setCompanyInfo(mergedInfo)
  └─ saveToSupabase(info, extractedData, extractedTx)
         ├─ companies.upsert (onConflict: user_id, cnpj)
         ├─ accounts.upsert em chunks de 1000 (onConflict: company_id, code)
         ├─ balances.upsert em chunks de 1000 (onConflict: account_id, period)
         └─ transactions: delete do intervalo + insert em chunks de 2000
```

### 3. Transformação dos Dados (`useMemo`)

Após `setData`, dois `useMemo` principais são recalculados:

#### `monthlyData`
```
data[]  →  {
  periods: string[]         // lista ordenada de períodos únicos
  allAccounts: Account[]    // todas as contas (com saldos indexados por período)
  accounts: Account[]       // filtradas por searchTerm (aba Balancete)
}
```
- `Account.saldos[periodo]` = linha de saldo correspondente ao período.

#### `dashboardData`
```
monthlyData  +  charts[]  +  pieCharts[]  +  períodos/acumulado configurados
  →  {
     macroAccounts: MacroAccount[]   // até 4 contas de nível 1 com valor do último período
     lastPeriod: string              // último período disponível
     chartsData: ChartConf[]         // dados processados para cada gráfico comparativo
     pieChartsData: PieConf[]        // dados processados para cada gráfico de pizza
  }
```

**Regra de negócio central — Mensal Isolado vs. Acumulado:**

| Tipo de conta | Mensal Isolado | Acumulado |
|---|---|---|
| Patrimonial (Ativo, Passivo, PL) | `sldFin` do período | `sldFin` do período |
| Resultado (Receita/Despesa — natureza `04` ou contas `3`, `4`, `5`) | `|debito − credito|` do período | `sldFin` do período |

---

## Seções do Dashboard de Evolução

### 3.1 Painel de Ajuda (`ExplanationPanel`)

Componente reutilizável colapsável. Na aba Dashboard exibe:
- Descrição geral do dashboard
- 4 cards explicativos: "Lente Mensal/Acumulado", "Cards de Resumo", "Gráficos Comparativos Livres", "Pico Registrado e Crescimento"

### 3.2 Cards Macro (KPIs do Último Período)

- Renderiza até **4 contas de nível hierárquico 1** (ex.: Ativo, Passivo, PL, Resultado).
- Exibe: nome da conta, saldo do último período, ícone de tendência (↑ verde / ↓ vermelho).
- "Positivo" = saldo Credor **ou** conta de Ativo com saldo Devedor.

### 3.3 Gráficos de Pizza (Composição Livre)

- Quantos gráficos o usuário quiser (botão **"Adicionar Novo Gráfico de Pizza"**).
- Até **15 contas** por pizza (buscável por código ou nome).
- Filtros por período independentes por gráfico: seletores **"De"** e **"Até"** (dropdown com todos os períodos).
- Perspectiva Isolado/Acumulado por pizza (independente do toggle global).
- Títulos editáveis inline (`EditableTitle`).
- Valores: representatividade percentual de cada conta no total selecionado.

### 3.4 Gráficos Comparativos (Linha / Barras / Área)

- Quantos gráficos o usuário quiser (botão **"Adicionar Novo Gráfico Comparativo"**).
- Até **5 contas** por gráfico.
- Tipos: Barras (`BarChart`), Linhas (`LineChart`), Área (`AreaChart`) — selecionável por ícone.
- Filtro de período por gráfico: seletores "De" / "Até".
- Perspectiva Isolado/Acumulado por gráfico.
- Painel lateral por conta: **Crescimento do Período** (%) e **Pico Registrado** (R$).
- Tooltips customizados (`CustomTooltip`) com formatação monetária.
- Cores fixas: indigo, emerald, amber, rose, cyan (ciclo de 5).

---

## Filtros e Entradas do Usuário

| Controle | Localização | Efeito |
|---|---|---|
| Toggle **Mensal Isolado / Acumulado** | Cabeçalho global (todas as abas exceto Liquidez/Endividamento) | Altera como valores de resultado são calculados em todo o dashboard |
| **"De" / "Até"** (por gráfico) | Dentro de cada card de gráfico comparativo ou pizza | Filtra os períodos exibidos naquele gráfico específico |
| **Seleção de contas** | Dropdown buscável dentro de cada gráfico | Define quais contas aparecem no gráfico |
| **Tipo de gráfico** (Barras / Linhas / Área) | Ícones no topo do gráfico comparativo | Altera a visualização sem perder os dados |
| **Perspectiva por gráfico** (Isolado/Acumulado) | Botões dentro de cada gráfico | Sobrepõe o toggle global para aquele gráfico |
| **Títulos editáveis** | Inline nos cabeçalhos dos gráficos | Renomeia o gráfico (persistido no localStorage e Supabase) |

---

## Persistência de Configuração

As configurações do Dashboard (quais contas estão em quais gráficos, períodos, tipos, títulos) são salvas:

1. **`localStorage`** (chave `boardecd_config`) — instantâneo, a cada mudança de estado.
2. **Supabase `user_configs`** — com debounce de **2 segundos** após qualquer alteração. Upsert na tabela vinculada a `user_id` + `company_id`.

**Campos persistidos em `config_data` (JSON):**

```json
{
  "charts": [...],
  "pieCharts": [...],
  "piePeriods": { "<chartId>": { "from": "...", "to": "..." } },
  "chartPeriods": { "<chartId>": { "from": "...", "to": "..." } },
  "chartAccumulated": { "<chartId>": true/false },
  "pieAccumulated": { "<chartId>": true/false },
  "customMapping": { "<conta>": "<grupoId>" },
  "customDaMapping": { "<conta>": "<grupoId>" },
  "customExpenseGroups": [...],
  "expenseAccountToGroup": { "<conta>": "<grupoId>" },
  "expenseRange": null,
  "viewPresets": [...]
}
```

O usuário também pode exportar/importar configurações como arquivo `.json` (botões no cabeçalho).

---

## Estados e Tratamento de Erros

| Estado | Comportamento |
|---|---|
| **Sem dados** (`data.length === 0`) | Exibe tela de boas-vindas com botão "Iniciar Importação". Nenhuma aba de análise é exibida. |
| **Carregando** (`loading === true`) | Spinner no botão "Importar Dados" + spinner na tela de loading inicial. |
| **`dashboardData === null`** | A seção do Dashboard simplesmente não renderiza (condicional `dashboardData &&`). |
| **Erro no Supabase (carregamento)** | Capturado em `try/catch`; exibe `console.error`. `isConfigLoaded` é setado para `true` mesmo assim (não bloqueia a UI). |
| **Erro no Supabase (importação)** | `toast` destrutivo: "Erro na sincronização — Não foi possível salvar os dados na nuvem." |
| **Conta não encontrada no SPED** | Campo `nome` recebe `'Conta não encontrada'`; a conta ainda aparece nos gráficos. |
| **Gráfico sem contas selecionadas** | Mensagem vazia inline: "Selecione até N contas…". Nenhum erro é lançado. |
| **Permissão (rota protegida)** | `ProtectedRoute` redireciona para `/login` se não há usuário autenticado. |

---

## Diagrama Textual do Fluxo de Dados

```
[Supabase Auth]
     │ user
     ▼
[useEffect: loadData]
     │ SELECT companies / accounts / balances / user_configs
     ▼
[state: data[], companyInfo, charts, pieCharts, …]
     │
     │  (ou)
     │
[handleFileUpload]
     │ FileReader (ISO-8859-1)
     │ parse |0000| |I050| |I150| |I155| |I200| |I250|
     │ computeRollup() → saldos sintéticos
     ▼
[saveToSupabase]
     │ upsert companies / accounts / balances
     │ delete+insert transactions
     ▼
[state: data[]]
     │
     ▼
[useMemo: monthlyData]
     │ organiza por período e conta
     ▼
[useMemo: dashboardData]
     │ macroAccounts (nível 1, último período)
     │ chartsData    (por gráfico: filtro de período, isAccumulated, crescimento, pico)
     │ pieChartsData (por pizza: filtro de período, isAccumulated, % de representatividade)
     ▼
[Render: activeTab === 'dashboard']
     ├─ ExplanationPanel (ajuda colapsável)
     ├─ Cards Macro × 4  (KPIs do último período)
     ├─ PieChart × N     (composição livre de contas)
     │     └─ SVG custom + tabela de legenda + CustomPieTooltip
     └─ Chart × N        (BarChart | LineChart | AreaChart)
           └─ Recharts ResponsiveContainer + CustomTooltip
                                                │
                                          [useEffect: auto-save]
                                                │ 2s debounce
                                                ▼
                                          [Supabase user_configs.upsert]
                                          [localStorage boardecd_config]
```

---

## Integrações com Backend / Banco de Dados

### Tabelas Supabase utilizadas

| Tabela | Operações | Quando |
|---|---|---|
| `companies` | SELECT (carregamento) / UPSERT (importação + auto-save) | Inicialização e upload de arquivo |
| `accounts` | SELECT (carregamento) / UPSERT em chunks 1 000 (importação) | Inicialização e upload de arquivo |
| `balances` | SELECT paginado 1 000/página (carregamento) / UPSERT (importação) | Inicialização e upload de arquivo |
| `transactions` | SELECT (Livro Razão) / DELETE + INSERT (importação) | Drill-down de conta e upload de arquivo |
| `user_configs` | SELECT (carregamento) / UPSERT (auto-save a cada 2s) | Inicialização e qualquer alteração de layout |

### Funções RPC (disponíveis no schema, não utilizadas no Dashboard de Evolução)

| Função | Descrição |
|---|---|
| `get_expense_distribution(p_company_id, p_periods[])` | Retorna distribuição de despesas por grupo |
| `get_top_expenses(p_company_id, p_periods[])` | Retorna top despesas com percentual |

Essas funções são usadas na aba **Top 20 Despesas**.

---

## Observações para Desenvolvimento

- O arquivo `src/pages/Index.tsx` tem mais de 8000 linhas e concentra toda a lógica. Uma refatoração futura poderia extrair o componente `DashboardTab`, os hooks `useDashboardData`, `useMonthlyData`, `useSupabaseSync`, e os componentes `PieChartCard` / `ComparativeChartCard`.
- O comentário `// @ts-nocheck` no topo do arquivo desabilita checagem de tipos TypeScript. Isso facilita o desenvolvimento rápido, mas aumenta o risco de erros em runtime.
- O cliente Supabase lê URL e chave de variáveis de ambiente (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`). **Nunca commitar um arquivo `.env` com esses valores**.
- A persistência no `localStorage` usa a chave `boardecd_config`. Limpar o storage do navegador fará o dashboard voltar às configurações padrão na próxima sessão (caso o Supabase também não tenha um registro salvo).
