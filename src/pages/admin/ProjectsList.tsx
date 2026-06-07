import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Eye, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string | null;
  is_active: boolean | null;
  cover_image: string | null;
  created_at: string;
}

const ProjectsList = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os projetos',
        variant: 'destructive',
      });
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', id);

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o projeto',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Sucesso',
        description: 'Projeto excluído com sucesso',
      });
      fetchProjects();
    }
  };

  const categoryLabels: Record<string, string> = {
    social: 'Social',
    cultural: 'Cultural',
    esportivo: 'Esportivo',
    educacional: 'Educacional',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Projetos</h1>
          <p className="text-muted-foreground mt-1">Gerencie os projetos da fundação</p>
        </div>
        <Link to="/admin/projetos/novo">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Projeto
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">Nenhum projeto encontrado</p>
            <Link to="/admin/projetos/novo">
              <Button>Criar primeiro projeto</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardContent className="flex items-center gap-4 p-4">
                {project.cover_image && (
                  <img
                    src={project.cover_image}
                    alt={project.title}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground truncate max-w-[300px]">{project.title}</h3>
                    <Badge variant={project.is_active ? 'default' : 'secondary'} className="shrink-0">
                      {project.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <Badge variant="outline" className="shrink-0">
                      {categoryLabels[project.category || 'social'] || project.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{project.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/projetos/${project.slug}`} target="_blank">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to={`/admin/projetos/${project.id}`}>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir projeto?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. O projeto será permanentemente excluído.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(project.id)}>
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsList;
