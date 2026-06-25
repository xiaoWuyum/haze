import type { VideoGenerationInput, VideoGenerationJob, VideoProvider } from './types.js';
import { ensureDirectedVideoPrompt } from '../../src/utils/videoPromptDirector.js';

interface RunwayTask {
  id?: string;
  status?: string;
  output?: unknown;
  error?: string;
  failure?: string;
}

function getOutputVideoUrl(output: unknown): string | undefined {
  if (typeof output === 'string') return output;

  if (Array.isArray(output)) {
    const firstString = output.find(item => typeof item === 'string');
    if (firstString) return firstString;

    const firstUrlObject = output.find(
      item => item && typeof item === 'object' && 'url' in item && typeof (item as { url?: unknown }).url === 'string',
    ) as { url?: string } | undefined;
    return firstUrlObject?.url;
  }

  if (output && typeof output === 'object' && 'url' in output) {
    const url = (output as { url?: unknown }).url;
    return typeof url === 'string' ? url : undefined;
  }

  return undefined;
}

function mapRunwayStatus(status: string | undefined): VideoGenerationJob['status'] {
  const normalized = (status || '').toLowerCase();
  if (['succeeded', 'completed', 'success'].includes(normalized)) return 'completed';
  if (['failed', 'cancelled', 'canceled'].includes(normalized)) return 'failed';
  if (['running', 'processing', 'generating', 'throttled'].includes(normalized)) return 'generating';
  return 'queued';
}

export class RunwayVideoProvider implements VideoProvider {
  readonly name = 'runway';

  private readonly apiKey: string;
  private readonly apiVersion: string;
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly ratio: string;
  private readonly duration: number;

  constructor() {
    const apiKey = process.env.RUNWAY_API_KEY;
    if (!apiKey) {
      throw new Error('RUNWAY_API_KEY is required when VIDEO_PROVIDER=runway');
    }

    this.apiKey = apiKey;
    this.apiVersion = process.env.RUNWAY_API_VERSION || '2024-11-06';
    this.baseUrl = process.env.RUNWAY_API_BASE_URL || 'https://api.dev.runwayml.com/v1';
    this.model = process.env.RUNWAY_MODEL || 'gen4_turbo';
    this.ratio = process.env.RUNWAY_RATIO || '720:1280';
    this.duration = Number(process.env.RUNWAY_DURATION || 5);
  }

  async createVideo(input: VideoGenerationInput): Promise<VideoGenerationJob> {
    const response = await fetch(`${this.baseUrl}/text_to_video`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': this.apiVersion,
      },
      body: JSON.stringify({
        model: this.model,
        promptText: ensureDirectedVideoPrompt(input.prompt),
        ratio: this.ratio,
        duration: this.duration,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Runway create video failed: ${response.status} ${details}`);
    }

    const task = await response.json() as RunwayTask;
    if (!task.id) {
      throw new Error('Runway response did not include a task id');
    }

    return {
      jobId: task.id,
      provider: this.name,
      status: mapRunwayStatus(task.status),
      videoUrl: getOutputVideoUrl(task.output),
      error: task.error || task.failure,
    };
  }

  async getVideo(jobId: string): Promise<VideoGenerationJob> {
    const response = await fetch(`${this.baseUrl}/tasks/${encodeURIComponent(jobId)}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'X-Runway-Version': this.apiVersion,
      },
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Runway get video failed: ${response.status} ${details}`);
    }

    const task = await response.json() as RunwayTask;
    return {
      jobId,
      provider: this.name,
      status: mapRunwayStatus(task.status),
      videoUrl: getOutputVideoUrl(task.output),
      error: task.error || task.failure,
    };
  }
}
