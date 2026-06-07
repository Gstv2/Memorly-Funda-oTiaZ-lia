import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogIn, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Até logo!",
      description: "Você saiu da sua conta.",
    });
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { name: "Início", path: "/" },
    { name: "História", path: "/historia" },
    { name: "Projetos", path: "/projetos" },
    { name: "Galeria", path: "/galeria" },
    { name: "Blog", path: "/blog" },
    { name: "Contato", path: "/contato" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-primary-foreground text-xl transition-transform group-hover:scale-110">
              TZ
            </div>
            <span className="font-poppins font-bold text-lg text-foreground hidden sm:block">
              Fundação Tia Zélia
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path}>
                <Button
                  variant="ghost"
                  className={`${
                    isActive(link.path)
                      ? "text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  } transition-colors`}
                >
                  {link.name}
                </Button>
              </Link>
            ))}
            
            {/* Auth Buttons */}
            {!user ? (
              <Link to="/auth">
                <Button variant="outline" size="sm" className="ml-2">
                  <LogIn className="w-4 h-4 mr-2" />
                  Entrar
                </Button>
              </Link>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                >
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${
                      isActive(link.path)
                        ? "text-primary font-semibold bg-primary/5"
                        : "text-muted-foreground"
                    }`}
                  >
                    {link.name}
                  </Button>
                </Link>
              ))}
              
              {/* Mobile Auth Buttons */}
              {!user ? (
                <Link to="/auth" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full justify-start">
                    <LogIn className="w-4 h-4 mr-2" />
                    Entrar
                  </Button>
                </Link>
              ) : (
                <>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full justify-start">
                        <Settings className="w-4 h-4 mr-2" />
                        Admin
                      </Button>
                    </Link>
                  )}
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
