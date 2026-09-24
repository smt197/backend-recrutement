import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export async function seedAdmin() {
  const prisma = new PrismaClient();
  try {
    // 1. Créer l'Admin par défaut s'il n'existe pas
    const email = 'admin@gmail.com';
    const existingAdmin = await prisma.user.findUnique({ where: { email } });
    if (!existingAdmin) {
      const password = 'P@sser12';
      const name = 'Admin';
      const hashedPassword = await bcrypt.hash(password, 10);

      await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'ADMIN',
        },
      });
      console.log('Admin created successfully.');
    } else {
      console.log('Admin already exists.');
    }

    // 2. Créer un compte Recruteur par défaut s'il n'existe pas
    const recruiterEmail = 'recruteur@gmail.com';
    const existingRecruiter = await prisma.user.findUnique({ where: { email: recruiterEmail } });
    if (!existingRecruiter) {
      const recruiterPassword = 'P@sser12';
      const recruiterName = 'Recruteur Demo';
      const hashedRecruiterPassword = await bcrypt.hash(recruiterPassword, 10);

      await prisma.user.create({
        data: {
          name: recruiterName,
          email: recruiterEmail,
          password: hashedRecruiterPassword,
          role: 'RECRUTEUR',
        },
      });

      console.log('Recruiter account created successfully.');
    } else {
      console.log('Recruiter already exists.');
    }

    // 3. Créer un compte Candidat par défaut s'il n'existe pas
    const candidateEmail = 'serignembayet@gmail.com';
    const existingCandidate = await prisma.user.findUnique({ where: { email: candidateEmail } });
    if (!existingCandidate) {
      const candidatePassword = 'P@sser12';
      const candidateName = 'Serigne Mbaye';
      const hashedCandidatePassword = await bcrypt.hash(candidatePassword, 10);

      await prisma.user.create({
        data: {
          name: candidateName,
          email: candidateEmail,
          password: hashedCandidatePassword,
          role: 'CANDIDATE',
          experience: 2,
          skills: ['Angular', 'TypeScript', 'NestJS'],
        },
      });

      console.log('Candidate account created successfully.');
    } else {
      console.log('Candidate already exists.');
    }
  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await prisma.$disconnect();
  }
}
