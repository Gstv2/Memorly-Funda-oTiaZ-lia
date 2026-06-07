import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ActivityFieldsProps {
  scheduleTimes: string;
  setScheduleTimes: (value: string) => void;
  weekdays: string[];
  setWeekdays: (value: string[]) => void;
  minAge: string;
  setMinAge: (value: string) => void;
  maxAge: string;
  setMaxAge: (value: string) => void;
  availableSpots: string;
  setAvailableSpots: (value: string) => void;
  howToRegister: string;
  setHowToRegister: (value: string) => void;
}

const WEEKDAYS = [
  { id: 'segunda', label: 'Segunda' },
  { id: 'terca', label: 'Terça' },
  { id: 'quarta', label: 'Quarta' },
  { id: 'quinta', label: 'Quinta' },
  { id: 'sexta', label: 'Sexta' },
  { id: 'sabado', label: 'Sábado' },
  { id: 'domingo', label: 'Domingo' },
];

const ActivityFields = ({
  scheduleTimes,
  setScheduleTimes,
  weekdays,
  setWeekdays,
  minAge,
  setMinAge,
  maxAge,
  setMaxAge,
  availableSpots,
  setAvailableSpots,
  howToRegister,
  setHowToRegister,
}: ActivityFieldsProps) => {
  const toggleWeekday = (dayId: string) => {
    if (weekdays.includes(dayId)) {
      setWeekdays(weekdays.filter((d) => d !== dayId));
    } else {
      setWeekdays([...weekdays, dayId]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-poppins">Informações da Atividade</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="scheduleTimes">Horários</Label>
          <Input
            id="scheduleTimes"
            value={scheduleTimes}
            onChange={(e) => setScheduleTimes(e.target.value)}
            placeholder="Ex: 08:00 - 10:00 e 14:00 - 16:00"
          />
          <p className="text-xs text-muted-foreground">
            Informe os horários das aulas ou atividades
          </p>
        </div>

        <div className="space-y-2">
          <Label>Dias da Semana</Label>
          <div className="flex flex-wrap gap-3">
            {WEEKDAYS.map((day) => (
              <div key={day.id} className="flex items-center space-x-2">
                <Checkbox
                  id={day.id}
                  checked={weekdays.includes(day.id)}
                  onCheckedChange={() => toggleWeekday(day.id)}
                />
                <label
                  htmlFor={day.id}
                  className="text-sm cursor-pointer select-none"
                >
                  {day.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="minAge">Idade Mínima</Label>
            <Input
              id="minAge"
              type="number"
              min="0"
              max="120"
              value={minAge}
              onChange={(e) => setMinAge(e.target.value)}
              placeholder="Ex: 7"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxAge">Idade Máxima</Label>
            <Input
              id="maxAge"
              type="number"
              min="0"
              max="120"
              value={maxAge}
              onChange={(e) => setMaxAge(e.target.value)}
              placeholder="Ex: 60"
            />
            <p className="text-xs text-muted-foreground">
              Deixe vazio para sem limite
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="availableSpots">Vagas Disponíveis</Label>
          <Input
            id="availableSpots"
            type="number"
            min="0"
            value={availableSpots}
            onChange={(e) => setAvailableSpots(e.target.value)}
            placeholder="Ex: 20"
          />
          <p className="text-xs text-muted-foreground">
            Deixe vazio se não houver limite de vagas
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="howToRegister">Como se Inscrever</Label>
          <Textarea
            id="howToRegister"
            value={howToRegister}
            onChange={(e) => setHowToRegister(e.target.value)}
            placeholder="Ex: Entre em contato pelo WhatsApp (86) 99999-9999 ou compareça à sede da fundação."
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityFields;
