const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function verifyEmails() {
  try {
    const result = await prisma.user.findMany({
      where: {
        isEmailVerified: false, 
      },
      select: {
        email: true,
        id: true,
        name: true
      }
    });

    console.log(`Found ${result.length} users`);

    // Create CSV content
    const csvHeader = 'ID,Name,Email\n';
    const csvRows = result.map(user => 
      `${user.id},"${user.name || ''}","${user.email}"`
    ).join('\n');
    const csvContent = csvHeader + csvRows;

    // Write to CSV file in the same directory
    const csvPath = path.join(__dirname, 'unverified-emails.csv');
    fs.writeFileSync(csvPath, csvContent);
    
    console.log(`Saved ${result.length} unverified emails to ${csvPath}`);
  } catch (error) {
    console.error('Error fetching users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyEmails();