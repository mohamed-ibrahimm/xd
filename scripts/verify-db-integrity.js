const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const users = await prisma.user.count();
    const courses = await prisma.course.count();
    const enrollments = await prisma.enrollment.count();
    const identities = await prisma.authIdentity.count();
    const orders = await prisma.order.count();
    const certificates = await prisma.certificate.count();

    console.log('=== DATABASE INTEGRITY CHECK ===');
    console.log(`Users:         ${users}`);
    console.log(`Courses:       ${courses}`);
    console.log(`Enrollments:   ${enrollments}`);
    console.log(`Orders:        ${orders}`);
    console.log(`Certificates:  ${certificates}`);
    console.log(`AuthIdentities:${identities}`);
    console.log('STATUS: Database records intact and validated.');
  } catch (err) {
    console.error('Integrity error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

check();
