# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projeto FOMENTAR - Expertzy Inteligência Tributária

Este é um sistema web completo para conversão de arquivos SPED e apuração de incentivos fiscais FOMENTAR/PRODUZIR/MICROPRODUZIR e ProGoiás do Estado de Goiás.

### Estrutura do Projeto

```
/Users/ceciliodaher/Documents/git/FOMENTAR/
├── index.html                   # Interface unificada com 3 abas principais
├── script.js                    # Sistema unificado (SPED + FOMENTAR + ProGoiás + CFOPs Genéricos + Demonstrativo v3.51)
├── script.ori.js                # Versão original antes da implementação CFOPs
├── script-cfop.js               # Versão anterior com tentativas de CFOPs (backup)
├── style.css                    # Estilos responsivos com sistema de 3 abas
├── sped-web-fomentar.html       # Versão alternativa focada em FOMENTAR
├── CORRECOES_IMPLEMENTADAS.md   # Documentação de correções recentes
├── Comparativo_ProGoias_50_periodos.xlsx # Planilha de teste ProGoiás
└── normativas/                  # Documentação normativa expandida
    ├── INSTRUÇÃO NORMATIVA Nº 885_07-GSF.pdf
    ├── demonstrativo-versAo-3_51-unlocked.xlsx
    ├── instrucao-de-preenchimento-do-demonstrativo-versao-3_5-a87.pdf
    ├── Apuração do ProGoiás.md  # Normativa completa do ProGoiás
    ├── Distinção de Débito e Crédito nos Códigos de Ajust.md
    ├── DECRETO Nº 9.724, DE 07 DE OUTUBRO DE 2020 - PRO GOIAS.pdf
    ├── IN_1478_2020.pdf
    └── Progoias.xlsx
```

### Comandos Principais

#### Desenvolvimento Local

- Abrir `index.html` diretamente no navegador (versão principal)
- Alternativa: `sped-web-fomentar.html` (versão focada em FOMENTAR)
- Não requer servidor web específico (aplicação client-side)
- Usar ferramentas de desenvolvedor do navegador para debug

#### Dependências

- **XlsxPopulate**: Biblioteca para geração de arquivos Excel
  - CDN: `https://cdn.jsdelivr.net/npm/xlsx-populate/browser/xlsx-populate.min.js`
  - Já incluída no HTML principal

### Arquitetura do Sistema

#### Funcionalidades Principais

1. **Conversor SPED** (Aba 1)
   
   - Importação de arquivos SPED (.txt)
   - Parsing e validação de registros SPED
   - Exportação para Excel com múltiplas abas
   - Interface drag-and-drop para upload

2. **Apuração FOMENTAR** (Aba 2)
   
   - Classificação automática de operações incentivadas/não incentivadas
   - Cálculo conforme Instrução Normativa nº 885/07-GSF
   - Quadros A, B e C da apuração
   - Configuração de programas (FOMENTAR/PRODUZIR/MICROPRODUZIR)
   - Processamento de múltiplos períodos
   - Correção automática de códigos E111 inconsistentes
   - Correção de códigos C197/D197 (débitos adicionais)
   - Sistema de memória de cálculo com auditoria completa

3. **Apuração ProGoiás** (Aba 3)
   
   - Implementação completa conforme Decreto nº 9.724/2020
   - Cálculo automático: ICMSS - ICMSE - AJCRED + AJDEB
   - Configuração por tipo de empresa e ano de fruição
   - Processamento de múltiplos períodos sequenciais
   - Geração de demonstrativo E115 completo

#### Fluxo de Dados

1. **Importação SPED**: `processSpedFile()` → `lerArquivoSpedCompleto()`
2. **Classificação**: `classifyOperations()` usando CFOPs da IN 885 e registros consolidados
3. **Cálculo FOMENTAR**: `calculateFomentar()` com base nos quadros normativos
4. **Cálculo ProGoiás**: `calculateProgoias()` conforme Decreto 9.724/2020
5. **Correção E111**: Interface de correção manual para códigos inconsistentes
6. **Exportação**: Geração de Excel, memória de cálculo ou impressão

