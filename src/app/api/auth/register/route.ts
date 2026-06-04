import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, username, email, password, rollNumber, semester, department } = body;

        // Validation
        if (!name || !username || !email || !password || !rollNumber || !semester || !department) {
            return NextResponse.json({ error: "All fields are mandatory. Please fill in all details." }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
        }

        // Check for existing username
        if (username) {
            const existingUsername = await prisma.user.findUnique({ where: { username } });
            if (existingUsername) {
                return NextResponse.json({ error: "Username is already taken." }, { status: 409 });
            }
        }

        // Check for existing email
        if (email) {
            const existingEmail = await prisma.user.findUnique({ where: { email } });
            if (existingEmail) {
                return NextResponse.json({ error: "Email is already registered." }, { status: 409 });
            }
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user
        const user = await prisma.user.create({
            data: {
                name: name || null,
                username,
                email: email || null,
                password: hashedPassword,
                role: "USER",
                rollNumber: rollNumber || null,
                semester: semester || null,
                department: department || null,
            },
        });

        return NextResponse.json({ message: "Account created successfully!", userId: user.id }, { status: 201 });

    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
    }
}
