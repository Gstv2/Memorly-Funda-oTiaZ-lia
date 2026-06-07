import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BlogCard from "@/components/BlogCard";
import { Loader2 } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  published: boolean | null;
  published_at: string | null;
  created_at: string;
}

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .order('published_at', { ascending: false });

    if (!error && data) {
      setPosts(data);
    }
    setLoading(false);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const featuredPost = posts[0];
  const otherPosts = posts.slice(1);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
            <h1 className="font-poppins font-bold text-5xl md:text-6xl text-foreground mb-6">
              Blog & Notícias
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Fique por dentro das últimas novidades, eventos e histórias inspiradoras da Fundação Tia Zélia 
              e nossa comunidade.
            </p>
          </div>
        </div>
      </section>

      {loading ? (
        <section className="py-20">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </section>
      ) : posts.length === 0 ? (
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <p className="text-xl text-muted-foreground">
              Nenhuma postagem publicada ainda.
            </p>
          </div>
        </section>
      ) : (
        <>
          {/* Featured Post */}
          {featuredPost && (
            <section className="py-16">
              <div className="container mx-auto px-4">
                <div className="max-w-5xl mx-auto">
                  <Link to={`/blog/${featuredPost.slug}`}>
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl group cursor-pointer animate-scale-in">
                      {featuredPost.cover_image ? (
                        <div className="aspect-video">
                          <img
                            src={featuredPost.cover_image}
                            alt={featuredPost.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video bg-muted flex items-center justify-center">
                          <span className="text-muted-foreground">Sem imagem</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end">
                        <div className="p-8 md:p-12">
                          <span className="inline-block px-4 py-1 bg-primary text-primary-foreground text-sm font-semibold rounded-full mb-4">
                            Destaque
                          </span>
                          <h2 className="font-poppins font-bold text-3xl md:text-4xl text-white mb-4">
                            {featuredPost.title}
                          </h2>
                          {featuredPost.excerpt && (
                            <p className="text-white/90 text-lg mb-4 max-w-2xl">
                              {featuredPost.excerpt}
                            </p>
                          )}
                          <span className="text-white/80 text-sm">
                            {formatDate(featuredPost.published_at || featuredPost.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </section>
          )}

          {/* Blog Grid */}
          {otherPosts.length > 0 && (
            <section className="py-20 bg-background">
              <div className="container mx-auto px-4">
                <div className="mb-12">
                  <h2 className="font-poppins font-bold text-3xl text-foreground text-center mb-4">
                    Mais Artigos
                  </h2>
                  <p className="text-center text-muted-foreground">
                    Explore mais histórias e atualizações da nossa fundação
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {otherPosts.map((post, index) => (
                    <div 
                      key={post.id} 
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <BlogCard 
                        title={post.title}
                        excerpt={post.excerpt || ''}
                        date={formatDate(post.published_at || post.created_at)}
                        image={post.cover_image || ''}
                        slug={post.slug}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* Newsletter Section */}
      <section className="py-20 bg-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-poppins font-bold text-4xl mb-6 text-background">
              Receba Nossas Novidades
            </h2>
            <p className="text-xl mb-8 text-background/90">
              Assine nossa newsletter e fique por dentro de todos os eventos, projetos e histórias da fundação.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                className="px-6 py-3 rounded-lg text-foreground bg-background flex-grow max-w-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors">
                Inscrever-se
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blog;