#### Constantes Importantes

- **CFOP_ENTRADAS_INCENTIVADAS**: Lista de CFOPs para entradas incentivadas
- **CFOP_SAIDAS_INCENTIVADAS**: Lista de CFOPs para saídas incentivadas  
- **CODIGOS_AJUSTE_INCENTIVADOS**: Códigos do registro E111 considerados incentivados

### Registros SPED Processados

#### Registros Consolidados (Processamento Principal)

- **C190**: Consolidado de NF-e (substitui C100/C170)
- **C590**: Consolidado de NF-e Energia/Telecom  
- **D190**: Consolidado de CT-e (substitui D100/D190)
- **D590**: Consolidado de CT-e de Serviços

#### Registros de Apuração

- **E100/E110**: Apuração do ICMS
- **E111**: Outros créditos e débitos (processamento detalhado)
- **E115**: Demonstrativo ProGoiás (geração automática)

#### Registros de Controle

- **0000**: Dados cadastrais da empresa
- **C100/C170**: Referência para validação (não processados)

### Padrões de Código

#### JavaScript

- Funções nomeadas em camelCase
- Constantes em UPPER_SNAKE_CASE
- Event listeners organizados por seção
- Logging detalhado com `addLog()`

#### CSS

- Sistema de abas responsivo
- Gradientes modernos (purple/teal)
- Grid system para layouts
- Classes utilitárias para estados

#### HTML

- Estrutura semântica com sections
- IDs descritivos para elementos funcionais
- Acessibilidade com labels apropriados

### Tratamento de Erros

- Validação de formato de arquivo SPED
- Verificação de registros obrigatórios
- Logs de erro detalhados para debug
- Fallbacks para dados ausentes

### Performance

- Processamento assíncrono de arquivos grandes
- Progress bars para feedback visual
- Lazy loading de dados pesados
- Otimização de memória para SPEDs grandes

### Conformidade Fiscal

O sistema implementa rigorosamente:

#### FOMENTAR/PRODUZIR/MICROPRODUZIR

- **IN 885/07-GSF**: Classificação de operações incentivadas
- **Demonstrativo versão 3.51**: Layout oficial dos quadros
- **Anexo III**: Códigos de ajuste incentivados do E111
- **Exclusão de Circularidade**: Créditos próprios do programa (GO040007, GO040008, etc.)

#### ProGoiás

- **Decreto nº 9.724/2020**: Fórmula oficial de cálculo
- **Lei nº 20.787/20**: Percentuais e regras de fruição
- **IN 1478/2020**: Procedimentos de apuração
- **Anexos I e II**: CFOPs e ajustes incentivados
- **Registro E115**: Geração automática do demonstrativo

### Debugging

#### Logs de Sistema

- Console do navegador: logs técnicos detalhados
- Interface de usuário: feedback visual no painel de logs
- Estados de erro: styling visual diferenciado

#### Pontos de Breakpoint Recomendados

- `classifyOperations()`: Verificar classificação CFOP e processamento de consolidados
- `calculateFomentar()`: Validar cálculos dos quadros A, B e C
- `calculateProgoias()`: Validar fórmula ICMSS - ICMSE - AJCRED + AJDEB
- `processSpedFile()`: Debugging de parsing SPED
- `aplicarCorrecoesECalcular()`: Validação de correções E111

#### Logs Específicos

**FOMENTAR:**

- Processamento de registros consolidados C190, C590, D190, D590
- Exclusão automática de créditos circulares (GO040007, GO040008, etc.)
- Classificação de operações incentivadas vs não incentivadas
- Resumo de valores por quadro (A, B, C)

**ProGoiás:**

- Cálculo da base: ICMSS - ICMSE - AJCRED + AJDEB - GO100007 - MÉDIA
- Aplicação de percentuais por tipo de empresa
- Validação de saldo credor vs débito
- Geração do registro E115

**Múltiplos Períodos:**

- Progressão de importação sequencial
- Acumulação de dados por período
- Validação de consistência entre períodos

### Notas Importantes

