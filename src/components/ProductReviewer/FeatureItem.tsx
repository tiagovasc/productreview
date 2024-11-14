import { X, ThumbsUp, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Feature, Importance } from "@/types/product";

interface FeatureItemProps {
  feature: Feature;
  onImportanceChange: (importance: Importance) => void;
}

export function FeatureItem({ feature, onImportanceChange }: FeatureItemProps) {
  return (
    <div className="flex items-center space-x-2 bg-background p-4 rounded-lg animate-in fade-in duration-300">
      <span className="flex-grow font-medium">{feature.name}</span>
      <div className="flex space-x-2">
        <Button
          variant={feature.importance === 'Not important' ? 'destructive' : 'outline'}
          size="sm"
          onClick={() => onImportanceChange('Not important')}
          aria-label="Mark as not important"
        >
          <X className="h-4 w-4" />
        </Button>
        <Button
          variant={feature.importance === 'Important' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onImportanceChange('Important')}
          aria-label="Mark as important"
        >
          <ThumbsUp className="h-4 w-4" />
        </Button>
        <Button
          variant={feature.importance === 'Very Important' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onImportanceChange('Very Important')}
          aria-label="Mark as very important"
        >
          <Star className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}