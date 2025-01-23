const { PrismaClient, UserRole } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Criar um curso
  const course = await prisma.course.create({
    data: {
      name: 'Curso de Desenvolvimento Web',
      description: 'Aprenda a desenvolver aplicações web modernas',
    },
  });

  // Criar um módulo
  const module = await prisma.module.create({
    data: {
      courseId: course.id,
      name: 'Introdução ao Next.js',
      description: 'Fundamentos do Next.js e React',
      order: 1,
    },
  });

  // Criar uma aula com vídeo do Vimeo
  const lesson = await prisma.lesson.create({
    data: {
      moduleId: module.id,
      name: 'Configurando o Ambiente',
      description: 'Aprenda a configurar seu ambiente de desenvolvimento',
      videoUrl: 'https://vimeo.com/824804225', // Substitua pelo ID do seu vídeo
      videoId: '824804225', // Substitua pelo ID do seu vídeo
      order: 1,
    },
  });

  // Criar uma turma
  const classItem = await prisma.class.create({
    data: {
      courseId: course.id,
      name: 'Turma 1',
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 dias
    },
  });

  // Criar um usuário de teste (se não existir)
  const user = await prisma.user.upsert({
    where: { email: 'aluno@example.com' },
    update: {},
    create: {
      email: 'aluno@example.com',
      name: 'Aluno Teste',
      role: UserRole.STUDENT,
    },
  });

  // Matricular o usuário na turma
  await prisma.classEnrollment.create({
    data: {
      classId: classItem.id,
      userId: user.id,
    },
  });

  console.log('Dados de teste criados com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