1. **Códigos CFOP**: Lista baseada na legislação específica de Goiás
2. **Percentuais de Financiamento**: 
   - **FOMENTAR**: até 70% (corrigido de 73%)
   - **PRODUZIR**: até 73%
   - **MICROPRODUZIR**: até 90%
3. **Registro E111**: Processamento detalhado com exclusão automática de créditos circulares
4. **Múltiplos Períodos**: Suporte a processamento sequencial de vários SPEDs
5. **Correção de Códigos**: Interface para correção manual de códigos E111 inconsistentes
6. **Validação de Dados**: Sempre verificar consistência antes dos cálculos

### Múltiplos Períodos

#### Funcionalidades

- **Importação Sequencial**: Processamento de vários arquivos SPED em sequência
- **Acumulação de Dados**: Soma automática de valores entre períodos
- **Navegação**: Interface para alternar entre períodos processados
- **Exportação Unificada**: Relatório consolidado de todos os períodos

#### Variáveis de Controle

```javascript
// FOMENTAR
let multiPeriodData = []; // Array de dados por período
let selectedPeriodIndex = 0; // Período selecionado para visualização
let currentImportMode = 'single'; // 'single' ou 'multiple'

// ProGoiás
let progoiasMultiPeriodData = []; // Array de dados ProGoiás por período
let progoiasSelectedPeriodIndex = 0;
let progoiasCurrentImportMode = 'single';
```

#### Fluxo de Processamento

1. **Seleção de Modo**: Radio buttons para single/multiple
2. **Importação**: Loop sequencial de arquivos SPED
3. **Processamento**: Cálculo individual por período
4. **Acumulação**: Soma de valores para totais gerais
5. **Visualização**: Interface de navegação entre períodos

### Sistema de Correção de Códigos Avançado (2025-07-30)

#### Funcionalidade Completa para E111, C197 e D197

O sistema agora oferece **máxima flexibilidade** na correção de códigos fiscais, permitindo configurações específicas por período em múltiplos cenários.

#### Problemática

- Códigos E111, C197 e D197 podem estar inconsistentes no SPED
- Necessidade de correção manual para conformidade fiscal
- **NOVO**: Códigos diferentes podem ser necessários para períodos específicos
- Distinção entre débitos e créditos conforme legislação

#### Estrutura de Dados Atualizada

```javascript
// E111 (FOMENTAR)
let codigosCorrecao = {}; // Mapeamento: código original -> código corrigido
let codigosEncontrados = []; // Lista de códigos E111 encontrados no SPED
let isMultiplePeriods = false; // Flag para processamento múltiplo

// C197/D197 (FOMENTAR) 
let codigosCorrecaoC197D197 = {}; // Mapeamento de códigos C197/D197
let codigosEncontradosC197D197 = []; // Lista de códigos C197/D197 encontrados
let isMultiplePeriodsC197D197 = false; // Flag para múltiplos períodos C197/D197

// Estrutura expandida para cada código
const codigo = {
    codigo: 'GO020999',
    novocodigo: 'GO040001', // Código global padrão
    aplicarTodos: false,
    periodosEscolhidos: [0, 1, 2], // Períodos selecionados
    codigosPorPeriodo: { // NOVO: Códigos específicos por período
        0: '', // Período 1: usar código global
        1: 'GO040002', // Período 2: código específico
        2: 'GO040003'  // Período 3: código específico
    }
};
```

#### Interface Modernizada - Códigos Específicos por Período

**Recursos Implementados:**

1. **Código Global**: Campo principal aplicado a todos os períodos selecionados
2. **Códigos Específicos**: Input individual para cada período com possibilidade de sobrescrever o global
3. **Interface Expansível**: 
   - Estrutura `.periodo-item-expandido` com header e campo de código
   - Campos aparecem/desaparecem dinamicamente conforme seleção
   - Barra de rolagem automática para muitos períodos (`max-height: 400px`)
4. **Modo Híbrido**: Combina código global + específicos conforme necessidade

#### Fluxo de Correção Avançado

