import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Markdown from "markdown-to-jsx";
import type { ResearchResults } from "@/types/product";
import { useState } from "react";

interface StepFiveProps {
  research: ResearchResults;
  onBack: () => void;
}

interface ParsedReport {
  introduction: string;
  features: Array<{
    name: string;
    importance: string;
    analysis: string;
  }>;
  limitations: string[];
  conclusion: string;
}

const MarkdownContent = ({ content }: { content: string }) => (
  <div className="prose prose-sm max-w-none dark:prose-invert">
    <Markdown>{content}</Markdown>
  </div>
);

const FinalReport = ({ content }: { content: string }) => {
  try {
    const report: ParsedReport = JSON.parse(content);
    
    return (
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Introduction</h2>
          <p className="text-gray-700 dark:text-gray-300">{report.introduction}</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Features Analysis</h2>
          <div className="space-y-6">
            {report.features.map((feature, index) => (
              <div key={index} className="space-y-2">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  {feature.name}
                  <span className={`text-sm px-2 py-1 rounded ${
                    feature.importance === 'Very Important' 
                      ? 'bg-primary/10 text-primary'
                      : 'bg-secondary text-secondary-foreground'
                  }`}>
                    {feature.importance}
                  </span>
                </h3>
                <p className="text-gray-700 dark:text-gray-300">{feature.analysis}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Limitations</h2>
          <ul className="list-disc pl-5 space-y-2">
            {report.limitations.map((limitation, index) => (
              <li key={index} className="text-gray-700 dark:text-gray-300">{limitation}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Conclusion</h2>
          <p className="text-gray-700 dark:text-gray-300">{report.conclusion}</p>
        </section>
      </div>
    );
  } catch (error) {
    console.error('Error parsing report:', error);
    return <div className="text-red-500">Error parsing report data</div>;
  }
};

export function StepFive({ research, onBack }: StepFiveProps) {
  const [selectedProduct, setSelectedProduct] = useState(research.reports[0].productName);
  const currentReport = research.reports.find(r => r.productName === selectedProduct)!;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {research.reports.length > 1 && (
        <div className="w-full flex justify-end mb-4">
          <Select value={selectedProduct} onValueChange={setSelectedProduct}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Select product to view" />
            </SelectTrigger>
            <SelectContent>
              {research.reports.map((report) => (
                <SelectItem key={report.productName} value={report.productName}>
                  {report.productName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Tabs defaultValue="final" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="final">Final Report</TabsTrigger>
          <TabsTrigger value="youtube">YouTube</TabsTrigger>
          <TabsTrigger value="websites">Websites</TabsTrigger>
          <TabsTrigger value="reddit">Reddit</TabsTrigger>
        </TabsList>

        <TabsContent value="final" className="mt-4">
          <Card className="p-6">
            <ScrollArea className="h-[60vh]">
              <FinalReport content={currentReport.finalReport} />
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="youtube" className="mt-4">
          <Card className="p-6">
            <ScrollArea className="h-[60vh]">
              <div className="space-y-6">
                {currentReport.youtubeResults.map((video, index) => (
                  <div key={index} className="space-y-2">
                    <h3 className="text-lg font-semibold">{video.title}</h3>
                    <p className="text-sm text-muted-foreground">{video.description}</p>
                    {video.analysis && (
                      <MarkdownContent content={video.analysis} />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="websites" className="mt-4">
          <Card className="p-6">
            <ScrollArea className="h-[60vh]">
              <MarkdownContent content={currentReport.websiteResults} />
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="reddit" className="mt-4">
          <Card className="p-6">
            <ScrollArea className="h-[60vh]">
              <MarkdownContent content={currentReport.redditResults} />
            </ScrollArea>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" onClick={onBack} className="flex items-center justify-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button className="flex items-center justify-center" onClick={() => window.location.reload()}>
          Start New Research
        </Button>
      </div>
    </div>
  );
}