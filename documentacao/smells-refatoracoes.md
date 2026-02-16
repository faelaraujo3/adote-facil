# Detecção de Code Smells e Refatorações

Este documento descreve os *code smells* identificados no sistema Adote Fácil através da análise com a extensão SonarLint (que foi renomeado para SonarQube) no VSCode e as respectivas refatorações automáticas ou manuais aplicadas para melhorar a qualidade e o desempenho do código.

---

## 1. Membro de Classe não Reatribuído (Backend)

**Arquivo:** `backend/src/providers/authenticator.ts`

* **Trecho do código original:**
```typescript
export class Authenticator {
  private secret = process.env.JWT_SECRET || 'secret'
  // ...
}

```

* **Smell identificado:** `typescript:S2933` - A propriedade `secret` é inicializada mas nunca é reatribuída fora do construtor. Membros que não mudam devem ser marcados como `readonly` para evitar modificações acidentais e melhorar a clareza do código.
* **Refatoração aplicada:** Adição do modificador `readonly` à propriedade.

```typescript
export class Authenticator {
  private readonly secret = process.env.JWT_SECRET || 'secret'
  // ...
}

```

---

## 2. Condição Negada Inesperada (Frontend)

**Arquivo:** `frontend/src/layout/DefaultLoggedPage/DefaultLoggedPageLayout.tsx`

* **Trecho do código original:**

```tsx
</S.AsideMenu>
{!mobileMenuIsOpen ? <S.PageContent>{children}</S.PageContent> : null}
</S.Wrapper>

```

* **Smell identificado:** `typescript:S7735` - *Unexpected negated condition*. O uso de negações em blocos `if-else` (ou ternários) torna a leitura menos intuitiva. É preferível estruturar a lógica de forma afirmativa.
* **Refatoração aplicada:** Inversão da condição lógica e dos valores de retorno do ternário para remover a negação.

```tsx
</S.AsideMenu>
{mobileMenuIsOpen ? null : <S.PageContent>{children}</S.PageContent>}
</S.Wrapper>

```

---

## 3. Otimização de Performance no Context Provider (Frontend)

**Arquivo:** `frontend/src/contexts/animals.tsx`

* **Trecho do código original:**

```tsx
return (
  <AnimalsContext.Provider
    value={{
      availableAnimals,
      setAvailableAnimals,
      getAnimalById,
      userAnimals,
      setUserAnimals,
    }}
  >
    {children}
  </AnimalsContext.Provider>
)

```

* **Smell identificado:** `typescript:S6481` - O objeto passado como `value` para um Context Provider muda em cada renderização. Isso força todos os componentes que consomem este contexto a renderizarem novamente, mesmo que os dados não tenham mudado, prejudicando a performance.
* **Refatoração aplicada:** Utilização do hook `useMemo` para memorizar o objeto literal, garantindo que a referência só mude se uma das dependências for alterada.

```tsx
import { useMemo } from "react"
// ...
const contextValue = useMemo(() => ({
  availableAnimals,
  setAvailableAnimals,
  getAnimalById,
  userAnimals,
  setUserAnimals,
}), [availableAnimals, setAvailableAnimals, getAnimalById, userAnimals, setUserAnimals]);

return (
  <AnimalsContext.Provider value={contextValue}>
    {children}
  </AnimalsContext.Provider>
)

```

---

## 4. Tratamento de Exceção Vazio (Frontend/Middleware)

**Arquivo:** `frontend/src/middleware.ts`

* **Trecho do código original:**

```typescript
try {
  const decoded: { exp: number } = jwtDecode(token)
  return decoded.exp > Date.now() / 1000
} catch (e) {
  return false
}

```

* **Smell identificado:** `typescript:S2486` - *Handle this exception or don't catch it at all*. Capturar uma exceção e não realizar nenhuma ação (como log ou tratamento específico) dificulta o rastreamento de erros ocultos no sistema.
* **Refatoração aplicada:** Adição de um log de console para registrar a falha na decodificação do token antes de retornar o valor padrão de segurança.

```typescript
try {
  const decoded: { exp: number } = jwtDecode(token)
  return decoded.exp > Date.now() / 1000
} catch (e) {
  console.error(`Erro: ${e}`);
  return false
}

```
