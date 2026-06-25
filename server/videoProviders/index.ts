import { MockVideoProvider } from './mockProvider.js';
import { RunwayVideoProvider } from './runwayProvider.js';
import { VolcengineSeedanceProvider } from './volcengineSeedanceProvider.js';
import type { VideoProvider } from './types.js';

export function createVideoProvider(): VideoProvider {
  const providerName = (process.env.VIDEO_PROVIDER || 'mock').toLowerCase();

  if (providerName === 'runway') {
    return new RunwayVideoProvider();
  }

  if (providerName === 'volcengine' || providerName === 'seedance') {
    return new VolcengineSeedanceProvider();
  }

  return new MockVideoProvider();
}
