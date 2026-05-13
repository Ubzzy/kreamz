import { Link } from "react-router-dom";
import { IceCream, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";

const Navigation = () => {
  const { user, signOut } = useAuth();
  const { canManage } = useUserRole();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary hover:opacity-80 transition-opacity">
          <IceCream className="h-8 w-8" />
          <span>Kreams</span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              {canManage && (
                <Link to="/dashboard">
                  <Button variant="secondary">Dashboard</Button>
                </Link>
              )}
              <Button onClick={signOut} variant="outline">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button variant="default">
                <LogIn className="h-4 w-4 mr-2" />
                Owner Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
