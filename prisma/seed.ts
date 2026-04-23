import { db } from '../src/lib/db'
import { hashPassword } from '../src/lib/password'

async function main() {
  console.log('Seeding database...')

  // Create admin user
  const adminEmail = 'admin@paybridge.tn'
  const existingAdmin = await db.user.findUnique({ where: { email: adminEmail } })

  if (existingAdmin) {
    console.log('Admin user already exists')
  } else {
    const admin = await db.user.create({
      data: {
        email: adminEmail,
        password: hashPassword('admin123'),
        name: 'PayBridge Admin',
        phone: '+216 00 000 000',
        role: 'admin',
      },
    })
    console.log(`Admin user created: ${admin.email}`)
  }

  // Create a demo user
  const demoEmail = 'demo@paybridge.tn'
  const existingDemo = await db.user.findUnique({ where: { email: demoEmail } })

  if (existingDemo) {
    console.log('Demo user already exists')
  } else {
    const demo = await db.user.create({
      data: {
        email: demoEmail,
        password: hashPassword('demo123'),
        name: 'Ahmed Demo',
        phone: '+216 55 123 456',
        role: 'user',
      },
    })
    console.log(`Demo user created: ${demo.email}`)
  }

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
