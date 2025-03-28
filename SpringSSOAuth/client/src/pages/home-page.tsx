import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { CardInfo, StatusCardInfo, CodeCardInfo } from "@/components/ui/card-info";
import { useToast } from "@/hooks/use-toast";
import { jwtDecode } from "jwt-decode";
import { LogOut, Copy, UserCheck } from "lucide-react";
import { useLocation } from "wouter";
import { format } from "date-fns";

type JwtPayload = {
  id: number;
  username: string;
  iat: number;
  exp: number;
};

export default function HomePage() {
  const { user, token, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  
  // Check for token in URL (from Scalekit redirect)
  useEffect(() => {
    // Parse the URL params
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');
    
    if (tokenFromUrl) {
      // If we have a token in the URL, store it in localStorage
      localStorage.setItem('auth_token', tokenFromUrl);
      
      // Show success toast for Scalekit login
      toast({
        title: "Login Successful",
        description: "You've successfully signed in with Scalekit"
      });
      
      // Clean up the URL by removing the token parameter
      setLocation("/", { replace: true });
      
      // Reload the page to refresh the auth state with the new token
      window.location.reload();
    }
  }, []);

  if (!user || !token) {
    return null;
  }

  // Decode JWT token to get payload information
  const decodedToken = token ? jwtDecode<JwtPayload>(token) : null;
  
  const issuedAt = decodedToken?.iat 
    ? format(new Date(decodedToken.iat * 1000), "PPpp")
    : "Unknown";
  
  const expiresAt = decodedToken?.exp 
    ? format(new Date(decodedToken.exp * 1000), "PPpp")
    : "Unknown";

  // Get user's initials for the avatar
  const userInitials = user.username.substring(0, 2).toUpperCase();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const copyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token)
        .then(() => {
          toast({
            title: "Copied!",
            description: "Token copied to clipboard",
          });
        })
        .catch(() => {
          toast({
            title: "Error",
            description: "Failed to copy token",
            variant: "destructive",
          });
        });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-primary text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-medium">SSO Application</h1>
          <Button 
            variant="ghost" 
            className="text-white hover:text-gray-100 hover:bg-primary-dark" 
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <span className="mr-1">Logout</span>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          {/* User profile */}
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl mr-4">
              <span>{userInitials}</span>
            </div>
            <div>
              <h2 className="text-2xl font-medium">{user.username}</h2>
              <p className="text-gray-500">{`User #${user.id}`}</p>
            </div>
          </div>
          
          <hr className="my-6 border-gray-200" />
          
          {/* User Information */}
          <div className="space-y-4">
            <h3 className="text-xl font-medium mb-4">User Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CardInfo 
                label="User ID" 
                value={`#${user.id}`} 
              />
              
              <CardInfo 
                label="Username" 
                value={user.username} 
              />
              
              {user.email && (
                <CardInfo 
                  label="Email" 
                  value={user.email} 
                />
              )}
              
              {(user.first_name || user.last_name) && (
                <CardInfo 
                  label="Name" 
                  value={`${user.first_name || ''} ${user.last_name || ''}`.trim()} 
                />
              )}
              
              <StatusCardInfo 
                label="Account Status" 
                value="Active" 
                status="active" 
              />
              
              <StatusCardInfo 
                label="Auth Method" 
                value={user.scalekit_id ? "Scalekit SSO" : "Local"} 
                status={user.scalekit_id ? "success" : "default"} 
              />
            </div>
          </div>
          
          {/* JWT Token Information */}
          <div className="mt-8 space-y-4">
            <h3 className="text-xl font-medium mb-4">Session Information</h3>
            
            <CodeCardInfo 
              label="JWT Token" 
              value={token}
              onCopy={copyToken}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <CardInfo 
                label="Issued At" 
                value={issuedAt} 
              />
              
              <CardInfo 
                label="Expires At" 
                value={expiresAt} 
              />
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
