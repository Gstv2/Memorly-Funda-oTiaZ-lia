// Componente de SEO para otimização de motores de busca e compartilhamento em redes sociais
// Utiliza react-helmet-async para gerenciar meta tags
import { Helmet } from 'react-helmet-async';

// Interface para as propriedades do componente SEO
interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEO = ({ 
  title, 
  description = "Memorial digital da Fundação Tia Zélia - Uma instituição dedicada a projetos sociais, culturais e esportivos.",
  image = "https://dvomcyjjjobfpfmkfygq.supabase.co/storage/v1/object/public/media/hero-community.jpg", // Imagem padrão para compartilhamento
  url = "https://fundacaotiazelia.vercel.app", // URL base do site
  type = "website"
}: SEOProps) => {
  const siteTitle = "Fundação Tia Zélia";
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;

  return (
    <Helmet>
      {/* Meta tags padrão do site */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      {/* Meta tags Open Graph (Facebook, LinkedIn) */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Meta tags do Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};

export default SEO;
