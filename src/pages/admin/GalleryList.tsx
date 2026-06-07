import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
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

interface GalleryImage {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  category: string;
  year: number | null;
  created_at: string;
}

const GalleryList = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchImages = async () => {
    const { data, error } = await supabase
      .from('gallery_images')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching images:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as imagens',
        variant: 'destructive',
      });
    } else {
      setImages(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('gallery_images').delete().eq('id', id);

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a imagem',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Sucesso',
        description: 'Imagem excluída com sucesso',
      });
      fetchImages();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Galeria</h1>
          <p className="text-muted-foreground mt-1">Gerencie as imagens da galeria</p>
        </div>
        <Link to="/admin/galeria/novo">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Imagem
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : images.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">Nenhuma imagem encontrada</p>
            <Link to="/admin/galeria/novo">
              <Button>Adicionar primeira imagem</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <Card key={image.id} className="overflow-hidden">
              <img
                src={image.image_url}
                alt={image.title}
                className="w-full h-48 object-cover"
              />
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{image.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">{image.category}</Badge>
                      {image.year && (
                        <span className="text-xs text-muted-foreground">{image.year}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Link to={`/admin/galeria/${image.id}`}>
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
                          <AlertDialogTitle>Excluir imagem?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. A imagem será permanentemente excluída.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(image.id)}>
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default GalleryList;
