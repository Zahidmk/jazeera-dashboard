# Middleware Dashboard

A comprehensive admin dashboard for managing the Middleware System that connects Van Sales App with Odoo ERP.

## Features

- **Dashboard Overview**: Real-time KPIs, sync metrics, and recent activities
- **Vans & Reps Management**: Manage vans, representatives, and their assignments
- **Relay Reps**: Handle backup and replacement representatives
- **Sync Queue & Logs**: Monitor sync operations and view detailed logs 
- **API Endpoints**: Manage and test API endpoints
- **System Health**: Monitor server performance, CPU, memory, and latency
- **Settings**: Configure environment, sync settings, API keys, and webhooks

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** components
- **Recharts** for data visualization
- **Lucide React** for icons
- **date-fns** for date formatting

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

The app will automatically redirect to `/dashboard`.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── dashboard/         # Main dashboard page
│   ├── vans-reps/         # Vans & Reps management
│   ├── relay-reps/        # Relay representatives
│   ├── sync/              # Sync queue & logs
│   ├── api-endpoints/     # API endpoints management
│   ├── system-health/     # System health monitoring
│   ├── settings/          # Application settings
│   ├── layout.tsx         # Root layout with Sidebar
│   └── page.tsx           # Root page (redirects to dashboard)
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── Charts/           # Chart components
│   ├── Sidebar.tsx       # Navigation sidebar
│   ├── Topbar.tsx        # Top navigation bar
│   └── ...               # Other shared components
├── lib/                   # Utilities and data
│   ├── types.ts          # TypeScript type definitions
│   ├── dummy-data.ts     # Mock data for development
│   └── utils.ts          # Utility functions
└── public/               # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Features Overview

### Dashboard
- Real-time KPI cards (Total Vans, Reps, Sync Attempts, etc.)
- Interactive charts (Sync Success Rate, Attempts per Hour, Error Distribution)
- Recent activities table

### Vans & Reps
- View and manage vans and representatives
- Filter by branch and status
- Add/Edit modals for vans and reps
- Assignment functionality

### Sync Queue & Logs
- Queue management with status tracking
- Detailed sync logs with error messages
- Advanced filtering options

### System Health
- Real-time system metrics
- CPU, Memory, and API Latency monitoring
- Visual status indicators

## Development

This project uses:
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **Recharts** for data visualization

All components are modular and reusable. The codebase follows clean architecture principles with separation of concerns.

## License

Private - Internal use only
