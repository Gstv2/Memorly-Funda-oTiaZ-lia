import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Download } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SEO from "@/components/SEO";
import { Skeleton } from "@/components/ui/skeleton";

interface GalleryImage {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  category: string | null;
  year: number | null;
}

// 🔴 ALTERAÇÃO 1: Helper seguro para resolver a URL final sem quebrar com transformações de imagem
const resolveGalleryImageUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  // Se já for uma URL completa (http/https), usa diretamente
  if (path.startsWith('http://') || path.startsWith('https://')) return path;

  // Se for apenas o caminho do arquivo no bucket 'media'
  return supabase.storage.from('media').getPublicUrl(path).data.publicUrl;
};

const Galeria = () => {
  const [activeFilter, setActiveFilter] = useState<string>("todos");
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [years, setYears] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [downloading, setDownloading] = useState(false);

  // 🔴 ALTERAÇÃO 2: Download otimizado e seguro com suporte a fallback em caso de CORS no fetch
  const handleDownload = async (image: GalleryImage) => {
    setDownloading(true);
    const imageUrl = resolveGalleryImageUrl(image.image_url);

    try {
      const response = await fetch(imageUrl, { mode: 'cors' });
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const extension = imageUrl.split('.').pop()?.split('?')[0] || 'jpg';
      link.download = `${image.title.replace(/[^a-zA-Z0-9]/g, '_')}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.warn('CORS/Fetch failed, fallback to direct download:', error);
      // Fallback: abre ou baixa diretamente pelo link do navegador
      const link = document.createElement('a');
      link.href = imageUrl;
      link.target = '_blank';
      link.download = image.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    const { data, error } = await supabase
      .from('gallery_images')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setImages(data);
      const uniqueYears = [...new Set(data.map(img => img.year).filter(Boolean))]
        .sort((a, b) => (b || 0) - (a || 0))
        .map(y => String(y));
      setYears(uniqueYears);
    }
    setLoading(false);
  };

  const filteredItems = activeFilter === "todos" 
    ? images 
    : images.filter(item => String(item.year) === activeFilter);

  const filters = [
    { label: "Todos", value: "todos" },
    ...years.map(year => ({ label: year, value: year }))
  ];

  const categoryLabels: Record<string, string> = {
    capoeira: 'Capoeira',
    educacao: 'Educação',
    cultura: 'Cultura',
    eventos: 'Eventos',
    comunidade: 'Comunidade',
    geral: 'Geral'
  };

  return (
    <div className="min-h-screen">
      <SEO 
        title="Galeria de Momentos" 
        description="Veja as fotos dos eventos e projetos realizados pela Fundação Tia Zélia."
      />

      {/* Header */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
            <h1 className="font-poppins font-bold text-5xl md:text-6xl text-foreground mb-6">
              Galeria de Momentos
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Reviva os momentos especiais que marcam nossa história e celebram as conquistas da nossa comunidade.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      {filters.length > 1 && (
        <section className="py-12 bg-background border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-3">
              {filters.map(filter => (
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
      )}

      {/* Gallery Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={i} className="aspect-square rounded-xl" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground">
                {images.length === 0 ? "Nenhuma imagem na galeria ainda." : "Nenhuma imagem encontrada para este ano."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item, index) => (
                <Card 
                  key={item.id} 
                  className="group overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 animate-fade-in" 
                  style={{ animationDelay: `${(index % 9) * 100}ms` }} 
                  onClick={() => setSelectedImage(item)}
                >
                  <div className="relative overflow-hidden aspect-video">
                    {/* 🔴 ALTERAÇÃO 3: Substituído getOptimizedImageUrl por resolveGalleryImageUrl */}
                    <img 
                      src={resolveGalleryImageUrl(item.image_url)} 
                      alt={item.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                      <h3 className="font-poppins font-bold text-white text-xl mb-2">
                        {item.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-white/90 text-sm">
                          {categoryLabels[item.category || 'geral'] || item.category}
                        </span>
                        {item.year && <span className="text-white/90 text-sm font-semibold">{item.year}</span>}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-poppins font-bold text-3xl text-foreground mb-6">
              Cada Foto Conta uma História
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Nossa galeria é um testemunho visual do impacto positivo que geramos na comunidade. 
              Cada imagem representa vidas transformadas, sorrisos conquistados e sonhos realizados.
            </p>
            <p className="text-muted-foreground">
              Quer ver suas fotos aqui? Participe de nossos eventos e compartilhe seus momentos conosco!
            </p>
          </div>
        </div>
      </section>

      {/* Image Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="font-poppins text-xl">
              {selectedImage?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedImage && (
            <div className="flex flex-col">
              <div className="relative flex-1 flex items-center justify-center bg-black/5 p-4">
                {/* 🔴 ALTERAÇÃO 4: Resolução segura da imagem do modal */}
                <img 
                  src={resolveGalleryImageUrl(selectedImage.image_url)} 
                  alt={selectedImage.title} 
                  className="max-w-full max-h-[60vh] object-contain rounded-lg" 
                />
              </div>
              
              <div className="p-4 border-t border-border">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    {selectedImage.description && (
                      <p className="text-muted-foreground mb-2">
                        {selectedImage.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="px-2 py-1 rounded text-inherit bg-muted">
                        {categoryLabels[selectedImage.category || 'geral'] || selectedImage.category}
                      </span>
                      {selectedImage.year && <span className="font-semibold">{selectedImage.year}</span>}
                    </div>
                  </div>
                  
                  <Button onClick={() => handleDownload(selectedImage)} disabled={downloading} className="gap-2">
                    {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    Baixar Imagem
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Galeria;