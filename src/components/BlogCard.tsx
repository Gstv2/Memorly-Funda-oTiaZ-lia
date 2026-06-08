import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FileText } from "lucide-react";
import { getOptimizedImageUrl } from "@/lib/storage-utils";

interface BlogCardProps {
  title: string;
  excerpt: string;
  date: string;
  image: string;
  slug: string;
}

const BlogCard = ({ title, excerpt, date, image, slug }: BlogCardProps) => {
  return (
    <Link to={`/blog/${slug}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50 cursor-pointer h-full flex flex-col">
        <div className="relative overflow-hidden h-56">
          {image ? (
            <img
              src={getOptimizedImageUrl(image, { width: 600, height: 400 })}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <FileText className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <CardHeader>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-2">
            <Calendar size={14} className="text-primary" />
            <span>{date}</span>
          </div>
          <CardTitle className="font-poppins text-xl group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow">
          <CardDescription className="text-sm leading-relaxed line-clamp-3">
            {excerpt}
          </CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
};

export default BlogCard;
