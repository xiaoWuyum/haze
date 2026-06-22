export type VideoGenerationStatus = 'queued' | 'generating' | 'completed' | 'failed';

export interface VideoGenerationJob {
  jobId: string;
  provider: string;
  status: VideoGenerationStatus;
  videoUrl?: string;
  error?: string;
}

export interface VideoGenerationRequest {
  prompt: string;
  imageUrl?: string;
}

export async function requestVideoGeneration(input: VideoGenerationRequest): Promise<VideoGenerationJob> {
  const response = await fetch('/api/video/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`Video API returned ${response.status}`);
  }

  return response.json() as Promise<VideoGenerationJob>;
}

export async function getVideoGenerationJob(jobId: string): Promise<VideoGenerationJob> {
  const response = await fetch(`/api/video/${encodeURIComponent(jobId)}`);

  if (!response.ok) {
    throw new Error(`Video job API returned ${response.status}`);
  }

  return response.json() as Promise<VideoGenerationJob>;
}
