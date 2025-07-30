# Sistema de Autenticação - FOMENTAR

Sistema completo de login/senha com controle automático de permissões e sessões.

## ✅ Implementação Completa

### Arquivos do Sistema
- **`auth.js`** - Gerenciamento de autenticação e sessões
- **`permissions.js`** - Sistema de permissões (integrado)
- **CSS** - Estilos da tela de login e interface de usuário
- **HTML** - Elementos de login e cabeçalho atualizado

## 🔐 Usuários Pré-configurados

### Administradores (Acesso Total)
| Usuário | Senha | Perfil | Descrição |
|---------|-------|--------|-----------|
| `admin` | `admin0000` | admin | Administrador principal |
| `supervisor` | `super123` | admin | Supervisor do sistema |

### FOMENTAR
| Usuário | Senha | Perfil | Acesso |
|---------|-------|--------|--------|
| `fomentar.basico` | `fom123` | fomentarBasico | Apenas período único |
| `fomentar.completo` | `fomc123` | fomentarCompleto | Período único + múltiplo |

### ProGoiás  
| Usuário | Senha | Perfil | Acesso |
|---------|-------|--------|--------|
| `progoias.basico` | `pro123` | progoiasBasico | Apenas período único |
| `progoias.completo` | `proc123` | progoiasCompleto | Período único + múltiplo |

### Conversor
| Usuário | Senha | Perfil | Acesso |
|---------|-------|--------|--------|
| `conversor` | `conv123` | converterApenas | Só conversão SPED |

### Usuários Personalizados
| Usuário | Senha | Perfil | Nome | Descrição |
|---------|-------|--------|------|-----------|
| `contador1` | `cont123` | fomentarBasico | João Silva | Contador - FOMENTAR Básico |
| `contador2` | `cont456` | progoiasCompleto | Maria Santos | Contadora - ProGoiás Completo |

## 🚀 Funcionalidades Implementadas

### 1. Tela de Login
- **Design moderno** com gradiente Expertzy
- **Campos validados** (usuário/senha obrigatórios)
- **Lista de usuários** para teste (expandível)
- **Mensagens de erro/sucesso**
- **Responsiva** para mobile

### 2. Autenticação Segura
- **Validação de credenciais** contra base local
- **Criação automática de sessão** (4 horas)
- **Aplicação automática de perfil** após login
- **Renovação de sessão** em atividade do usuário

### 3. Controle de Sessão
- **Armazenamento local** (localStorage)
- **Expiração automática** (4 horas)
- **Timer de renovação** em interações
- **Logout automático** ao expirar
- **Informações de sessão** disponíveis

### 4. Interface de Usuário
- **Cabeçalho atualizado** com nome do usuário
- **Indicador de perfil** visual
- **Botão de logout** com confirmação
- **Botão de configuração** (apenas admin)
- **Ocultação da aplicação** até login

### 5. Integração com Permissões
- **Aplicação automática** do perfil após login
- **Sincronização** entre autenticação e permissões
- **Controle granular** por funcionalidade
- **Redirecionamento** para primeira aba disponível

## 🔧 Como Funciona

### Fluxo de Login
1. **Carregamento da página** → Verifica sessão existente
2. **Sem sessão** → Mostra tela de login
3. **Login válido** → Cria sessão + aplica perfil
4. **Sessão válida** → Vai direto para aplicação

### Fluxo de Sessão
1. **Login** → Sessão de 4 horas criada
2. **Atividade** → Sessão renovada automaticamente
3. **Inatividade** → Timer de expiração ativo
4. **Expiração** → Logout automático + tela de login

### Fluxo de Permissões
1. **Login** → Perfil aplicado automaticamente
2. **Interface** → Elementos mostrados/ocultos conforme perfil
3. **Funcionalidades** → Bloqueadas conforme permissões
4. **Logout** → Reset para tela de login

## ⚙️ Configuração

### Adicionar Novo Usuário
Edite `auth.js` no objeto `USERS_DATABASE`:

```javascript
'novoUsuario': {
    password: 'senha123',
    profile: 'fomentarBasico',  // Perfil desejado
    name: 'Nome do Usuário',
    description: 'Descrição do usuário'
}
```

### Perfis Disponíveis
- `admin` - Acesso completo
- `fomentarBasico` - FOMENTAR período único
- `fomentarCompleto` - FOMENTAR completo  
- `progoiasBasico` - ProGoiás período único
- `progoiasCompleto` - ProGoiás completo
- `converterApenas` - Só conversor SPED

