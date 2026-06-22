# Drift

A Vite + React + TypeScript ambient music prototype.

## Prerequisites

- Node.js 20 or newer
- npm

## Run Locally

```powershell
npm install
npm run dev
```

Open the local Vite URL:

```text
http://localhost:3000/
```

## Useful Scripts

```powershell
npm run lint
npm run build
npm run preview
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
