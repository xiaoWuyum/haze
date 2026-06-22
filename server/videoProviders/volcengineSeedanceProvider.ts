import type { VideoGenerationInput, VideoGenerationJob, VideoProvider } from './types';
import { ensureDirectedVideoPrompt } from '../../src/utils/videoPromptDirector';

interface VolcengineTaskResponse {
  id?: string;
  status?: string;
  content?: unknown;
  output?: unknown;
  video_url?: string;
  url?: string;
  error?: {
    message?: string;
  };
}

function findVideoUrl(value: unknown): string | undefined {
  if (typeof value === 'string' && /^https?:\/\//.test(value)) return value;

  if (Array.isArray(value)) {
    for (const item of value) {
      const url = findVideoUrl(item);
      if (url) return url;
    }
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    for (const key of ['video_url', 'videoUrl', 'url']) {
      if (typeof record[key] === 'string' && /^https?:\/\//.test(record[key])) {
        return record[key];
      }
    }

    for (const nested of Object.values(record)) {
      const url = findVideoUrl(nested);
      if (url) return url;
    }
  }

  return undefined;
}

function mapVolcengineStatus(status: string | undefined): VideoGenerationJob['status'] {
  const normalized = (status || '').toLowerCase();
  if (['succeeded', 'success', 'completed', 'done'].includes(normalized)) return 'completed';
  if (['failed', 'error', 'cancelled', 'canceled'].includes(normalized)) return 'failed';
  if (['running', 'processing', 'generating'].includes(normalized)) return 'generating';
  return 'queued';
}

export class VolcengineSeedanceProvider implements VideoProvider {
  readonly name = 'volcengine-seedance';

  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly duration: number;
  private readonly ratio: string;
  private readonly cameraFixed: boolean;
  private readonly watermark: boolean;

  constructor() {
    const apiKey = process.env.VOLCENGINE_API_KEY || process.env.ARK_API_KEY;
    if (!apiKey) {
      throw new Error('VOLCENGINE_API_KEY is required when VIDEO_PROVIDER=volcengine');
    }
    if (/[^\x20-\x7E]/.test(apiKey) || apiKey.includes('YOUR_') || apiKey.includes('你的')) {
      throw new Error('VOLCENGINE_API_KEY must be a real Ark API key, not the example placeholder');
    }

    this.apiKey = apiKey;
    this.baseUrl = process.env.VOLCENGINE_API_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3';
    this.model = process.env.VOLCENGINE_VIDEO_MODEL || 'doubao-seedance-1-5-pro-251215';
    this.duration = Number(process.env.VIDEO_DURATION || process.env.VOLCENGINE_VIDEO_DURATION || 5);
    this.ratio = process.env.VOLCENGINE_RATIO || process.env.VIDEO_RATIO || '720:1280';
    this.cameraFixed = (process.env.VOLCENGINE_CAMERA_FIXED || 'true') !== 'false';
    this.watermark = (process.env.VOLCENGINE_WATERMARK || 'false') === 'true';
  }

  async createVideo(input: VideoGenerationInput): Promise<VideoGenerationJob> {
    const content: Array<Record<string, unknown>> = [
      {
        type: 'text',
        text: `${ensureDirectedVideoPrompt(input.prompt)} --duration ${this.duration} --ratio ${this.ratio} --camerafixed ${this.cameraFixed} --watermark ${this.watermark}`,
      },
    ];

    if (input.imageUrl) {
      content.push({
        type: 'image_url',
        image_url: {
          url: input.imageUrl,
        },
      });
    }

    const response = await fetch(`${this.baseUrl}/contents/generations/tasks`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        content,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Volcengine Seedance create video failed: ${response.status} ${details}`);
    }

    const task = await response.json() as VolcengineTaskResponse;
    if (!task.id) {
      throw new Error('Volcengine Seedance response did not include a task id');
    }

    return {
      jobId: task.id,
      provider: this.name,
      status: mapVolcengineStatus(task.status),
      videoUrl: findVideoUrl(task),
      error: task.error?.message,
    };
  }

  async getVideo(jobId: string): Promise<VideoGenerationJob> {
    const response = await fetch(`${this.baseUrl}/contents/generations/tasks/${encodeURIComponent(jobId)}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Volcengine Seedance get video failed: ${response.status} ${details}`);
    }

    const task = await response.json() as VolcengineTaskResponse;
    return {
      jobId,
      provider: this.name,
      status: mapVolcengineStatus(task.status),
      videoUrl: findVideoUrl(task),
      error: task.error?.message,
    };
  }
}