### Alterar Tempo de Sessão
Em `auth.js`, linha 17:
```javascript
this.sessionTimeout = 4 * 60 * 60 * 1000; // 4 horas
```

## 🛡️ Segurança

### Limitações Atuais
- **Client-side apenas** - Senhas visíveis no código
- **Armazenamento local** - Dados na máquina do usuário
- **Sem criptografia** - Senhas em texto simples

### Recomendações para Produção
1. **Server-side auth** - Mover lógica para servidor
2. **Hash de senhas** - Usar bcrypt ou similar
3. **HTTPS obrigatório** - Para transmissão segura
4. **Tokens JWT** - Para autenticação stateless
5. **Rate limiting** - Prevenir força bruta
6. **Logs de auditoria** - Rastrear acessos

### Melhorias Implementáveis
- **Alterar senha** - Funcionalidade já preparada
- **Perfis dinâmicos** - Carregamento de servidor
- **2FA** - Autenticação em duas etapas
- **SSO** - Integração com sistemas corporativos

## 📱 Interface Mobile

### Responsividade
- **Tela de login** adaptável
- **Cabeçalho** compacto em mobile
- **Botões** com tamanho adequado
- **Modal** de configuração responsivo

## 🔍 Debug e Monitoramento

### Funções Úteis (Console)
```javascript
// Ver informações da sessão
showSessionInfo()

// Verificar usuário atual
getCurrentUser()

// Ver permissões
getCurrentPermissions()

// Listar usuários (admin)
authManager.getUsersList()
```

### Estados da Aplicação
- **Não logado** - Tela de login visível
- **Logado** - Aplicação principal visível
- **Sessão expirada** - Logout automático + alerta

### Logs do Sistema
- Login bem-sucedido
- Falha de login
- Aplicação de perfil
- Expiração de sessão
- Renovação de sessão

## 🚨 Troubleshooting

### Problema: Não mostra tela de login
**Solução**: Verificar se `auth.js` foi carregado antes dos outros scripts

### Problema: Permissões não aplicadas
**Solução**: Aguardar carregamento completo ou usar setTimeout

### Problema: Sessão não persiste
**Solução**: Verificar localStorage e configurações do navegador

### Problema: Modal não abre
**Solução**: Verificar se usuário é admin (botão só aparece para admin)

### Problema: Logout não funciona
**Solução**: Verificar console para erros JavaScript

## 📋 Checklist de Teste

### ✅ Funcionalidades Básicas
- [ ] Tela de login aparece ao abrir sistema
- [ ] Login com credenciais válidas funciona
- [ ] Login com credenciais inválidas é rejeitado
- [ ] Perfil correto é aplicado após login
- [ ] Interface mostra nome e perfil do usuário
- [ ] Botão de logout funciona
- [ ] Sessão expira após tempo configurado

### ✅ Permissões por Perfil
- [ ] Admin: Acesso completo
- [ ] FOMENTAR Básico: Só período único
- [ ] FOMENTAR Completo: Todas funcionalidades FOMENTAR
- [ ] ProGoiás Básico: Só período único
- [ ] ProGoiás Completo: Todas funcionalidades ProGoiás
- [ ] Conversor: Só conversão SPED

### ✅ Interface
- [ ] Cabeçalho mostra informações corretas
- [ ] Abas são ocultadas conforme perfil
- [ ] Botões são desabilitados conforme permissões
- [ ] Modal de configuração (apenas admin)
- [ ] Responsividade em mobile

## 🎯 Próximos Passos

### Melhorias Prioritárias
1. **Hash de senhas** para segurança básica
2. **Logs de auditoria** para rastreamento
3. **Perfis personalizáveis** via interface
4. **Backup/restore** de configurações

### Funcionalidades Futuras
1. **Alterar senha** via interface
2. **Gestão de usuários** para admin
3. **Estatísticas de uso** por usuário
4. **Integração com AD/LDAP**

---

## 📞 Suporte

O sistema está completamente funcional e pronto para uso. Para dúvidas ou problemas:

1. Verificar este documento
2. Consultar logs do navegador (F12)
3. Testar com usuário admin primeiro
4. Verificar se todos os arquivos foram carregados

**Status**: ✅ **SISTEMA COMPLETO E FUNCIONAL**