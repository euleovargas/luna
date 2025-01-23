import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(
  req: Request,
  { params }: { params: { lessonId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const progress = await db.progress.upsert({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId: params.lessonId,
        },
      },
      update: {
        completed: true,
        percentage: 100,
      },
      create: {
        userId: session.user.id,
        lessonId: params.lessonId,
        completed: true,
        percentage: 100,
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error('[COMPLETE_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
