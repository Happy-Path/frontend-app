
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { 
    message: "Password must be at least 6 characters long" 
  }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      // In a real app, this would validate against a real backend
      const user = await api.loginUser(values.email, values.password);
      toast({
        title: "Login successful!",
        description: `Welcome back, ${user.name}`,
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Please check your email and password and try again.",
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
            Welcome Back!
          </CardTitle>
          <CardDescription className="text-happy-500 text-lg">
            Login to continue your learning journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-happy-700">Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        className="text-lg p-6 rounded-xl border-happy-200 focus-visible:ring-happy-400" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full bg-happy-600 hover:bg-happy-700 text-white font-semibold p-6 h-auto text-lg rounded-xl"
                disabled={isLoading}
              >
                {isLoading ? (
                  "Logging in..."
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5" /> Login
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="text-center w-full">
            <Link 
              to="/forgot-password" 
              className="text-happy-600 hover:text-happy-800 text-sm"
            >
              Forgot your password?
            </Link>
          </div>
          <div className="w-full border-t border-gray-200 pt-4 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link 
                to="/register" 
                className="text-sunny-600 hover:text-sunny-800 font-semibold"
              >
                Register
              </Link>
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
