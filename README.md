# Drift

A Vite + React + TypeScript ambient music prototype.

## Prerequisites

- Node.js 20 or newer
- npm

## Run Locally

```powershell
npm install
npm run dev

npm run dev:api
```

Create `.env.local` or `.env` from `.env.example` and set `GEMINI_API_KEY`. If the API server or key is missing, the app falls back to the local rule-based recommender.

The video generation flow uses a server-side provider. By default `VIDEO_PROVIDER=mock`, so the UI can test the full queued/generating/completed flow without paid API calls. To use Runway, set:

```powershell
VIDEO_PROVIDER="runway"
RUNWAY_API_KEY="YOUR_RUNWAY_API_KEY"
RUNWAY_MODEL="gen4_turbo"
RUNWAY_RATIO="720:1280"
RUNWAY_DURATION="5"
```

Run the API server after changing `.env`. Never put the Runway key in frontend code.

For Volcengine Ark / Seedance image-to-video, use:

```powershell
VIDEO_PROVIDER="volcengine"
VOLCENGINE_API_KEY="YOUR_VOLCENGINE_ARK_API_KEY"
VOLCENGINE_VIDEO_MODEL="doubao-seedance-1-5-pro-251215"
VOLCENGINE_VIDEO_DURATION="5"
VOLCENGINE_RATIO="720:1280"
VOLCENGINE_CAMERA_FIXED="true"
VOLCENGINE_WATERMARK="false"
```

## Useful Scripts

```powershell
npm run lint
npm run build
npm run preview
npm run dev:api
npm start
npm run clean
```

## Notes

The app currently runs fully in the browser. Favorites, play history, listening time, and custom spaces are stored in `localStorage`.

The `.env.example` file is inherited from the AI Studio export. The current source does not call Gemini APIs, so `GEMINI_API_KEY` is not required for local development.

## Local Music Files

The current player uses these MP3 files from `public/audio`:

```text
public/audio/How+Sweet+-+NewJeans.mp3
public/audio/kendrick+lamar-not+like+us.mp3
public/audio/michael jackson-billie jean.mp3
public/audio/方大同-红豆.mp3
public/audio/陈粒-+小半.mp3
public/audio/陶喆+-+飞机场的10.30.mp3
public/audio/陶喆-普通朋友.mp3
```

Keep these filenames unchanged unless you also update `src/data.ts`.

## Ambient Audio Files

The ambience mixer uses these looped background files from `public/ambient`:

```text
public/ambient/雨声.mp3
public/ambient/海浪.mp3
public/ambient/篝火.mp3
public/ambient/虫鸣.mp3
public/ambient/夜晚.mp3
```

`wind` and `vinyl` still use the built-in synthesized effects until matching audio files are added.
