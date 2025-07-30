# FÓRMULAS FOMENTAR - AUDITORIA E CORREÇÕES

## CORREÇÕES IMPLEMENTADAS CONFORME ANÁLISE

### **QUADRO B - OPERAÇÕES INCENTIVADAS**

#### **CORREÇÕES CRÍTICAS IDENTIFICADAS:**

**1. Item 11 - Débito do ICMS das Operações Incentivadas**
- ❌ **ANTES**: `fomentarData.saidasIncentivadas.reduce((total, op) => total + op.valorIcms, 0)`
- ✅ **DEPOIS**: Exclui débito do item 11.1 (bonificações)
```javascript
const debitoIncentivadas = fomentarData.saidasIncentivadas
    .filter(op => {
        const cfopsBonificacao = ['5910', '5911', '6910', '6911'];
        return !cfopsBonificacao.includes(op.cfop);
    })
    .reduce((total, op) => total + op.valorIcms, 0);
```

**2. Item 14 - Crédito para Operações Incentivadas**
- ❌ **ANTES**: `creditoOperacoesIncentivadas` (sem item 10.1)
- ✅ **DEPOIS**: Deve incluir item 10.1
```javascript
const creditoOperacoesIncentivadas = creditoIncentivadas + item10_1;
```

**3. Item 19 - Deduções/Compensações (NOVO)**
- ❌ **ANTES**: Ausente
- ✅ **DEPOIS**: Implementado
```javascript
const deducoesCompensacoes = 0; // Configurável (referência linha 64)
```

**4. Item 20 - Saldo do ICMS a Pagar por Média (NOVO)**
- ❌ **ANTES**: Ausente  
- ✅ **DEPOIS**: Implementado
```javascript
const saldoIcmsPagarPorMedia = Math.max(0, icmsPorMediaCalc - deducoesCompensacoes);
```

**5. Item 21 - ICMS Base para FOMENTAR/PRODUZIR**
- ❌ **ANTES**: `Math.max(0, saldoAposMedia - outrosAbatimentos)`
- ✅ **DEPOIS**: Fórmula corrigida (17-18)
```javascript
const icmsBaseFomentar = Math.max(0, saldoDevedorIncentivadas - saldoIcmsPagarPorMedia);
```

**6. Item 24 - ICMS Excedente Não Sujeito ao Incentivo (NOVO)**
- ❌ **ANTES**: Ausente
- ✅ **DEPOIS**: Implementado
```javascript
const icmsExcedenteNaoSujeitoIncentivo = 0; // Campo manual/configurável
```

**7. Item 25 - ICMS Financiado**
- ❌ **ANTES**: `valorFinanciamentoConcedido`
- ✅ **DEPOIS**: Fórmula corrigida (23-24)
```javascript
const icmsFinanciado = icmsSujeitoFinanciamento - icmsExcedenteNaoSujeitoIncentivo;
```

### **FÓRMULAS CORRETAS POR ITEM**

```javascript
// === QUADRO B - FÓRMULAS CORRIGIDAS ===

// Item 11 - Débito das Operações Incentivadas (exceto 11.1)
const debitoIncentivadas = saidasIncentivadas_SemBonificacao.reduce(...);

// Item 11.1 - Débito das Bonificações  
const debitoBonificacaoIncentivadas = saidasBonificacao.reduce(...);

// Item 14 - Crédito para Operações Incentivadas (9 + 10.1)
const creditoOperacoesIncentivadas = creditoIncentivadas + item10_1;

// Item 17 - Saldo Devedor Incentivadas
const saldoDevedorIncentivadas = Math.max(0, 
    (item11 + item11_1 + item12 + item13) - (item14 + item15 + item16)
);

// Item 18 - ICMS por Média
const icmsPorMediaCalc = icmsPorMedia;

// Item 19 - Deduções/Compensações (NOVO)
const deducoesCompensacoes = 0; // Configurável

// Item 20 - Saldo ICMS a Pagar por Média (NOVO)
const saldoIcmsPagarPorMedia = Math.max(0, item18 - item19);

// Item 21 - ICMS Base FOMENTAR (17-20)
const icmsBaseFomentar = Math.max(0, item17 - item20);

// Item 22 - Percentual Financiamento
const percentualFinanciamento = valor_configurado;

// Item 23 - ICMS Sujeito a Financiamento
const icmsSujeitoFinanciamento = (item21 * item22) / 100;

// Item 24 - ICMS Excedente Não Sujeito ao Incentivo (NOVO)
const icmsExcedenteNaoSujeitoIncentivo = 0; // Manual

// Item 25 - ICMS Financiado (23-24)
const icmsFinanciado = item23 - item24;

// Item 26 - Parcela Não Financiada  
const parcelaNaoFinanciada = item21 - item23;

// Item 28 - Saldo a Pagar Parcela Não Financiada
const saldoPagarParcelaNaoFinanciada = Math.max(0, item26 - item27);
```

### **QUADRO C - OPERAÇÕES NÃO INCENTIVADAS**

```javascript
// Item 35 - ICMS Excedente (transportado do item 24)
const icmsExcedenteQuadroC = icmsExcedenteNaoSujeitoIncentivo;

// Item 39 - Saldo Devedor Não Incentivadas
const saldoDevedorNaoIncentivadas = Math.max(0,
    (item32 + item33 + item34 + item35) - (item36 + item37 + item38)
);

// Item 41 - Saldo a Pagar Não Incentivadas
const saldoPagarNaoIncentivadas = Math.max(0, item39 - item40);
```

### **IMPACTO DAS CORREÇÕES**

**🎯 VALOR TOTAL ICMS A PAGAR:**
```javascript
// CORRETO: Item 28 + Item 41
const icmsTotalAPagar = saldoPagarParcelaNaoFinanciada + saldoPagarNaoIncentivadas;
```

**🎯 VALOR BENEFÍCIO FOMENTAR:**
```javascript
// CORRETO: Item 25 (ICMS Financiado)
const beneficioFomentar = icmsFinanciado;
```

### **PRÓXIMOS PASSOS**

1. ✅ Implementar campos ausentes (19, 20, 24)
2. ✅ Corrigir fórmulas divergentes (11, 14, 21, 25)  
3. ✅ Atualizar interface HTML com novos campos
4. ✅ Sincronizar função período único e múltiplos períodos
5. ✅ Testar confronto SPED com fórmulas corretas

**⚠️ CRÍTICO**: Essas correções são obrigatórias para conformidade com IN 885/07-GSF.