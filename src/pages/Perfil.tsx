import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Upload, User, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { deleteFileFromStorage } from '@/lib/storage-utils';

const Perfil = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchProfile();
    }
  }, [user, authLoading, navigate]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setFullName(data.full_name || '');
        setAvatarUrl(data.avatar_url || '');
        setEmail(data.email || user?.email || '');
      }
    } catch (error: unknown) {
      console.error('Erro ao carregar perfil:', error);
      toast.error('Erro ao carregar dados do perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id);

      if (error) throw error;
      toast.success('Perfil atualizado com sucesso!');
    } catch (error: unknown) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;
      
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}/${Math.random()}.${fileExt}`;

      // Deleta avatar antigo se existir
      if (avatarUrl) {
        await deleteFileFromStorage(avatarUrl);
      }

      // Upload nova imagem
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Atualiza perfil com nova URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast.success('Foto de perfil atualizada!');
    } catch (error: unknown) {
      console.error('Erro no upload:', error);
      toast.error('Erro ao fazer upload da imagem');
    } finally {
      setUploading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/10 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-poppins font-bold">Meu Perfil</CardTitle>
            <CardDescription>
              Gerencie suas informações pessoais e foto de perfil.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="relative group">
                <div className="h-32 w-32 rounded-full bg-secondary flex items-center justify-center overflow-hidden border-4 border-background shadow-lg">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-16 w-16 text-muted-foreground" />
                  )}
                </div>
                <label 
                  htmlFor="avatar-upload" 
                  className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity"
                >
                  {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
                </label>
                <input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleAvatarUpload} 
                  disabled={uploading}
                />
              </div>
              <p className="text-sm text-muted-foreground">Clique na imagem para alterar sua foto</p>
            </div>

            {/* Form Section */}
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail (não alterável)</Label>
                <Input id="email" value={email} disabled className="bg-muted cursor-not-allowed" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input 
                  id="fullName" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  placeholder="Seu nome completo"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Salvar Alterações
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Perfil;
