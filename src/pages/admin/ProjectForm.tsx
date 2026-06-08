import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Upload, X, Plus } from 'lucide-react';
import { deleteFileFromStorage } from '@/lib/storage-utils';

const categories = [
  { value: 'social', label: 'Social' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'esportivo', label: 'Esportivo' },
  { value: 'educacional', label: 'Educacional' },
];

const ProjectForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // Basic fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [category, setCategory] = useState('social');
  const [isActive, setIsActive] = useState(true);

  // Extended fields
  const [impactPhrase, setImpactPhrase] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [location, setLocation] = useState('');
  const [objective, setObjective] = useState('');
  const [schedule, setSchedule] = useState('');
  const [aboutContent, setAboutContent] = useState('');
  const [howItWorks, setHowItWorks] = useState('');
  const [socialImpact, setSocialImpact] = useState('');
  const [activities, setActivities] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  useEffect(() => {
    if (isEditing) {
      fetchProject();
    }
  }, [id]);

  const fetchProject = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      toast({
        title: 'Erro',
        description: 'Projeto não encontrado',
        variant: 'destructive',
      });
      navigate('/admin/projetos');
    } else {
      setTitle(data.title);
      setSlug(data.slug);
      setDescription(data.description);
      setContent(data.content || '');
      setCoverImage(data.cover_image || '');
      setCategory(data.category || 'social');
      setIsActive(data.is_active ?? true);
      
      // Extended fields
      setImpactPhrase(data.impact_phrase || '');
      setTargetAudience(data.target_audience || '');
      setLocation(data.location || '');
      setObjective(data.objective || '');
      setSchedule(data.schedule || '');
      setAboutContent(data.about_content || '');
      setHowItWorks(data.how_it_works || '');
      setSocialImpact(data.social_impact || '');
      setActivities(data.activities || '');
      setGalleryImages(data.gallery_images || []);
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
    const filePath = `projects/${fileName}`;

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

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingGallery(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `projects/gallery/${fileName}`;

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
      setGalleryImages([...galleryImages, data.publicUrl]);
    }
    setUploadingGallery(false);
  };

  const removeGalleryImage = async (index: number) => {
    const imageUrl = galleryImages[index];
    if (imageUrl) {
      await deleteFileFromStorage(imageUrl);
    }
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !description) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    const projectData = {
      title,
      slug,
      description,
      content: content || null,
      cover_image: coverImage || null,
      category,
      is_active: isActive,
      impact_phrase: impactPhrase || null,
      target_audience: targetAudience || null,
      location: location || null,
      objective: objective || null,
      schedule: schedule || null,
      about_content: aboutContent || null,
      how_it_works: howItWorks || null,
      social_impact: socialImpact || null,
      activities: activities || null,
      gallery_images: galleryImages.length > 0 ? galleryImages : null,
    };

    if (isEditing) {
      const { error } = await supabase.from('projects').update(projectData).eq('id', id);

      if (error) {
        toast({
          title: 'Erro',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Sucesso',
          description: 'Projeto atualizado com sucesso',
        });
        navigate('/admin/projetos');
      }
    } else {
      const { error } = await supabase.from('projects').insert(projectData);

      if (error) {
        toast({
          title: 'Erro',
          description: error.message.includes('duplicate key')
            ? 'Já existe um projeto com este slug'
            : error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Sucesso',
          description: 'Projeto criado com sucesso',
        });
        navigate('/admin/projetos');
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
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/projetos')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isEditing ? 'Editar Projeto' : 'Novo Projeto'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditing ? 'Atualize as informações do projeto' : 'Adicione um novo projeto'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
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
                placeholder="Nome do projeto"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="url-do-projeto"
              />
              <p className="text-xs text-muted-foreground">
                URL: /projetos/{slug || 'url-do-projeto'}
              </p>
            </div>

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
              <Label htmlFor="description">Descrição *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve descrição do projeto"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="impactPhrase">Frase de Impacto</Label>
              <Input
                id="impactPhrase"
                value={impactPhrase}
                onChange={(e) => setImpactPhrase(e.target.value)}
                placeholder="Ex: Transformando vidas através da cultura"
              />
              <p className="text-xs text-muted-foreground">
                Aparece no hero da página do projeto
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetAudience">Público Atendido</Label>
                <Input
                  id="targetAudience"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="Ex: Crianças de 6 a 12 anos"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Localização</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: Sede da Fundação"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="objective">Objetivo</Label>
                <Input
                  id="objective"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="Ex: Promover inclusão social"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="schedule">Periodicidade</Label>
                <Input
                  id="schedule"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  placeholder="Ex: Terças e Quintas, 14h-17h"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Content Sections */}
        <Card>
          <CardHeader>
            <CardTitle>Conteúdo Detalhado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo Principal</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Texto geral sobre o projeto..."
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="aboutContent">Sobre o Projeto</Label>
              <Textarea
                id="aboutContent"
                value={aboutContent}
                onChange={(e) => setAboutContent(e.target.value)}
                placeholder="Descrição detalhada sobre o projeto..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="howItWorks">Como Funciona</Label>
              <Textarea
                id="howItWorks"
                value={howItWorks}
                onChange={(e) => setHowItWorks(e.target.value)}
                placeholder="Explique como o projeto funciona..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="socialImpact">Impacto Social</Label>
              <Textarea
                id="socialImpact"
                value={socialImpact}
                onChange={(e) => setSocialImpact(e.target.value)}
                placeholder="Descreva o impacto social do projeto..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="activities">Atividades Realizadas</Label>
              <Textarea
                id="activities"
                value={activities}
                onChange={(e) => setActivities(e.target.value)}
                placeholder="Liste as atividades realizadas..."
                rows={4}
              />
            </div>
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

        {/* Gallery Images */}
        <Card>
          <CardHeader>
            <CardTitle>Galeria de Imagens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {galleryImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {galleryImages.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeGalleryImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center gap-4">
              <Label htmlFor="gallery-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-secondary transition-colors">
                  {uploadingGallery ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  <span>{uploadingGallery ? 'Enviando...' : 'Adicionar Imagem'}</span>
                </div>
                <Input
                  id="gallery-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleGalleryUpload}
                  disabled={uploadingGallery}
                />
              </Label>
              <p className="text-sm text-muted-foreground">
                {galleryImages.length} imagem(ns) na galeria
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="active">Projeto Ativo</Label>
                <p className="text-sm text-muted-foreground">
                  Exibir o projeto no site
                </p>
              </div>
              <Switch
                id="active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
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
          <Button type="button" variant="outline" onClick={() => navigate('/admin/projetos')}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;