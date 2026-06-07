import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Upload, User } from 'lucide-react';

const VolunteerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [contact, setContact] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (isEditing) {
      fetchVolunteer();
    }
  }, [id]);

  const fetchVolunteer = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('volunteers')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      toast({
        title: 'Erro',
        description: 'Voluntário não encontrado',
        variant: 'destructive',
      });
      navigate('/admin/voluntarios');
    } else {
      setName(data.name);
      setRole(data.role);
      setPhotoUrl(data.photo_url || '');
      setContact(data.contact || '');
      setIsActive(data.is_active);
    }
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `volunteers/${fileName}`;

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
      setPhotoUrl(data.publicUrl);
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    const volunteerData = {
      name,
      role,
      photo_url: photoUrl || null,
      contact: contact || null,
      is_active: isActive,
    };

    if (isEditing) {
      const { error } = await supabase.from('volunteers').update(volunteerData).eq('id', id);

      if (error) {
        toast({
          title: 'Erro',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Sucesso',
          description: 'Voluntário atualizado com sucesso',
        });
        navigate('/admin/voluntarios');
      }
    } else {
      const { error } = await supabase.from('volunteers').insert(volunteerData);

      if (error) {
        toast({
          title: 'Erro',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Sucesso',
          description: 'Voluntário adicionado com sucesso',
        });
        navigate('/admin/voluntarios');
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
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/voluntarios')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isEditing ? 'Editar Voluntário' : 'Novo Voluntário'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditing ? 'Atualize as informações do voluntário' : 'Adicione um novo voluntário'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Voluntário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Função *</Label>
              <Input
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Ex: Instrutor de Capoeira"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact">Contato (email)</Label>
              <Input
                id="contact"
                type="email"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is-active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="is-active">
                {isActive ? 'Voluntário ativo' : 'Voluntário inativo'}
              </Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Foto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-6">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Preview"
                  className="w-24 h-24 object-cover rounded-full"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 space-y-2">
                <Label htmlFor="photo-upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-secondary transition-colors w-fit">
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    <span>{uploading ? 'Enviando...' : 'Upload Foto'}</span>
                  </div>
                  <Input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </Label>
                <p className="text-xs text-muted-foreground">ou insira a URL abaixo</p>
                <Input
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="URL da foto"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/voluntarios')}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {isEditing ? 'Salvar Alterações' : 'Adicionar Voluntário'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default VolunteerForm;
