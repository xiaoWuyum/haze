export type VideoGenerationStatus = 'queued' | 'generating' | 'completed' | 'failed';

export interface VideoGenerationInput {
  prompt: string;
  imageUrl?: string;
}

export interface VideoGenerationJob {
  jobId: string;
  provider: string;
  status: VideoGenerationStatus;
  videoUrl?: string;
  error?: string;
}

export interface VideoProvider {
  readonly name: string;
  createVideo(input: VideoGenerationInput): Promise<VideoGenerationJob>;
  getVideo(jobId: string): Promise<VideoGenerationJob>;
}
