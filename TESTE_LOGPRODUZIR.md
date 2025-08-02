# 🚛 Sistema LogPRODUZIR - Guia de Teste

## ✅ **Status da Implementação**

### **Implementado e Funcional:**
- ✅ **Interface HTML completa** com 4 abas (incluindo LogPRODUZIR)
- ✅ **Sistema IGP-DI configurável** (upload CSV + edição manual)
- ✅ **Formatação brasileira** (vírgula decimal, moeda R$)
- ✅ **Classificação de CFOPs** conforme legislação LogPRODUZIR
- ✅ **Cálculo de proporcionalidade** fretes interestaduais/totais
- ✅ **Categorização empresa** (I=50%, II=73%, III=80%)
- ✅ **Validações fiscais obrigatórias**
- ✅ **Event listeners conectados**
- ✅ **Drag & drop SPED**
- ✅ **StateManager modular**

### **Parcialmente Implementado:**
- 🟡 **Múltiplos períodos** (estrutura pronta, implementação futura)
- 🟡 **Exportação Excel/E115** (stub implementado)
- 🟡 **Cálculo média histórica** (estrutura pronta)

---

## 🧪 **Como Testar o Sistema**

### **1. Preparação:**
```bash
# Abrir no navegador
open /Users/ceciliodaher/Documents/git/FOMENTAR/sped-web-fomentar.html

# Fazer login com usuário admin
# Usuário: admin
# Senha: admin0000
```

### **2. Configurar IGP-DI:**

#### **Opção A - Upload da Planilha Template:**
1. Baixar template: `template_igpdi.csv`
2. Clicar "Upload Planilha IGP-DI"
3. Selecionar arquivo template
4. Verificar se dados foram carregados

#### **Opção B - Adicionar Manualmente:**
1. Campo Competência: `01/2024`
2. Campo IGP-DI: `425,67`
3. Clicar "Adicionar"
4. Repetir para outros períodos

### **3. Configurar Empresa:**
1. Preencher Razão Social
2. Preencher CNPJ
3. Selecionar categoria:
   - I (até 50%): Logística básica
   - II (até 73%): + Transporte
   - III (até 80%): + ICMS > R$ 900k
4. Preencher ICMS Mensal (para categoria III)
5. Data entrada projeto: `2024-01`
6. Média histórica: `10.000,00`

### **4. Importar SPED:**
1. Deixar "Período Único" selecionado
2. Arrastar arquivo SPED para área ou clicar "Importar SPED"
3. Sistema deve processar e exibir resultados

---

## 📊 **Dados de Teste**

### **Planilha IGP-DI (template_igpdi.csv):**
```csv
Competência;IGP-DI
01/2023;387,45
02/2023;389,12
03/2023;391,78
04/2023;394,25
12/2024;448,51
```

### **Empresa de Teste:**
```
Razão Social: LOGÍSTICA TESTE LTDA
CNPJ: 12.345.678/0001-90
Categoria: II (73%)
ICMS Mensal: R$ 500.000,00
Data Projeto: 01/2024
Média Histórica: R$ 8.500,00
```

### **CFOPs Esperados no SPED:**
- **6351, 6352, 6353**: Prestações interestaduais (geram incentivo)
- **5351, 5352, 5353**: Prestações estaduais (proporcionalidade)

---

## 🔍 **Validações de Teste**

### **1. Interface:**
- [ ] Aba LogPRODUZIR visível e clicável
- [ ] Seções de configuração carregam corretamente
- [ ] Botões respondem aos cliques
- [ ] Tabela IGP-DI atualiza em tempo real
- [ ] Campos de input aceitam formatação brasileira

### **2. IGP-DI:**
- [ ] Upload CSV funciona
- [ ] Validação de formato competência (MM/AAAA)
- [ ] Parsing de números brasileiros (vírgula)
- [ ] Adição manual de valores
- [ ] Remoção de valores com confirmação
- [ ] Export para CSV

### **3. Classificação SPED:**
- [ ] Registros D190/D590 são processados
- [ ] CFOPs 6xxx classificados como interestaduais
- [ ] CFOPs 5xxx classificados como estaduais
- [ ] Proporcionalidade calculada corretamente

### **4. Cálculos Fiscais:**
- [ ] Categoria da empresa aplicada
- [ ] Correção IGP-DI funciona
- [ ] Apenas excesso sobre média incentivado
- [ ] Contribuições obrigatórias calculadas (~35%)
- [ ] Validação categoria III (ICMS > R$ 900k)

### **5. Logs do Sistema:**
```javascript
// Verificar no console (F12):
// - "Sistema modular inicializado"
// - "IGP-DI carregado: X períodos"
// - "Categoria selecionada: II (até 73%)"
// - "Processando SPED para LogPRODUZIR"
// - "Cálculo LogPRODUZIR concluído com sucesso"
```

---

## 🐛 **Possíveis Problemas e Soluções**

### **Problema: Aba LogPRODUZIR não aparece**
**Solução:** Verificar se sistema de autenticação permite acesso

### **Problema: IGP-DI não carrega**
**Solução:** 
- Verificar formato CSV (separador `;`)
- Verificar encoding (UTF-8)
- Competência no formato MM/AAAA

### **Problema: SPED não processa**
**Solução:**
- Verificar se arquivo é .txt válido
- Verificar se tem registros D190/D590
- Consultar logs no console

### **Problema: Cálculo não executa**
**Solução:**
- Configurar categoria da empresa
- Adicionar pelo menos 1 valor IGP-DI
- Preencher média histórica

---

## 📈 **Resultados Esperados**

### **Tela de Resultados deve mostrar:**
1. **Dados da Empresa**: Categoria, percentual, ICMS mensal
2. **Proporcionalidade**: Fretes inter/estaduais, proporção
3. **Cálculo do Crédito**: Base, correção IGP-DI, excesso, crédito
4. **Contribuições**: Detalhamento dos 4 tipos (~35% total)
5. **Resumo Final**: ICMS original, crédito, valor a pagar

### **Botões de Ação ativos:**
- 📊 Exportar Excel (stub)
- 📄 Memória de Cálculo (stub)
- 📋 Gerar E115 (stub)
- 🖨️ Imprimir (stub)
- 💾 Exportar IGP-DI (funcional)

---

## 🚀 **Próximos Passos**

1. **Testar sistema completo** conforme este guia
2. **Implementar funcionalidades stub** (Excel, E115, etc.)
3. **Adicionar múltiplos períodos**
4. **Integrar com sistema de autenticação**
5. **Adicionar estilos CSS específicos**

---

## 📞 **Debug Console Commands**

```javascript
// Verificar estado do sistema
window.SystemsManager.StateManager.systems.logproduzir

// Verificar IGP-DI carregado
window.SystemsManager.StateManager.systems.logproduzir.igpdiConfig.valores

// Testar formatação brasileira
BrazilianFormatter.formatCurrency(12345.67)
BrazilianFormatter.parseNumber("12.345,67")

// Verificar logs
// Abrir console (F12) e procurar por mensagens do sistema
```

O sistema LogPRODUZIR está **estruturalmente completo** e pronto para teste!