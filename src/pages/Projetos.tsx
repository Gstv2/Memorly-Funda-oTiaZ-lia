import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import ProjectCard from "@/components/ProjectCard";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProjects(data);
    }
    setLoading(false);
  };

  const filteredProjects = activeFilter === "todos" 
    ? projects 
    : projects.filter(p => p.category === activeFilter);

  const filters: { label: string; value: CategoryFilter }[] = [
    { label: "Todos", value: "todos" },
    { label: "Social", value: "social" },
    { label: "Cultural", value: "cultural" },
    { label: "Esportivo", value: "esportivo" },
    { label: "Educacional", value: "educacional" },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
            <h1 className="font-poppins font-bold text-5xl md:text-6xl text-foreground mb-6">
              Nossos Projetos
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Conheça as iniciativas que transformam vidas e fortalecem nossa comunidade através da 
              educação, cultura e esporte.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-12 bg-background border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-3">
            {filters.map((filter) => (
              <Button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                variant={activeFilter === filter.value ? "default" : "outline"}
                size="lg"
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
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground">
                {projects.length === 0 
                  ? "Nenhum projeto cadastrado ainda." 
                  : "Nenhum projeto encontrado nesta categoria."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project, index) => (
                <div 
                  key={project.id} 
                  className="animate-fade-in"
                  style={{ animationDelay: `${(index % 9) * 100}ms` }}
                >
                  <ProjectCard 
                    title={project.title}
                    description={project.description}
                    image={project.cover_image || ''}
                    category={project.category as "social" | "cultural" | "esportivo" || "social"}
                    slug={project.slug}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-poppins font-bold text-4xl mb-6 text-background">
            Quer Fazer Parte de um Projeto?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-background/90">
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