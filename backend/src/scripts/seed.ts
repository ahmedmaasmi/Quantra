import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parse } from 'csv-parse/sync';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

interface SeedUser {
  id: string;
  name: string;
  email: string;
  password: string;
  kycStatus: string;
  phone?: string;
}

interface SeedTransaction {
  id: string;
  userId: string;
  amount: number;
  merchant?: string;
  category?: string;
  country?: string;
  type?: string;
  description?: string;
  timestamp: Date;
  fraudScore?: number;
  isFlagged?: boolean;
}

async function seedUsers() {
  console.log('📝 Seeding users...');
  
  // Use path relative to project root (go up from backend to project root)
  const projectRoot = join(__dirname, '..', '..', '..');
  const usersPath = join(projectRoot, 'data', 'users.csv');
  const fileContent = readFileSync(usersPath, 'utf-8');
  
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  }) as SeedUser[];

  for (const user of records) {
    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(user.password || 'password123', 10);
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email }
    });

    if (!existingUser) {
      await prisma.user.create({
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          password: hashedPassword,
          kycStatus: user.kycStatus as any,
          phone: user.phone || null
        }
      });
      console.log(`✅ Created user: ${user.email}`);
    } else {
      // Update password if user exists but password might not be hashed
      const needsPasswordUpdate = !existingUser.password.startsWith('$2b$');
      if (needsPasswordUpdate) {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { password: hashedPassword }
        });
        console.log(`🔐 Updated password hash for user: ${user.email}`);
      } else {
        console.log(`⏭️  User already exists: ${user.email}`);
      }
    }
  }
  
  console.log(`✅ Seeded ${records.length} users`);
}

async function seedTransactions() {
  console.log('📝 Seeding transactions...');
  
  // Use path relative to project root (go up from backend to project root)
  const projectRoot = join(__dirname, '..', '..', '..');
  const transactionsPath = join(projectRoot, 'data', 'transactions.csv');
  const fileContent = readFileSync(transactionsPath, 'utf-8');
  
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  }) as any[];

  let created = 0;
  let skipped = 0;

  for (const tx of records) {
    try {
      // Check if transaction exists
      const existingTx = await prisma.transaction.findUnique({
        where: { id: tx.id }
      });

      if (existingTx) {
        skipped++;
        continue;
      }

      // Verify user exists
      const user = await prisma.user.findUnique({
        where: { id: tx.userId }
      });

      if (!user) {
        console.log(`⚠️  User not found for transaction ${tx.id}: ${tx.userId}`);
        skipped++;
        continue;
      }

      await prisma.transaction.create({
        data: {
          id: tx.id,
          userId: tx.userId,
          amount: parseFloat(tx.amount),
          merchant: tx.merchant || null,
          category: tx.category || null,
          country: tx.country || null,
          type: tx.type || null,
          description: tx.description || null,
          timestamp: new Date(tx.timestamp),
          fraudScore: tx.fraudScore ? parseFloat(tx.fraudScore) : null,
          isFlagged: tx.isFlagged === 'true' || tx.isFlagged === true
        }
      });
      created++;

      // Create alert if transaction is flagged
      if (tx.isFlagged === 'true' || tx.isFlagged === true) {
        await prisma.alert.create({
          data: {
            userId: tx.userId,
            transactionId: tx.id,
            type: 'fraud',
            message: `Fraudulent transaction detected: ${tx.type} of $${tx.amount}`,
            severity: parseFloat(tx.fraudScore || '0') > 80 ? 'high' : 'medium',
            status: 'open'
          }
        });
      }
    } catch (error: any) {
      console.error(`❌ Error creating transaction ${tx.id}:`, error.message);
      skipped++;
    }
  }
  
  console.log(`✅ Created ${created} transactions, skipped ${skipped}`);
}

async function seedAMLCases() {
  console.log('📝 Seeding AML cases...');
  
  const projectRoot = join(__dirname, '..', '..', '..');
  const casesPath = join(projectRoot, 'data', 'aml_cases.csv');
  
  try {
    const fileContent = readFileSync(casesPath, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    }) as any[];

    let created = 0;
    let skipped = 0;

    for (const caseRecord of records) {
      try {
        // Check if case exists
        const existingCase = await prisma.case.findUnique({
          where: { id: caseRecord.id }
        });

        if (existingCase) {
          skipped++;
          continue;
        }

        // Verify user exists
        const user = await prisma.user.findUnique({
          where: { id: caseRecord.userId }
        });

        if (!user) {
          console.log(`⚠️  User not found for case ${caseRecord.id}: ${caseRecord.userId}`);
          skipped++;
          continue;
        }

        // Create or find alert
        let alert = await prisma.alert.findFirst({
          where: { 
            userId: caseRecord.userId,
            type: 'fraud'
          }
        });

        if (!alert) {
          // Create a default alert for this case
          alert = await prisma.alert.create({
            data: {
              userId: caseRecord.userId,
              type: 'fraud',
              message: caseRecord.summary || 'AML case alert',
              severity: 'high',
              status: 'open'
            }
          });
        }

        // Create case
        await prisma.case.create({
          data: {
            id: caseRecord.id,
            userId: caseRecord.userId,
            alertId: alert.id,
            summary: caseRecord.summary || 'AML case',
            status: caseRecord.status || 'open',
            assignedTo: caseRecord.assignedTo === 'Unassigned' ? null : caseRecord.assignedTo || null,
            notes: caseRecord.notes || null,
            createdAt: new Date(caseRecord.createdAt || Date.now())
          }
        });
        created++;
      } catch (error: any) {
        console.error(`❌ Error creating case ${caseRecord.id}:`, error.message);
        skipped++;
      }
    }

    console.log(`✅ Created ${created} AML cases, skipped ${skipped}`);
  } catch (error: any) {
    console.log(`⚠️  Could not seed AML cases: ${error.message}`);
    console.log('   (This is okay if the file doesn\'t exist yet)');
  }
}

async function main() {
  console.log('🌱 Starting database seed...\n');
  
  try {
    await seedUsers();
    console.log('');
    await seedTransactions();
    console.log('');
    await seedAMLCases();
    console.log('');
    console.log('✅ Database seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

