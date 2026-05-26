import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findUnique({
    where: { email: 'superadmin@warisanlink.id' },
  });

  if (existing) {
    console.log('Superadmin sudah ada, skip seeding.');
    return;
  }

  const hashed = await bcrypt.hash('Admin@Warisan123', 12);

  const superadmin = await prisma.user.create({
    data: {
      email: 'superadmin@warisanlink.id',
      password: hashed,
      name: 'Super Administrator',
      role: 'SUPERADMIN',
      status: 'ACTIVE',
    },
  });

  console.log('✅ Superadmin dibuat:', superadmin.email);
  console.log('   Password: Admin@Warisan123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
