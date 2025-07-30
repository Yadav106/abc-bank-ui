import axios from 'axios';
import { AuthOptions } from 'next-auth';
import CredentialsProviders from 'next-auth/providers/credentials';

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProviders({
            name: 'credentials',
            credentials: {
                username: { label: "username", type: "text" },
                password: { label: "password", type: "password" },
            },
            async authorize(credentials) {
                if(!credentials?.username || !credentials?.password) {
                    throw new Error('Invalid Credentials')
                }

                try {
                    const response = await axios.post('http://localhost:8080/api/auth/login', {
                        username: credentials.username,
                        password: credentials.password
                    });

                    console.error('Response:', response.data);

                    // Check if login was successful
                    if (response.status === 200 && response.data) {
                        // Return user object with data from your API
                        return {
                            id: response.data.id || response.data.userId,
                            name: response.data.name || response.data.username,
                            email: response.data.email,
                            // Add any other fields your API returns
                            token: response.data.token,
                            role: response.data.role,
                        };
                    }

                    throw new Error('Invalid Credentials');

                } catch (error) {
                    console.error('Authentication error:', error);
                    throw new Error('Invalid Credentials');
                }
            }
        })
    ],
    debug: process.env.NODE_ENV === 'development',
    session: {
        strategy: 'jwt',
        maxAge: 120 * 60,
        updateAge: 5 * 60,
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.user = user;
            }
            return token;
        },
        async session({ session, token }) {
            if (token.user) {
                session.user = token.user;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET
}