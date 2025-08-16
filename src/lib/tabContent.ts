import type { TabKey } from "./types";

export const TAB_CONTENT: Record<TabKey, string> = {
  about: `Hey! I’m Ehsan — a CS student (graduating 2025) focused on ML/AI and full-stack development.

Highlights:
• Built ML demos (digit recognizer, IDS prototype)
• Java + Python + JS/Three.js + Flutter (Android-first)
• Interested in AI safety, CV, and scalable app backends.`,
  projects: `Selected Projects:

1) AI Resume Ranker — NLP pipeline with Flask API, React dashboard.
2) SafeNet (Home IDS) — anomaly detection over simulated logs; Flask API + simple UI.
3) VisionAid (Prototype) — room object detection & distance cues; CV model + mobile overlay.
4) Delivery & Dispatch System — mobile scanner app + dispatcher web console.

Ask for a GitHub link or a live demo.`,
  skills: `Core Skills:
• Languages: Python, Java, C++, JS/TS
• Web: Flask, HTML/CSS, GSAP, Three.js
• Mobile: Flutter (Android focus)
• ML: TensorFlow/Keras, scikit-learn, Pandas
• Tools: Git, Linux, Docker basics
• CS Topics: Algorithms, concurrency, security basics (OWASP)`,
  contact: `Let’s connect:
• Email: your.email@example.com
• GitHub: github.com/your-handle
• LinkedIn: linkedin.com/in/your-handle
• Location: USA

(Replace with your real links.)`,
};
