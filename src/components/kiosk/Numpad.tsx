import { Button } from "@/components/ui/button";
import { Delete } from "lucide-react";

interface NumpadProps {
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
  accentColor?: string;
}

export const Numpad = ({ value, onChange, maxLength = 20, accentColor }: NumpadProps) => {
  const press = (k: string) => {
    if (k === "del") return onChange(value.slice(0, -1));
    if (value.length >= maxLength) return;
    onChange(value + k);
  };
  const keys = ["1","2","3","4","5","6","7","8","9","0","000","del"];
  return (
    <div className="grid grid-cols-3 gap-3">
      {keys.map((k) => (
        <Button
          key={k}
          variant="outline"
          onClick={() => press(k)}
          className="h-16 text-2xl font-bold rounded-2xl"
          style={k === "del" ? undefined : { borderColor: accentColor }}
        >
          {k === "del" ? <Delete className="w-6 h-6" /> : k}
        </Button>
      ))}
    </div>
  );
};