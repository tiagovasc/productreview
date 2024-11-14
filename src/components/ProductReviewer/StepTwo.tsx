import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Option } from "@/types/product";

interface StepTwoProps {
  option: Option;
  input: string;
  loading: boolean;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

export function StepTwo({ 
  option, 
  input, 
  loading, 
  onInputChange, 
  onSubmit, 
  onBack 
}: StepTwoProps) {
  const getPlaceholder = () => {
    switch (option) {
      case 'research':
        return "Enter product name";
      case 'compare':
        return "Enter product to compare";
      case 'recommend':
        return "What kind of product are you looking for?";
      default:
        return "Enter product details";
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6 animate-in fade-in duration-500">
      <Input
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        placeholder={getPlaceholder()}
        className="w-full"
      />
      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" onClick={onBack} type="button" className="flex items-center justify-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button type="submit" disabled={loading} className="flex items-center justify-center">
          {loading ? 'Loading...' : 'Continue'}
        </Button>
      </div>
    </form>
  );
}