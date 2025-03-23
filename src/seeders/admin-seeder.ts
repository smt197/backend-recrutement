import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function seedAdmin() {
  const email = 'admin@gmail.com';

  // Vérifier si l'admin existe déjà
  const existingAdmin = await prisma.user.findUnique({ where: { email } });
  if (existingAdmin) {
    console.log('Admin already exists.');
    return;
  }

  // Hasher le mot de passe
  const password = 'Serigne197';
  const name = 'Serigne';
  const hashedPassword = await bcrypt.hash(password, 10);

  // Créer l'utilisateur admin
  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('Admin created successfully.');
}

seedAdmin()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
