# Guia de Commits Semanticos

## Formato
```
<tipo>(escopo): descricao em portugues
```

## Tipos
| Tipo | Uso |
|------|-----|
| feat | Nova funcionalidade |
| fix | Correcao de bug |
| refactor | Refatoracao sem mudar comportamento |
| docs | Documentacao |
| chore | Configuracao, build, dependencias |
| ci | Docker, CI/CD |
| style | Formatacao visual |

## Exemplos corretos
```bash
git commit -m "feat(clientes): implementar CRUD completo"
git commit -m "feat(ml): treinar modelo Random Forest"
git commit -m "fix(pedidos): corrigir calculo do total"
git commit -m "refactor(backend): aplicar Object Calisthenics"
git commit -m "chore: configurar docker-compose"
git commit -m "docs: atualizar README"
```

## Fluxo recomendado
```bash
# 1. Crie uma branch por funcionalidade
git checkout -b feat/crud-clientes

# 2. Commits pequenos e frequentes
git add src/clientes/
git commit -m "feat(clientes): adicionar entity e DTO"

# 3. Merge quando pronto
git checkout main
git merge feat/crud-clientes
```