1. **Detecção**: Identificação automática de códigos inconsistentes (E111, C197, D197)
2. **Interface Inteligente**: 
   - Apresentação de interface expansível para correção
   - Suporte a código global + códigos específicos por período
   - Texto explicativo e placeholders intuitivos
3. **Configuração Flexível**:
   - **Todos os períodos**: Aplicar código global em todos
   - **Períodos específicos**: Selecionar períodos individuais
   - **Códigos específicos**: Definir código diferente para período específico
4. **Validação**: Verificação de conformidade com legislação
5. **Aplicação Inteligente**: 
   - Prioriza código específico do período quando disponível
   - Fallback para código global quando não há específico
6. **Logs Detalhados**: Indica se foi aplicado código "específico" ou "global"

#### Lógica de Aplicação

```javascript
// CLAUDE-FISCAL: Lógica de correção inteligente
function aplicarCorrecao(codigoOriginal, periodoIndex, correcao) {
    let codigoFinal;
    
    // 1. Verificar se existe código específico para este período
    if (correcao.codigosPorPeriodo && correcao.codigosPorPeriodo[periodoIndex]) {
        codigoFinal = correcao.codigosPorPeriodo[periodoIndex];
        addLog(`Código corrigido: ${codigoOriginal} → ${codigoFinal} (específico)`, 'success');
    } 
    // 2. Usar código global como fallback
    else if (correcao.novoCodigo) {
        codigoFinal = correcao.novoCodigo;
        addLog(`Código corrigido: ${codigoOriginal} → ${codigoFinal} (global)`, 'success');
    }
    
    return codigoFinal;
}
```

#### Cenários de Uso

**Exemplo Prático**: Código E111 "GO020999" encontrado em 5 períodos:
- **Períodos 1-3**: Usar código global "GO040001"
- **Período 4**: Código específico "GO040002" (legislação mudou)
- **Período 5**: Código específico "GO040003" (caso especial)

**Interface permite:**
1. Definir "GO040001" como código global
2. Selecionar todos os 5 períodos
3. Para período 4: inserir "GO040002" no campo específico
4. Para período 5: inserir "GO040003" no campo específico
5. Períodos 1-3 usarão automaticamente o código global

#### Compatibilidade

- ✅ **Período único**: Comportamento inalterado (código global)
- ✅ **Múltiplos períodos**: Suporte completo a códigos específicos
- ✅ **Modo híbrido**: Combinação de global + específicos
- ✅ **E111, C197, D197**: Funcionalidade idêntica em todos os tipos
- ✅ **Retrocompatibilidade**: Sistemas existentes continuam funcionando

### Implementação Demonstrativo Versão 3.51 (2025-07-29)

#### Correções Estruturais Críticas

A implementação foi completamente refeita para seguir rigorosamente o **Demonstrativo versão 3.51**, corrigindo problemas fundamentais na lógica de cálculo:

##### Múltiplos Períodos - Extensão da Lógica Corrigida (2025-07-29)

**IMPORTANTE**: A funcionalidade de múltiplos períodos foi atualizada para usar a mesma lógica corrigida do período único, garantindo que o relatório comparativo apresente todos os 44 itens conforme o demonstrativo oficial.

**Alterações Realizadas:**

1. **Função `calculateFomentarForPeriod()` Atualizada:**
   - Implementação completa dos 44 itens conforme demonstrativo versão 3.51
   - Lógica idêntica à função `calculateFomentar()` do período único
   - Compensação de saldo credor entre quadros B e C
   - Item 35 com lógica condicional complexa implementada

2. **Relatório Comparativo Corrigido:**
   - **Quadro B**: Agora inclui TODOS os itens (11, 11.1, 12-31)
   - **Quadro C**: Agora inclui TODOS os itens (32-44)
   - Exportação Excel com estrutura completa de 44 itens
   - Mapeamento correto de campos conforme nova estrutura

3. **Compatibilidade de Campos:**
   - Campos antigos mantidos para compatibilidade: `totalIncentivadas`, `totalNaoIncentivadas`, `totalGeral`
   - Campos novos implementados: `saldoPagarParcelaNaoFinanciada`, `saldoPagarNaoIncentivadas`, `totalGeralPagar`
   - Funções de export (Excel e PDF) atualizadas para usar campos corretos

