import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"

export default async function CoursesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // Buscar todos os cursos e calcular o progresso do usuário em cada um
  const coursesWithProgress = await db.course.findMany({
    include: {
      modules: {
        include: {
          lessons: {
            include: {
              progress: {
                where: {
                  userId: user.id,
                },
              },
            },
          },
        },
      },
      classes: {
        include: {
          enrollments: {
            where: {
              userId: user.id,
            },
          },
        },
      },
    },
  })

  // Calcular o progresso para cada curso
  const coursesWithCalculatedProgress = coursesWithProgress.map((course) => {
    const totalLessons = course.modules.reduce(
      (acc, module) => acc + module.lessons.length,
      0
    )
    
    const completedLessons = course.modules.reduce(
      (acc, module) =>
        acc +
        module.lessons.reduce(
          (acc, lesson) => acc + (lesson.progress.length > 0 ? 1 : 0),
          0
        ),
      0
    )

    const progress = totalLessons === 0 ? 0 : (completedLessons / totalLessons) * 100

    const isEnrolled = course.classes.some((classItem) =>
      classItem.enrollments.length > 0
    )

    return {
      ...course,
      progress,
      isEnrolled,
    }
  })

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between">
        <Heading
          title="Cursos"
          description="Aqui estão todos os cursos disponíveis para você"
        />
      </div>
      <Separator className="my-4" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coursesWithCalculatedProgress.map((course) => (
          <Link key={course.id} href={`/courses/${course.id}`}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{course.name}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Progresso</span>
                    <span>{Math.round(course.progress)}%</span>
                  </div>
                  <Progress value={course.progress} />
                  {course.isEnrolled ? (
                    <p className="text-sm text-green-600">Matriculado</p>
                  ) : (
                    <p className="text-sm text-yellow-600">Não matriculado</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
