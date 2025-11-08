const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyEmails() {
  try {
    const result = await prisma.user.updateMany({
      where: {
        isEmailVerified: false, 
      },
      data: {
        isEmailVerified: true,
        isActive: true
      }
    });
    
    console.log(`Updated ${result.count} users`);
  } catch (error) {
    console.error('Error updating users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyEmails();