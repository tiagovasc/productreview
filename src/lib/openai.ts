import OpenAI from 'openai';
import type { ProductInfo, ProductComparison, ProductRecommendations } from '@/types/product';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

// Helper function to handle OpenAI API errors
function handleOpenAIError(error: any): never {
  if (error.error?.type === 'insufficient_quota') {
    throw new Error(
      'API quota exceeded. Please check your OpenAI API key and billing status.'
    );
  }
  if (error.status === 429) {
    throw new Error(
      'Too many requests. Please wait a moment before trying again.'
    );
  }
  throw new Error(
    error.error?.message || error.message || 'An unexpected error occurred'
  );
}

const productInfoFunction = {
  name: 'get_product_info',
  description: 'Provides detailed product information and recommendations',
  parameters: {
    type: 'object',
    properties: {
      productName: {
        type: 'string',
        description: 'The name of the product',
      },
      considerations: {
        type: 'array',
        description: 'A list of key-value pairs representing product considerations',
        items: {
          type: 'object',
          properties: {
            key: {
              type: 'string',
              description: 'The type of consideration (e.g., price, quality, battery life)',
            },
            value: {
              type: 'string',
              description: 'The details or description of the consideration',
            },
          },
          required: ['key', 'value'],
        },
      },
    },
    required: ['productName', 'considerations'],
  },
};

const compareProductsFunction = {
  name: 'get_product_comparisons',
  description: 'Provides comparison information for a product and its alternatives',
  parameters: {
    type: 'object',
    properties: {
      mainProduct: {
        type: 'string',
        description: 'The main product being researched',
      },
      alternatives: {
        type: 'array',
        description: 'List of alternative products',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Name of the alternative product',
            },
            considerations: {
              type: 'array',
              description: 'Key considerations for this product',
              items: {
                type: 'object',
                properties: {
                  key: {
                    type: 'string',
                    description: 'The type of consideration',
                  },
                  value: {
                    type: 'string',
                    description: 'The details of the consideration',
                  },
                },
                required: ['key', 'value'],
              },
            },
          },
          required: ['name', 'considerations'],
        },
      },
    },
    required: ['mainProduct', 'alternatives'],
  },
};

const recommendProductsFunction = {
  name: 'get_product_recommendations',
  description: 'Provides product recommendations based on user requirements',
  parameters: {
    type: 'object',
    properties: {
      recommendations: {
        type: 'array',
        description: 'List of recommended products',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Name of the recommended product',
            },
            considerations: {
              type: 'array',
              description: 'Key considerations for this product',
              items: {
                type: 'object',
                properties: {
                  key: {
                    type: 'string',
                    description: 'The type of consideration',
                  },
                  value: {
                    type: 'string',
                    description: 'The details of the consideration',
                  },
                },
                required: ['key', 'value'],
              },
            },
          },
          required: ['name', 'considerations'],
        },
      },
    },
    required: ['recommendations'],
  },
};

export async function fetchProductInfo(productName: string): Promise<ProductInfo> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-1106-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that provides detailed product information and recommendations.',
        },
        {
          role: 'user',
          content: `Provide detailed considerations for the product "${productName}". Include various relevant attributes and their descriptions.`,
        },
      ],
      functions: [productInfoFunction],
      function_call: { name: 'get_product_info' },
      temperature: 0.7,
    });

    const message = response.choices[0]?.message;
    if (!message || !message.function_call?.arguments) {
      throw new Error('Invalid response format from OpenAI');
    }

    try {
      const data = JSON.parse(message.function_call.arguments);
      if (!data.productName || !Array.isArray(data.considerations)) {
        throw new Error('Invalid data structure in OpenAI response');
      }
      return data;
    } catch (parseError) {
      throw new Error(`Failed to parse OpenAI response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error fetching product information:', error);
    handleOpenAIError(error);
  }
}

export async function fetchProductComparisons(productName: string): Promise<ProductComparison> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-1106-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that provides detailed product comparisons.',
        },
        {
          role: 'user',
          content: `A user is considering buying "${productName}". Suggest the top 3 most relevant alternative products that serve a similar purpose.`,
        },
      ],
      functions: [compareProductsFunction],
      function_call: { name: 'get_product_comparisons' },
      temperature: 0.7,
    });

    const message = response.choices[0]?.message;
    if (!message || !message.function_call?.arguments) {
      throw new Error('Invalid response format from OpenAI');
    }

    try {
      const data = JSON.parse(message.function_call.arguments);
      if (!data.mainProduct || !Array.isArray(data.alternatives)) {
        throw new Error('Invalid data structure in OpenAI response');
      }
      return data;
    } catch (parseError) {
      throw new Error(`Failed to parse OpenAI response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error fetching product comparisons:', error);
    handleOpenAIError(error);
  }
}

