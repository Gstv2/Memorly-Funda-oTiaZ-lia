import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Eye, Loader2 } from 'lucide-react';
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

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  published: boolean | null;
  created_at: string;
  cover_image: string | null;
}

const PostsList = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, published, created_at, cover_image')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os posts',
        variant: 'destructive',
      });
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id: string, coverImage: string | null) => {
    // Se houver imagem de capa, deletar do storage
    if (coverImage) {
      await deleteFileFromStorage(coverImage);
    }

    const { error } = await supabase.from('blog_posts').delete().eq('id', id);

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o post',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Sucesso',
        description: 'Post excluído com sucesso',
      });
      fetchPosts();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Blog Posts</h1>
          <p className="text-muted-foreground mt-1">Gerencie as postagens do blog</p>
        </div>
        <Link to="/admin/posts/novo">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Post
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">Nenhum post encontrado</p>
            <Link to="/admin/posts/novo">
              <Button>Criar primeiro post</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="flex items-center gap-4 p-4">
                {post.cover_image && (
                  <img
                    src={post.cover_image}
                    alt={post.title}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground truncate max-w-[300px]">{post.title}</h3>
                    <Badge variant={post.published ? 'default' : 'secondary'} className="shrink-0">
                      {post.published ? 'Publicado' : 'Rascunho'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{post.excerpt}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(post.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/blog/${post.slug}`} target="_blank">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to={`/admin/posts/${post.id}`}>
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
                        <AlertDialogTitle>Excluir post?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. O post será permanentemente excluído.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(post.id, post.cover_image)}>
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

export default PostsList;