**CRÍTICO**: O relatório comparativo agora apresenta a mesma estrutura e cálculos do período único, garantindo consistência total entre as duas visualizações.

##### Itens Implementados Corretamente

**Quadro B - Operações Incentivadas (44 itens completos):**
- **Item 11**: Débito do ICMS das Operações Incentivadas
- **Item 11.1**: Débito do ICMS das Saídas a Título de Bonificação (CFOPs 5910, 5911, 6910, 6911)
- **Item 16**: Crédito Referente a Saldo Credor do Período das Operações Não Incentivadas
- **Item 17**: Saldo Devedor = [(11+11.1+12+13) - (14+15+16)]
- **Itens 19, 20, 24, 27**: Saldo após média, abatimentos, financiamento, compensações
- **Itens 29, 30, 31**: Saldos credores das operações incentivadas

**Quadro C - Operações Não Incentivadas (44 itens completos):**
- **Item 35**: ICMS Excedente Não Sujeito ao Incentivo (lógica complexa)
- **Item 38**: Saldo Devedor Bruto das Operações Não Incentivadas
- **Item 40**: Compensação de Saldo Credor de Período Anterior
- **Itens 42, 43, 44**: Saldos credores das operações não incentivadas

##### Lógica de Compensação Fiscal Correta

```javascript
// SEQUÊNCIA CORRETA DE CÁLCULO:

// 1. Calcular Quadro C primeiro (operações não incentivadas)
const saldoCredorPeriodoNaoIncentivadas = Math.max(0, 
    (creditoOperacoesNaoIncentivadas + deducoesNaoIncentivadas) - 
    (debitoNaoIncentivadas + outrosDebitosNaoIncentivadas + estornoCreditosNaoIncentivadas + icmsExcedenteNaoSujeitoIncentivo)
);

// 2. Item 43 (Quadro C) transfere para Item 16 (Quadro B)
const creditoSaldoCredorNaoIncentivadas = saldoCredorNaoIncentUsadoIncentivadas;

// 3. Calcular Quadro B com compensação
const saldoDevedorIncentivadas = Math.max(0, 
    (debitoIncentivadas + debitoBonificacaoIncentivadas + outrosDebitosIncentivadas + estornoCreditosIncentivadas) - 
    (creditoOperacoesIncentivadas + deducoesIncentivadas + creditoSaldoCredorNaoIncentivadas)
);

// 4. Item 35 - Lógica específica conforme instrução de preenchimento
if (icmsPorMediaCalc > (saldoDevedorIncentivadas - icmsExcedente)) {
    icmsExcedenteNaoSujeitoIncentivoFinal = icmsBaseFomentar - parcelaNaoFinanciada;
} else {
    icmsExcedenteNaoSujeitoIncentivoFinal = valorTransportadoItem24;
}
```

##### Fórmulas Fiscais Específicas

**Item 29 (Quadro B)**: Saldo Credor Período Incentivadas = [(14+15)-(11+11.1+12+13)]  
**Item 42 (Quadro C)**: Saldo Credor Período Não Incentivadas = [(36+37)-(32+33+34+35)]  
**Item 17 (Quadro B)**: Saldo Devedor Incentivadas = [(11+11.1+12+13) - (14+15+16)]

##### Interface HTML Atualizada

- **44 itens completos** implementados em `sped-web-fomentar.html`
- **Nomenclaturas corretas** conforme demonstrativo oficial
- **Funções updateQuadroB/C** atualizadas para todos os novos itens
- **Exportação Excel** com mapeamento correto de todos os campos

##### Validação Fiscal

- ✅ **Compensação entre quadros**: Saldos credores de um quadro reduzem saldos devedores do outro
- ✅ **Item 35 complexo**: Implementada lógica condicional conforme instrução oficial
- ✅ **Bonificações específicas**: CFOPs 5910, 5911, 6910, 6911 separados no item 11.1
- ✅ **Saldos credores transportados**: Itens 31 e 44 para períodos seguintes
- ✅ **Fórmula FOMENTAR**: Base correta após todas as compensações e abatimentos

