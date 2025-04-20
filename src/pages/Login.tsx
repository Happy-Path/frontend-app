
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { LogIn } from "lucide-react";
import { FaGoogle } from "react-icons/fa";

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
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleRoleBasedRedirect = (role) => {
    console.log("Redirecting based on role:", role);
    // Force navigation based on role
    if (role === 'teacher') {
      navigate("/teacher", { replace: true });
      return;
    } else if (role === 'parent') {
      navigate("/parent", { replace: true });
      return;
    } else {
      // Default to student dashboard
      navigate("/", { replace: true });
      return;
    }
  };

  const onSubmit = async (values) => {
    setIsLoading(true);
    try {
      const user = await login(values.email, values.password);
      console.log("Login successful, user role:", user.role);

      toast("Login successful!", {
        description: `Welcome back, ${user.name}!`,
      });

      // Add a slight delay to ensure state updates complete
      setTimeout(() => {
        handleRoleBasedRedirect(user.role);
      }, 100);

    } catch (error) {
      console.error("Login error:", error);
      toast("Login failed", {
        description: "Invalid email or password. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
      // OAuth redirect will handle navigation
    } catch (error) {
      console.error("Google login error:", error);
      toast("Google login failed", {
        description: "An error occurred during Google login.",
      });
    } finally {
      setIsGoogleLoading(false);
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
          <CardContent className="space-y-4">
            <Button
                type="button"
                variant="outline"
                className="w-full p-6 h-auto text-lg rounded-xl flex items-center justify-center gap-2"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                  "Connecting..."
              ) : (
                  <>
                    <FaGoogle className="mr-2 h-5 w-5" /> Continue with Google
                  </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
              </div>
            </div>

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
                        <LogIn className="mr-2 h-5 w-5" /> Login with Email
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