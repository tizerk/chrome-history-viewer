# Chrome History Calendar & Timeline Viewer

A high-performance calendar-based Chrome history viewer built with **React**, **TypeScript**, and **Tailwind CSS**, designed specifically for analyzing Google Takeout browsing history (`History.json`).

Rather than scrolling through Chrome's infinite chronological list, this app turns your browsing history into an interactive daily logbook with heatmaps, sessions, website breakdowns, and full-text search.

---

## ✨ Features

- 📅 **Interactive Calendar & Heatmap**:
  - Month and year navigation with density indicators showing browsing activity per day (318 active days, 349,491 total visits).
  - Hover previews with visit counts and top websites.
  - Quick-jump shortcuts: **Latest Day**, **Peak Day** (6,957 visits on April 5, 2026), and **Random Day**.
- 🔍 **Day Inspector**:
  - **Daily Summary**: Total visits, unique sites, active browsing span, and estimated time online.
  - **24-Hour Activity Histogram**: Interactive hourly bar chart showing when you were browsing during the day (click any hour to filter).
  - **Top Websites Cloud**: Clickable domain pills (Reddit, YouTube, GitHub, Google, etc.) to immediately isolate activity on a given site.
  - **Consecutive Visit Collapsing**: Automatically groups duplicate visits, page reloads, and redirect loops into expandable pills so your timeline stays clean.
- 🗂️ **Multiple View Modes**:
  - **Timeline**: Chronological feed with timestamps, page titles, favicons, domain tags, redirect badges, and copy buttons.
  - **Grouped by Site**: Domain-level accordions displaying all pages visited per website.
  - **Grouped by Session**: Identifies discrete browsing sessions separated by breaks (>25 minutes of inactivity).
- ⚡ **Global Search (⌘K / Ctrl+K)**:
  - Instant full-text search across all 350,000 history entries with direct "Open Day" jump buttons.
- 📊 **All-Time Analytics**:
  - Overall top 20 websites, day-of-week distribution (e.g., peak weekdays), and yearly 24-hour activity heatmaps.
- 📝 **Standup & Journaling Export**:
  - "Copy Markdown" button that generates a clean markdown log of the day's highlights for daily notes, journaling, or standups.
  - "Export JSON" button for downstream data analysis.
- 🌓 **Dark & Light Modes**:
  - System-aware theme toggle with persisted preference.
- 🔄 **Local & Client-Side Versatility**:
  - Auto-loads the workspace `History.json` instantly with zero setup.
  - Includes an in-app "Import JSON" modal with drag-and-drop to load any other Google Takeout history file in the browser.

---

## 🚀 Getting Started

### 1. Run the Development Server (with Vite):
```bash
npm run dev
```
Visit `http://localhost:5173` in your browser.

### 2. Run the Production Server:
```bash
npm run build
npm run serve
```
Visit `http://localhost:3000` in your browser.

---

## 📁 Project Structure

```
├── History.json                   # Google Takeout raw browsing history
├── server/
│   ├── historyService.js          # In-memory indexing service for History.json
│   └── standalone.js              # Production HTTP server (serves dist & APIs)
├── src/
│   ├── components/
│   │   ├── Calendar/
│   │   │   └── CalendarView.tsx   # Monthly calendar grid with heatmaps & quick jumps
│   │   ├── DayView/
│   │   │   ├── DayView.tsx        # Day header, filters, and view controller
│   │   │   ├── HourlyChart.tsx    # Interactive 24-hour bar chart
│   │   │   ├── TimelineEntry.tsx  # Chronological entry card with duplicate collapsing
│   │   │   ├── DomainGroupView.tsx# Domain-grouped accordion view
│   │   │   └── SessionGroupView.tsx# Session-grouped view with break indicators
│   │   ├── Modals/
│   │   │   ├── GlobalSearchModal.tsx # Global ⌘K search across all history
│   │   │   ├── OverallStatsModal.tsx # All-time analytics & charts
│   │   │   └── FileUploadModal.tsx   # Drag-and-drop importer for other History.json files
│   │   └── Header.tsx             # Main navigation, shortcuts & theme toggle
│   ├── utils/
│   │   ├── clientParser.ts        # Client-side FileReader & Takeout parser
│   │   ├── dateUtils.ts           # Calendar math & date formatting
│   │   └── domainColors.ts        # Deterministic brand colors & favicon helper
│   ├── types.ts                   # TypeScript interfaces
│   ├── App.tsx                    # Top-level state and layout
│   └── main.tsx                   # React root entry
├── vite.config.ts                 # Vite config with integrated dev API middleware
└── tailwind.config.js             # Styling configuration
```

