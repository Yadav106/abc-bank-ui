import { NextResponse } from 'next/server';

export async function POST(
    request: Request
) {
    try{
        const body = await request.json();
        const { email, username, password, phone, address, pan, name } = body;

        if(!email || !username || !password || !phone || !address || !pan || !name) {
            return new NextResponse('Missing info', { status: 400 });
        }

        // call an api to register the user
        // the endpoint is http://localhost:8080/api/auth/register

        const response = await fetch('http://localhost:8080/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                username,
                password,
                phone,
                address,
                pan,
                name,
                role: "ROLE_CUSTOMER"
            })
        });

        if (!response.ok) {
            return new NextResponse('Error registering user', { status: 500 });
        }

        // If the response is successful, the response will be User registered successfully.

        return NextResponse.json({ message: 'User registered successfully.' });
    } catch(err: any) {
        console.log(err, 'REGISTRATION_ERROR');
        return new NextResponse('Internal server error', { status: 500 });
    }
}