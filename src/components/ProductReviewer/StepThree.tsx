import { useState, useEffect } from 'react';
import { PlusCircle, ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FeatureItem } from "./FeatureItem";
import { ProductItem } from "./ProductItem";
import { LoadingScreen } from "./LoadingScreen";
import type { Product, Importance, Option } from "@/types/product";

interface StepThreeProps {
  products: Product[];
  newFeature: string;
  option: Option;
  onNewFeatureChange: (value: string) => void;
  onAddFeature: (productIndex: number) => void;
  onImportanceChange: (productIndex: number, featureId: number, importance: Importance) => void;
  onBack: () => void;
  onContinue: () => void;
  loading: boolean;
  onProductsChange?: (products: Product[]) => void;
}

export function StepThree({
  products,
  newFeature,
  option,
  onNewFeatureChange,
  onAddFeature,
  onImportanceChange,
  onBack,
  onContinue,
  loading,
  onProductsChange,
}: StepThreeProps) {
  const [newProduct, setNewProduct] = useState("");
  const [productList, setProductList] = useState(() => products.slice(0, -1));
  const featuresProduct = products[products.length - 1];
  const showProductSection = option === 'compare' || option === 'recommend';

  const handleAddProduct = () => {
    if (newProduct.trim()) {
      const updatedList = [...productList, { name: newProduct.trim(), features: [] }];
      setProductList(updatedList);
      setNewProduct("");
      onProductsChange?.([...updatedList, featuresProduct]);
    }
  };

  const handleRemoveProduct = (index: number) => {
    const updatedList = productList.filter((_, i) => i !== index);
    setProductList(updatedList);
    onProductsChange?.([...updatedList, featuresProduct]);
  };

  // Initialize products on mount
  useEffect(() => {
    setProductList(products.slice(0, -1));
  }, [products]);

  if (!products || products.length === 0) {
    return (
      <div className="text-center">
        <p>No products available. Please go back and try again.</p>
        <Button onClick={onBack} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
    );
  }

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {showProductSection && (
        <div className="space-y-4 bg-secondary p-6 rounded-lg">
          <h2 className="text-2xl font-semibold">Products</h2>
          <div className="space-y-2">
            {productList.map((product, index) => (
              <ProductItem
                key={index}
                product={product}
                onRemove={() => handleRemoveProduct(index)}
              />
            ))}
          </div>
          <div className="flex space-x-2">
            <Input
              value={newProduct}
              onChange={(e) => setNewProduct(e.target.value)}
              placeholder="Add new product"
              className="flex-grow"
            />
            <Button onClick={handleAddProduct}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4 bg-secondary p-6 rounded-lg">
        <h2 className="text-2xl font-semibold">Features</h2>
        <div className="space-y-2">
          {featuresProduct.features.map(feature => (
            <FeatureItem
              key={feature.id}
              feature={feature}
              onImportanceChange={(importance) => 
                onImportanceChange(products.length - 1, feature.id, importance)
              }
            />
          ))}
        </div>
        <div className="flex space-x-2">
          <Input
            value={newFeature}
            onChange={(e) => onNewFeatureChange(e.target.value)}
            placeholder="Add new feature"
            className="flex-grow"
          />
          <Button onClick={() => onAddFeature(products.length - 1)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" onClick={onBack} className="flex items-center justify-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button 
          onClick={onContinue}
          disabled={loading || (showProductSection && productList.length === 0)}
          className="flex items-center justify-center"
        >
          {loading ? (
            <>
              <span className="animate-spin mr-2">⚡</span>
              Researching...
            </>
          ) : (
            <>
              Start Research
              <ChevronRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}