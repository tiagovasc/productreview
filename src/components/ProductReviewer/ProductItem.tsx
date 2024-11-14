import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/product";

interface ProductItemProps {
  product: Product;
  onRemove: () => void;
}

export function ProductItem({ product, onRemove }: ProductItemProps) {
  return (
    <div className="flex items-center space-x-2 bg-background p-4 rounded-lg animate-in fade-in duration-300">
      <span className="flex-grow font-medium">{product.name}</span>
      <Button
        variant="outline"
        size="sm"
        onClick={onRemove}
        className="h-8 px-2"
        aria-label="Remove product"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}