### Comandos de Teste e Validação

#### Testes Funcionais

```bash
# Testar importação de arquivo SPED simples
open index.html # Aba Conversor SPED

# Testar apuração FOMENTAR período único
open index.html # Aba Apuração FOMENTAR

# Testar apuração ProGoiás período único
open index.html # Aba Apuração ProGoiás

# Testar múltiplos períodos
# Selecionar "Múltiplos Períodos" e importar vários SPEDs
```

#### Validação de Cálculos

- **FOMENTAR**: Verificar se registros consolidados são processados corretamente
- **ProGoiás**: Validar fórmula contra planilha `Comparativo_ProGoias_50_periodos.xlsx`
- **E111**: Confirmar exclusão automática de créditos circulares
- **Múltiplos**: Testar acumulação e navegação entre períodos

#### Logs Esperados

```
[14:30:15] Processando registros consolidados C190, C590, D190, D590...
[14:30:16] E111 EXCLUÍDO (crédito programa incentivo): GO040007 = R$ 5.250,00
[14:30:17] ProGoiás: Base = R$ 15.750,00 x 50% = R$ 7.875,00
[14:30:18] Múltiplos períodos: Processando 3/5 arquivos...
```

### Code Markers

O código utiliza marcadores específicos para orientar o Claude:

- **CLAUDE-CONTEXT**: Explica seções complexas ou críticas
- **CLAUDE-TODO**: Indica tarefas pendentes rápidas
- **CLAUDE-CAREFUL**: Marca código sensível que requer atenção especial
- **CLAUDE-FISCAL**: Indica cálculos fiscais que seguem normativas específicas

```javascript
// CLAUDE-CONTEXT: Processamento de registros consolidados SPED
// CLAUDE-FISCAL: Cálculo conforme IN 885/07-GSF - não alterar sem validação
// CLAUDE-CAREFUL: Exclusão de créditos circulares - crítico para conformidade
```

### Funções JavaScript Principais (2025-07-30)

#### Sistema de Correção Avançado - E111
```javascript
// Gerenciamento de códigos específicos por período
window.atualizarCodigoPorPeriodo(index, periodoIndex, novoCodigo)
window.atualizarPeriodoEspecifico(index, periodoIndex, checked)

// Estrutura de dados expandida
const codigo = {
    codigosPorPeriodo: {}, // NOVO: códigos específicos por período
    periodosEscolhidos: [], // períodos selecionados
    novocodigo: '' // código global padrão
};
```

#### Sistema de Correção Avançado - C197/D197
```javascript
// Funções específicas para C197/D197
window.atualizarCodigoPorPeriodoC197D197(index, periodoIndex, novoCodigo)
window.atualizarPeriodoEspecificoC197D197(index, periodoIndex, checked)

// Aplicação inteligente com priorização
if (correcao.codigosPorPeriodo[periodoIndex]) {
    codigoFinal = correcao.codigosPorPeriodo[periodoIndex]; // Específico
} else {
    codigoFinal = correcao.novoCodigo; // Global
}
```

#### Interface Dinâmica
```javascript
// Controle de visibilidade de campos específicos
const periodoCodigoDiv = document.getElementById(`periodoCodigo_${index}_${periodoIndex}`);
periodoCodigoDiv.style.display = checked ? 'block' : 'none';

// Estrutura HTML expansível
<div class="periodo-item-expandido">
    <div class="periodo-header">/* Checkbox + info */</div>
    <div class="periodo-codigo">/* Campo específico */</div>
</div>
```

### Decisões Arquiteturais

#### 2025-07-02: Migração para Registros Consolidados
- **Decisão**: Usar C190, C590, D190, D590 em vez de C100/C170, D100/D190
- **Razão**: Dados já consolidados reduzem processamento e melhoram performance
- **Impacto**: Cálculos mais precisos, menos memória utilizada
- **Trade-off**: Menor granularidade de dados individuais

