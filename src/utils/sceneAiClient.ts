import type { Song } from '../types';
import { recommendScene } from './sceneRecommender';
import type { SceneRecommendation } from './sceneRecommender';

interface SceneRecommendResponse {
  source: 'gemini' | 'local';
  recommendation: SceneRecommendation;
}

export async function getSceneRecommendation(input: string, songs: Song[]): Promise<SceneRecommendation> {
  try {
    const response = await fetch('/api/scene/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input }),
    });

    if (!response.ok) {
      throw new Error(`Scene API returned ${response.status}`);
    }

    const payload = await response.json() as SceneRecommendResponse;
    return payload.recommendation;
  } catch {
    return recommendScene(input, songs);
  }
}
