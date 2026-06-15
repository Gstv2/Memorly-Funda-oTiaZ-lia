import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Users, Award, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ProjectCard from "@/components/ProjectCard";
import BlogCard from "@/components/BlogCard";
import heroImage from "@/assets/hero-community.jpg";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import SEO from "@/components/SEO";

const Home = () => {
  const { data: settings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 'config')
        .single();
      if (error) throw error;
      return data;
    }
  });

  const { data: counts } = useQuery({
    queryKey: ['site-counts'],
    queryFn: async () => {
      const [projectsRes, volunteersRes] = await Promise.all([
        supabase.from('projects').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('volunteers').select('id', { count: 'exact', head: true }).eq('is_active', true),
      ]);
      return {
        projects: projectsRes.count || 0,
        volunteers: volunteersRes.count || 0,
      };
    }
  });

  const { data: projects, isLoading: loadingProjects } = useQuery({
    queryKey: ['featured-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    }
  });

  const { data: posts, isLoading: loadingPosts } = useQuery({
    queryKey: ['recent-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('published_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    }
  });

  const stats = [
    { icon: Heart, label: "Vidas Transformadas", value: settings?.manual_stats_lives_transformed || "5.000+" },
    { icon: Users, label: "Voluntários Ativos", value: counts?.volunteers.toString() || "0" },
    { icon: Award, label: "Projetos Realizados", value: counts?.projects.toString() || "0" },
  ];

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return format(new Date(dateString), "d 'de' MMMM, yyyy", { locale: ptBR });
  };

  return (
    <div className="min-h-screen">
      <SEO 
        title="Home" 
        description="Memorial digital da Fundação Tia Zélia - Transformando vidas através da cultura, esporte e educação em Piripiri, Piauí."
      />
      {/* Hero Section */}
      <section className="relative min-h-[60vh] md:h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={settings?.home_hero_image || heroImage}
            alt="Comunidade Fundação Tia Zélia"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40 md:bg-gradient-to-r md:from-black/70 md:via-black/50 md:to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 z-10 relative">
          <div className="max-w-2xl animate-fade-in-up">
            <h1 className="font-poppins font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white mb-6 leading-tight">
              Transformando Vidas Através da{" "}
              <span className="text-transparent bg-clip-text bg-gradient-warm">
                Cultura e Educação
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
              Há mais de uma década dedicados a construir um futuro melhor através de projetos sociais, culturais e esportivos que fortalecem nossa comunidade.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/projetos" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-warm">
                  Conheça Nossos Projetos
                  <ArrowRight className="ml-2" size={18} />
                </Button>
              </Link>
              <Link to="/contato" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white bg-white/10 text-white hover:bg-white hover:text-foreground font-semibold">
                  Entre em Contato
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-16 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-6 md:p-8 rounded-2xl bg-background border border-border hover:shadow-card transition-all duration-300 animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary text-primary-foreground mb-4">
                  <stat.icon size={24} className="md:w-7 md:h-7" />
                </div>
                <h3 className="font-poppins font-bold text-3xl md:text-4xl text-foreground mb-2">
                  {stat.value}
                </h3>
                <p className="text-sm md:text-base text-muted-foreground font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-poppins font-bold text-2xl sm:text-3xl md:text-4xl text-foreground mb-6">
              Nossa Missão
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8">
              {settings?.home_mission_text || "A Fundação Tia Zélia é uma instituição sem fins lucrativos comprometida em promover a inclusão social, preservar a cultura brasileira e desenvolver cidadãos através do esporte e da educação. Acreditamos que cada vida transformada é uma vitória para toda a comunidade."}
            </p>
            <Link to="/historia">
              <Button variant="outline" size="lg" className="font-semibold">
                Conheça Nossa História
                <ArrowRight className="ml-2" size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-16 md:py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="font-poppins font-bold text-2xl sm:text-3xl md:text-4xl text-foreground mb-4">
              Projetos em Destaque
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Conheça alguns dos nossos principais projetos que estão transformando vidas em nossa comunidade.
            </p>
          </div>

          {loadingProjects ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-10">
              {projects.map((project, index) => (
                <div key={project.id} className="animate-fade-in" style={{ animationDelay: `${index * 150}ms` }}>
                  <ProjectCard
                    title={project.title}
                    description={project.description}
                    image={project.cover_image || ""}
                    category={(project.category as "social" | "cultural" | "esportivo") || "social"}
                    slug={project.slug}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Nenhum projeto disponível no momento.</p>
          )}

          <div className="text-center">
            <Link to="/projetos">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-warm">
                Ver Todos os Projetos
                <ArrowRight className="ml-2" size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="font-poppins font-bold text-2xl sm:text-3xl md:text-4xl text-foreground mb-4">
              Últimas Notícias
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Fique por dentro das novidades, eventos e conquistas da nossa comunidade.
            </p>
          </div>

          {loadingPosts ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : posts && posts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-10">
              {posts.map((post, index) => (
                <div key={post.id} className="animate-fade-in" style={{ animationDelay: `${index * 150}ms` }}>
                  <BlogCard
                    title={post.title}
                    excerpt={post.excerpt || ""}
                    date={formatDate(post.published_at)}
                    image={post.cover_image || ""}
                    slug={post.slug}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Nenhuma notícia disponível no momento.</p>
          )}

          <div className="text-center">
            <Link to="/blog">
              <Button size="lg" variant="outline" className="font-semibold">
                Ver Todas as Notícias
                <ArrowRight className="ml-2" size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-poppins font-bold text-2xl sm:text-3xl md:text-4xl mb-6 text-background">
            Faça Parte Desta Transformação
          </h2>
          <p className="text-base sm:text-lg md:text-xl mb-8 max-w-2xl mx-auto text-background/90">
            Junte-se a nós como voluntário, parceiro ou apoiador. 
            Cada contribuição faz a diferença na vida de centenas de pessoas.
          </p>
          <Link to="/contato">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold hover:scale-105 transition-transform shadow-warm">
              Quero Contribuir
              <Heart className="ml-2" size={18} />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
