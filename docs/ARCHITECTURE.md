# Luna - Guia de Arquitetura e Padrões

Este documento serve como guia de referência para a arquitetura e padrões utilizados no projeto Luna. Ele deve ser consultado e atualizado sempre que novas decisões arquiteturais forem tomadas.

## 📁 Estrutura de Diretórios

```
src/
├── app/                    # Rotas e páginas da aplicação
│   ├── (admin)/           # Grupo de rotas administrativas
│   ├── (auth)/            # Grupo de rotas de autenticação
│   ├── (root)/            # Grupo de rotas principais
│   └── _actions/          # Server Actions
├── components/            # Componentes React reutilizáveis
│   ├── admin/            # Componentes específicos para admin
│   ├── ui/               # Componentes de UI base (shadcn/ui)
│   └── [feature]/        # Componentes específicos por feature
├── lib/                  # Utilitários e configurações
│   ├── db.ts            # Configuração do Prisma
│   ├── auth.ts          # Configuração do NextAuth
│   └── session.ts       # Utilitários de sessão
└── types/               # Definições de tipos TypeScript
```

## 🏗️ Padrões Arquiteturais

### Server vs Client Components

1. **Server Components (`.tsx`):**
   - Páginas principais (`app/**/page.tsx`)
   - Busca de dados do banco
   - Verificações de autorização
   - Exemplo:
   ```typescript
   export default async function ProfilePage() {
     const currentUser = await getCurrentUser()
     const dbUser = await db.user.findUnique(...)
     return <ProfileForm user={dbUser} />
   }
   ```

2. **Client Components (`"use client"`):**
   - Componentes interativos
   - Formulários
   - Upload de arquivos
   - Exemplo:
   ```typescript
   "use client"
   export function ProfileForm({ user }: Props) {
     const form = useForm(...)
     return <form>...</form>
   }
   ```

### Server Actions

1. **Localização:**
   - Em `/app/_actions/[feature].ts`
   - Um arquivo por feature

2. **Estrutura:**
   ```typescript
   "use server"
   
   export async function updateProfile(data: ProfileData) {
     // 1. Validação
     // 2. Autorização
     // 3. Mutação
     // 4. Revalidação
   }
   ```

3. **Boas Práticas:**
   - Sempre usar `"use server"`
   - Validar inputs
   - Verificar autorização
   - Usar `revalidatePath` após mutações

### Componentes

1. **Organização:**
   - Um diretório por feature (`components/profile/`)
   - Componentes UI base em `components/ui/`
   - Nomes descritivos e específicos

2. **Estrutura de Formulários:**
   ```typescript
   export function FeatureForm() {
     const form = useForm({
       resolver: zodResolver(schema),
       defaultValues: {...}
     })
     
     return (
       <Form {...form}>
         <FormField ... />
       </Form>
     )
   }
   ```

### Validação

1. **Schema com Zod:**
   ```typescript
   const schema = z.object({
     name: z.string().min(2).max(30),
     email: z.string().email(),
   })
   ```

2. **Validação no Cliente:**
   - Usar `zodResolver` com `react-hook-form`
   - Feedback visual imediato

3. **Validação no Servidor:**
   - Validar novamente nos Server Actions
   - Nunca confiar apenas na validação do cliente

## 🔒 Autenticação e Autorização

1. **NextAuth.js:**
   - Configuração em `lib/auth.ts`
   - Providers configurados (Google, etc)

2. **Middleware:**
   - Proteção de rotas
   - Redirecionamentos

3. **Verificações:**
   ```typescript
   const user = await getCurrentUser()
   if (!user) notFound()
   if (user.role !== "ADMIN") redirect("/")
   ```

## 🎨 UI/UX

1. **Componentes Base:**
   - Usar shadcn/ui
   - Customizar via Tailwind

2. **Feedback:**
   - Loading states com `useTransition`
   - Toast notifications para ações
   - Mensagens de erro claras

3. **Forms:**
   - Labels descritivos
   - Mensagens de erro inline
   - Indicadores de loading

## 📝 Convenções de Código

1. **Nomes:**
   - PascalCase para componentes
   - camelCase para funções e variáveis
   - UPPER_CASE para constantes

2. **Tipos:**
   - Interfaces para props de componentes
   - Types para schemas de formulários
   - Zod para validação

3. **Imports:**
   - Agrupar por categoria
   - Usar paths absolutos (`@/`)

## 🔄 Fluxo de Dados

1. **Mutações:**
   ```
   Client Component
   → Server Action
   → Database
   → Revalidate
   → UI Update
   ```

2. **Fetching:**
   ```
   Server Component
   → Database
   → Props
   → Client Components
   ```

## 📈 Performance

1. **Server Components:**
   - Reduzir JavaScript no cliente
   - Streaming quando possível

2. **Caching:**
   - Usar `revalidatePath` com moderação
   - Considerar `revalidateTag` para cache fino

3. **Bundle Size:**
   - Importar apenas o necessário
   - Usar dynamic imports quando apropriado

## 🧪 Testes

1. **Tipos:**
   - Unit tests para utilitários
   - Integration tests para fluxos
   - E2E para features críticas

2. **Cobertura:**
   - Foco em fluxos críticos
   - Testar edge cases

## 📚 Recursos

1. **Documentação:**
   - [Next.js](https://nextjs.org/docs)
   - [shadcn/ui](https://ui.shadcn.com)
   - [Prisma](https://www.prisma.io/docs)

2. **Ferramentas:**
   - VS Code
   - Prettier
   - ESLint

## 🔄 Processo de Atualização

Este documento deve ser atualizado quando:
1. Novos padrões são estabelecidos
2. Decisões arquiteturais são tomadas
3. Problemas recorrentes são resolvidos

Mantenha este guia vivo e atualizado para garantir consistência no desenvolvimento.
