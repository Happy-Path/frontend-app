// src/pages/Register.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { UserPlus, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card, CardContent, CardDescription, CardFooter,
    CardHeader, CardTitle,
} from "@/components/ui/card";
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const registerSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string(),
    role: z.enum(["student", "parent", "teacher"], {
        required_error: "Please select a role",
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [showPw, setShowPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);

    const navigate = useNavigate();
    const { toast } = useToast();
    const { register: registerUser } = useAuth();

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            role: "student",
        },
    });

    const onSubmit = async (values: RegisterFormValues) => {
        setIsLoading(true);
        try {
            await registerUser(values.name, values.email, values.password, values.role);
            toast({
                title: "Registration successful!",
                description: "You can now log in with your email and password.",
            });
            navigate("/login");
        } catch (error: any) {
            console.error("Registration error:", error);
            toast({
                title: "Registration failed",
                description: error?.message || "Something went wrong. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-happy-50 p-4">
            <Card className="max-w-md w-full shadow-xl">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-3xl font-bold text-happy-700">
                        Join HappyPath
                    </CardTitle>
                    <CardDescription className="text-happy-500 text-lg">
                        Create an account to start your learning journey
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            {/* Name */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-happy-700">Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Your Name"
                                                className="text-lg p-6 rounded-xl border-happy-200 focus-visible:ring-happy-400"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Email */}
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-happy-700">Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="your.email@example.com"
                                                className="text-lg p-6 rounded-xl border-happy-200 focus-visible:ring-happy-400"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Role */}
                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-happy-700">Role</FormLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger className="text-lg p-6 h-auto rounded-xl border-happy-200 focus:ring-happy-400">
                                                    <SelectValue placeholder="Select your role" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="student">Student</SelectItem>
                                                <SelectItem value="parent">Parent</SelectItem>
                                                <SelectItem value="teacher">Teacher</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Password */}
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-happy-700">Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={showPw ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    className="text-lg p-6 rounded-xl border-happy-200 focus-visible:ring-happy-400 pr-12"
                                                    {...field}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPw((v) => !v)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-happy-600"
                                                    aria-label="Toggle password visibility"
                                                >
                                                    {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Confirm Password */}
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-happy-700">Confirm Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={showConfirmPw ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    className="text-lg p-6 rounded-xl border-happy-200 focus-visible:ring-happy-400 pr-12"
                                                    {...field}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPw((v) => !v)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-happy-600"
                                                    aria-label="Toggle confirm password visibility"
                                                >
                                                    {showConfirmPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Submit */}
                            <Button
                                type="submit"
                                className="w-full bg-sunny-500 hover:bg-sunny-600 text-white font-semibold p-6 h-auto text-lg rounded-xl"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    "Creating Account..."
                                ) : (
                                    <>
                                        <UserPlus className="mr-2 h-5 w-5" /> Register with Email
                                    </>
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>

                <CardFooter className="flex flex-col gap-4">
                    <div className="w-full border-t border-gray-200 pt-4 text-center">
                        <p className="text-gray-600">
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                className="text-happy-600 hover:text-happy-800 font-semibold"
                            >
                                Login
                            </Link>
                        </p>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Register;
