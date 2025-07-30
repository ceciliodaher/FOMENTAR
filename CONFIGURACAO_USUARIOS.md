# Configuração de Controle de Acesso de Usuários

Este documento explica como configurar diferentes níveis de acesso ao sistema FOMENTAR.

## Como Configurar

### 1. Via Interface (Recomendado)
- Clique no botão `👤 Admin` no cabeçalho
- Selecione o perfil desejado no modal
- Clique em "Aplicar Perfil"

### 2. Via Código (Avançado)
Edite o arquivo `permissions.js` na linha 67:

```javascript
let currentUserProfile = 'fomentarBasico'; // Altere aqui
```

## Perfis Disponíveis

### 👑 Administrador (`admin`)
**Acesso completo a todas as funcionalidades**
- ✅ Conversor SPED
- ✅ FOMENTAR (período único e múltiplo)
- ✅ ProGoiás (período único e múltiplo) 
- ✅ Registro E115 e Confrontos
- ✅ Correção de códigos
- ✅ Memória de cálculo
- ✅ Exportações

### 📊 FOMENTAR Básico (`fomentarBasico`)
**Apenas FOMENTAR período único**
- 🚫 Conversor SPED
- ✅ FOMENTAR período único
- 🚫 FOMENTAR múltiplos períodos
- 🚫 ProGoiás
- 🚫 Registro E115
- 🚫 Confrontos E115
- 🚫 Correção de códigos
- ✅ Exportação Excel básica
- ✅ Memória de cálculo

### 📈 FOMENTAR Completo (`fomentarCompleto`)
**Todas as funcionalidades FOMENTAR**
- 🚫 Conversor SPED
- ✅ FOMENTAR (período único e múltiplo)
- ✅ Registro E115 e Confrontos
- ✅ Correção de códigos E111/C197/D197
- 🚫 ProGoiás
- ✅ Todas as exportações
- ✅ Memória de cálculo

### 🔄 Conversor Apenas (`converterApenas`)
**Apenas conversão SPED para Excel**
- ✅ Conversor SPED
- ✅ Importação de arquivos
- ✅ Exportação Excel
- 🚫 FOMENTAR
- 🚫 ProGoiás

### 🏢 ProGoiás Básico (`progoiasBasico`)
**Apenas ProGoiás período único**
- 🚫 Conversor SPED
- 🚫 FOMENTAR
- ✅ ProGoiás período único
- 🚫 ProGoiás múltiplos períodos
- ✅ Exportação Excel
- ✅ Memória de cálculo

### 🏭 ProGoiás Completo (`progoiasCompleto`)
**Todas as funcionalidades ProGoiás**
- 🚫 Conversor SPED
- 🚫 FOMENTAR
- ✅ ProGoiás (período único e múltiplo)
- ✅ Exportação Excel
- ✅ Memória de cálculo

## Casos de Uso Recomendados

### Para Contador Iniciante
```javascript
currentUserProfile = 'fomentarBasico';
```
- Interface simplificada
- Apenas período único
- Sem funcionalidades avançadas
- Reduz chance de erro

### Para Contador Experiente
```javascript
currentUserProfile = 'fomentarCompleto';
```
- Acesso completo ao FOMENTAR
- Múltiplos períodos
- Registro E115 e confrontos
- Correção de códigos

### Para Empresa Pequena (só ProGoiás básico)
```javascript
currentUserProfile = 'progoiasBasico';
```
- Foco apenas no ProGoiás período único
- Interface simplificada
- Sem múltiplos períodos
- Reduz complexidade

### Para Empresa Média (ProGoiás completo)
```javascript
currentUserProfile = 'progoiasCompleto';
```
- Todas as funcionalidades ProGoiás
- Múltiplos períodos
- Relatórios completos

### Para Administrador do Sistema
```javascript
currentUserProfile = 'admin';
```
- Acesso completo
- Todas as funcionalidades
- Para testes e suporte

## Implementação Técnica

### Estrutura de Permissões
```javascript
const USER_PERMISSIONS = {
    perfil: {
        tabs: {
            converter: boolean,
            fomentar: boolean,
            progoias: boolean
        },
        fomentar: {
            periodoUnico: boolean,
            multiplosPeriodos: boolean,
            exportar: boolean,
            memoriaCalculo: boolean,
            registroE115: boolean,
            confrontoE115: boolean,
            correcaoCodigos: boolean
        },
        // ... outras categorias
    }
};
```

### Funções Principais
- `permissionManager.setUserProfile(profile)` - Alterar perfil
- `permissionManager.hasPermission(category, permission)` - Verificar permissão
- `permissionManager.applyPermissions()` - Aplicar na interface

### Controles Implementados

#### Nível de Aba
- Oculta abas não permitidas
- Redireciona para primeira aba disponível

#### Nível de Funcionalidade
- Desabilita botões sem permissão
- Oculta seções restritas
- Bloqueia modos não permitidos

#### Elementos Controlados
- **Abas**: Conversor, FOMENTAR, ProGoiás
- **Botões**: Exportar, Memória de Cálculo, E115, Confronto
- **Modos**: Período único vs múltiplos períodos
- **Seções**: Correção de códigos, CFOPs genéricos

## Personalização

### Criar Novo Perfil
1. Adicione no objeto `USER_PERMISSIONS` em `permissions.js`
2. Defina as permissões específicas
3. Adicione no modal HTML (opcional)
4. Teste todas as funcionalidades

### Exemplo de Novo Perfil
```javascript
// Perfil personalizado: apenas múltiplos períodos
fomentarMultiplo: {
    tabs: {
        converter: false,
        fomentar: true,
        progoias: false
    },
    fomentar: {
        periodoUnico: false,        // Bloqueado
        multiplosPeriodos: true,    // Apenas este
        exportar: true,
        memoriaCalculo: true,
        registroE115: false,
        confrontoE115: false,
        correcaoCodigos: false
    }
}
```

## Segurança

### Limitações
- **Client-side**: Controle apenas visual/interface
- **Não é segurança real**: Usuário avançado pode contornar
- **Para organização**: Evita confusão, não protege dados

### Recomendações
- Use para simplificar interface para usuários específicos
- Para segurança real, implemente controle server-side
- Combine com treinamento adequado dos usuários
- Documente bem os perfis para cada usuário

## Troubleshooting

### Perfil não aplicado
1. Verifique console do navegador
2. Confirme se `permissions.js` foi carregado
3. Teste com perfil 'admin' primeiro

### Elementos não aparecem
1. Verifique IDs dos elementos no HTML
2. Confirme timing de aplicação das permissões
3. Use setTimeout se necessário

### Modal não abre
1. Verifique se botão tem ID correto: `configUserButton`
2. Confirme se modal tem ID: `userConfigModal`
3. Teste eventos no console

## Manutenção

### Adicionar Nova Funcionalidade
1. Defina permissão na estrutura `USER_PERMISSIONS`
2. Implemente controle em `applyPermissions()`
3. Teste com todos os perfis
4. Atualize documentação

### Alterar Perfil Existente
1. Modifique objeto de permissões
2. Teste impacto em interface
3. Valide com usuários afetados
4. Documente mudanças