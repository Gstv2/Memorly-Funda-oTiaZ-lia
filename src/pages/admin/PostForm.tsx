import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Upload } from 'lucide-react';
import PostTypeSelector from '@/components/admin/PostTypeSelector';
import StructuredContentEditor, {
  StructuredContent,
} from '@/components/admin/StructuredContentEditor';
import ActivityFields from '@/components/admin/ActivityFields';

const defaultStructuredContent: StructuredContent = {
  introduction: '',
  about: '',
  benefits: '',
  howToParticipate: '',
  additionalInfo: '',
};

const PostForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Basic fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [location, setLocation] = useState('Rua Pires Rebelo, 373, Piripiri–PI');
  const [published, setPublished] = useState(false);

  // New structured fields
  const [postType, setPostType] = useState('noticia');
  const [structuredContent, setStructuredContent] = useState<StructuredContent>(
    defaultStructuredContent
  );

  // Activity-specific fields
  const [scheduleTimes, setScheduleTimes] = useState('');
  const [weekdays, setWeekdays] = useState<string[]>([]);
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [availableSpots, setAvailableSpots] = useState('');
  const [howToRegister, setHowToRegister] = useState('');

  useEffect(() => {
    if (isEditing) {
      fetchPost();
    }
  }, [id]);

  const fetchPost = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      toast({
        title: 'Erro',
        description: 'Post não encontrado',
        variant: 'destructive',
      });
      navigate('/admin/posts');
    } else {
      setTitle(data.title);
      setSlug(data.slug);
      setExcerpt(data.excerpt || '');
      setCoverImage(data.cover_image || '');
      setLocation(data.location || 'Rua Pires Rebelo, 373, Piripiri–PI');
      setPublished(data.published || false);
      setPostType(data.post_type || 'noticia');

      // Parse structured content
      if (data.structured_content) {
        const parsed = data.structured_content as unknown as StructuredContent;
        setStructuredContent({
          introduction: parsed.introduction || '',
          about: parsed.about || '',
          benefits: parsed.benefits || '',
          howToParticipate: parsed.howToParticipate || '',
          additionalInfo: parsed.additionalInfo || '',
        });
      } else if (data.content) {
        // Migrate old content to introduction
        setStructuredContent({
          ...defaultStructuredContent,
          introduction: data.content,
        });
      }

      // Activity fields
      setScheduleTimes(data.schedule_times || '');
      setWeekdays(data.weekdays || []);
      setMinAge(data.min_age?.toString() || '');
      setMaxAge(data.max_age?.toString() || '');
      setAvailableSpots(data.available_spots?.toString() || '');
      setHowToRegister(data.how_to_register || '');
    }
    setLoading(false);
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!isEditing) {
      setSlug(generateSlug(value));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `blog/${fileName}`;

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
      setCoverImage(data.publicUrl);
    }
    setUploading(false);
  };

  // Generate plain text content from structured content for backwards compatibility
  const generatePlainContent = (): string => {
    const parts: string[] = [];
    if (structuredContent.introduction) {
      parts.push(structuredContent.introduction);
    }
    if (structuredContent.about) {
      parts.push(structuredContent.about);
    }
    if (structuredContent.benefits) {
      parts.push(structuredContent.benefits);
    }
    if (structuredContent.howToParticipate) {
      parts.push(structuredContent.howToParticipate);
    }
    if (structuredContent.additionalInfo) {
      parts.push(structuredContent.additionalInfo);
    }
    return parts.join('\n\n');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !slug || !structuredContent.introduction) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios (título, slug e introdução)',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    const postData: Record<string, unknown> = {
      title,
      slug,
      excerpt,
      content: generatePlainContent(),
      cover_image: coverImage || null,
      location: location || null,
      published,
      published_at: published ? new Date().toISOString() : null,
      author_id: user?.id,
      post_type: postType,
      structured_content: structuredContent,
      schedule_times: scheduleTimes || null,
      weekdays: weekdays.length > 0 ? weekdays : null,
      min_age: minAge ? parseInt(minAge) : null,
      max_age: maxAge ? parseInt(maxAge) : null,
      available_spots: availableSpots ? parseInt(availableSpots) : null,
      how_to_register: howToRegister || null,
    };

    if (isEditing) {
      const { error } = await supabase.from('blog_posts').update(postData as never).eq('id', id);

      if (error) {
        toast({
          title: 'Erro',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Sucesso',
          description: 'Post atualizado com sucesso',
        });
        navigate('/admin/posts');
      }
    } else {
      const { error } = await supabase.from('blog_posts').insert(postData as never);

      if (error) {
        toast({
          title: 'Erro',
          description: error.message.includes('duplicate key')
            ? 'Já existe um post com este slug'
            : error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Sucesso',
          description: 'Post criado com sucesso',
        });
        navigate('/admin/posts');
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
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/posts')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isEditing ? 'Editar Post' : 'Novo Post'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditing ? 'Atualize as informações do post' : 'Crie uma nova postagem para o blog'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Post Type Selection */}
        <PostTypeSelector value={postType} onChange={setPostType} />

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Título do post"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="url-do-post"
              />
              <p className="text-xs text-muted-foreground">
                URL: /blog/{slug || 'url-do-post'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Resumo</Label>
              <Textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Breve descrição do post para listagens e SEO"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Localização</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Rua Pires Rebelo, 373, Piripiri–PI"
              />
            </div>
          </CardContent>
        </Card>

        {/* Activity-specific fields */}
        {postType === 'atividade' && (
          <ActivityFields
            scheduleTimes={scheduleTimes}
            setScheduleTimes={setScheduleTimes}
            weekdays={weekdays}
            setWeekdays={setWeekdays}
            minAge={minAge}
            setMinAge={setMinAge}
            maxAge={maxAge}
            setMaxAge={setMaxAge}
            availableSpots={availableSpots}
            setAvailableSpots={setAvailableSpots}
            howToRegister={howToRegister}
            setHowToRegister={setHowToRegister}
          />
        )}

        {/* Structured Content Editor */}
        <Card>
          <CardHeader>
            <CardTitle>Conteúdo</CardTitle>
          </CardHeader>
          <CardContent>
            <StructuredContentEditor
              value={structuredContent}
              onChange={setStructuredContent}
              postType={postType}
            />
          </CardContent>
        </Card>

        {/* Cover Image */}
        <Card>
          <CardHeader>
            <CardTitle>Imagem de Capa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {coverImage && (
              <img
                src={coverImage}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
            )}
            <div className="flex items-center gap-4">
              <Label htmlFor="cover-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-secondary transition-colors">
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  <span>{uploading ? 'Enviando...' : 'Upload Imagem'}</span>
                </div>
                <Input
                  id="cover-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </Label>
              <span className="text-sm text-muted-foreground">ou</span>
              <Input
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="URL da imagem"
                className="flex-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Publish Toggle */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="published">Publicar</Label>
                <p className="text-sm text-muted-foreground">
                  Tornar o post visível no site
                </p>
              </div>
              <Switch
                id="published"
                checked={published}
                onCheckedChange={setPublished}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
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
          <Button type="button" variant="outline" onClick={() => navigate('/admin/posts')}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PostForm;
