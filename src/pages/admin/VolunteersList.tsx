import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Loader2, User } from 'lucide-react';
import { deleteFileFromStorage } from '@/lib/storage-utils';
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

interface Volunteer {
  id: string;
  name: string;
  role: string;
  photo_url: string | null;
  contact: string | null;
  is_active: boolean;
  created_at: string;
}

const VolunteersList = () => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchVolunteers = async () => {
    const { data, error } = await supabase
      .from('volunteers')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching volunteers:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os voluntários',
        variant: 'destructive',
      });
    } else {
      setVolunteers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const handleDelete = async (id: string, photoUrl: string | null) => {
    // Deletar foto do voluntário se existir
    if (photoUrl) {
      await deleteFileFromStorage(photoUrl);
    }

    const { error } = await supabase.from('volunteers').delete().eq('id', id);

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o voluntário',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Sucesso',
        description: 'Voluntário excluído com sucesso',
      });
      fetchVolunteers();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Voluntários</h1>
          <p className="text-muted-foreground mt-1">Gerencie os voluntários da fundação</p>
        </div>
        <Link to="/admin/voluntarios/novo">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Voluntário
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : volunteers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">Nenhum voluntário encontrado</p>
            <Link to="/admin/voluntarios/novo">
              <Button>Adicionar primeiro voluntário</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {volunteers.map((volunteer) => (
            <Card key={volunteer.id}>
              <CardContent className="flex items-center gap-4 p-4">
                {volunteer.photo_url ? (
                  <img
                    src={volunteer.photo_url}
                    alt={volunteer.name}
                    className="w-16 h-16 object-cover rounded-full"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{volunteer.name}</h3>
                    <Badge variant={volunteer.is_active ? 'default' : 'secondary'}>
                      {volunteer.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{volunteer.role}</p>
                  {volunteer.contact && (
                    <p className="text-xs text-muted-foreground mt-1">{volunteer.contact}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/admin/voluntarios/${volunteer.id}`}>
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
                        <AlertDialogTitle>Excluir voluntário?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. O voluntário será permanentemente excluído.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(volunteer.id, volunteer.photo_url)}>
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

export default VolunteersList;
