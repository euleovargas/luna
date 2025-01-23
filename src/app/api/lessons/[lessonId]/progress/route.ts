import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// Buscar progresso atual
export async function GET(
  req: Request,
  { params }: { params: { lessonId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const progress = await db.progress.findFirst({
      where: {
        userId: session.user.id,
        lessonId: params.lessonId,
      },
    });

    return NextResponse.json(progress || { percentage: 0, completed: false });
  } catch (error) {
    console.error('[PROGRESS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// Atualizar progresso
export async function POST(
  req: Request,
  { params }: { params: { lessonId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { progress } = await req.json();

    const updatedProgress = await db.progress.upsert({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId: params.lessonId,
        },
      },
      update: {
        percentage: progress,
      },
      create: {
        userId: session.user.id,
        lessonId: params.lessonId,
        percentage: progress,
      },
    });

    return NextResponse.json(updatedProgress);
  } catch (error) {
    console.error('[PROGRESS_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
