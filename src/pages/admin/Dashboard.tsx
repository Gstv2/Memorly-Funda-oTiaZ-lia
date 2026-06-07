import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Image, FolderOpen, Plus, TrendingUp } from 'lucide-react';

interface Stats {
  posts: number;
  images: number;
  projects: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({ posts: 0, images: 0, projects: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [postsRes, imagesRes, projectsRes] = await Promise.all([
          supabase.from('blog_posts').select('id', { count: 'exact', head: true }),
          supabase.from('gallery_images').select('id', { count: 'exact', head: true }),
          supabase.from('projects').select('id', { count: 'exact', head: true }),
        ]);

        setStats({
          posts: postsRes.count || 0,
          images: imagesRes.count || 0,
          projects: projectsRes.count || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Posts do Blog',
      value: stats.posts,
      icon: FileText,
      href: '/admin/posts',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Imagens na Galeria',
      value: stats.images,
      icon: Image,
      href: '/admin/galeria',
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Projetos Ativos',
      value: stats.projects,
      icon: FolderOpen,
      href: '/admin/projetos',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie o conteúdo do site da Fundação Tia Zélia
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {statCards.map((stat) => (
          <Link key={stat.href} to={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {loading ? '...' : stat.value}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Link to="/admin/posts/novo">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Plus className="h-4 w-4" />
                Novo Post
              </Button>
            </Link>
            <Link to="/admin/galeria/novo">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Plus className="h-4 w-4" />
                Nova Imagem
              </Button>
            </Link>
            <Link to="/admin/projetos/novo">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Plus className="h-4 w-4" />
                Novo Projeto
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
