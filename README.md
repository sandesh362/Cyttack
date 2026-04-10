# CYTTAK Frontend

This directory contains the React frontend for the CYTTAK Security Operations Center dashboard. It is responsible for presenting live honeypot telemetry through a clean, analyst-oriented UI with real-time updates over WebSockets.

For full project documentation, see the root [README](/d:/cyttack/README.md). This file focuses on the frontend specifically.

## Purpose

The frontend converts backend event streams and aggregate statistics into an operational dashboard that helps users:

- monitor live attack activity
- review high-priority alerts
- analyze severity trends
- inspect active attacker sessions
- view geographic attack origins

## Frontend Stack

- React 18
- Create React App
- Framer Motion
- Recharts
- Leaflet
- date-fns

## Directory Structure

```text
dashboard/
|-- public/
|   |-- index.html
|-- src/
|   |-- App.js
|   |-- App.css
|   |-- index.js
|   |-- index.css
|   |-- useWebSocket.js
|   |-- components/
|   |   |-- AlertBanner.jsx
|   |   |-- AttackMap.jsx
|   |   |-- Charts.jsx
|   |   |-- LiveFeed.jsx
|   |   |-- MetricsPanel.jsx
|   |   |-- SessionViewer.jsx
|   |   |-- Sidebar.jsx
|   |   |-- dashboard-ui.css
|   |-- utils/
|       |-- helpers.js
|       |-- ui.js
|-- package.json
```

## Frontend Architecture

### Application Shell

[App.js](/d:/cyttack/dashboard/src/App.js) is the layout controller. It:

- connects view state to the sidebar
- consumes live data from `useWebSocket`
- prepares derived dashboard metrics
- renders the top header and active content view

### Real-Time State Layer

[useWebSocket.js](/d:/cyttack/dashboard/src/useWebSocket.js) maintains:

- `events`
- `stats`
- `connected`
- reconnect behavior with backoff

It listens for:

- `EVENT`
- `HISTORY`
- `STATS`

### Presentation Layer

The UI is broken into focused components:

- [Sidebar.jsx](/d:/cyttack/dashboard/src/components/Sidebar.jsx): navigation and CYTTAK branding
- [AlertBanner.jsx](/d:/cyttack/dashboard/src/components/AlertBanner.jsx): transient toast alerts for high-risk activity
- [MetricsPanel.jsx](/d:/cyttack/dashboard/src/components/MetricsPanel.jsx): KPI cards and analytical summaries
- [AttackMap.jsx](/d:/cyttack/dashboard/src/components/AttackMap.jsx): geo-visualization with Leaflet
- [LiveFeed.jsx](/d:/cyttack/dashboard/src/components/LiveFeed.jsx): filterable alert feed and log table
- [SessionViewer.jsx](/d:/cyttack/dashboard/src/components/SessionViewer.jsx): session list and command playback
- [Charts.jsx](/d:/cyttack/dashboard/src/components/Charts.jsx): trend, severity, distribution, and frequency charts

## UI Views

### Dashboard View

Shows the main SOC workspace:

- header and connection state
- executive metric cards
- trend and distribution charts
- threat origin map
- live event queue
- watchlist of recent critical activity

### Threat Map View

Dedicated geographic view for:

- attack source markers
- recent attack paths
- mapped source counts

### Sessions View

Used to inspect:

- active sessions
- source metadata
- command history and replay

### Analytics View

Used for:

- severity mix
- attack trend analysis
- command frequency
- top entities such as usernames and passwords

## Styling System

The layout and visual system are primarily defined in:

- [App.css](/d:/cyttack/dashboard/src/App.css)
- [dashboard-ui.css](/d:/cyttack/dashboard/src/components/dashboard-ui.css)

Current design principles:

- compact SOC-style sidebar
- max-width centered main content
- consistent spacing scale using 8px / 12px / 16px / 24px / 32px tokens
- CSS Grid for card and panel alignment
- responsive stacking for smaller screens
- soft glass-like panel surfaces with clear hierarchy

## Runtime Configuration

The frontend reads environment variables through the package scripts:

```bash
REACT_APP_WS_URL=ws://localhost:8000/ws
REACT_APP_API_URL=http://localhost:8000
```

It also includes:

```json
"proxy": "http://localhost:8000"
```

## Development

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm start
```

Default dev URL:

```text
http://localhost:3000
```

Build for production:

```bash
npm run build
```

## Frontend Data Contract

The frontend expects normalized backend events containing fields such as:

- `type`
- `timestamp`
- `ip`
- `session`
- `severityLabel`
- `suspicious`
- `geo`

It also expects stats objects containing:

- `totalEvents`
- `totalAttacks`
- `uniqueIPs`
- `loginSuccesses`
- `loginFailures`
- `suspiciousCommands`
- `severityCounts`
- `timeline`
- `topUsernames`
- `topPasswords`
- `topCommands`
- `topCountries`
- `activeSessions`

## Reporting Notes

If you are using this frontend in a project report, useful discussion points include:

- dashboard information architecture
- real-time UI update strategy
- WebSocket client lifecycle management
- security telemetry visualization choices
- responsiveness and layout system design
- user workflow support for SOC analysts

## Known Notes

- Leaflet is loaded via CDN in [public/index.html](/d:/cyttack/dashboard/public/index.html).
- The frontend gracefully handles `EVENT`, `HISTORY`, and `STATS` message types.
- The dashboard keeps a rolling event list client-side for responsive analyst workflows.
- The UI branding has been standardized to `CYTTAK`.
