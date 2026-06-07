import { Link } from "react-router-dom";
import { Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-background to-muted/30 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sobre */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-primary-foreground">
                TZ
              </div>
              <span className="font-poppins font-bold text-lg">
                Fundação Tia Zélia
              </span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Transformando vidas através da cultura, educação e esporte há mais de uma década.
            </p>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="font-poppins font-semibold mb-4 text-foreground">Links Rápidos</h3>
            <ul className="space-y-2">
              {[
                { name: "Início", path: "/" },
                { name: "História", path: "/historia" },
                { name: "Projetos", path: "/projetos" },
                { name: "Galeria", path: "/galeria" },
                { name: "Blog", path: "/blog" },
                { name: "Contato", path: "/contato" },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="font-poppins font-semibold mb-4 text-foreground">Contato</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2 text-sm text-muted-foreground">
                <MapPin size={16} className="mt-1 flex-shrink-0 text-primary" />
                <span>Rua Pires Rebelo, 373, Piripiri, PI</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone size={16} className="flex-shrink-0 text-primary" />
                <span>(86) 9940-3966</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail size={16} className="flex-shrink-0 text-primary" />
                <span>francimary.melo@bol.com.br</span>
              </li>
            </ul>
          </div>

          {/* Redes Sociais */}
          <div>
            <h3 className="font-poppins font-semibold mb-4 text-foreground">Redes Sociais</h3>
            <div className="flex space-x-3">
              <a
                href="https://www.facebook.com/fundacaotiazelia/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center group"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://www.instagram.com/ftz.pi/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center group"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Siga-nos para acompanhar nossas atividades e eventos!
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Fundação Tia Zélia. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
