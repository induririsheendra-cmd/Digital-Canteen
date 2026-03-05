import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
    secret: process.env.AUTH_SECRET || "super-secret-key-fallback",
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "mock-client-id",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "mock-secret",
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) return null

                const user = await prisma.user.findUnique({
                    where: { username: credentials.username as string }
                })

                if (!user || !user.password) return null

                const isValid = await bcrypt.compare(credentials.password as string, user.password)
                if (!isValid) return null

                return {
                    id: user.id,
                    name: user.username,
                    email: user.email,
                    role: user.role,
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, account, profile }) {
            if (user) {
                token.id = user.id
                token.role = (user as any).role || 'USER'

                // Handle Google OAuth implicit users
                if (account?.provider === 'google') {
                    const dbUser = await prisma.user.findUnique({
                        where: { email: user.email! }
                    })
                    if (dbUser) {
                        token.id = dbUser.id
                        token.role = dbUser.role
                    } else {
                        // Create Google User if doesn't exist
                        const newDbUser = await prisma.user.create({
                            data: {
                                email: user.email,
                                username: user.email?.split('@')[0], // rudimentary username
                                role: 'USER',
                            }
                        })
                        token.id = newDbUser.id
                        token.role = newDbUser.role
                    }
                }
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                (session.user as any).role = token.role as string
            }
            return session
        }
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    session: {
        strategy: 'jwt'
    }
})
