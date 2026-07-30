import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Loader2, 
  Save, 
  MapPin, 
  TriangleAlert,
  Facebook, 
  Target, 
  Eye, 
  Star, 
  Home, 
  History, 
  Plus, 
  Trash2, 
  Upload,
} from 'lucide-react';

interface SiteSettings {
  address: string;
  phone: string;
  contact_email: string;
  facebook_url: string;
  instagram_url: string;
  mission: string;
  vision: string;
  values: string;
  history_image: string;
  home_hero_image: string;
  home_mission_text: string;
  manual_stats_lives_transformed: string;
}

interface TimelineEvent {
  id?: string;
  year: string;
  title: string;
  description: string;
  icon: string;
}

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [settings, setSettings] = useState<SiteSettings>({
    address: '',
    phone: '',
    contact_email: '',
    facebook_url: '',
    instagram_url: '',
    mission: '',
    vision: '',
    values: '',
    history_image: '',
    home_hero_image: '',
    home_mission_text: '',
    manual_stats_lives_transformed: '',
  });

  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [newTimelineEvent, setNewTimelineEvent] = useState<TimelineEvent>({
    year: '',
    title: '',
    description: '',
    icon: 'Heart',
  });

  useEffect(() => {
    fetchSettings();
    fetchTimeline();
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
          mission: data.mission || '',
          vision: data.vision || '',
          values: data.values || '',
          history_image: data.history_image || '',
          home_hero_image: data.home_hero_image || '',
          home_mission_text: data.home_mission_text || '',
          manual_stats_lives_transformed: data.manual_stats_lives_transformed || '',
        });
      }
    } catch (error: unknown) {
      console.error('Erro ao carregar configurações:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeline = async () => {
    const { data, error } = await supabase
      .from('timeline_events')
      .select('*')
      .order('year', { ascending: true });
    
    if (!error && data) {
      setTimelineEvents(data);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSettings({
      ...settings,
      [e.target.id]: e.target.value,
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'home_hero_image' | 'history_image') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(field);
      const fileExt = file.name.split('.').pop();
      const fileName = `${field}-${Date.now()}.${fileExt}`;
      const filePath = `settings/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('media').getPublicUrl(filePath);
      setSettings(prev => ({ ...prev, [field]: data.publicUrl }));
      toast.success('Imagem enviada com sucesso!');
    } catch (error: unknown) {
      // Verifica de forma segura se o erro possui uma propriedade message
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error('Erro ao enviar imagem: ' + errorMessage);
    } finally {
      setUploading(null);
    }
  };

  const handleAddTimelineEvent = async () => {
    if (!newTimelineEvent.year || !newTimelineEvent.title) {
      toast.error('Ano e título são obrigatórios');
      return;
    }

    const { error } = await supabase
      .from('timeline_events')
      .insert([newTimelineEvent]);

    if (error) {
      toast.error('Erro ao adicionar evento: ' + error.message);
    } else {
      toast.success('Evento adicionado!');
      setNewTimelineEvent({ year: '', title: '', description: '', icon: 'Heart' });
      fetchTimeline();
    }
  };

  const handleDeleteTimelineEvent = async (id: string) => {
    const { error } = await supabase
      .from('timeline_events')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erro ao excluir evento');
    } else {
      toast.success('Evento excluído!');
      fetchTimeline();
    }
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
        <h1 className="text-3xl font-bold text-foreground">Configurações do Site</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie todo o conteúdo institucional e visual da Fundação
        </p>
      </div>

      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="institucional">Institucional</TabsTrigger>
          <TabsTrigger value="paginas">Páginas</TabsTrigger>
          <TabsTrigger value="timeline">Linha do Tempo</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSave}>
          {/* Aba Geral: Contato e Redes Sociais */}
          <TabsContent value="geral" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Informações de Contato
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço Completo</Label>
                    <Input id="address" value={settings.address} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone / WhatsApp (caso não tenha deixe em branco)</Label>
                    <Input id="phone" value={settings.phone?.trim()} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_email">E-mail de Contato</Label>
                    <Input id="contact_email" value={settings.contact_email} onChange={handleChange} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Facebook className="h-5 w-5 text-blue-600" />
                    Redes Sociais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="facebook_url">Facebook URL</Label>
                    <Input id="facebook_url" value={settings.facebook_url} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram_url">Instagram URL</Label>
                    <Input id="instagram_url" value={settings.instagram_url} onChange={handleChange} />
                  </div>
                </CardContent>
              </Card>
            </div>

          </TabsContent>

          {/* Aba Institucional: Missão, Visão, Valores */}
          <TabsContent value="institucional" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Identidade Organizacional</CardTitle>
                <CardDescription>Estes textos aparecem na página "Nossa História"</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mission" className="flex items-center gap-2"><Target className="h-4 w-4" /> Missão</Label>
                  <Textarea id="mission" value={settings.mission} onChange={handleChange} rows={3} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vision" className="flex items-center gap-2"><Eye className="h-4 w-4" /> Visão</Label>
                  <Textarea id="vision" value={settings.vision} onChange={handleChange} rows={3} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="values" className="flex items-center gap-2"><Star className="h-4 w-4" /> Valores</Label>
                  <Textarea id="values" value={settings.values} onChange={handleChange} rows={3} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Páginas: Home e História */}
          <TabsContent value="paginas" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Configurações da Home */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Home className="h-5 w-5" /> Página Inicial (Home)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Imagem de Capa (Hero)</Label>
                    {settings.home_hero_image && (
                      <img src={settings.home_hero_image} className="w-full h-32 object-cover rounded-md mb-2" alt="Hero Preview" />
                    )}
                    <div className="flex gap-2">
                      <Input type="file" onChange={(e) => handleImageUpload(e, 'home_hero_image')} accept="image/*" className="hidden" id="hero-upload" />
                      <Button type="button" variant="outline" className="w-full" onClick={() => document.getElementById('hero-upload')?.click()} disabled={uploading === 'home_hero_image'}>
                        {uploading === 'home_hero_image' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                        Mudar Imagem Hero
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="home_mission_text">Texto "Nossa Missão"</Label>
                    <Textarea id="home_mission_text" value={settings.home_mission_text} onChange={handleChange} rows={4} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manual_stats_lives_transformed">Vidas Transformadas (Estatística)</Label>
                    <Input id="manual_stats_lives_transformed" value={settings.manual_stats_lives_transformed} onChange={handleChange} placeholder="Ex: 5.000+" />
                  </div>
                </CardContent>
              </Card>

              {/* Configurações da História */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><History className="h-5 w-5" /> Página Nossa História</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Imagem da Sede / História</Label>
                    {settings.history_image && (
                      <img src={settings.history_image} className="w-full h-32 object-cover rounded-md mb-2" alt="History Preview" />
                    )}
                    <div className="flex gap-2">
                      <Input type="file" onChange={(e) => handleImageUpload(e, 'history_image')} accept="image/*" className="hidden" id="history-upload" />
                      <Button type="button" variant="outline" className="w-full" onClick={() => document.getElementById('history-upload')?.click()} disabled={uploading === 'history_image'}>
                        {uploading === 'history_image' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                        Mudar Imagem da História
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <div className="flex justify-end mt-6">
            <Button type="submit" size="lg" disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Salvar Alterações
            </Button>
          </div>
        </form>

        {/* Aba Timeline (Gerenciada separadamente do form principal por ser lista) */}
        <TabsContent value="timeline" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Linha do Tempo</CardTitle>
              <CardDescription>Adicione ou remova marcos históricos da fundação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Formulário Novo Evento */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/30">
                <div className="space-y-2">
                  <Label>Ano</Label>
                  <Input placeholder="Ex: 2010" value={newTimelineEvent.year} onChange={e => setNewTimelineEvent({...newTimelineEvent, year: e.target.value})} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Título</Label>
                  <Input placeholder="Título do marco" value={newTimelineEvent.title} onChange={e => setNewTimelineEvent({...newTimelineEvent, title: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Ícone</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newTimelineEvent.icon}
                    onChange={e => setNewTimelineEvent({...newTimelineEvent, icon: e.target.value})}
                  >
                    <option value="Heart">Coração (Social)</option>
                    <option value="Users">Pessoas (Comunidade)</option>
                    <option value="Award">Troféu (Conquista)</option>
                    <option value="Calendar">Calendário (Evento)</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-3">
                  <Label>Descrição</Label>
                  <Input placeholder="Breve descrição" value={newTimelineEvent.description} onChange={e => setNewTimelineEvent({...newTimelineEvent, description: e.target.value})} />
                </div>
                <div className="flex items-end">
                  <Button type="button" onClick={handleAddTimelineEvent} className="w-full gap-2">
                    <Plus className="h-4 w-4" /> Adicionar
                  </Button>
                </div>
              </div>

              {/* Lista de Eventos */}
              <div className="space-y-3">
                {timelineEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="font-bold text-primary w-12">{event.year}</div>
                      <div>
                        <div className="font-semibold">{event.title}</div>
                        <div className="text-sm text-muted-foreground">{event.description}</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => event.id && handleDeleteTimelineEvent(event.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;

