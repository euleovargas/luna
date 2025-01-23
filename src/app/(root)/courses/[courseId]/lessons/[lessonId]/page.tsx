'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { VimeoPlayer } from '@/components/video/vimeo-player';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, PlayCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface LessonData {
  id: string;
  name: string;
  description: string;
  videoId: string;
  moduleId: string;
  order: number;
}

export default function LessonPage() {
  const params = useParams();
  const lessonId = params?.lessonId as string;
  const courseId = params?.courseId as string;
  const { toast } = useToast();
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);

  // Buscar dados da aula
  useEffect(() => {
    const fetchLesson = async () => {
      if (!lessonId) return;
      
      try {
        const response = await fetch(`/api/lessons/${lessonId}`);
        const data = await response.json();
        setLesson(data);
        
        // Buscar progresso existente
        const progressResponse = await fetch(`/api/lessons/${lessonId}/progress`);
        const progressData = await progressResponse.json();
        setProgress(progressData.percentage || 0);
        setCompleted(progressData.completed || false);
      } catch (error) {
        toast({
          title: "Erro ao carregar aula",
          description: "Não foi possível carregar os dados da aula.",
          variant: "destructive"
        });
      }
    };

    fetchLesson();
  }, [lessonId]);

  // Atualizar progresso
  const handleProgress = async (newProgress: number) => {
    if (!lessonId) return;
    
    setProgress(newProgress);
    
    try {
      await fetch(`/api/lessons/${lessonId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress: newProgress })
      });
    } catch (error) {
      console.error('Erro ao salvar progresso:', error);
    }
  };

  // Marcar como concluído
  const handleComplete = async () => {
    if (!lessonId) return;
    
    try {
      await fetch(`/api/lessons/${lessonId}/complete`, {
        method: 'POST'
      });
      setCompleted(true);
      toast({
        title: "Aula concluída!",
        description: "Seu progresso foi salvo com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível marcar a aula como concluída.",
        variant: "destructive"
      });
    }
  };

  if (!lesson) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {completed ? (
              <CheckCircle className="text-green-500" />
            ) : (
              <PlayCircle className="text-blue-500" />
            )}
            {lesson.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <VimeoPlayer
              videoId={lesson.videoId}
              onProgress={handleProgress}
              onComplete={() => setProgress(100)}
            />
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progresso</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>

            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {completed ? 'Aula concluída' : 'Marque como concluída quando terminar'}
              </p>
              <Button
                onClick={handleComplete}
                disabled={completed}
              >
                Marcar como concluída
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sobre esta aula</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{lesson.description}</p>
        </CardContent>
      </Card>
    </div>
  );
}
