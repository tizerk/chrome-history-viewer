### Running locally
```
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev
```
Visit `http://localhost:5173` in your browser.


### Project structure
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