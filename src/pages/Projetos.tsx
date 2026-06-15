import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import ProjectCard from "@/components/ProjectCard";
import { Loader2, Search } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string | null;
  cover_image: string | null;
  category: string | null;
  is_active: boolean | null;
}

type CategoryFilter = "todos" | "social" | "cultural" | "esportivo" | "educacional";

const Projetos = () => {
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>("todos");
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = projects.filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(query) || 
                          project.description.toLowerCase().includes(query);
      const matchesCategory = activeFilter === "todos" || project.category === activeFilter;
      return matchesSearch && matchesCategory;
    });
    setFilteredProjects(filtered);
  }, [searchQuery, activeFilter, projects]);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProjects(data);
      setFilteredProjects(data);
    }
    setLoading(false);
  };

  const filters: { label: string; value: CategoryFilter }[] = [
    { label: "Todos", value: "todos" },
    { label: "Social", value: "social" },
    { label: "Cultural", value: "cultural" },
    { label: "Esportivo", value: "esportivo" },
    { label: "Educacional", value: "educacional" },
  ];

  return (
    <div className="min-h-screen">
      <SEO 
        title="Projetos" 
        description="Conheça os projetos sociais, culturais e educativos da Fundação Tia Zélia."
      />
      {/* Header */}
      <section className="py-16 md:py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
            <h1 className="font-poppins font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
              Nossos Projetos
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed">
              Conheça as iniciativas que transformam vidas e fortalecem nossa comunidade através da 
              educação, cultura e esporte.
            </p>
          </div>
        </div>
      </section>

      {/* Filters & Search */}
      <section className="py-10 md:py-12 bg-background border-b border-border">
        <div className="container mx-auto px-4 space-y-6 md:space-y-8">
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {filters.map((filter) => (
              <Button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                variant={activeFilter === filter.value ? "default" : "outline"}
                size="sm"
                className={`font-semibold transition-all ${
                  activeFilter === filter.value
                    ? "bg-primary text-primary-foreground shadow-warm"
                    : "hover:border-primary hover:text-primary"
                }`}
              >
                {filter.label}
              </Button>
            ))}
          </div>

          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar projetos..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-40 sm:h-48 w-full rounded-xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-16 sm:h-20 w-full" />
                </div>
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
                Nenhum projeto encontrado para esta busca ou categoria.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredProjects.map((project) => (
                <ProjectCard 
                  key={project.id} 
                  title={project.title}
                  description={project.description}
                  image={project.cover_image || ""}
                  category={(project.category || "social") as "social"}
                  slug={project.slug}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-poppins font-bold text-2xl sm:text-3xl md:text-4xl mb-6 text-background">
            Quer Fazer Parte de um Projeto?
          </h2>
          <p className="text-base sm:text-lg md:text-xl mb-8 max-w-2xl mx-auto text-background/90">
            Entre em contato conosco para saber mais sobre como participar ou apoiar nossos projetos.
          </p>
          <Link to="/contato">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold hover:scale-105 transition-transform shadow-warm">
              Entre em Contato
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Projetos;