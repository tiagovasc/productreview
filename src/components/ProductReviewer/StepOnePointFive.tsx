import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Option } from "@/types/product";
import { Search, ListFilter } from "lucide-react";

interface StepOnePointFiveProps {
  input: string;
  onInputChange: (value: string) => void;
  onOptionSelect: (option: Option) => void;
  onBack: () => void;
  loading: boolean;
}

export function StepOnePointFive({ 
  input, 
  onInputChange, 
  onOptionSelect,
  onBack,
  loading
}: StepOnePointFiveProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Input
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        placeholder="Enter product name"
        className="w-full"
      />
      <div className="grid grid-cols-2 gap-4">
        <Button 
          size="lg"
          className="w-full text-left flex items-center justify-center"
          onClick={() => onOptionSelect('research')}
          disabled={!input.trim() || loading}
        >
          <Search className="mr-2 h-5 w-5" />
          {loading ? 'Loading...' : 'Single Product Research'}
        </Button>
        <Button 
          size="lg"
          className="w-full text-left flex items-center justify-center"
          onClick={() => onOptionSelect('compare')}
          disabled={!input.trim() || loading}
        >
          <ListFilter className="mr-2 h-5 w-5" />
          {loading ? 'Loading...' : 'Multi Product Research'}
        </Button>
      </div>
      <div className="flex justify-start">
        <Button variant="outline" onClick={onBack} disabled={loading}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
    </div>
  );
}