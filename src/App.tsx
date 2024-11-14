import { useState } from 'react';
import { performResearch, performMultiProductResearch } from './lib/research';
import type { Option, Step, Product, MainOption, ResearchResults, ResearchError } from './types/product';
import { Button } from "@/components/ui/button";
import { StepOne } from './components/ProductReviewer/StepOne';
import { StepOnePointFive } from './components/ProductReviewer/StepOnePointFive';
import { StepTwo } from './components/ProductReviewer/StepTwo';
import { StepThree } from './components/ProductReviewer/StepThree';
import { StepFive } from './components/ProductReviewer/StepFive';
import { ErrorDialog } from './components/ui/error-dialog';
import { fetchProductInfo, fetchProductComparisons, fetchProductRecommendations } from './lib/openai';

function App() {
  const [step, setStep] = useState<Step>(1);
  const [mainOption, setMainOption] = useState<MainOption>(null);
  const [option, setOption] = useState<Option>(null);
  const [input, setInput] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ResearchError | null>(null);
  const [newFeature, setNewFeature] = useState('');
  const [research, setResearch] = useState<ResearchResults | null>(null);

  const handleMainOptionSelect = (selectedOption: MainOption) => {
    setMainOption(selectedOption);
    if (selectedOption === 'known') {
      setStep(1.5);
    } else {
      setStep(2);
      setOption('recommend');
    }
  };

  const handleOptionSelect = async (selectedOption: Option) => {
    setOption(selectedOption);
    setLoading(true);
    setError(null);

    try {
      switch (selectedOption) {
        case 'research': {
          const productInfo = await fetchProductInfo(input);
          const features = extractFeatures(productInfo.considerations);
          setProducts([{ name: input, features }]);
          break;
        }
        case 'compare': {
          const comparison = await fetchProductComparisons(input);
          const features = extractFeatures(comparison.alternatives[0].considerations);
          const allProducts = [
            { name: comparison.mainProduct, features: [] },
            ...comparison.alternatives.map(alt => ({ name: alt.name, features: [] })),
          ];
          setProducts([...allProducts, { name: 'Features', features }]);
          break;
        }
        case 'recommend': {
          const recommendations = await fetchProductRecommendations(input);
          const features = extractFeatures(recommendations.recommendations[0].considerations);
          const recommendedProducts = recommendations.recommendations.map(rec => ({
            name: rec.name,
            features: [],
          }));
          setProducts([...recommendedProducts, { name: 'Features', features }]);
          break;
        }
      }
      setStep(3);
    } catch (err) {
      const errorObj = err as Error;
      setError({
        message: errorObj.message || 'An unknown error occurred',
        logs: (errorObj as any).logs || []
      });
    } finally {
      setLoading(false);
    }
  };

  const extractFeatures = (considerations: Array<{ key: string; value: string }>) => {
    return considerations.map((consideration, index) => ({
      id: Date.now() + index,
      name: consideration.key,
      importance: 'Important' as const,
    }));
  };

  const handleBack = () => {
    if (step === 1.5) {
      setStep(1);
      setOption(null);
      setInput('');
      setMainOption(null);
    } else if (step === 2) {
      setStep(1);
      setOption(null);
      setInput('');
      setMainOption(null);
      setProducts([]);
    } else if (step === 3) {
      if (mainOption === 'known') {
        setStep(1.5);
      } else {
        setStep(2);
      }
      setProducts([]);
    } else if (step === 5) {
      setStep(3);
      setResearch(null);
    }
  };

  const handleImportanceChange = (productIndex: number, featureId: number, importance: string) => {
    setProducts(prevProducts => prevProducts.map((product, index) => 
      index === productIndex
        ? {
            ...product,
            features: product.features.map(feature => 
              feature.id === featureId ? { ...feature, importance } : feature
            )
          }
        : product
    ));
  };

  const addNewFeature = (productIndex: number) => {
    if (newFeature.trim()) {
      setProducts(prevProducts => prevProducts.map((product, index) => 
        index === productIndex
          ? {
              ...product,
              features: [...product.features, { 
                id: Date.now(), 
                name: newFeature.trim(), 
                importance: 'Important' 
              }]
            }
          : product
      ));
      setNewFeature('');
    }
  };

  const handleProductsChange = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
  };

  const startResearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const featuresProduct = products[products.length - 1];
      const features = featuresProduct.features.reduce(
        (acc, feature) => {
          if (feature.importance === 'Very Important') {
            acc.veryImportant.push(feature.name);
          } else if (feature.importance === 'Important') {
            acc.important.push(feature.name);
          }
          return acc;
        },
        { veryImportant: [] as string[], important: [] as string[] }
      );

      const results = option === 'research'
        ? await performResearch(products[0].name, features)
        : await performMultiProductResearch(products, features);

      setResearch(results);
      setStep(5);
    } catch (err) {
      const errorObj = err as Error;
      setError({
        message: errorObj.message || 'An unknown error occurred',
        logs: (errorObj as any).logs || []
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-4xl w-full mx-auto p-6">
        <div className="bg-card p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-center mb-8">
            Product Research AI
          </h1>
          
          {error && (
            <p className="text-destructive text-center mb-6">
              Research failed. Click <ErrorDialog logs={error.logs} /> for details.
            </p>
          )}

          {step === 1 && (
            <StepOne onOptionSelect={handleMainOptionSelect} />
          )}

          {step === 1.5 && (
            <StepOnePointFive
              input={input}
              loading={loading}
              onInputChange={setInput}
              onOptionSelect={handleOptionSelect}
              onBack={handleBack}
            />
          )}

          {step === 2 && (
            <StepTwo
              option={option}
              input={input}
              loading={loading}
              onInputChange={setInput}
              onSubmit={(e) => {
                e.preventDefault();
                handleOptionSelect('recommend');
              }}
              onBack={handleBack}
            />
          )}

          {step === 3 && (
            <StepThree
              products={products}
              option={option}
              newFeature={newFeature}
              onNewFeatureChange={setNewFeature}
              onAddFeature={addNewFeature}
              onImportanceChange={handleImportanceChange}
              onBack={handleBack}
              onContinue={startResearch}
              loading={loading}
              onProductsChange={handleProductsChange}
            />
          )}

          {step === 5 && research && (
            <StepFive
              research={research}
              onBack={handleBack}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;