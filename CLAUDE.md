# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projeto FOMENTAR - Expertzy Inteligência Tributária

Este é um sistema web para conversão de arquivos SPED e apuração de incentivos fiscais FOMENTAR/PRODUZIR/MICROPRODUZIR do Estado de Goiás.

### Estrutura do Projeto

```
/Users/ceciliodaher/Documents/git/FOMENTAR/
├── sped-web/                    # Aplicação web principal
│   ├── index.html              # Interface com duas abas: Conversor SPED e Apuração FOMENTAR
│   ├── script.js               # Lógica principal JavaScript
│   └── style.css               # Estilos CSS responsivos
├── script.js                   # Versão standalone do sistema FOMENTAR
├── style.css                   # Estilos CSS standalone
├── index.html.txt              # Template HTML base
└── normativas/                 # Documentação normativa
    ├── INSTRUÇÃO NORMATIVA Nº 885_07-GSF.pdf
    ├── demonstrativo-versAo-3_51-unlocked.xlsx
    └── instrucao-de-preenchimento-do-demonstrativo-versao-3_5-a87.pdf
```

### Comandos Principais

#### Desenvolvimento Local
- Abrir `sped-web/index.html` diretamente no navegador
- Não requer servidor web específico (aplicação client-side)
- Usar ferramentas de desenvolvedor do navegador para debug

#### Dependências
- **XlsxPopulate**: Biblioteca para geração de arquivos Excel
  - CDN: `https://cdn.jsdelivr.net/npm/xlsx-populate/browser/xlsx-populate.min.js`
  - Já incluída no HTML principal

### Arquitetura do Sistema

#### Funcionalidades Principais

1. **Conversor SPED** (`sped-web/`)
   - Importação de arquivos SPED (.txt)
   - Parsing e validação de registros SPED
   - Exportação para Excel com múltiplas abas
   - Interface drag-and-drop para upload

2. **Apuração FOMENTAR** (integrada)
   - Classificação automática de operações incentivadas/não incentivadas
   - Cálculo conforme Instrução Normativa nº 885/07-GSF
   - Quadros A, B e C da apuração
   - Configuração de programas (FOMENTAR/PRODUZIR/MICROPRODUZIR)

#### Fluxo de Dados

1. **Importação SPED**: `processSpedFile()` → `lerArquivoSpedCompleto()`
2. **Classificação**: `classifyOperations()` usando CFOPs da IN 885
3. **Cálculo FOMENTAR**: `calculateFomentar()` com base nos quadros normativos
4. **Exportação**: Geração de Excel ou impressão

#### Constantes Importantes

- **CFOP_ENTRADAS_INCENTIVADAS**: Lista de CFOPs para entradas incentivadas
- **CFOP_SAIDAS_INCENTIVADAS**: Lista de CFOPs para saídas incentivadas  
- **CODIGOS_AJUSTE_INCENTIVADOS**: Códigos do registro E111 considerados incentivados

### Registros SPED Processados

- **C100/C170**: Notas fiscais de entrada/saída e itens
- **D100/D190**: CTe e consolidados de transporte
- **E100/E110/E111**: Apuração do ICMS e ajustes
- **0000**: Dados cadastrais da empresa

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
- **IN 885/07-GSF**: Classificação de operações incentivadas
- **Demonstrativo versão 3.51**: Layout oficial dos quadros
- **Anexo III**: Códigos de ajuste incentivados do E111

### Debugging

#### Logs de Sistema
- Console do navegador: logs técnicos detalhados
- Interface de usuário: feedback visual no painel de logs
- Estados de erro: styling visual diferenciado

#### Pontos de Breakpoint Recomendados
- `classifyOperations()`: Verificar classificação CFOP
- `calculateFomentar()`: Validar cálculos dos quadros
- `processSpedFile()`: Debugging de parsing SPED

### Notas Importantes

1. **Códigos CFOP**: Lista baseada na legislação específica de Goiás
2. **Percentuais de Financiamento**: MICROPRODUZIR até 90%, demais até 73%
3. **Registro E111**: Processamento de ajustes diferenciado por tipo
4. **Validação de Dados**: Sempre verificar consistência antes dos cálculos

### Manutenção

Ao modificar o sistema:
1. Manter compatibilidade com layout SPED oficial
2. Validar cálculos contra planilha de referência
3. Testar com SPEDs reais de diferentes portes
4. Documentar mudanças nos códigos CFOP se necessário
5. Verificar impacto nas exportações Excel