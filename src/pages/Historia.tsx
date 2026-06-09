import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Calendar, Award, Users, Heart, Mail, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import SEO from "@/components/SEO";

interface Volunteer {
  id: string;
  name: string;
  role: string;
  photo_url: string | null;
  contact: string | null;
  is_active: boolean;
}
interface SiteSettings {
  history_image?: string;
  mission?: string;
  vision?: string;
  values?: string;
}

interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  description: string;
  icon: string;
}

const sedeImageUrl = supabase.storage.from('media').getPublicUrl('corporate/sede-ftz.jpg').data.publicUrl;

const Historia = () => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [volunteersRes, settingsRes, timelineRes] = await Promise.all([
        supabase.from('volunteers').select('*').order('is_active', { ascending: false }).order('name'),
        supabase.from('site_settings').select('*').eq('id', 'config').single(),
        supabase.from('timeline_events').select('*').order('year', { ascending: true })
      ]);
      
      if (volunteersRes.data) setVolunteers(volunteersRes.data);
      if (settingsRes.data) setSettings(settingsRes.data);
      if (timelineRes.data) setTimelineEvents(timelineRes.data);
      setLoading(false);
    };

    fetchData();
  }, []);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Heart': return Heart;
      case 'Users': return Users;
      case 'Award': return Award;
      case 'Calendar': return Calendar;
      default: return Heart;
    }
  };

  return (
    <div className="min-h-screen">
      <SEO 
        title="Nossa História" 
        description="Conheça a trajetória da Fundação Tia Zélia e seu compromisso com a comunidade de Piripiri."
      />
      {/* Header */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
            <h1 className="font-poppins font-bold text-5xl md:text-6xl text-foreground mb-6">
              Nossa História
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Uma jornada de dedicação, amor e transformação que começou há mais de uma década 
              e continua mudando vidas todos os dias.
            </p>
          </div>
        </div>
      </section>

      {/* Imagem da Sede */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl animate-scale-in">
              <img
                src={settings?.history_image || sedeImageUrl}
                alt="Sede da Fundação Tia Zélia"
                className="w-full h-[400px] md:h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                <div className="p-8">
                  <h2 className="font-poppins font-bold text-3xl text-white mb-2">
                    Nossa Sede
                  </h2>
                  <p className="text-white/90 text-lg">
                    Um espaço dedicado ao desenvolvimento e bem-estar da comunidade
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Missão, Visão e Valores */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="p-8 text-center hover:shadow-lg transition-all duration-300 border-border/50">
              <div className="w-16 h-16 rounded-full bg-primary mx-auto mb-6 flex items-center justify-center">
                <Heart className="text-primary-foreground" size={32} />
              </div>
              <h3 className="font-poppins font-bold text-2xl mb-4 text-foreground">Missão</h3>
              <p className="text-muted-foreground leading-relaxed">
                {settings?.mission || "Promover a inclusão social e o desenvolvimento integral de crianças, jovens e adultos através da cultura, educação e esporte."}
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-lg transition-all duration-300 border-border/50">
              <div className="w-16 h-16 rounded-full bg-primary mx-auto mb-6 flex items-center justify-center">
                <Award className="text-primary-foreground" size={32} />
              </div>
              <h3 className="font-poppins font-bold text-2xl mb-4 text-foreground">Visão</h3>
              <p className="text-muted-foreground leading-relaxed">
                {settings?.vision || "Ser referência em transformação social, reconhecida pela excelência de nossos projetos e pelo impacto positivo na comunidade."}
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-lg transition-all duration-300 border-border/50">
              <div className="w-16 h-16 rounded-full bg-primary mx-auto mb-6 flex items-center justify-center">
                <Users className="text-primary-foreground" size={32} />
              </div>
              <h3 className="font-poppins font-bold text-2xl mb-4 text-foreground">Valores</h3>
              <p className="text-muted-foreground leading-relaxed">
                {settings?.values || "Solidariedade, respeito, compromisso social, valorização da cultura brasileira e desenvolvimento da cidadania."}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-poppins font-bold text-4xl text-foreground mb-4">
                Linha do Tempo
              </h2>
              <p className="text-lg text-muted-foreground">
                Os momentos marcantes da nossa trajetória
              </p>
            </div>

            <div className="space-y-8">
              {timelineEvents.map((item, index) => {
                const Icon = getIcon(item.icon);
                return (
                  <div
                    key={item.id || index}
                    className="flex gap-6 group animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Year indicator */}
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-warm group-hover:scale-110 transition-transform">
                        <Icon size={24} />
                      </div>
                      <div className="w-0.5 bg-border flex-grow mt-4 hidden md:block" />
                    </div>

                    {/* Content */}
                    <Card className="flex-grow p-6 mb-8 hover:shadow-lg transition-all duration-300 border-border/50">
                      <div className="flex items-center gap-3 mb-3">
                        <Calendar size={18} className="text-primary" />
                        <span className="font-bold text-primary text-lg">{item.year}</span>
                      </div>
                      <h3 className="font-poppins font-bold text-xl text-foreground mb-2">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Voluntários */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-poppins font-bold text-4xl text-foreground mb-4">
                Nossos Voluntários
              </h2>
              <p className="text-lg text-muted-foreground">
                Pessoas que dedicaram seu tempo e amor à nossa causa
              </p>
            </div>

            {/* Voluntários Ativos */}
            {volunteers.filter(v => v.is_active).length > 0 && (
              <div className="mb-12">
                <h3 className="font-poppins font-semibold text-2xl text-foreground mb-6 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  Voluntários Ativos
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {volunteers.filter(v => v.is_active).map((volunteer, index) => (
                    <Card 
                      key={volunteer.id} 
                      className="overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50 animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* Foto */}
                      <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        {volunteer.photo_url ? (
                          <img 
                            src={volunteer.photo_url} 
                            alt={volunteer.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                            <User className="w-12 h-12 text-primary" />
                          </div>
                        )}
                      </div>
                      
                      {/* Info */}
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-semibold text-foreground text-lg leading-tight">
                            {volunteer.name}
                          </h4>
                          <Badge variant="default" className="shrink-0 bg-green-500 hover:bg-green-600">
                            Ativo
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm mb-3">
                          {volunteer.role}
                        </p>
                        {volunteer.contact && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="w-4 h-4 text-primary" />
                            <a 
                              href={`mailto:${volunteer.contact}`}
                              className="hover:text-primary transition-colors truncate"
                            >
                              {volunteer.contact}
                            </a>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Ex-Voluntários */}
            {volunteers.filter(v => !v.is_active).length > 0 && (
              <div>
                <h3 className="font-poppins font-semibold text-2xl text-foreground mb-6 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-muted-foreground"></div>
                  Voluntários que já passaram por aqui
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {volunteers.filter(v => !v.is_active).map((volunteer, index) => (
                    <Card 
                      key={volunteer.id} 
                      className="overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50 animate-fade-in opacity-80"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* Foto */}
                      <div className="h-48 bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center grayscale">
                        {volunteer.photo_url ? (
                          <img 
                            src={volunteer.photo_url} 
                            alt={volunteer.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                            <User className="w-12 h-12 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      
                      {/* Info */}
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-semibold text-foreground text-lg leading-tight">
                            {volunteer.name}
                          </h4>
                          <Badge variant="secondary" className="shrink-0">
                            Inativo
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm mb-3">
                          {volunteer.role}
                        </p>
                        {volunteer.contact && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="w-4 h-4" />
                            <a 
                              href={`mailto:${volunteer.contact}`}
                              className="hover:text-primary transition-colors truncate"
                            >
                              {volunteer.contact}
                            </a>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Carregando voluntários...</p>
              </div>
            )}

            {!loading && volunteers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhum voluntário cadastrado ainda.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Historia;
