import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, PlayCircle } from 'lucide-react';

interface CoursePageProps {
  params: {
    courseId: string;
  };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const course = await db.course.findUnique({
    where: {
      id: params.courseId,
    },
    include: {
      modules: {
        include: {
          lessons: {
            include: {
              progress: {
                where: {
                  userId: session.user.id,
                },
              },
            },
          },
        },
        orderBy: {
          order: 'asc',
        },
      },
    },
  });

  if (!course) {
    redirect('/courses');
  }

  // Calcular progresso geral do curso
  const totalLessons = course.modules.reduce(
    (total, module) => total + module.lessons.length,
    0
  );

  const completedLessons = course.modules.reduce(
    (total, module) =>
      total +
      module.lessons.filter((lesson) => lesson.progress[0]?.completed).length,
    0
  );

  const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{course.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{course.description}</p>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progresso geral</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {course.modules.map((module) => (
          <Card key={module.id}>
            <CardHeader>
              <CardTitle>{module.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {module.description}
              </p>
              <div className="space-y-2">
                {module.lessons.map((lesson) => (
                  <a
                    key={lesson.id}
                    href={`/courses/${course.id}/lessons/${lesson.id}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-accent"
                  >
                    <span className="flex items-center gap-2">
                      {lesson.progress[0]?.completed ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <PlayCircle className="w-4 h-4 text-blue-500" />
                      )}
                      {lesson.name}
                    </span>
                    {lesson.progress[0]?.percentage ? (
                      <span className="text-sm text-muted-foreground">
                        {Math.round(lesson.progress[0].percentage)}%
                      </span>
                    ) : null}
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
