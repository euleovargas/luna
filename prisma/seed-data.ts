const client = require('@prisma/client');
const bcrypt = require('bcryptjs');

const seedClient = new client.PrismaClient();

async function seed() {
  // Criar um curso
  const course = await seedClient.course.create({
    data: {
      name: 'Curso de Desenvolvimento Web',
      description: 'Aprenda a desenvolver aplicações web modernas',
    },
  });

  // Criar um módulo
  const module = await seedClient.module.create({
    data: {
      courseId: course.id,
      name: 'Introdução ao Next.js',
      description: 'Fundamentos do Next.js e React',
      order: 1,
    },
  });

  // Criar uma aula com vídeo do Vimeo
  const lesson = await seedClient.lesson.create({
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
  const classItem = await seedClient.class.create({
    data: {
      courseId: course.id,
      name: 'Turma 1',
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 dias
    },
  });

  // Criar um usuário de teste (se não existir)
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('senha123', salt);
  
  const user = await seedClient.user.upsert({
    where: { email: 'aluno@example.com' },
    update: {
      password: hashedPassword,
      emailVerified: new Date(),
    },
    create: {
      email: 'aluno@example.com',
      name: 'Aluno Teste',
      role: client.UserRole.STUDENT,
      password: hashedPassword,
      emailVerified: new Date(), // Marcar email como verificado
    },
  });

  // Matricular o usuário na turma
  await seedClient.classEnrollment.create({
    data: {
      classId: classItem.id,
      userId: user.id,
    },
  });

  console.log('Dados de teste criados com sucesso!');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await seedClient.$disconnect();
  });
