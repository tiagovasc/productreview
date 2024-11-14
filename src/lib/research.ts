import { searchYoutubeVideos, getVideoTranscripts } from './youtube';
import { searchPerplexity } from './perplexity';
import { analyzeYouTubeContent, generateFinalReport } from './openai';
import type { ResearchResults, ApiLog, Product, ProductReport } from '@/types/product';

interface FeatureSet {
  veryImportant: string[];
  important: string[];
}

const logs: ApiLog[] = [];

function addLog(log: ApiLog) {
  logs.push(log);
}

async function researchSingleProduct(
  product: Product,
  features: FeatureSet
): Promise<ProductReport> {
  const videos = await searchYoutubeVideos(product.name);
  
  if (videos.length === 0) {
    throw new Error(`No videos found for ${product.name}`);
  }

  const timestamp = new Date().toISOString();
  const transcripts = await getVideoTranscripts(videos.map(v => v.id));
  
  addLog({
    timestamp,
    type: 'youtube',
    endpoint: 'transcript',
    request: {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer [HIDDEN]',
        'Content-Type': 'application/json'
      },
      body: { videoIds: Object.keys(transcripts) }
    },
    response: {
      status: 200,
      headers: {},
      body: 'Batch transcripts retrieved successfully'
    }
  });

  const videosWithTranscripts = videos.map(video => ({
    ...video,
    transcript: transcripts[video.id] || ''
  }));

  const validVideos = videosWithTranscripts.filter(video => 
    video.transcript && video.transcript.trim().length > 0
  );

  if (validVideos.length === 0) {
    throw new Error(`No valid video transcripts available for ${product.name}`);
  }

  const youtubeAnalysis = await analyzeYouTubeContent(
    product.name,
    features,
    validVideos
  );

  const websiteResults = await searchPerplexity(
    `I'm researching ${product.name}. Provide detailed information about:
    ${features.veryImportant.length > 0 ? `Very important features: ${features.veryImportant.join(', ')}` : ''}
    ${features.important.length > 0 ? `Important features: ${features.important.join(', ')}` : ''}
    Also list any notable limitations or complaints about ${product.name}.`,
    false
  );

  const redditResults = await searchPerplexity(
    `What do users say about ${product.name}? Focus on:
    ${features.veryImportant.length > 0 ? `Very important features: ${features.veryImportant.join(', ')}` : ''}
    ${features.important.length > 0 ? `Important features: ${features.important.join(', ')}` : ''}
    Include common complaints and limitations mentioned by users.`,
    true
  );

  const finalReport = await generateFinalReport(
    product.name,
    features,
    youtubeAnalysis,
    websiteResults,
    redditResults
  );

  return {
    productName: product.name,
    youtubeResults: validVideos.map((video, index) => ({
      ...video,
      analysis: youtubeAnalysis[index] || ''
    })),
    websiteResults,
    redditResults,
    finalReport,
  };
}

export async function performResearch(
  productName: string,
  features: FeatureSet
): Promise<ResearchResults> {
  try {
    const report = await researchSingleProduct({ name: productName, features: [] }, features);
    return { reports: [report] };
  } catch (error) {
    const errorWithLogs = new Error(error instanceof Error ? error.message : 'Research failed');
    (errorWithLogs as any).logs = logs;
    throw errorWithLogs;
  }
}

export async function performMultiProductResearch(
  products: Product[],
  features: FeatureSet
): Promise<ResearchResults> {
  try {
    const productList = products.filter(p => p.name !== 'Features');
    const reports = await Promise.all(
      productList.map(product => researchSingleProduct(product, features))
    );
    return { reports };
  } catch (error) {
    const errorWithLogs = new Error(error instanceof Error ? error.message : 'Research failed');
    (errorWithLogs as any).logs = logs;
    throw errorWithLogs;
  }
}