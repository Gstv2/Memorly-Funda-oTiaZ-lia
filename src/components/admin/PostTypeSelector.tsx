// Componente para selecionar o tipo de post (blog ou atividade)
// Utilizado nos formulários de criação/edição de posts
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Calendar, Newspaper, Quote } from 'lucide-react';

// Interface para as propriedades do componente
interface PostTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

// Lista de tipos de post disponíveis
const POST_TYPES = [
  {
    id: 'atividade',
    label: 'Atividade/Aula',
    description: 'Aulas regulares, oficinas, cursos',
    icon: BookOpen,
  },
  {
    id: 'evento',
    label: 'Evento Especial',
    description: 'Apresentações, festas, encontros',
    icon: Calendar,
  },
  {
    id: 'noticia',
    label: 'Notícia',
    description: 'Novidades, comunicados, atualizações',
    icon: Newspaper,
  },
  {
    id: 'depoimento',
    label: 'Depoimento',
    description: 'Histórias de participantes, testemunhos',
    icon: Quote,
  },
];

const PostTypeSelector = ({ value, onChange }: PostTypeSelectorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-poppins">Tipo de Post</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={value}
          onValueChange={onChange}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {POST_TYPES.map((type) => {
            const Icon = type.icon;
            const isSelected = value === type.id;
            return (
              <div key={type.id}>
                <RadioGroupItem
                  value={type.id}
                  id={type.id}
                  className="sr-only"
                />
                <Label
                  htmlFor={type.id}
                  className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 mt-0.5 ${
                      isSelected ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  />
                  <div>
                    <p
                      className={`font-medium ${
                        isSelected ? 'text-primary' : 'text-foreground'
                      }`}
                    >
                      {type.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {type.description}
                    </p>
                  </div>
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default PostTypeSelector;
