import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Loader2, 
  FileText, 
  Calendar,
  User,
  Share2,
  Copy,
  Check,
  MessageCircle,
  Facebook,
  ChevronRight,
  MapPin,
  Clock,
  Users,
  CalendarDays,
  UserCheck
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import SEO from "@/components/SEO";
import BlogCard from "@/components/BlogCard";

interface StructuredContent {
  introduction?: string;
  about?: string;
  benefits?: string;
  howToParticipate?: string;
  additionalInfo?: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  location: string | null;
  published: boolean | null;
  published_at: string | null;
  created_at: string;
  author_id: string | null;
  post_type: string | null;
  structured_content: StructuredContent | null;
  schedule_times: string | null;
  weekdays: string[] | null;
  min_age: number | null;
  max_age: number | null;
  available_spots: number | null;
  how_to_register: string | null;
}

interface Author {
  full_name: string | null;
  avatar_url: string | null;
}

const WEEKDAY_LABELS: Record<string, string> = {
  segunda: 'Segunda',
  terca: 'Terça',
  quarta: 'Quarta',
  quinta: 'Quinta',
  sexta: 'Sexta',
  sabado: 'Sábado',
  domingo: 'Domingo',
};

const POST_TYPE_LABELS: Record<string, string> = {
  atividade: 'Atividade',
  evento: 'Evento',
  noticia: 'Notícia',
  depoimento: 'Depoimento',
};

