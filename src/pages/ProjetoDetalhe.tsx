import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Loader2, 
  FolderOpen, 
  Users, 
  MapPin, 
  Target, 
  Calendar,
  Share2,
  Copy,
  Check,
  MessageCircle,
  Facebook,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string | null;
  cover_image: string | null;
  category: string | null;
  is_active: boolean | null;
  created_at: string;
  impact_phrase: string | null;
  target_audience: string | null;
  location: string | null;
  objective: string | null;
  schedule: string | null;
  about_content: string | null;
  how_it_works: string | null;
  social_impact: string | null;
  activities: string | null;
  gallery_images: string[] | null;
}

const categoryColors: Record<string, string> = {
  social: "bg-accent text-accent-foreground",
  cultural: "bg-secondary text-secondary-foreground",
  esportivo: "bg-primary text-primary-foreground",
  educacional: "bg-muted text-muted-foreground",
};

const categoryLabels: Record<string, string> = {
  social: "Social",
  cultural: "Cultural",
  esportivo: "Esportivo",
  educacional: "Educacional",
};

const ProjetoDetalhe = () => {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isShareVisible, setIsShareVisible] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      if (!slug) return;
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (!error && data) {
        setProject(data);
      }
      setLoading(false);
    };

    fetchProject();
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsShareVisible(scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = `Confira o projeto "${project?.title}" da Fundação Tia Zélia: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-foreground">Projeto não encontrado</h1>
        <Link to="/projetos">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar aos Projetos
          </Button>
        </Link>
      </div>
    );
  }

  const infoBlocks = [
    { icon: Users, label: "Público Atendido", value: project.target_audience },
    { icon: MapPin, label: "Local", value: project.location },
    { icon: Target, label: "Objetivo", value: project.objective },
    { icon: Calendar, label: "Periodicidade", value: project.schedule },
  ].filter(block => block.value);

  return (
    <div className="min-h-screen bg-background">
      {/* Floating Share Buttons */}
      <div 
        className={`fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2 transition-all duration-300 ${
          isShareVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 pointer-events-none'
        }`}
      >
        <Button
          size="icon"
          variant="secondary"
          className="rounded-full shadow-lg hover:shadow-xl transition-shadow bg-green-500 hover:bg-green-600 text-white"
          onClick={handleShareWhatsApp}
          title="Compartilhar no WhatsApp"
        >
          <MessageCircle className="h-5 w-5" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="rounded-full shadow-lg hover:shadow-xl transition-shadow bg-blue-600 hover:bg-blue-700 text-white"
          onClick={handleShareFacebook}
          title="Compartilhar no Facebook"
        >
          <Facebook className="h-5 w-5" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="rounded-full shadow-lg hover:shadow-xl transition-shadow bg-background"
          onClick={handleCopyLink}
          title="Copiar link"
        >
          {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
        </Button>
      </div>

      {/* Simplified Hero */}
      <section className="relative h-[60vh] min-h-[450px] max-h-[600px]">
        {project.cover_image ? (
          <img
            src={project.cover_image}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <FolderOpen className="h-24 w-24 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
        
        {/* Back button */}
        <div className="absolute top-6 left-0 right-0">
          <div className="container mx-auto px-4">
            <Link to="/projetos">
              <Button variant="ghost" className="text-white hover:bg-white/20 backdrop-blur-sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div className="container mx-auto">
            <div className="max-w-3xl">
              {project.category && (
                <Badge className={`mb-4 ${categoryColors[project.category] || categoryColors.social}`}>
                  {categoryLabels[project.category] || project.category}
                </Badge>
              )}
              <h1 className="font-poppins font-bold text-3xl md:text-4xl lg:text-5xl text-white mb-4">
                {project.title}
              </h1>
              <p className="text-lg md:text-xl text-white/90 font-medium">
                {project.impact_phrase || project.description}
              </p>

              {/* Inline Share Buttons */}
              <div className="flex items-center gap-3 mt-6">
                <span className="text-white/70 text-sm flex items-center gap-1">
                  <Share2 className="h-4 w-4" />
                  Compartilhar:
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20 backdrop-blur-sm"
                  onClick={handleShareWhatsApp}
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  WhatsApp
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20 backdrop-blur-sm"
                  onClick={handleShareFacebook}
                >
                  <Facebook className="h-4 w-4 mr-1" />
                  Facebook
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20 backdrop-blur-sm"
                  onClick={handleCopyLink}
                >
                  {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                  Copiar Link
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Info Section */}
      {infoBlocks.length > 0 && (
        <section className="py-8 bg-muted/30 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {infoBlocks.map((block, index) => (
                <Card key={index} className="p-5 flex items-start gap-4 bg-background border-border/50">
                  <div className="p-3 rounded-lg bg-primary/10 shrink-0">
                    <block.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium mb-1">{block.label}</p>
                    <p className="text-foreground font-semibold">{block.value}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Content Sections */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-16">
          
          {/* Sobre o Projeto */}
          <section className="animate-fade-in">
            <h2 className="font-poppins font-bold text-2xl md:text-3xl text-foreground mb-6 flex items-center gap-3">
              <div className="w-1 h-8 bg-primary rounded-full" />
              Sobre o Projeto
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed">
              {project.about_content ? (
                <div dangerouslySetInnerHTML={{ __html: project.about_content }} />
              ) : (
                <p>{project.description}</p>
              )}
            </div>
          </section>

          {/* Gallery Preview - First Row */}
          {project.gallery_images && project.gallery_images.length > 0 && (
            <section className="animate-fade-in">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {project.gallery_images.slice(0, 3).map((img, index) => (
                  <div 
                    key={index}
                    className="aspect-[4/3] rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
                  >
                    <img 
                      src={img} 
                      alt={`${project.title} - Imagem ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Como Funciona */}
          {project.how_it_works && (
            <section className="animate-fade-in">
              <h2 className="font-poppins font-bold text-2xl md:text-3xl text-foreground mb-6 flex items-center gap-3">
                <div className="w-1 h-8 bg-secondary rounded-full" />
                Como Funciona
              </h2>
              <div 
                className="prose prose-lg max-w-none text-muted-foreground leading-relaxed"
                dangerouslySetInnerHTML={{ __html: project.how_it_works }}
              />
            </section>
          )}

          {/* Impacto Social */}
          {project.social_impact && (
            <section className="animate-fade-in">
              <h2 className="font-poppins font-bold text-2xl md:text-3xl text-foreground mb-6 flex items-center gap-3">
                <div className="w-1 h-8 bg-accent rounded-full" />
                Impacto Social
              </h2>
              <Card className="p-6 md:p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <div 
                  className="prose prose-lg max-w-none text-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: project.social_impact }}
                />
              </Card>
            </section>
          )}

          {/* Gallery Preview - Second Row */}
          {project.gallery_images && project.gallery_images.length > 3 && (
            <section className="animate-fade-in">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {project.gallery_images.slice(3, 7).map((img, index) => (
                  <div 
                    key={index}
                    className="aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
                  >
                    <img 
                      src={img} 
                      alt={`${project.title} - Imagem ${index + 4}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Atividades Realizadas */}
          {project.activities && (
            <section className="animate-fade-in">
              <h2 className="font-poppins font-bold text-2xl md:text-3xl text-foreground mb-6 flex items-center gap-3">
                <div className="w-1 h-8 bg-muted-foreground rounded-full" />
                Atividades Realizadas
              </h2>
              <div 
                className="prose prose-lg max-w-none text-muted-foreground leading-relaxed"
                dangerouslySetInnerHTML={{ __html: project.activities }}
              />
            </section>
          )}

          {/* Legacy Content (for existing projects) */}
          {project.content && !project.about_content && !project.how_it_works && (
            <section className="animate-fade-in">
              <div 
                className="prose prose-lg max-w-none text-muted-foreground
                  prose-headings:font-poppins prose-headings:text-foreground
                  prose-p:leading-relaxed
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-foreground
                  prose-ul:text-muted-foreground prose-ol:text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: project.content }}
              />
            </section>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-primary/10 via-primary/5 to-background border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="font-poppins font-bold text-2xl md:text-3xl text-foreground mb-4">
                  Quer participar deste projeto?
                </h2>
                <p className="text-muted-foreground text-lg mb-6">
                  Entre em contato conosco para saber mais sobre como você pode contribuir ou se beneficiar deste projeto.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/contato">
                    <Button size="lg" className="font-semibold">
                      Entre em Contato
                    </Button>
                  </Link>
                  <Link to="/projetos">
                    <Button size="lg" variant="outline" className="font-semibold">
                      Ver Outros Projetos
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="hidden md:flex justify-end">
                <div className="relative">
                  <div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl" />
                  <div className="relative w-48 h-48 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
                    <Users className="h-20 w-20 text-primary-foreground" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Other Projects */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground mb-4">Gostou do que viu?</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              variant="ghost"
              className="text-primary hover:text-primary"
              onClick={handleShareWhatsApp}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Compartilhar no WhatsApp
            </Button>
            <Button
              variant="ghost"
              className="text-primary hover:text-primary"
              onClick={handleShareFacebook}
            >
              <Facebook className="mr-2 h-4 w-4" />
              Compartilhar no Facebook
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProjetoDetalhe;
