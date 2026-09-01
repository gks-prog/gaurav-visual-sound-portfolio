# Gaurav Sharma — Visual × Sound Portfolio

A high-end, responsive creative portfolio for cinematography, music production, fashion content and AI-assisted visual work. It is dependency-free and can be deployed on GitHub Pages, Netlify, Vercel or any static host.

## Add your real work

Open `portfolio.js`. Each project has a `mediaUrl` field. Paste one of these:

- Instagram Reel or post: `https://www.instagram.com/reel/SHORTCODE/`
- Public Google Drive video: `https://drive.google.com/file/d/FILE_ID/view`
- YouTube video: `https://youtu.be/VIDEO_ID`
- Direct `.mp4`, `.webm`, `.jpg`, `.png` or `.webp` URL

The project modal automatically converts supported links into an embedded player. Keep Drive files set to **Anyone with the link → Viewer**. Instagram embeds can be limited by Instagram privacy or cookie settings, so always keep the “View original” fallback.

At the top of `portfolio.js`, add your `email`, `instagram`, `linkedin` and optional `showreel` links. Blank links remain hidden rather than rendering broken buttons.

The `mediaArchive` array powers the live-work gallery. Instagram and individual Drive previews
load only as they approach the viewport, while the full player loads only when selected. Playback
stays inside the portfolio dialog; no external-view CTA is rendered.

Drive folder links cannot be embedded as videos; use individual `/file/d/FILE_ID/` links so the
site can generate preview players and on-page playback.

## Run locally

```bash
npm run dev
```

Then open `http://localhost:4173`.

## Deploy with GitHub Pages

1. Push the repository to GitHub.
2. Open **Settings → Pages** and select **GitHub Actions** as the source.
3. Add a static-site workflow that runs `npm ci` and `npm run build`.
4. Upload the generated `dist` folder with `actions/upload-pages-artifact` and deploy it with `actions/deploy-pages`.

No environment variables are required.

## Structure

```text
.
├── index.html          # Content structure and SEO metadata
├── styles.css          # Visual system, motion and responsive layout
├── app.js              # Filters, modals, embeds and canvas animation
├── portfolio.js        # Projects and contact links — edit this most often
├── assets/favicon.svg
├── manifest.webmanifest
└── robots.txt
```

## Quality notes

- Semantic headings, keyboard-friendly dialogs and a skip link
- Respects `prefers-reduced-motion`
- Responsive from small phones through large desktops
- No framework or runtime dependency; fast static delivery
- Person schema and social preview metadata included
- No invented performance metrics, awards or client outcomes
