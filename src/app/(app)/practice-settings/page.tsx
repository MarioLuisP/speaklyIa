
"use client";

import React, { useEffect, useState } from 'react';
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
import { Save, Settings, CheckCircle } from 'lucide-react'; // Added CheckCircle
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Added Link for the success message

const practiceSettingsSchema = z.object({
  language: z.string().default('en'),
  topic: z.enum(['negocios', 'viajes', 'tecnologia', 'vida_diaria']).default('viajes'), // "general" removed, "viajes" as default
  numQuestions: z.coerce.number().default(10),
  questionType: z.enum(['correct_answer', 'meaning', 'fill_blank', 'mix']).default('correct_answer'), // "correct_answer" as default
});

type PracticeSettingsFormValues = z.infer<typeof practiceSettingsSchema>;

const defaultValues: PracticeSettingsFormValues = { // Ensured PracticeSettingsFormValues type for defaultValues
  language: 'en',
  topic: 'viajes', // Default topic set
  numQuestions: 10,
  questionType: 'correct_answer', // Default question type set
};

const languageOptions = [{ value: 'en', label: 'Inglés' }];
const topicOptions = [
  // "General" option removed
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
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PracticeSettingsFormValues>({
    resolver: zodResolver(practiceSettingsSchema),
    defaultValues,
  });

  // Effect to load saved settings from localStorage
  useEffect(() => {
    const savedSettingsRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedSettingsRaw) {
      try {
        const savedSettings = JSON.parse(savedSettingsRaw);
        const result = practiceSettingsSchema.safeParse(savedSettings);
        if (result.success) {
          form.reset(result.data);
        } else {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
      } catch (error) {
        console.error("Error loading practice settings from localStorage:", error);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
  }, [form]);

  // Effect to hide success message if form values change
  const watchedValues = form.watch();
  useEffect(() => {
    if (showSuccessMessage) {
      setShowSuccessMessage(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedValues]); // Rerun when any form value changes

  async function onSubmit(data: PracticeSettingsFormValues) {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

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
    setShowSuccessMessage(true);
    setIsSubmitting(false);
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
                      value={field.value} // ensure value is controlled
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
                      value={field.value} // ensure value is controlled
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
                      value={String(field.value)} // ensure value is controlled
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
                      defaultValue={field.value} // Default is set by useForm
                      value={field.value} // ensure value is controlled
                    >
                      <FormControl>
                        <SelectTrigger>
                           {/* No placeholder needed if default is set */}
                          <SelectValue />
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <Save size={18} className="mr-2" />
                )}
                {isSubmitting ? 'Guardando...' : 'Guardar Configuración'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {showSuccessMessage && (
        <div className="mt-6 max-w-2xl mx-auto p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg shadow-md text-center">
          <div className="flex items-center justify-center">
            <CheckCircle size={24} className="mr-3 text-green-600" />
            <div className="text-left">
              <p className="font-semibold">¡Configuración guardada, excelente elección!</p>
              <p className="text-sm">Ya puedes <Link href="/practice" className="font-medium text-green-800 hover:underline">ir a tu práctica diaria</Link>.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

    