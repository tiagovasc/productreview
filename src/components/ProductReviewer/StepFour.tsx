import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/product";

interface StepFourProps {
  products: Product[];
  onBack: () => void;
  onStartResearch: () => void;
  loading: boolean;
}

export function StepFour({ products, onBack, onStartResearch, loading }: StepFourProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Review Features</h2>
        {products.map((product, index) => (
          <div key={index} className="bg-secondary p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">{product.name}</h3>
            <div className="space-y-2">
              {product.features.map((feature, featureIndex) => (
                <p key={featureIndex}>
                  <span className="font-medium">{feature.name}:</span>{" "}
                  <span className={
                    feature.importance === 'Very Important' 
                      ? 'text-primary font-semibold'
                      : feature.importance === 'Not important'
                      ? 'text-muted-foreground'
                      : ''
                  }>
                    {feature.importance}
                  </span>
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={onStartResearch} disabled={loading}>
          {loading ? 'Researching...' : 'Start Research'}
        </Button>
      </div>
    </div>
  );
}