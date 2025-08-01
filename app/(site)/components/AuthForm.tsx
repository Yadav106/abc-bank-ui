'use client';

import Button from "@/app/components/Button";
import Input from "@/app/components/inputs/Input";
import { useCallback, useEffect, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-hot-toast";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Variant = 'LOGIN' | 'REGISTER'

const AuthForm = () => {
    const session = useSession();
    const router = useRouter();
    const [variant, setVariant] = useState<Variant>('LOGIN')
    const [isLoading, setIsLoading] = useState<boolean>(false)

    async function getRoleAndContinue() {
        const username = localStorage.getItem('username');

        const response = await axios.get(`http://localhost:8080/users/username/${username}`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }
        );

        console.log('Response Data:', response.data);

        const role = response.data.role;

        localStorage.setItem('role', role);

        if (role === 'ROLE_ADMIN') {
            router.push('/admin');
        } else if (role === 'ROLE_CUSTOMER') {
            router.push('/users');
        } else if (role === 'ROLE_MANAGER') {
            router.push('/manager');
        } else if (role === 'ROLE_LOAN_OFFICER') {
            router.push('/loan-officer');
        }
    }

    useEffect(() => {
        console.log('Session:', session);
        if (session?.status === 'authenticated') {
            localStorage.setItem('token', (session.data?.user as any)?.token || '');
            getRoleAndContinue();
        }
    }, [session?.status, router])

    const toggleVariant = useCallback(() => {
        if(variant === 'LOGIN') {
            setVariant('REGISTER')
        } else {
            setVariant('LOGIN')
        }
    }, [variant]);

    const {
        register,
        handleSubmit,
        formState: {
            errors
        }
    } = useForm<FieldValues>({
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            address: '',
            pan: '',
            username: '',
            password: ''
        },
        mode: 'onChange'
    });

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        setIsLoading(true);

        if(variant === 'REGISTER') {
            axios.post('/api/register', data)
            .then(() => signIn('credentials', data))
            .catch(() => toast.error('Something went wrong'))
            .finally(() => setIsLoading(false))
        }

        if (variant === 'LOGIN') {
            signIn('credentials', {
                ...data,
                redirect: false,
            })
            .then((callback:any) => {
                if (callback?.error) {
                    toast.error('Invalid credentials')
                }

                if (callback?.ok && !callback?.error) {
                    toast.success('Logged in!')
                    localStorage.setItem('username', data.username);
                    getRoleAndContinue();
                    // router.push('/users')
                }
            })
            .finally(() => setIsLoading(false))
        }
    }

    return ( 
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
                <form
                    className="space-y-6"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    {variant === 'REGISTER' && (
                        <>
                            <Input 
                                id="name" 
                                label="Full Name" 
                                register={register} 
                                errors={errors}
                                disabled={isLoading}
                                required
                                validation={{
                                    required: 'Full name is required',
                                    minLength: {
                                        value: 2,
                                        message: 'Name must be at least 2 characters'
                                    },
                                    maxLength: {
                                        value: 50,
                                        message: 'Name must be less than 50 characters'
                                    },
                                    pattern: {
                                        value: /^[a-zA-Z\s]+$/,
                                        message: 'Name can only contain letters and spaces'
                                    }
                                }}
                            />
                            <Input 
                                id="email" 
                                label="Email Address" 
                                type="email"
                                register={register} 
                                errors={errors}
                                disabled={isLoading}
                                required
                                validation={{
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Please enter a valid email address'
                                    }
                                }}
                            />
                            <Input 
                                id="phone" 
                                label="Phone Number" 
                                type="tel"
                                register={register} 
                                errors={errors}
                                disabled={isLoading}
                                required
                                validation={{
                                    required: 'Phone number is required',
                                    pattern: {
                                        value: /^[6-9]\d{9}$/,
                                        message: 'Please enter a valid 10-digit Indian mobile number'
                                    }
                                }}
                            />
                            <Input 
                                id="address" 
                                label="Address" 
                                register={register} 
                                errors={errors}
                                disabled={isLoading}
                                required
                                validation={{
                                    required: 'Address is required',
                                    minLength: {
                                        value: 10,
                                        message: 'Address must be at least 10 characters'
                                    },
                                    maxLength: {
                                        value: 200,
                                        message: 'Address must be less than 200 characters'
                                    }
                                }}
                            />
                            <Input 
                                id="pan" 
                                label="PAN Number" 
                                register={register} 
                                errors={errors}
                                disabled={isLoading}
                                required
                                validation={{
                                    required: 'PAN number is required',
                                    pattern: {
                                        value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                                        message: 'Please enter a valid PAN number (e.g., ABCDE1234F)'
                                    }
                                }}
                            />
                        </>
                    )}
                    <Input 
                        id="username" 
                        label="Username" 
                        type="text"
                        register={register} 
                        errors={errors}
                        disabled={isLoading}
                        required
                        validation={{
                            required: 'Username is required',
                            minLength: {
                                value: 3,
                                message: 'Username must be at least 3 characters'
                            },
                            maxLength: {
                                value: 20,
                                message: 'Username must be less than 20 characters'
                            },
                            pattern: {
                                value: /^[a-zA-Z0-9_]+$/,
                                message: 'Username can only contain letters, numbers, and underscores'
                            }
                        }}
                    />
                    <Input 
                        id="password" 
                        label="Password" 
                        type="password"
                        register={register} 
                        errors={errors}
                        disabled={isLoading}
                        required
                        validation={{
                            required: 'Password is required',
                            minLength: {
                                value: variant === 'REGISTER' ? 8 : 1,
                                message: variant === 'REGISTER' ? 'Password must be at least 8 characters' : 'Password is required'
                            },
                            maxLength: {
                                value: 50,
                                message: 'Password must be less than 50 characters'
                            },
                            ...(variant === 'REGISTER' && {
                                pattern: {
                                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                                    message: 'Password must contain uppercase, lowercase, number, and special character'
                                }
                            })
                        }}
                    />
                    <div>
                        <Button
                            disabled={isLoading}
                            fullWidth
                            type="submit"
                        >
                            {variant === 'LOGIN' ? 'Sign In' : 'Register'}
                        </Button>
                    </div>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 justify-center text-sm mt-6 px-2 text-gray-500">
                    <div>
                        {variant === 'LOGIN' ? 'New to ABC Bank?' : 'Already have an account?'}
                    </div>
                    <div
                        onClick={toggleVariant}
                        className="underline cursor-pointer"
                    >
                        {variant === 'LOGIN' ? 'Create an account' : 'Sign in'}
                    </div>
                </div>
            </div>
        </div>
     );
}
 
export default AuthForm;