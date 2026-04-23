import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/password'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, name, phone } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    const hashedPassword = hashPassword(password)

    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        phone: phone || null,
      },
    })

    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      { user: userWithoutPassword, message: 'Registration successful' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
