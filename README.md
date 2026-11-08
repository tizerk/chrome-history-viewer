# Chrome History Calendar & Timeline Viewer

A high-performance calendar-based Chrome history viewer built with **React**, **TypeScript**, and **Tailwind CSS**, designed with **Apple's Human Interface Guidelines** for analyzing Google Takeout browsing history (`History.json`).

Rather than scrolling through Chrome's infinite chronological list, this app turns your browsing history into an interactive daily logbook with calendar navigation, sessions, website breakdowns, and full-text search. All processing runs privately inside your browser using a background **Web Worker**.

---

## ✨ Features

- 📅 **Apple-Style Calendar**:
  - Month and year navigation with subtle activity dots marking active days.
  - Hover previews with visit counts and top websites.
  - Selected day highlight with Apple Blue indicator.
- 🔍 **Day Inspector**:
  - **Summary Metrics**: Total visits, unique sites, and active browsing time.
  - **Screen Time Histogram**: Interactive hourly bar chart showing when you were browsing during the day (click any hour to filter).
  - **Top Websites Cloud**: Clickable domain pills (Reddit, YouTube, GitHub, Google, etc.) to immediately isolate activity on a given site.
  - **Consecutive Visit Collapsing**: Automatically groups duplicate visits, page reloads, and redirect loops into expandable pills so your timeline stays clean.
- 🗂️ **Segmented View Modes**:
  - **Timeline**: Chronological feed with timestamps, page titles, favicons, domain tags, and copy buttons.
  - **By Site**: Accordion grouped by domain displaying all pages browsed per website.
  - **By Session**: Identifies discrete browsing sessions separated by breaks (>25 minutes of inactivity).
- ⚡ **Spotlight Search (⌘K / Ctrl+K)**:
  - Instant full-text search across all history entries with direct links and "Open Day" jump buttons.
- 📊 **All-Time Analytics**:
  - Overall top 20 websites, day-of-week distribution, and yearly 24-hour activity heatmaps.
- 🚀 **Background Web Worker (Zero UI Freezing)**:
  - 100% client-side streaming parser runs on a background thread. Even with 170MB+ JSON files and 350,000+ entries, the UI stays at 60/120 FPS without page-unresponsive warnings.
- 🌓 **Dark & Light Modes**:
  - Apple design aesthetic with `#F5F5F7` light canvas and true deep black (`#000000` / `#1C1C1E`) dark mode.

---

## 🚀 Getting Started

### Run Locally
```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev
```
Visit `http://localhost:5173` in your browser.

---

## 🌐 Deploy to GitHub Pages

This repository is already configured for automatic deployment with **GitHub Actions**.

### Step 1: Push your code to GitHub
```bash
git add .
git commit -m "Deploy Chrome History Viewer"
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

### Step 2: Enable GitHub Pages in your Repository Settings
1. Open your repository on GitHub.
2. Go to **Settings** → **Pages** (under the "Code and automation" section in the left sidebar).
3. Under **Build and deployment** → **Source**, select **GitHub Actions**.

GitHub Actions will automatically run the `.github/workflows/deploy.yml` workflow, build the site, and publish it at:
```
https://<your-username>.github.io/<your-repo-name>/
```
*(Your private `History.json` is listed in `.gitignore` so your personal data is never uploaded to GitHub).*
