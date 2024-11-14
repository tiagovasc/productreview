const API_KEY = import.meta.env.VITE_PERPLEXITY_API_KEY;

interface PerplexityResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export async function searchPerplexity(query: string, useReddit: boolean = false): Promise<string> {
  const url = 'https://api.perplexity.ai/chat/completions';
  const searchDomainFilter = useReddit ? ['reddit.com'] : ['-reddit.com'];

  const payload = {
    model: 'llama-3.1-sonar-small-128k-online',
    messages: [
      { role: 'system', content: 'Be precise and concise.' },
      { role: 'user', content: `${query} review` },
    ],
    max_tokens: 1500,
    temperature: 0.2,
    top_p: 0.9,
    return_citations: true,
    search_domain_filter: searchDomainFilter,
    return_images: false,
    return_related_questions: false,
    search_recency_filter: 'month',
    top_k: 5,
    stream: false,
    presence_penalty: 0,
    frequency_penalty: 1,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.statusText}`);
    }

    const data: PerplexityResponse = await response.json();
    return data.choices[0]?.message.content || '';
  } catch (error) {
    console.error('Perplexity API Error:', error);
    throw new Error('Failed to fetch Perplexity results');
  }
}