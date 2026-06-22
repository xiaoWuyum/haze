import { MockVideoProvider } from './mockProvider';
import { RunwayVideoProvider } from './runwayProvider';
import { VolcengineSeedanceProvider } from './volcengineSeedanceProvider';
import type { VideoProvider } from './types';

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
