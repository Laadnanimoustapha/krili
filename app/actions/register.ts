'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';

const RegisterSchema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone number must be at least 10 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    agreeToTerms: z.boolean().refine((val) => val === true, {
        message: 'You must agree to the terms and conditions',
    }),
    agreeToMarketing: z.boolean().optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export type State = {
    errors?: {
        firstName?: string[];
        lastName?: string[];
        email?: string[];
        phone?: string[];
        password?: string[];
        confirmPassword?: string[];
        agreeToTerms?: string[];
    };
    message?: string | null;
};

export async function register(prevState: State, formData: FormData) {
    const validatedFields = RegisterSchema.safeParse({
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword'),
        agreeToTerms: formData.get('agreeToTerms') === 'on',
        agreeToMarketing: formData.get('agreeToMarketing') === 'on',
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Register.',
        };
    }

    const { firstName, lastName, email, phone, password } = validatedFields.data;

    try {
        console.log('Hashing password for:', email);
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log('Executing DB insertion for:', email);
        await db.execute(
            'INSERT INTO users (first_name, last_name, email, phone, password) VALUES (?, ?, ?, ?, ?)',
            [firstName, lastName, email, phone, hashedPassword]
        );
        console.log('User registered successfully');
    } catch (error) {
        console.error('Registration error:', error);
        return {
            message: 'Database Error: Failed to Create User. ' + (error instanceof Error ? error.message : String(error)),
        };
    }

    redirect('/login');
}
