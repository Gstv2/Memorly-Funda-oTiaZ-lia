// Componente de cartão para exibir projetos da fundação
// Mostra thumbnail, categoria, título e descrição do projeto
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderOpen } from "lucide-react";
import { getOptimizedImageUrl } from "@/lib/storage-utils";

// Interface para as propriedades do cartão de projeto
interface ProjectCardProps {
  title: string;
  description: string;
  image: string;
  category: "social" | "cultural" | "esportivo" | "educacional";
  slug: string;
}

// Objeto que mapeia categorias a cores de fundo
const categoryColors = {
  social: "bg-accent text-accent-foreground",
  cultural: "bg-secondary text-secondary-foreground",
  esportivo: "bg-primary text-primary-foreground",
  educacional: "bg-muted text-muted-foreground",
};

// Objeto que mapeia categorias a rótulos legíveis
const categoryLabels = {
  social: "Social",
  cultural: "Cultural",
  esportivo: "Esportivo",
  educacional: "Educacional",
};

const ProjectCard = ({ title, description, image, category, slug }: ProjectCardProps) => {
  return (
    <Link to={`/projetos/${slug}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50 h-full flex flex-col cursor-pointer">
        <div className="relative overflow-hidden h-48">
          {/* Thumbnail do projeto, ou placeholder se não houver imagem */}
          {image ? (
            <img
              src={getOptimizedImageUrl(image, { width: 500, height: 350 })}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <FolderOpen className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
          {/* Overlay escuro que aparece no hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {/* Badge com a categoria do projeto */}
          <Badge className={`absolute top-4 right-4 ${categoryColors[category] || categoryColors.social}`}>
            {categoryLabels[category] || category}
          </Badge>
        </div>
        <CardHeader>
          <CardTitle className="font-poppins text-lg group-hover:text-primary transition-colors">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow">
          <CardDescription className="text-sm leading-relaxed">
            {description}
          </CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ProjectCard;
