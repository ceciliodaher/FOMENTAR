# Confronto das fórmulas:



## **QUADRO B - APURAÇÃO DOS SALDOS DAS OPERAÇÕES INCENTIVADAS**

| Item | Descrição                                                                  | Fórmula JavaScript                                                                                                                                                                                                        | Fórmula Planilha Excel                 | Diferenças/Observações                                                    |
| ---- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------- |
| 11   | Débito do ICMS das Operações Incentivadas                                  | `fomentarData.saidasIncentivadas.reduce((total, op) => total + op.valorIcms, 0)`                                                                                                                                          | Valor manual                           | ⚠️ **Diferença** - Planilha especifica "(exceto o débito do item 11.1)"   |
| 11.1 | Débito do ICMS das Saídas a Título de Bonificação                          | Filtro por CFOPs ['5910', '5911', '6910', '6911']                                                                                                                                                                         | Valor manual                           | ✅ **Compatível** - JS automatiza                                          |
| 12   | Outros Débitos das Operações Incentivadas                                  | `fomentarData.outrosDebitosIncentivados`                                                                                                                                                                                  | Valor manual                           | ✅ **Compatível**                                                          |
| 13   | Estorno de Créditos das Operações Incentivadas                             | `estornoCreditosIncentivadas`                                                                                                                                                                                             | Valor manual                           | ✅ **Compatível**                                                          |
| 14   | Crédito para Operações Incentivadas                                        | `creditoOperacoesIncentivadas`                                                                                                                                                                                            | `(9+10.1)`                             | ❌ **DIFERENÇA** - JS não inclui item 10.1                                 |
| 15   | Deduções das Operações Incentivadas                                        | `deducoesIncentivadas`                                                                                                                                                                                                    | Valor manual (referência LRA linha 14) | ✅ **Compatível**                                                          |
| 16   | Crédito Referente a Saldo Credor do Período das Operações Não Incentivadas | `saldoCredorNaoIncentUsadoIncentivadas`                                                                                                                                                                                   | `(43)`                                 | ✅ **Compatível** - Referência cruzada                                     |
| 17   | Saldo Devedor do ICMS das Operações Incentivadas                           | `Math.max(0, (debitoIncentivadas + debitoBonificacaoIncentivadas + outrosDebitosIncentivadas + estornoCreditosIncentivadas) - (creditoOperacoesIncentivadas + deducoesIncentivadas + creditoSaldoCredorNaoIncentivadas))` | `[(11+11.1+12+13)-(14+15+16)]`         | ⚠️ **Parcialmente compatível** - Estrutura similar mas JS não inclui 10.1 |
| 18   | ICMS por Média                                                             | `icmsPorMediaCalc`                                                                                                                                                                                                        | Valor manual                           | ✅ **Compatível**                                                          |
| 19   | Deduções/Compensações                                                      | **AUSENTE NO JS**                                                                                                                                                                                                         | `(64)`                                 | ❌ **AUSENTE** - Campo não implementado                                    |
| 20   | Saldo do ICMS a Pagar por Média                                            | **AUSENTE NO JS**                                                                                                                                                                                                         | `(18-19)`                              | ❌ **AUSENTE** - Campo não implementado                                    |
| 21   | ICMS Base para FOMENTAR/PRODUZIR                                           | `Math.max(0, saldoAposMedia - outrosAbatimentos)`                                                                                                                                                                         | `(17-18)`                              | ⚠️ **Diferença** - JS usa `saldoAposMedia`, planilha usa `(17-18)`        |
| 22   | Percentagem do Financiamento                                               | `percentualFinanciamento * 100`                                                                                                                                                                                           | Valor manual                           | ✅ **Compatível**                                                          |
| 23   | ICMS Sujeito a Financiamento                                               | `icmsBaseFomentar * percentualFinanciamento`                                                                                                                                                                              | `[(21x22)/100]`                        | ✅ **Compatível**                                                          |
| 24   | ICMS Excedente Não Sujeito ao Incentivo                                    | **AUSENTE NO JS**                                                                                                                                                                                                         | Valor manual                           | ❌ **AUSENTE** - Campo não implementado                                    |
| 25   | ICMS Financiado                                                            | `valorFinanciamentoConcedido`                                                                                                                                                                                             | `(23-24)`                              | ⚠️ **Diferença** - JS não considera item 24                               |
| 26   | Saldo do ICMS da Parcela Não Financiada                                    | `icmsBaseFomentar - icmsFinanciado`                                                                                                                                                                                       | `(21-23)`                              | ✅ **Compatível**                                                          |
| 27   | Compensação de Saldo Credor de Período Anterior                            | `compensacaoSaldoCredorAnterior`                                                                                                                                                                                          | Valor manual (referência linha 65)     | ✅ **Compatível**                                                          |
| 28   | Saldo do ICMS a Pagar da Parcela Não Financiada                            | `Math.max(0, parcelaNaoFinanciada - compensacaoSaldoCredorAnterior)`                                                                                                                                                      | `(26-27)`                              | ✅ **Compatível**                                                          |

## **QUADRO C - APURAÇÃO DOS SALDOS DAS OPERAÇÕES NÃO INCENTIVADAS**

| Item | Descrição                                            | Fórmula JavaScript                                                                  | Fórmula Planilha Excel             | Diferenças/Observações                       |
| ---- | ---------------------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------- | -------------------------------------------- |
| 32   | Débito do ICMS das Operações Não Incentivadas        | `fomentarData.saidasNaoIncentivadas.reduce((total, op) => total + op.valorIcms, 0)` | Valor manual                       | ✅ **Compatível**                             |
| 35   | ICMS Excedente Não Sujeito ao Incentivo              | Valor transportado do item 24                                                       | Valor manual                       | ⚠️ **Diferença** - JS não implementa item 24 |
| 39   | Saldo Devedor do ICMS das Operações Não Incentivadas | Calculado com base nos itens 32-38                                                  | `[(32+33+34+35)-(36+37+38)]`       | ✅ **Compatível** - Mesma estrutura           |
| 40   | Compensação de Saldo Credor de Período Anterior      | `compensacaoSaldoCredorAnteriorNaoIncentivadas`                                     | Valor manual (referência linha 63) | ✅ **Compatível**                             |

## **🚨 PRINCIPAIS DIVERGÊNCIAS IDENTIFICADAS**

## **1. Campos Ausentes no JavaScript**

- Item 19: Deduções/Compensações (64)

- Item 20: Saldo do ICMS a Pagar por Média

- Item 24: ICMS Excedente Não Sujeito ao Incentivo

## 2. Diferenças de Implementação**

- **Item 11**: JS não exclui o débito do item 11.1

- **Item 21**: JS usa lógica diferente para base de cálculo

## **4. Impacto Regulatório**

A planilha Excel é o **modelo oficial** conforme IN 885/07-GSF. As divergências encontradas podem resultar em:

- Cálculos incorretos do benefício FOMENTAR

- Não conformidade com a legislação tributária

- Problemas em eventuais fiscalizações

**Recomendação**: O código JavaScript precisa ser **revisado e corrigido** para seguir exatamente a estrutura e fórmulas da planilha oficial.

1. https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/8663280/95b2e527-10cf-48a9-81dc-6f47f9f5bd88/script.js
2. https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/8663280/68e4c2a9-286e-4167-b64d-3e0f2a2a4d2b/sped-web-fomentar.html
3. https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/8663280/b8b820ab-4f34-4d43-8c22-89d4076bf70f/demonstrativo-versAo-3_51.xlsx
