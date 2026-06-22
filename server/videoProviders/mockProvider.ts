import type { VideoGenerationInput, VideoGenerationJob, VideoProvider } from './types';

interface MockJobRecord {
  createdAt: number;
  prompt: string;
}

const MOCK_VIDEOS = [
  'https://assets.mixkit.co/videos/preview/mixkit-futuristic-subway-station-with-neon-lights-44133-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-fireplace-burning-with-bright-fire-in-dark-cozy-room-41604-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-background-1611-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-top-view-of-waves-crashing-on-a-beach-46014-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-41864-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-snow-falling-decorating-coniferous-trees-in-a-forest-44111-large.mp4',
];

function pickMockVideo(prompt: string) {
  const text = prompt.toLowerCase();
  if (text.includes('cyber') || text.includes('neon') || text.includes('tokyo')) return MOCK_VIDEOS[0];
  if (text.includes('space') || text.includes('star') || text.includes('galaxy')) return MOCK_VIDEOS[2];
  if (text.includes('beach') || text.includes('wave') || text.includes('ocean')) return MOCK_VIDEOS[3];
  if (text.includes('forest') || text.includes('rainforest') || text.includes('moss')) return MOCK_VIDEOS[4];
  if (text.includes('snow') || text.includes('winter') || text.includes('mountain')) return MOCK_VIDEOS[5];
  return MOCK_VIDEOS[1];
}

export class MockVideoProvider implements VideoProvider {
  readonly name = 'mock';

  private readonly jobs = new Map<string, MockJobRecord>();

  async createVideo(input: VideoGenerationInput): Promise<VideoGenerationJob> {
    const jobId = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    this.jobs.set(jobId, {
      createdAt: Date.now(),
      prompt: input.prompt,
    });

    return {
      jobId,
      provider: this.name,
      status: 'queued',
    };
  }

  async getVideo(jobId: string): Promise<VideoGenerationJob> {
    const job = this.jobs.get(jobId);
    if (!job) {
      return {
        jobId,
        provider: this.name,
        status: 'failed',
        error: 'Video job not found',
      };
    }

    const ageMs = Date.now() - job.createdAt;
    if (ageMs < 1200) {
      return { jobId, provider: this.name, status: 'queued' };
    }

    if (ageMs < 3600) {
      return { jobId, provider: this.name, status: 'generating' };
    }

    return {
      jobId,
      provider: this.name,
      status: 'completed',
      videoUrl: pickMockVideo(job.prompt),
    };
  }
}
