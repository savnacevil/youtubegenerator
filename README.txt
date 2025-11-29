BrainRotter — Quick Deploy Notes
--------------------------------
Files:
- index.html
- styles.css
- stories.js
- memes.js
- script.js

How to run:
1) Push files to a GitHub repository.
2) Enable GitHub Pages on the repository (Settings → Pages → select branch root).
3) Open the site URL provided by GitHub Pages.

What it includes:
- Self-contained reveal images (SVG data URIs inside memes.js).
- Synthesized reveal audio (WebAudio) — no MP3 needed.
- Export to .webm with audio embedded (works in modern Chrome/Edge).
- 4 story categories with high-retention lines.
- Draggable divider, caption styling, animations, watermark toggle.

Notes & limitations:
- Export uses MediaRecorder: Safari may not support desired codecs; Chrome/Edge recommended.
- MP4 conversion not included (can be added via ffmpeg-wasm if you want server-free conversion).
- TTS preview uses browser SpeechSynthesis (preview only). Embedding of TTS is unreliable cross-browser; reveal audio is synthesized and embedded reliably.