#### 2025-07-15: Implementação ProGoiás Completo
- **Decisão**: Sistema unificado FOMENTAR + ProGoiás em 3 abas
- **Razão**: Demanda de usuários por apuração ProGoiás automatizada
- **Impacto**: Interface mais complexa, mas cobertura fiscal completa
- **Validação**: Decreto nº 9.724/2020 implementado rigorosamente

#### 2025-07-20: Correção de Percentuais FOMENTAR
- **Decisão**: FOMENTAR até 70% (corrigido de 73%)
- **Razão**: Conformidade com legislação vigente
- **Impacto**: Recálculo de apurações existentes necessário
- **Documentação**: Atualizado em `CORRECOES_IMPLEMENTADAS.md`

#### 2025-07-25: Múltiplos Períodos
- **Decisão**: Suporte a processamento sequencial de vários SPEDs
- **Razão**: Facilitar apuração anual e comparativos
- **Implementação**: Arrays separados para cada programa fiscal
- **Performance**: Processamento assíncrono para não travar interface

### Marcos do Projeto

#### Fase 1: Sistema Base (Concluída)
- [x] Conversor SPED básico
- [x] Interface drag-and-drop
- [x] Exportação Excel
- [x] Parsing de registros principais

#### Fase 2: FOMENTAR (Concluída)
- [x] Classificação CFOP automática
- [x] Quadros A, B, C da apuração
- [x] Configuração de programas
- [x] Correção de créditos circulares

#### Fase 3: ProGoiás (Concluída)
- [x] Implementação Decreto 9.724/2020
- [x] Fórmula completa de cálculo
- [x] Configuração por tipo de empresa
- [x] Geração registro E115

#### Fase 4: Múltiplos Períodos (Concluída)
- [x] Interface para vários SPEDs
- [x] Acumulação automática
- [x] Navegação entre períodos
- [x] Exportação consolidada

#### Fase 5: Correção E111 (Concluída)
- [x] Detecção de códigos inconsistentes
- [x] Interface de correção manual
- [x] Validação contra Anexo III
- [x] Recálculo automático

#### Fase 6: CFOPs Genéricos (Concluída)
- [x] Detecção automática de CFOPs genéricos
- [x] Interface de configuração incentivado/não incentivado
- [x] Integração com fluxo E111 → Cálculo
- [x] Correção de mapeamento Excel

#### Fase 7: Demonstrativo v3.51 Completo (Concluída)
- [x] Implementação dos 44 itens oficiais
- [x] Lógica de compensação entre quadros
- [x] Item 35 - ICMS Excedente (lógica complexa)
- [x] Saldos credores transportados (itens 29-31, 42-44)
- [x] Interface HTML com todos os campos
- [x] Exportação Excel corrigida

#### Fase 8: Sistema de Correção Avançado (Concluída - 2025-07-30)
- [x] **Códigos específicos por período** para E111, C197 e D197
- [x] **Interface expansível** com campos individuais por período
- [x] **Modo híbrido**: código global + específicos conforme necessidade
- [x] **Barra de rolagem** para muitos períodos (max-height: 400px)
- [x] **Lógica inteligente**: prioriza específico → fallback global
- [x] **Logs detalhados** indicando origem da correção (específico/global)
- [x] **Compatibilidade total** com sistemas existentes
- [x] **Máxima flexibilidade** para cenários fiscais complexos

**Status Atual**: Sistema completo com correção avançada de códigos fiscais (100% funcional)

### Contexto Importante

#### Requisitos Críticos
- **Conformidade Fiscal**: Seguir rigorosamente IN 885/07-GSF e Decreto 9.724/2020
- **Precisão de Cálculos**: Validar sempre contra planilhas oficiais
- **Performance**: Processar SPEDs grandes (>100MB) sem travar
- **Usabilidade**: Interface intuitiva para contadores

#### Limitações Técnicas
- **Client-side only**: Não requer servidor, mas limitado pela memória do navegador
- **Dependência Excel**: XlsxPopulate para exportações
- **Browser Support**: Chrome, Firefox, Safari (IE não suportado)
- **Offline**: Funciona sem conexão após carregamento inicial

