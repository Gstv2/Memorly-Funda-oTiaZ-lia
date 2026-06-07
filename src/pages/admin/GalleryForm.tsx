import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Upload } from 'lucide-react';

const categories = [
  { value: 'capoeira', label: 'Capoeira' },
  { value: 'educacao', label: 'Educação' },
  { value: 'cultura', label: 'Cultura' },
  { value: 'eventos', label: 'Eventos' },
  { value: 'comunidade', label: 'Comunidade' },
  { value: 'geral', label: 'Geral' },
];

const GalleryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('geral');
  const [year, setYear] = useState('');

  useEffect(() => {
    if (isEditing) {
      fetchImage();
    }
  }, [id]);

  const fetchImage = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('gallery_images')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      toast({
        title: 'Erro',
        description: 'Imagem não encontrada',
        variant: 'destructive',
      });
      navigate('/admin/galeria');
    } else {
      setTitle(data.title);
      setDescription(data.description || '');
      setImageUrl(data.image_url);
      setCategory(data.category || 'geral');
      setYear(data.year?.toString() || '');
    }
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `gallery/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file);

    if (uploadError) {
      toast({
        title: 'Erro',
        description: 'Não foi possível fazer upload da imagem: ' + uploadError.message,
        variant: 'destructive',
      });
    } else {
      const { data } = supabase.storage.from('media').getPublicUrl(filePath);
      setImageUrl(data.publicUrl);
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    const imageData = {
      title,
      description: description || null,
      image_url: imageUrl,
      category,
      year: year ? parseInt(year) : null,
      uploaded_by: user?.id,
    };

    if (isEditing) {
      const { error } = await supabase.from('gallery_images').update(imageData).eq('id', id);

      if (error) {
        toast({
          title: 'Erro',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Sucesso',
          description: 'Imagem atualizada com sucesso',
        });
        navigate('/admin/galeria');
      }
    } else {
      const { error } = await supabase.from('gallery_images').insert(imageData);

      if (error) {
        toast({
          title: 'Erro',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Sucesso',
          description: 'Imagem adicionada com sucesso',
        });
        navigate('/admin/galeria');
      }
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/galeria')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isEditing ? 'Editar Imagem' : 'Nova Imagem'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditing ? 'Atualize as informações da imagem' : 'Adicione uma nova imagem à galeria'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Imagem *</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-64 object-cover rounded-lg"
              />
            )}
            <div className="flex items-center gap-4">
              <Label htmlFor="image-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-secondary transition-colors">
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  <span>{uploading ? 'Enviando...' : 'Upload Imagem'}</span>
                </div>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </Label>
              <span className="text-sm text-muted-foreground">ou</span>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="URL da imagem"
                className="flex-1"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título da imagem"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição da imagem"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Ano</Label>
                <Input
                  id="year"
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="2024"
                  min="1900"
                  max="2100"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar'
            )}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/admin/galeria')}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default GalleryForm;
