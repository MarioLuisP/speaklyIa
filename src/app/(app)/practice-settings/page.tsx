
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
import { Save, Settings, CheckCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const LOCAL_STORAGE_PRACTICE_SETTINGS_KEY = 'speaklyai_practice_settings';

const practiceSettingsSchema = z.object({
  language: z.string().default('en'), // For localStorage, frontend uses 'en', API call will use 'english'
  level: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  topic: z.enum(['business', 'travel', 'technology', 'daily-life']).default('daily-life'),
  numQuestions: z.coerce.number().default(10),
  questionType: z.enum(['multiple-choice', 'meaning', 'fill_blank', 'mix']).default('multiple-choice'),
});

type PracticeSettingsFormValues = z.infer<typeof practiceSettingsSchema>;

const defaultValues: PracticeSettingsFormValues = {
  language: 'en',
  level: 'beginner',
  topic: 'daily-life',
  numQuestions: 10,
  questionType: 'multiple-choice',
};

const languageOptions = [{ value: 'en', label: 'Inglés' }]; // Backend might expect 'english'
const levelOptions = [
    { value: 'beginner', label: 'Principiante (Beginner)' },
    { value: 'intermediate', label: 'Intermedio (Intermediate)' },
    { value: 'advanced', label: 'Avanzado (Advanced)' },
];
const topicOptions = [
  { value: 'business', label: 'Negocios' },
  { value: 'travel', label: 'Viajes' },
  { value: 'technology', label: 'Tecnología' },
  { value: 'daily-life', label: 'Vida Diaria' },
];
const numQuestionsOptions = [
  { value: 5, label: '5 Preguntas' },
  { value: 10, label: '10 Preguntas' },
  { value: 15, label: '15 Preguntas' },
];
const questionTypeOptions = [
  { value: 'multiple-choice', label: 'Opción Múltiple' },
  { value: 'meaning', label: 'Cuál es el significado (Próximamente)' },
  { value: 'fill_blank', label: 'Completa la que falta (Próximamente)' },
  { value: 'mix', label: 'Mix de las 3 (Próximamente)' },
];

export default function PracticeSettingsPage() {
  const router = useRouter();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PracticeSettingsFormValues>({
    resolver: zodResolver(practiceSettingsSchema),
    defaultValues,
  });

  useEffect(() => {
    const savedSettingsRaw = localStorage.getItem(LOCAL_STORAGE_PRACTICE_SETTINGS_KEY);
    if (savedSettingsRaw) {
      try {
        const savedSettings = JSON.parse(savedSettingsRaw);
        const result = practiceSettingsSchema.safeParse(savedSettings);
        if (result.success) {
          form.reset(result.data);
        } else {
          console.warn("Invalid saved settings, removing from localStorage:", result.error);
          localStorage.removeItem(LOCAL_STORAGE_PRACTICE_SETTINGS_KEY);
        }
      } catch (error) {
        console.error("Error loading practice settings from localStorage:", error);
        localStorage.removeItem(LOCAL_STORAGE_PRACTICE_SETTINGS_KEY);
      }
    }
  }, [form]);

  async function onSubmit(data: PracticeSettingsFormValues) {
    setIsSubmitting(true);
    setShowSuccessMessage(false); 
    await new Promise(resolve => setTimeout(resolve, 700)); // Simulate async operation

    localStorage.setItem(LOCAL_STORAGE_PRACTICE_SETTINGS_KEY, JSON.stringify(data));
    toast({
      title: 'Configuración Guardada',
      description: (
        <pre className="mt-2 w-full max-w-[340px] rounded-md bg-slate-950 p-4 overflow-x-auto">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
    console.log('Practice settings saved to localStorage:', data);
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
            Estas opciones se usarán para generar tus preguntas.
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
                      value={field.value}
                      disabled // Fixed to English for now
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
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nivel de Dificultad</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccioná un nivel" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {levelOptions.map((option) => (
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
                      onValueChange={(value) => field.onChange(parseInt(value, 10))}
                      value={String(field.value)}
                      // disabled // Fixed to 10 for now, enable if backend supports variable count
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
                      value={field.value}
                      disabled={field.value !== 'multiple-choice'} // Only multiple-choice for now
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {questionTypeOptions.map((option) => (
                          <SelectItem 
                            key={option.value} 
                            value={option.value}
                            disabled={option.value !== 'multiple-choice'} // Only multiple-choice for now
                          >
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
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
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
              <p className="font-semibold">¡Configuración guardada!</p>
              <p className="text-sm">Tus preferencias se usarán para la próxima sesión de práctica. Ya puedes <Link href="/practice" className="font-medium text-green-800 hover:underline">ir a tu práctica diaria</Link>.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
