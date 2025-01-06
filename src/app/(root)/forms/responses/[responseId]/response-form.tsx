"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { useState } from "react";
import { FieldType } from "@prisma/client";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ResponseFormProps {
  response: any; // Tipo completo seria muito extenso aqui
  isActive: boolean;
}

export function ResponseForm({ response, isActive }: ResponseFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Criar schema dinâmico baseado nos campos
  const formSchema = z.object({
    fields: z.array(
      z.object({
        fieldId: z.string(),
        value: z.string(),
      })
    ),
  });

  // Preparar valores iniciais
  const defaultValues = {
    fields: response.form.fields.map((field: any) => ({
      fieldId: field.id,
      value:
        response.fields.find((f: any) => f.fieldId === field.id)?.value || "",
    })),
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  async function onSubmit(data: z.infer<typeof formSchema>, isDraft = false) {
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/forms/responses/${response.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          status: isDraft ? "DRAFT" : "SUBMITTED",
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Algo deu errado");
      }

      toast.success(
        isDraft ? "Rascunho salvo com sucesso" : "Formulário enviado com sucesso"
      );
      
      router.refresh();
      router.push("/forms/my-responses");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onDiscard() {
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/forms/responses/${response.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Algo deu errado");
      }

      toast.success("Rascunho descartado com sucesso");
      router.refresh();
      router.push("/forms/my-responses");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Renderizar campo baseado no tipo
  const renderField = (field: any) => {
    switch (field.type) {
      case FieldType.TEXT:
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={`fields.${field.order}.value`}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <Input
                    {...formField}
                    disabled={!isActive || response.status === "SUBMITTED"}
                  />
                </FormControl>
                {field.description && (
                  <FormDescription>{field.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case FieldType.TEXTAREA:
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={`fields.${field.order}.value`}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <Textarea
                    {...formField}
                    disabled={!isActive || response.status === "SUBMITTED"}
                  />
                </FormControl>
                {field.description && (
                  <FormDescription>{field.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case FieldType.SELECT:
        const options = JSON.parse(field.options || "[]");
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={`fields.${field.order}.value`}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <Select
                  onValueChange={formField.onChange}
                  defaultValue={formField.value}
                  disabled={!isActive || response.status === "SUBMITTED"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma opção" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {options.map((option: string) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.description && (
                  <FormDescription>{field.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      // Adicione outros tipos de campo conforme necessário

      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-8">
        {response.form.fields.map((field: any) => renderField(field))}

        <div className="flex justify-end space-x-4">
          {isActive && response.status !== "SUBMITTED" && (
            <>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="destructive">
                    Descartar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Descartar rascunho?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja descartar este rascunho? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onDiscard}
                      disabled={isSubmitting}
                    >
                      Descartar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button
                type="button"
                variant="outline"
                onClick={() => onSubmit(form.getValues(), true)}
                disabled={isSubmitting}
              >
                Salvar Rascunho
              </Button>
              <Button
                type="button"
                onClick={() => onSubmit(form.getValues(), false)}
                disabled={isSubmitting}
              >
                Enviar
              </Button>
            </>
          )}
        </div>
      </form>
    </Form>
  );
}
