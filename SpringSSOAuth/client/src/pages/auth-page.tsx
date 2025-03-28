import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import axios from "axios";

// Form schema for login and registration
const formSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-primary text-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-medium">SSO Application</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Auth Form */}
          <div className="w-full">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              {/* Login Form */}
              <TabsContent value="login">
                <LoginForm />
              </TabsContent>

              {/* Register Form */}
              <TabsContent value="register">
                <RegisterForm />
              </TabsContent>
            </Tabs>
          </div>

          {/* Hero Section */}
          <div className="bg-white p-8 rounded-lg shadow-md hidden md:block">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-primary mb-4">
                Secure Single Sign-On
              </h2>
              <p className="text-gray-600 mb-6">
                Our SSO solution provides a secure and streamlined authentication
                experience for your applications.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-primary/10 p-2 rounded-full mr-4">
                  <span className="material-icons text-primary">security</span>
                </div>
                <div>
                  <h3 className="font-medium">Enhanced Security</h3>
                  <p className="text-sm text-gray-500">
                    JWT-based authentication with secure session management
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-primary/10 p-2 rounded-full mr-4">
                  <span className="material-icons text-primary">speed</span>
                </div>
                <div>
                  <h3 className="font-medium">Seamless Experience</h3>
                  <p className="text-sm text-gray-500">
                    Sign in once and access all connected services
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-primary/10 p-2 rounded-full mr-4">
                  <span className="material-icons text-primary">devices</span>
                </div>
                <div>
                  <h3 className="font-medium">Cross-Platform</h3>
                  <p className="text-sm text-gray-500">
                    Works on all devices and browsers
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>&copy; 2023 SSO Application. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function LoginForm() {
  const { loginMutation } = useAuth();
  const [isScalekitLoading, setIsScalekitLoading] = useState(false);
  const [scalekitError, setScalekitError] = useState<string | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    loginMutation.mutate(values);
  };
  
  const handleScalekitLogin = async () => {
    setIsScalekitLoading(true);
    setScalekitError(null);
    
    try {
      // Get the authorization URL from our backend
      const response = await axios.get('/api/auth/scalekit');
      
      // Redirect to Scalekit's login page
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Error starting Scalekit auth flow:', error);
      setScalekitError('Failed to initialize Scalekit login. Please try again.');
      setIsScalekitLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-medium text-primary">Welcome Back</CardTitle>
        <CardDescription>
          Log in to access your dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loginMutation.error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {loginMutation.error.message || "Invalid username or password"}
            </AlertDescription>
          </Alert>
        )}
        
        {scalekitError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{scalekitError}</AlertDescription>
          </Alert>
        )}

        <Button
          variant="outline"
          className="w-full mb-4 py-3 flex items-center justify-center space-x-2 border-2"
          onClick={handleScalekitLogin}
          disabled={isScalekitLoading || loginMutation.isPending}
        >
          {isScalekitLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting to Scalekit...
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                <path d="M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12 12-5.383 12-12S18.617 0 12 0zm0 3.6c2.507 0 4.8 1.04 6.44 2.693A9.15 9.15 0 0121.6 12c0 5.088-4.112 9.2-9.2 9.2S3.2 17.088 3.2 12c0-2.38.9-4.55 2.36-6.16A8.323 8.323 0 0112 3.6z" fill="currentColor"/>
                <path d="M16.4 12c0 2.43-1.97 4.4-4.4 4.4-2.43 0-4.4-1.97-4.4-4.4 0-2.43 1.97-4.4 4.4-4.4 2.43 0 4.4 1.97 4.4 4.4z" fill="currentColor"/>
              </svg>
              <span>Sign in with Scalekit</span>
            </>
          )}
        </Button>

        <div className="relative mb-4">
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your username" 
                      {...field} 
                      className="px-3 py-4 border-2"
                      disabled={loginMutation.isPending || isScalekitLoading}
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Enter your password" 
                      {...field} 
                      className="px-3 py-4 border-2"
                      disabled={loginMutation.isPending || isScalekitLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary-dark py-3"
              disabled={loginMutation.isPending || isScalekitLoading}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Log In"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function RegisterForm() {
  const { registerMutation } = useAuth();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    registerMutation.mutate(values);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-medium text-primary">Create Account</CardTitle>
        <CardDescription>
          Register to get started with our SSO solution
        </CardDescription>
      </CardHeader>
      <CardContent>
        {registerMutation.error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {registerMutation.error.message || "Registration failed"}
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Choose a username" 
                      {...field} 
                      className="px-3 py-4 border-2"
                      disabled={registerMutation.isPending}
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Create a password" 
                      {...field} 
                      className="px-3 py-4 border-2"
                      disabled={registerMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary-dark py-3"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                "Register"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
