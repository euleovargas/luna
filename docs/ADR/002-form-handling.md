# ADR 002: Padronização do Gerenciamento de Formulários

## Status

Aceito

## Contexto

Precisávamos de uma abordagem consistente para gerenciar formulários na aplicação, incluindo validação, feedback e mutações.

## Decisão

Decidimos usar uma combinação de `react-hook-form`, `zod` e `shadcn/ui` para todos os formulários da aplicação.

### Estrutura de Formulários

1. **Schema com Zod**
```typescript
const formSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
})
```

2. **React Hook Form + Zod**
```typescript
const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: {...}
})
```

3. **Componentes shadcn/ui**
```typescript
<Form {...form}>
  <FormField
    control={form.control}
    name="name"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Nome</FormLabel>
        <FormControl>
          <Input {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
</Form>
```

### Feedback Visual

1. **Loading States**
```typescript
const [isPending, startTransition] = useTransition()
```

2. **Toast Notifications**
```typescript
toast({
  title: "Sucesso",
  description: "Alterações salvas.",
})
```

## Consequências

### Positivas

1. Consistência entre formulários
2. Validação robusta
3. Feedback visual claro
4. Boa experiência do usuário

### Negativas

1. Mais código boilerplate
2. Necessidade de conhecer múltiplas bibliotecas
3. Bundle size maior

## Exemplos

### Formulário Completo
```typescript
"use client"

export function ProfileForm({ user }: Props) {
  const [isPending, startTransition] = useTransition()
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name || "",
    },
  })

  async function onSubmit(data: FormValues) {
    startTransition(() => {
      updateProfile(data)
        .then(() => toast({ title: "Sucesso" }))
        .catch(() => toast({ title: "Erro" }))
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField ... />
        <Button disabled={isPending}>
          {isPending && <Icons.spinner />}
          Salvar
        </Button>
      </form>
    </Form>
  )
}
```

## Links

- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev)
- [shadcn/ui Form](https://ui.shadcn.com/docs/components/form)