const BlogDetalhe = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [author, setAuthor] = useState<Author | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isShareVisible, setIsShareVisible] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug || slug === "undefined") {
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .maybeSingle();

      if (!error && data) {
        const structuredContent = data.structured_content as unknown as StructuredContent | null;
        setPost({
          ...data,
          structured_content: structuredContent,
        });
        
        // Fetch author info if available
        if (data.author_id) {
          const { data: authorData } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', data.author_id)
            .maybeSingle();
          
          if (authorData) {
            setAuthor(authorData);
          }
        }

        // Fetch related posts (latest 3 excluding current)
        const { data: relatedData } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('published', true)
          .neq('id', data.id)
          .order('published_at', { ascending: false })
          .limit(3);
        
        if (relatedData) {
          setRelatedPosts(relatedData as unknown as BlogPost[]);
        }
      }
      setLoading(false);
    };

    fetchPost();
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsShareVisible(scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = `Confira o artigo "${post?.title}" da Fundação Tia Zélia: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const formatAgeRange = () => {
    if (!post) return null;
    if (post.min_age && post.max_age) {
      return `${post.min_age} a ${post.max_age} anos`;
    }
    if (post.min_age) {
      return `A partir de ${post.min_age} anos`;
    }
    if (post.max_age) {
      return `Até ${post.max_age} anos`;
    }
    return null;
  };

  const formatWeekdays = () => {
    if (!post?.weekdays || post.weekdays.length === 0) return null;
    return post.weekdays.map(day => WEEKDAY_LABELS[day] || day).join(', ');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-foreground">Artigo não encontrado</h1>
        <Link to="/blog">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Blog
          </Button>
        </Link>
      </div>
    );
  }

  const infoBlocks = [
    { 
      icon: Calendar, 
      label: "Publicado em", 
      value: formatDate(post.published_at || post.created_at) 
    },
    { 
      icon: User, 
      label: "Autor", 
      value: author?.full_name || "Fundação Tia Zélia" 
    },
    { 
      icon: MapPin, 
      label: "Localização", 
      value: post.location || "Rua Pires Rebelo, 373, Piripiri–PI" 
    },
  ];

  // Activity-specific info blocks
  const activityInfoBlocks = [];
  if (post.post_type === 'atividade') {
    if (post.schedule_times) {
      activityInfoBlocks.push({
        icon: Clock,
        label: "Horários",
        value: post.schedule_times,
      });
    }
    if (formatWeekdays()) {
      activityInfoBlocks.push({
        icon: CalendarDays,
        label: "Dias",
        value: formatWeekdays(),
      });
    }
    if (formatAgeRange()) {
      activityInfoBlocks.push({
        icon: UserCheck,
        label: "Faixa Etária",
        value: formatAgeRange(),
      });
    }
    if (post.available_spots) {
      activityInfoBlocks.push({
        icon: Users,
        label: "Vagas",
        value: `${post.available_spots} vagas disponíveis`,
      });
    }
  }

  // Render structured content sections
  const renderStructuredContent = () => {
    const sc = post.structured_content;
    if (!sc) {
      // Fallback to plain content
      return (
        <div 
          className="prose prose-lg max-w-none text-muted-foreground
            prose-headings:font-poppins prose-headings:text-foreground
            prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:mt-12 prose-h2:mb-6
            prose-h3:text-xl prose-h3:md:text-2xl prose-h3:mt-8 prose-h3:mb-4
            prose-p:leading-relaxed prose-p:mb-6
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-strong:text-foreground
            prose-ul:text-muted-foreground prose-ol:text-muted-foreground
            prose-li:mb-2
            prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-foreground/80
            prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8"
        >
          {post.content.split('\n\n').map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
      );
    }

    const sections = [
      { key: 'introduction', title: null, content: sc.introduction },
      { key: 'about', title: post.post_type === 'atividade' ? 'Sobre a Atividade' : post.post_type === 'evento' ? 'Sobre o Evento' : 'Desenvolvimento', content: sc.about },
      { key: 'benefits', title: 'Benefícios', content: sc.benefits },
      { key: 'howToParticipate', title: 'Como Participar', content: sc.howToParticipate },
      { key: 'additionalInfo', title: 'Informações Adicionais', content: sc.additionalInfo },
    ];

    return (
      <div className="space-y-8">
        {sections.map((section) => {
          if (!section.content) return null;
          return (
            <div key={section.key}>
              {section.title && (
                <h2 className="font-poppins font-bold text-2xl md:text-3xl text-foreground mb-4">
                  {section.title}
                </h2>
              )}
              <div className="text-muted-foreground text-lg leading-relaxed space-y-4">
                {section.content.split('\n\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title={post.title}
        description={post.excerpt || post.structured_content?.introduction || "Leia mais sobre este post da Fundação Tia Zélia."}
        image={post.cover_image || undefined}
        type="article"
      />
      {/* Floating Share Bar */}
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
        {post.cover_image ? (
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <FileText className="h-24 w-24 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
        
        {/* Back button */}
        <div className="absolute top-6 left-0 right-0">
          <div className="container mx-auto px-4">
            <Link to="/blog">
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
              <Badge className="mb-4 bg-primary text-primary-foreground">
                {POST_TYPE_LABELS[post.post_type || 'noticia'] || 'Blog'}
              </Badge>
              <h1 className="font-poppins font-bold text-3xl md:text-4xl lg:text-5xl text-white mb-4">
                {post.title}
              </h1>
              {post.excerpt && (
                <p className="text-lg md:text-xl text-white/90 font-medium">
                  {post.excerpt}
                </p>
              )}

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
      <section className="py-8 bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
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

      {/* Activity-specific Info Section */}
      {activityInfoBlocks.length > 0 && (
        <section className="py-8 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-poppins font-bold text-xl text-foreground mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Informações da Atividade
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {activityInfoBlocks.map((block, index) => (
                  <Card key={index} className="p-4 flex items-center gap-3 bg-primary/5 border-primary/20">
                    <block.icon className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">{block.label}</p>
                      <p className="text-foreground font-medium">{block.value}</p>
                    </div>
                  </Card>
                ))}
              </div>

              {/* How to Register */}
              {post.how_to_register && (
                <Card className="mt-4 p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                  <h3 className="font-poppins font-bold text-lg text-foreground mb-2">
                    Como se Inscrever
                  </h3>
                  <p className="text-muted-foreground">{post.how_to_register}</p>
                </Card>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <article className="animate-fade-in">
            {renderStructuredContent()}
          </article>
        </div>
      </div>

      {/* Author Section */}
      <section className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6 bg-muted/30">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center shrink-0">
                {author?.avatar_url ? (
                  <img 
                    src={author.avatar_url} 
                    alt={author.full_name || "Autor"} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="h-10 w-10 text-primary-foreground" />
                )}
              </div>
              <div className="text-center sm:text-left">
                <p className="text-sm text-muted-foreground mb-1">Escrito por</p>
                <h3 className="font-poppins font-bold text-xl text-foreground mb-2">
                  {author?.full_name || "Fundação Tia Zélia"}
                </h3>
                <p className="text-muted-foreground">
                  Promovendo a transformação social através da educação, cultura e esporte.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-primary/10 via-primary/5 to-background border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="font-poppins font-bold text-2xl md:text-3xl text-foreground mb-4">
                  Gostou do conteúdo?
                </h2>
                <p className="text-muted-foreground text-lg mb-6">
                  Explore mais artigos do nosso blog ou entre em contato para saber mais sobre nossos projetos e como participar.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/blog">
                    <Button size="lg" className="font-semibold">
                      Ver Mais Artigos
                    </Button>
                  </Link>
                  <Link to="/projetos">
                    <Button size="lg" variant="outline" className="font-semibold">
                      Conhecer Projetos
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="hidden md:flex justify-end">
                <div className="relative">
                  <div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl" />
                  <div className="relative w-48 h-48 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
                    <FileText className="h-20 w-20 text-primary-foreground" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Share Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground mb-4">Gostou do que leu? Compartilhe!</p>
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

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-20 bg-gradient-subtle">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="font-poppins font-bold text-3xl text-foreground mb-12 text-center">
                Veja também
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost) => (
                  <BlogCard
                    key={relatedPost.id}
                    title={relatedPost.title}
                    excerpt={relatedPost.excerpt || ""}
                    date={formatDate(relatedPost.published_at)}
                    image={relatedPost.cover_image || ""}
                    slug={relatedPost.slug}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default BlogDetalhe;
