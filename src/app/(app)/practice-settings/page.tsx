
"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Save, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

const practiceSettingsSchema = z.object({
  language: z.string().default('en'),
  topic: z.enum(['negocios', 'viajes', 'tecnologia', 'vida_diaria', 'general']),
  numQuestions: z.coerce.number().default(10),
  questionType: z.enum(['correct_answer', 'meaning', 'fill_blank', 'mix']),
});

type PracticeSettingsFormValues = z.infer<typeof practiceSettingsSchema>;

const defaultValues: Partial<PracticeSettingsFormValues> = {
  language: 'en',
  topic: 'general',
  numQuestions: 10,
  questionType: 'mix',
};

const languageOptions = [{ value: 'en', label: 'Inglés' }];
const topicOptions = [
  { value: 'general', label: 'General' },
  { value: 'negocios', label: 'Negocios' },
  { value: 'viajes', label: 'Viajes' },
  { value: 'tecnologia', label: 'Tecnología' },
  { value: 'vida_diaria', label: 'Vida Diaria' },
];
const numQuestionsOptions = [
  { value: 5, label: '5 Preguntas' },
  { value: 10, label: '10 Preguntas' },
  { value: 15, label: '15 Preguntas' },
];
const questionTypeOptions = [
  { value: 'correct_answer', label: 'Respuesta Correcta' },
  { value: 'meaning', label: 'Cuál es el significado' },
  { value: 'fill_blank', label: 'Completa la que falta' },
  { value: 'mix', label: 'Mix de las 3' },
];

const LOCAL_STORAGE_KEY = 'speaklyai_practice_settings';

export default function PracticeSettingsPage() {
  const router = useRouter();
  const form = useForm<PracticeSettingsFormValues>({
    resolver: zodResolver(practiceSettingsSchema),
    defaultValues,
  });

  useEffect(() => {
    const savedSettingsRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedSettingsRaw) {
      try {
        const savedSettings = JSON.parse(savedSettingsRaw);
        // Validate and set form values
        const result = practiceSettingsSchema.safeParse(savedSettings);
        if (result.success) {
          form.reset(result.data);
        } else {
          // Clear invalid data from localStorage
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
      } catch (error) {
        console.error("Error loading practice settings from localStorage:", error);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
  }, [form]);

  function onSubmit(data: PracticeSettingsFormValues) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    toast({
      title: 'Configuración Guardada',
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
    console.log('Practice settings saved:', data);
    // En el futuro, aquí se enviaría al backend
    // Por ahora, podríamos redirigir a home o a la página de práctica
    // router.push('/home'); 
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Settings className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">Configuración de Práctica</CardTitle>
          </div>
          <CardDescription>
            Personalizá tus sesiones de práctica para enfocarte en lo que más necesitás.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Idioma de la Práctica</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled // Solo Inglés por ahora
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccioná un idioma" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {languageOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temática</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccioná una temática" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {topicOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numQuestions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cantidad de Preguntas por Sesión</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={String(field.value)}
                      value={String(field.value)}
                      // disabled // Solo 10 por ahora, habilitar cuando se implemente la lógica
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccioná cantidad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {numQuestionsOptions.map((option) => (
                          <SelectItem key={option.value} value={String(option.value)}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="questionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Preguntas</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccioná tipo de preguntas" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {questionTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit">
                <Save size={18} className="mr-2" />
                Guardar Configuración
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
