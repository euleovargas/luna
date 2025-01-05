"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useState } from "react";
import { FieldType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { DragHandleDots2Icon } from "@radix-ui/react-icons";

const formSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  fields: z.array(
    z.object({
      type: z.enum([
        FieldType.TEXT,
        FieldType.TEXTAREA,
        FieldType.NUMBER,
        FieldType.DATE,
        FieldType.SELECT,
        FieldType.CHECKBOX,
        FieldType.RADIO,
      ]),
      label: z.string().min(1, "Label é obrigatório"),
      description: z.string().optional(),
      required: z.boolean().default(false),
      options: z.string().optional(),
    })
  ).min(1, "Adicione pelo menos um campo"),
});

interface FormBuilderProps {
  initialData?: any;
}

export function FormBuilder({ initialData }: FormBuilderProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      isActive: true,
      fields: [],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "fields",
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);
      const url = initialData
        ? `/api/forms/${initialData.id}`
        : "/api/forms";
      
      const res = await fetch(url, {
        method: initialData ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Algo deu errado");
      }

      toast.success(
        initialData
          ? "Formulário atualizado com sucesso"
          : "Formulário criado com sucesso"
      );
      router.push("/admin/forms");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const addField = (type: FieldType) => {
    append({
      type,
      label: "",
      description: "",
      required: false,
      options: type === FieldType.SELECT || type === FieldType.RADIO ? "[]" : undefined,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Ativo</FormLabel>
                <FormDescription>
                  Tornar este formulário disponível para preenchimento
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => addField(FieldType.TEXT)}
            >
              + Texto
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => addField(FieldType.TEXTAREA)}
            >
              + Área de Texto
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => addField(FieldType.SELECT)}
            >
              + Seleção
            </Button>
            {/* Adicione outros tipos de campo conforme necessário */}
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <Card key={field.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <button
                      type="button"
                      className="mt-1 cursor-move"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        const startIndex = index;
                        const element = e.target as HTMLElement;
                        
                        const onMouseMove = (e: MouseEvent) => {
                          const elements = document.elementsFromPoint(e.clientX, e.clientY);
                          const cardElement = elements.find((el) => 
                            el.closest("[data-field-card]")
                          );
                          
                          if (cardElement) {
                            const newIndex = Array.from(cardElement.closest("[data-field-card]")?.parentElement?.children || [])
                              .indexOf(cardElement.closest("[data-field-card]") as Element);
                            
                            if (newIndex !== startIndex && newIndex !== -1) {
                              move(startIndex, newIndex);
                            }
                          }
                        };
                        
                        const onMouseUp = () => {
                          document.removeEventListener("mousemove", onMouseMove);
                          document.removeEventListener("mouseup", onMouseUp);
                        };
                        
                        document.addEventListener("mousemove", onMouseMove);
                        document.addEventListener("mouseup", onMouseUp);
                      }}
                    >
                      <DragHandleDots2Icon className="h-5 w-5" />
                    </button>
                    
                    <div className="flex-1 space-y-4">
                      <FormField
                        control={form.control}
                        name={`fields.${index}.label`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Label</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`fields.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descrição</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {(fields[index].type === FieldType.SELECT ||
                        fields[index].type === FieldType.RADIO) && (
                        <FormField
                          control={form.control}
                          name={`fields.${index}.options`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Opções (uma por linha)</FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  onChange={(e) => {
                                    const options = e.target.value
                                      .split("\n")
                                      .map((o) => o.trim())
                                      .filter(Boolean);
                                    field.onChange(JSON.stringify(options));
                                  }}
                                  value={
                                    field.value
                                      ? JSON.parse(field.value)
                                          .join("\n")
                                      : ""
                                  }
                                />
                              </FormControl>
                              <FormDescription>
                                Digite cada opção em uma nova linha
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={form.control}
                        name={`fields.${index}.required`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Obrigatório
                              </FormLabel>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => remove(index)}
                    >
                      Remover
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {initialData ? "Atualizar" : "Criar"} Formulário
        </Button>
      </form>
    </Form>
  );
}