export async function fetchProductRecommendations(userDescription: string): Promise<ProductRecommendations> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-1106-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that provides product recommendations based on user needs.',
        },
        {
          role: 'user',
          content: `Based on the following description, suggest the top 4 most relevant products that meet the user's needs: "${userDescription}"`,
        },
      ],
      functions: [recommendProductsFunction],
      function_call: { name: 'get_product_recommendations' },
      temperature: 0.7,
    });

    const message = response.choices[0]?.message;
    if (!message || !message.function_call?.arguments) {
      throw new Error('Invalid response format from OpenAI');
    }

    try {
      const data = JSON.parse(message.function_call.arguments);
      if (!Array.isArray(data.recommendations)) {
        throw new Error('Invalid data structure in OpenAI response');
      }
      return data;
    } catch (parseError) {
      throw new Error(`Failed to parse OpenAI response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error fetching product recommendations:', error);
    handleOpenAIError(error);
  }
}

export async function analyzeYouTubeContent(
  product: string,
  features: { veryImportant: string[]; important: string[] },
  videos: Array<{ id: string; transcript: string }>
): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-1106-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that analyzes product reviews from YouTube videos. Format your response in Markdown.',
        },
        {
          role: 'user',
          content: `Analyze these YouTube transcripts about ${product}. For each video:
            1) Generate a small summary of the video/content
            2) Analyze how the product performs regarding these very important features: ${features.veryImportant.join(', ')}
            3) Analyze how the product performs regarding these important features: ${features.important.join(', ')}
            4) List important considerations not included above
            5) List complaints or limitations

            If information isn't provided for any given variable, output null.

            ${videos.map((v, i) => `Transcript of video ${i + 1}: ${v.transcript}`).join('\n\n')}

            Important: avoid generalized praise for the product. This needs to be a report that dives into the specifics.
            
            Format the response in Markdown with appropriate headers and bullet points.`,
        },
      ],
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Invalid response format from OpenAI');
    }

    return videos.map(() => content);
  } catch (error) {
    console.error('OpenAI YouTube Analysis Error:', error);
    handleOpenAIError(error);
  }
}

export async function generateFinalReport(
  product: string,
  features: { veryImportant: string[]; important: string[] },
  youtubeAnalysis: string[],
  websiteResults: string,
  redditResults: string
): Promise<string> {
  try {
    console.log('Generating final report for:', product);
    console.log('Features:', features);

    const response = await openai.chat.completions.create({
      model: 'gpt-4-1106-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that generates comprehensive product research reports. Your response must be in valid JSON format with the exact structure specified in the user prompt.',
        },
        {
          role: 'user',
          content: `Generate a JSON report for ${product} with this exact structure:
{
  "introduction": "Brief product introduction",
  "features": [
    {
      "name": "Feature name",
      "importance": "Very Important or Important",
      "analysis": "Detailed analysis"
    }
  ],
  "limitations": ["List of limitations"],
  "conclusion": "Final summary"
}

Very Important Features: ${features.veryImportant.join(', ')}
Important Features: ${features.important.join(', ')}

Research Data:
YouTube Analysis: ${youtubeAnalysis.join('\n')}
Website Analysis: ${websiteResults}
Reddit Analysis: ${redditResults}

Remember:
1. Response MUST be valid JSON
2. Include ALL features listed above
3. Mark importance correctly based on the feature lists
4. Provide detailed analysis for each feature
5. DO NOT add any markdown or text outside the JSON structure`
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    try {
      const parsed = JSON.parse(content);
      if (!parsed.introduction || !Array.isArray(parsed.features) || !Array.isArray(parsed.limitations) || !parsed.conclusion) {
        throw new Error('Missing required fields in JSON response');
      }
      return content;
    } catch (error) {
      console.error('JSON parsing error:', error);
      throw new Error('Invalid JSON format in response');
    }
  } catch (error) {
    console.error('OpenAI Report Generation Error:', error);
    handleOpenAIError(error);
  }
}