#### Dados Sensíveis
- **SPED**: Contém informações fiscais confidenciais
- **Não armazenar**: Dados permanecem apenas na sessão
- **Logs**: Evitar exposição de valores específicos nos logs públicos
- **Exportação**: Sempre nomear arquivos com empresa/período

### Manutenção

Ao modificar o sistema:

1. Manter compatibilidade com layout SPED oficial
2. Validar cálculos contra planilhas de referência:
   - `demonstrativo-versAo-3_51-unlocked.xlsx` (FOMENTAR)
   - `instrucao-de-preenchimento-do-demonstrativo-versao-3_5-a87.pdf` (Instruções oficiais)
   - `Comparativo_ProGoias_50_periodos.xlsx` (ProGoiás)
3. Testar com SPEDs reais de diferentes portes
4. **CRÍTICO**: Não alterar a lógica de compensação entre quadros sem validação fiscal
5. **IMPORTANTE**: Item 35 tem lógica complexa - validar contra instrução oficial
6. Verificar impacto nas exportações Excel e memórias de cálculo
7. Atualizar `CORRECOES_IMPLEMENTADAS.md` com novas correções
8. Adicionar marcadores CLAUDE-* em código novo
9. Validar todos os 44 itens do demonstrativo após mudanças
10. **Sequência obrigatória**: Quadro C → Saldos Credores → Quadro B → Compensações

## 🔄 Próxima Sessão

### Setup Inicial
1. Abrir `index.html` no navegador para testar interface
2. Verificar console para erros JavaScript
3. Testar com arquivo SPED real (se disponível)
4. Validar cálculos contra planilhas de referência

### Tarefas Pendentes
- [ ] Otimização de performance para SPEDs muito grandes (>200MB)
- [ ] Implementação de mais códigos E111 conforme demanda
- [ ] Validação adicional de consistência entre períodos
- [ ] Melhorias na UX de navegação entre períodos

### Funcionalidades Recentes (2025-07-30)
- ✅ **Sistema de Correção Avançado**: Códigos específicos por período implementado
- ✅ **Interface Expansível**: Barra de rolagem e campos dinâmicos funcionando
- ✅ **Compatibilidade Total**: E111, C197 e D197 com mesma funcionalidade
- ✅ **Logs Inteligentes**: Diferenciação entre correções específicas e globais

### Cuidados Especiais
- **Créditos Circulares**: Sempre verificar exclusão automática de GO040007, GO040008, etc.
- **Registros Consolidados**: Não reverter para C100/C170 sem justificativa técnica
- **Percentuais**: FOMENTAR = 70%, não 73%
- **ProGoiás**: Fórmula exata conforme Decreto 9.724/2020
- **NOVO - Correções Específicas**: Verificar se códigos específicos por período estão sendo aplicados corretamente

### Como Usar o Sistema de Correção Avançado

#### Cenário 1: Código Global para Todos os Períodos
1. Importar múltiplos SPEDs
2. Identificar código inconsistente (ex: "GO020999")
3. Campo "Código Corrigido (global)": inserir "GO040001"
4. Selecionar "Todos os períodos"
5. Aplicar correção → Todos usarão "GO040001"

#### Cenário 2: Códigos Específicos por Período
1. Importar múltiplos SPEDs  
2. Identificar código inconsistente
3. Selecionar "Períodos específicos"
4. Marcar períodos desejados
5. Para cada período: inserir código específico no campo que aparece
6. Deixar vazio = usar código global | Preencher = usar específico

#### Cenário 3: Modo Híbrido (Recomendado)
1. Definir código global como padrão
2. Selecionar todos os períodos necessários
3. Sobrescrever apenas períodos que precisam de código diferente
4. Sistema aplicará específico onde definido, global nos demais

### Em Caso de Problemas
1. Verificar logs detalhados no console
2. Comparar com `CORRECOES_IMPLEMENTADAS.md`
3. Testar com SPED menor para isolamento
4. Validar estrutura do arquivo SPED
5. **NOVO**: Verificar se campos específicos por período estão sendo salvos
6. **NOVO**: Confirmar nos logs se está aplicando código "específico" ou "global"
7. Validar exclusão de créditos circulares em novos cenários