import { VideoResult } from '@/types/product';

const API_URL = 'https://flasktest-production-b8ba.up.railway.app/run';
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

export async function searchYoutubeVideos(query: string): Promise<VideoResult[]> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
        query + ' review'
      )}&type=video&maxResults=3&key=${YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch YouTube videos: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.items || !Array.isArray(data.items)) {
      throw new Error('Invalid response format from YouTube API');
    }

    return data.items.map((item: any) => ({
      id: item.id?.videoId || '',
      title: item.snippet?.title || '',
      description: item.snippet?.description || '',
      analysis: '',
    }));
  } catch (error) {
    throw error;
  }
}

export async function getVideoTranscripts(videoIds: string[]): Promise<Record<string, string>> {
  if (!import.meta.env.VITE_API_KEY) {
    throw new Error('API key is not configured');
  }

  try {
    const headers = {
      'Authorization': `Bearer ${import.meta.env.VITE_API_KEY}`,
      'Content-Type': 'application/json'
    };

    const apiUrlWithParams = `${API_URL}?clean_output=true`;
    const videoUrls = videoIds.map(id => `https://www.youtube.com/watch?v=${id}`);
    
    const response = await fetch(apiUrlWithParams, {
      method: 'POST',
      headers,
      body: JSON.stringify({ 
        urls: videoUrls
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch transcripts: ${response.statusText}`);
    }

    const transcriptText = await response.text();
    
    // Generate mock transcripts for development/testing
    // In production, this should be replaced with actual transcript processing
    const transcriptMap: Record<string, string> = {};
    videoIds.forEach((id) => {
      transcriptMap[id] = `Mock transcript for video ${id}. This is a placeholder text that simulates the actual video transcript content. The real implementation should process the actual transcript data from the API response.`;
    });

    return transcriptMap;
  } catch (error) {
    console.error('Error fetching transcripts:', error);
    throw new Error('Failed to fetch video transcripts. Please try again later.');
  }
}