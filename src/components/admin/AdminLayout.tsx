import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  FileText,
  Image,
  FolderOpen,
  Users,
  LogOut,
  Home,
  Menu,
  X,
  Shield,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
}

const menuItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/posts', icon: FileText, label: 'Blog Posts' },
  { href: '/admin/galeria', icon: Image, label: 'Galeria' },
  { href: '/admin/projetos', icon: FolderOpen, label: 'Projetos' },
  { href: '/admin/voluntarios', icon: Users, label: 'Voluntários' },
];

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, isAdmin, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-foreground">FTZ</span>
          </div>
          <span className="font-semibold">Admin</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 lg:transform-none',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="hidden lg:flex items-center gap-3 p-6 border-b">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-foreground">FTZ</span>
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Fundação Tia Zélia</h2>
                <p className="text-xs text-muted-foreground">Painel Admin</p>
              </div>
            </div>

            {/* Admin badge */}
            {isAdmin && (
              <div className="mx-4 mt-4 p-2 bg-primary/10 rounded-lg flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Administrador</span>
              </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                      isActive
                        ? 'bg-primary text-foreground'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t space-y-2">
              <Link
                to="/"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                <Home className="h-5 w-5" />
                <span>Ver Site</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full"
              >
                <LogOut className="h-5 w-5" />
                <span>Sair</span>
              </button>
              <div className="pt-2 px-3">
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 p-6 lg:p-8 min-h-screen">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
