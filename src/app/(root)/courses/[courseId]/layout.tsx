import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

interface CourseLayoutProps {
  children: React.ReactNode;
  params: {
    courseId: string;
  };
}

export default async function CourseLayout({
  children,
  params,
}: CourseLayoutProps) {
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
          lessons: true,
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

  // Verificar se o usuário tem acesso ao curso
  const enrollment = await db.classEnrollment.findFirst({
    where: {
      userId: session.user.id,
      class: {
        courseId: course.id,
      },
    },
  });

  if (!enrollment && session.user.role !== 'ADMIN') {
    redirect('/courses');
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="hidden md:flex h-full w-80 flex-col fixed inset-y-0">
        <div className="px-6 py-4 border-b">
          <h2 className="text-2xl font-bold">{course.name}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {course.description}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {course.modules.map((module) => (
            <div key={module.id} className="px-6 py-4">
              <h3 className="text-lg font-semibold mb-2">
                {module.name}
              </h3>
              <div className="space-y-2">
                {module.lessons.map((lesson) => (
                  <a
                    key={lesson.id}
                    href={`/courses/${course.id}/lessons/${lesson.id}`}
                    className="block p-2 rounded-lg hover:bg-accent"
                  >
                    {lesson.name}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 md:ml-80">
        {children}
      </div>
    </div>
  );
}
