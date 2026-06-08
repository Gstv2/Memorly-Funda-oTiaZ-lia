import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Save, MapPin, Phone, Mail, Facebook, Instagram } from 'lucide-react';

interface SiteSettings {
  address: string;
  phone: string;
  contact_email: string;
  facebook_url: string;
  instagram_url: string;
}

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>({
    address: '',
    phone: '',
    contact_email: '',
    facebook_url: '',
    instagram_url: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 'config')
        .single();

      if (error) throw error;
      if (data) {
        setSettings({
          address: data.address || '',
          phone: data.phone || '',
          contact_email: data.contact_email || '',
          facebook_url: data.facebook_url || '',
          instagram_url: data.instagram_url || '',
        });
      }
    } catch (error: unknown) {
      console.error('Erro ao carregar configurações:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const { error } = await supabase
        .from('site_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 'config');

      if (error) throw error;
      toast.success('Configurações salvas com sucesso!');
    } catch (error: unknown) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({
      ...settings,
      [e.target.id]: e.target.value,
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie as informações de contato e redes sociais da Fundação
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informações de Contato */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Informações de Contato
              </CardTitle>
              <CardDescription>
                Dados exibidos na página de Contato e rodapé do site
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Endereço Completo</Label>
                <Input 
                  id="address" 
                  value={settings.address} 
                  onChange={handleChange} 
                  placeholder="Rua, Número, Bairro, Cidade, UF"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone / WhatsApp</Label>
                <Input 
                  id="phone" 
                  value={settings.phone} 
                  onChange={handleChange} 
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_email">E-mail de Contato (Exibição)</Label>
                <Input 
                  id="contact_email" 
                  type="email" 
                  value={settings.contact_email} 
                  onChange={handleChange} 
                  placeholder="contato@fundacao.org"
                />
              </div>
            </CardContent>
          </Card>

          {/* Redes Sociais */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Facebook className="h-5 w-5 text-blue-600" />
                Redes Sociais
              </CardTitle>
              <CardDescription>
                Links para as redes oficiais da Fundação
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="facebook_url" className="flex items-center gap-2">
                  <Facebook className="h-4 w-4" /> Facebook URL
                </Label>
                <Input 
                  id="facebook_url" 
                  value={settings.facebook_url} 
                  onChange={handleChange} 
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram_url" className="flex items-center gap-2">
                  <Instagram className="h-4 w-4" /> Instagram URL
                </Label>
                <Input 
                  id="instagram_url" 
                  value={settings.instagram_url} 
                  onChange={handleChange} 
                  placeholder="https://instagram.com/..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar Todas as Configurações
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
