import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export interface StructuredContent {
  introduction: string;
  about: string;
  benefits: string;
  howToParticipate: string;
  additionalInfo: string;
}

interface StructuredContentEditorProps {
  value: StructuredContent;
  onChange: (content: StructuredContent) => void;
  postType: string;
}

const StructuredContentEditor = ({
  value,
  onChange,
  postType,
}: StructuredContentEditorProps) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    introduction: true,
    about: true,
    benefits: false,
    howToParticipate: true,
    additionalInfo: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const updateField = (field: keyof StructuredContent, newValue: string) => {
    onChange({
      ...value,
      [field]: newValue,
    });
  };

  const sections = [
    {
      id: 'introduction',
      title: 'Introdução',
      required: true,
      placeholder: 'Escreva um parágrafo de abertura envolvente que capture a atenção do leitor...',
      description: 'Apresente o tema principal do post de forma cativante.',
      rows: 3,
    },
    {
      id: 'about',
      title: postType === 'atividade' ? 'Sobre a Atividade' : postType === 'evento' ? 'Sobre o Evento' : 'Desenvolvimento',
      required: true,
      placeholder: postType === 'atividade' 
        ? 'Descreva o que é oferecido, como funciona, público-alvo...'
        : postType === 'evento'
        ? 'Descreva o evento, programação, atrações...'
        : 'Desenvolva o conteúdo principal do seu post...',
      description: 'Detalhe as informações principais.',
      rows: 5,
    },
    {
      id: 'benefits',
      title: 'Benefícios',
      required: false,
      placeholder: 'Liste os benefícios para os participantes, o que vão aprender ou ganhar...',
      description: 'Destaque os pontos positivos e vantagens.',
      rows: 4,
      hideFor: ['noticia', 'depoimento'],
    },
    {
      id: 'howToParticipate',
      title: 'Como Participar',
      required: postType === 'atividade' || postType === 'evento',
      placeholder: postType === 'evento'
        ? 'Explique como participar do evento, inscrição, ingresso...'
        : 'Explique o processo de inscrição, requisitos, primeiro passo...',
      description: 'Oriente o leitor sobre como se envolver.',
      rows: 3,
      hideFor: ['noticia', 'depoimento'],
    },
    {
      id: 'additionalInfo',
      title: 'Informações Adicionais',
      required: false,
      placeholder: 'Requisitos especiais, o que trazer, observações importantes...',
      description: 'Adicione informações complementares.',
      rows: 3,
    },
  ];

  const visibleSections = sections.filter(
    (section) => !section.hideFor?.includes(postType)
  );

  return (
    <div className="space-y-3">
      {visibleSections.map((section) => (
        <Collapsible
          key={section.id}
          open={openSections[section.id]}
          onOpenChange={() => toggleSection(section.id)}
        >
          <Card className="border-border">
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-secondary/50 transition-colors py-3">
                <CardTitle className="text-base flex items-center justify-between font-poppins">
                  <span className="flex items-center gap-2">
                    {section.title}
                    {section.required && (
                      <span className="text-xs text-destructive">*</span>
                    )}
                    {!section.required && (
                      <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
                    )}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform ${
                      openSections[section.id] ? 'rotate-180' : ''
                    }`}
                  />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 pb-4">
                <p className="text-xs text-muted-foreground mb-2">
                  {section.description}
                </p>
                <Textarea
                  value={value[section.id as keyof StructuredContent] || ''}
                  onChange={(e) =>
                    updateField(section.id as keyof StructuredContent, e.target.value)
                  }
                  placeholder={section.placeholder}
                  rows={section.rows}
                  className="resize-none"
                />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      ))}
    </div>
  );
};

export default StructuredContentEditor;
