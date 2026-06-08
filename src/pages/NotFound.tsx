import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import SEO from "@/components/SEO";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle px-4">
      <SEO title="Página Não Encontrada" />
      <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
        <div className="relative">
          <h1 className="text-9xl font-bold text-primary/10">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <h2 className="text-4xl font-poppins font-bold text-foreground">Oops!</h2>
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-2xl font-semibold text-foreground">Página não encontrada</p>
          <p className="text-muted-foreground">
            Parece que o caminho <code className="bg-muted px-1 rounded text-primary">{location.pathname}</code> não existe ou foi movido.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button asChild variant="default" size="lg" className="gap-2 shadow-warm">
            <Link to="/">
              <Home className="h-4 w-4" />
              Voltar para Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2" onClick={() => window.history.back()}>
            <span>
              <ArrowLeft className="h-4 w-4" />
              Voltar anterior
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
