# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projeto FOMENTAR - Expertzy Inteligência Tributária

Este é um sistema web completo para conversão de arquivos SPED e apuração de incentivos fiscais FOMENTAR/PRODUZIR/MICROPRODUZIR e ProGoiás do Estado de Goiás.

### Estrutura do Projeto

```
/Users/ceciliodaher/Documents/git/FOMENTAR/
├── index.html                   # Interface unificada com 3 abas principais
├── script.js                    # Sistema unificado (SPED + FOMENTAR + ProGoiás + CFOPs Genéricos)
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

### Correção de Códigos E111

#### Problemática

- Códigos E111 podem estar inconsistentes no SPED
- Necessidade de correção manual para conformidade fiscal
- Distinção entre débitos e créditos conforme legislação

#### Interface de Correção

```javascript
let codigosCorrecao = {}; // Mapeamento: código original -> código corrigido
let codigosEncontrados = []; // Lista de códigos E111 encontrados no SPED
let isMultiplePeriods = false; // Flag para processamento múltiplo
```

#### Fluxo de Correção

1. **Detecção**: Identificação automática de códigos inconsistentes
2. **Interface**: Apresentação de tabela para correção manual
3. **Validação**: Verificação de conformidade com Anexo III
4. **Aplicação**: Recalcula apuração com códigos corrigidos
5. **Documentação**: Log detalhado das alterações realizadas

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

**Status Atual**: Manutenção e melhorias (100% funcional)

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
   - `Comparativo_ProGoias_50_periodos.xlsx` (ProGoiás)
3. Testar com SPEDs reais de diferentes portes
4. Documentar mudanças nos códigos CFOP se necessário
5. Verificar impacto nas exportações Excel e memórias de cálculo
6. Atualizar `CORRECOES_IMPLEMENTADAS.md` com novas correções
7. Adicionar marcadores CLAUDE-* em código novo
8. Validar exclusão de créditos circulares em novos cenários

## 🔄 Próxima Sessão

### Setup Inicial
1. Abrir `index.html` no navegador para testar interface
2. Verificar console para erros JavaScript
3. Testar com arquivo SPED real (se disponível)
4. Validar cálculos contra planilhas de referência

### Tarefas Pendentes
- [ ] Otimização de performance para SPEDs muito grandes (>200MB)
- [ ] Implementação de mais códigos E111 conforme demanda
- [ ] Melhorias na interface de múltiplos períodos
- [ ] Validação adicional de consistência entre períodos

### Cuidados Especiais
- **Créditos Circulares**: Sempre verificar exclusão automática de GO040007, GO040008, etc.
- **Registros Consolidados**: Não reverter para C100/C170 sem justificativa técnica
- **Percentuais**: FOMENTAR = 70%, não 73%
- **ProGoiás**: Fórmula exata conforme Decreto 9.724/2020

### Em Caso de Problemas
1. Verificar logs detalhados no console
2. Comparar com `CORRECOES_IMPLEMENTADAS.md`
3. Testar com SPED menor para isolamento
4. Validar estrutura do arquivo SPED
7. Validar exclusão de créditos circulares em novos cénarios