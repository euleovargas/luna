import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: { lessonId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const lesson = await db.lesson.findUnique({
      where: {
        id: params.lessonId,
      },
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!lesson) {
      return new NextResponse('Lesson not found', { status: 404 });
    }

    // Verificar se o usuário tem acesso a esta aula
    const enrollment = await db.classEnrollment.findFirst({
      where: {
        userId: session.user.id,
        class: {
          courseId: lesson.module.courseId,
        },
      },
    });

    if (!enrollment && session.user.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    return NextResponse.json(lesson);
  } catch (error) {
    console.error('[LESSON_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
