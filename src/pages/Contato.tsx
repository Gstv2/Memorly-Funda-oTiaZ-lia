import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Mail, Facebook, Instagram, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";

interface SiteSettings {
  address: string;
  phone: string;
  contact_email: string;
  facebook_url: string;
  instagram_url: string;
}

const Contato = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 'config')
        .single();

      if (error) throw error;
      if (data) setSettings(data);
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Por favor, insira um e-mail válido");
      return;
    }

    setIsSubmitting(true);

    try {
      if (!settings?.phone) {
        throw new Error("Telefone da fundação não configurado.");
      }

      // Limpar o número de telefone (remover tudo que não é número)
      const cleanPhone = settings.phone.replace(/\D/g, '');
      
      // Formatar a mensagem para o WhatsApp
      const text = `Olá! Meu nome é ${formData.name.trim()}.\nE-mail: ${formData.email.trim()}\nMensagem: ${formData.message.trim()}`;
      const encodedText = encodeURIComponent(text);
      
      // Criar o link do WhatsApp
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`;
      
      // Abrir em uma nova aba
      window.open(whatsappUrl, '_blank');
      
      toast.success("Redirecionando para o WhatsApp...");
      setFormData({ name: "", email: "", message: "" });
    } catch (error: any) {
      console.error("Error redirecting to WhatsApp:", error);
      toast.error(error.message || "Erro ao redirecionar. Verifique se o telefone está cadastrado.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Endereço",
      content: settings?.address || "Carregando...",
      color: "text-primary",
    },
    {
      icon: Phone,
      title: "Telefone",
      content: settings?.phone || "Carregando...",
      color: "text-accent",
    },
    {
      icon: Mail,
      title: "E-mail",
      content: settings?.contact_email || "Carregando...",
      color: "text-secondary",
    },
  ];

  return (
    <div className="min-h-screen">
      <SEO 
        title="Contato" 
        description="Fale com a Fundação Tia Zélia. Tire suas dúvidas, seja um voluntário ou faça uma doação."
      />
      {/* Header */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
            <h1 className="font-poppins font-bold text-5xl md:text-6xl text-foreground mb-6">
              Entre em Contato
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Estamos aqui para ouvir você. Entre em contato para saber mais sobre nossos projetos, 
              fazer uma doação ou se tornar um voluntário.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {contactInfo.map((info, index) => (
              <Card 
                key={index}
                className="text-center hover:shadow-lg transition-all duration-300 border-border/50 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className={`w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center ${info.color}`}>
                    <info.icon size={32} />
                  </div>
                  <CardTitle className="font-poppins text-xl">{info.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{info.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="border-border/50 shadow-xl animate-scale-in">
              <CardHeader className="text-center">
                <CardTitle className="font-poppins text-3xl mb-2">
                  Envie sua Mensagem
                </CardTitle>
                <CardDescription className="text-base">
                  Preencha o formulário abaixo e responderemos o mais breve possível
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Seu nome"
                      value={formData.name}
                      onChange={handleChange}
                      className="border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Mensagem</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Como podemos ajudar você?"
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      className="border-border resize-none"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-warm"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        Enviar Mensagem
                        <Send className="ml-2" size={18} />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Media & Map */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-poppins font-bold text-3xl text-foreground mb-4">
                Siga-nos nas Redes Sociais
              </h2>
              <p className="text-muted-foreground mb-8">
                Acompanhe nossas atividades e fique por dentro de tudo que acontece na fundação
              </p>
              <div className="flex justify-center space-x-4">
                <a
                  href={settings?.facebook_url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all flex items-center justify-center hover:scale-110 shadow-warm"
                  aria-label="Facebook"
                >
                  <Facebook size={24} />
                </a>
                <a
                  href={settings?.instagram_url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 h-14 rounded-full bg-foreground hover:bg-foreground/90 text-background transition-all flex items-center justify-center hover:scale-110"
                  aria-label="Instagram"
                >
                  <Instagram size={24} />
                </a>
              </div>
            </div>

            {/* Map Placeholder */}
            <Card className="overflow-hidden border-border/50">
              <div className="bg-muted h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <MapPin size={48} className="mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground text-lg font-semibold">
                    Rua Pires Rebelo, 373, Piripiri, PI
                  </p>
                  <p className="text-muted-foreground text-sm mt-2">
                    Visite-nos e conheça nossos projetos pessoalmente
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Volunteer CTA */}
      <section className="py-20 bg-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-poppins font-bold text-4xl mb-6 text-background">
            Seja um Voluntário
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-background/90">
            Sua dedicação e talento podem fazer a diferença na vida de muitas pessoas. 
            Junte-se ao nosso time de voluntários!
          </p>
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold hover:scale-105 transition-transform shadow-warm">
            Quero Ser Voluntário
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Contato;
