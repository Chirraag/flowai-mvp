# Flow AI Assistant

A healthcare AI platform with completely separated frontend and backend architecture.

## Project Structure

```
FlowAiAssistant/
├── client/                 # Frontend React application
│   ├── src/               # React source code
│   ├── public/            # Static assets
│   ├── package.json       # Frontend dependencies
│   ├── tsconfig.json      # Frontend TypeScript config
│   ├── vite.config.ts     # Vite configuration
│   ├── tailwind.config.ts # Tailwind CSS configuration
│   └── postcss.config.js  # PostCSS configuration
├── server/                # Backend Express application
│   ├── routes/            # API routes
│   ├── services/          # Business logic services
│   ├── package.json       # Backend dependencies
│   ├── tsconfig.json      # Backend TypeScript config
│   └── drizzle.config.ts  # Database configuration
├── shared/                # Shared code between frontend and backend
│   └── schema.ts          # Database schema
├── dist/                  # Built frontend files (generated)
│   └── public/            # Static files served by backend
├── package.json           # Root workspace configuration
└── README.md             # This file
```

## Architecture Overview

This project uses a **completely separated frontend and backend architecture**:

- **Frontend**: React + Vite development server (port 3000)
- **Backend**: Express API server (port 5000)
- **Production**: Backend serves built frontend static files

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database

### Installation

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

2. **Set up environment variables:**
   Create `.env` files in both `client/` and `server/` directories with your configuration.

3. **Set up the database:**
   ```bash
   npm run db:push
   ```

### Development

**Option 1: Run both frontend and backend in development mode:**
```bash
npm run dev
```
- Frontend: http://localhost:3000 (Vite dev server with hot reload)
- Backend: http://localhost:5000 (Express API server)
- Frontend proxies API calls to backend

**Option 2: Run only the backend:**
```bash
npm run dev:server
```
- Backend: http://localhost:5000 (Express API server only)

**Option 3: Run only the frontend:**
```bash
npm run dev:client
```
- Frontend: http://localhost:3000 (Vite dev server only)

### Building for Production

**Build both frontend and backend:**
```bash
npm run build
```

**Build only the backend:**
```bash
npm run build:server
```

**Build only the frontend:**
```bash
npm run build:client
```

### Production Deployment

**Start the production server (serves both API and built frontend):**
```bash
npm run start:prod
```

**Or build first, then start:**
```bash
npm run build
npm run start
```

## Available Scripts

### Root Level (Workspace Management)
- `npm run dev` - Start both frontend (port 3000) and backend (port 5000) in development
- `npm run build` - Build frontend and backend for production
- `npm run start:prod` - Build and start production server
- `npm run install:all` - Install dependencies for all workspaces
- `npm run check` - Type check all workspaces
- `npm run db:push` - Push database schema changes

### Frontend (client/)
- `npm run dev` - Start Vite development server on port 3000
- `npm run build` - Build for production (outputs to ../dist/public)
- `npm run preview` - Preview production build
- `npm run check` - Type check

### Backend (server/)
- `npm run dev` - Start development server with tsx on port 5000
- `npm run build` - Build for production with esbuild
- `npm run start` - Start production server on port 5000
- `npm run check` - Type check
- `npm run db:push` - Push database schema changes

## Development Workflow

### Development Mode
1. **Frontend development**: 
   - Runs on port 3000 with Vite dev server
   - Hot reload enabled
   - Proxies API calls to backend (port 5000)

2. **Backend development**: 
   - Runs on port 5000 with Express API server
   - Serves API endpoints only
   - No frontend serving in development

### Production Mode
1. **Build process**: 
   - Frontend builds to `dist/public/`
   - Backend builds to `server/dist/`

2. **Serving**: 
   - Backend serves both API and static frontend files
   - Single server on port 5000
   - Handles client-side routing

## Architecture Benefits

This separated architecture provides:

1. **🎯 Complete separation** - Frontend and backend are completely independent
2. **🚀 Independent development** - Can develop frontend and backend separately
3. **⚡ Fast development** - Vite dev server with hot reload for frontend
4. **🔧 Technology flexibility** - Can use different technologies for each part
5. **👥 Team scalability** - Different teams can work independently
6. **📦 Better dependencies** - Each part only includes its necessary dependencies
7. **🧪 Easier testing** - Can test frontend and backend in isolation
8. **🚀 Simple production** - Single server serves everything

## Environment Variables

### Backend (.env in server/)
```
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
NODE_ENV=development
```

### Frontend (.env in client/)
```
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=Flow AI Assistant
```

## API Endpoints

All API endpoints are prefixed with `/api` and are served by the backend server:

- Development: http://localhost:5000/api/*
- Production: http://localhost:5000/api/* (same server as frontend)

# FlowAI MVP

A comprehensive healthcare workflow automation platform powered by AI agents.

## Features

- **8 Specialized AI Agents**: Order ingestion, scheduling, insurance verification, patient communication, prior authorization, digital intake, EHR integration, and check-in
- **Real-time Analytics**: Live dashboard with cost savings, performance metrics, and workflow efficiency
- **EMR Integration**: Seamless connectivity with Epic, Cerner, Athenahealth, and other systems
- **Patient Management**: Complete patient journey from referral to check-in
- **Insurance Processing**: Automated verification and prior authorization workflows

## Sample Data

The application includes comprehensive sample data to demonstrate all features:

### Automatic Population
Sample data is automatically populated when the server starts (if no data exists).

### Manual Population
You can manually trigger database population via:

1. **API Endpoint**: `POST /api/v1/seed/populate`
2. **Frontend Button**: Use the "Populate Database" button on the dashboard
3. **Programmatic**: Import and call `populateDatabase()` from `server/seedData.ts`

### Sample Data Includes:
- **10 Patients** with complete demographic information
- **5 Referring Physicians** from various specialties
- **5 Healthcare Providers** with availability schedules
- **5 Medical Orders** with clinical notes
- **5 Insurance Records** with coverage details
- **8 AI Agents** with detailed configurations and metrics
- **5 Appointments** with full scheduling workflow
- **Insurance Verifications** with coverage analysis
- **Patient Communications** across multiple channels
- **Agent Interactions** tracking AI performance
- **Workflow Orchestrations** showing multi-agent coordination
- **EMR Connections** to Epic, Cerner, and Athenahealth
- **30 Days of Analytics** with realistic metrics and trends
- **Cost Savings Data** showing automation benefits

### Dashboard Metrics
The dashboard displays real-time metrics from the sample data:
- Total patients and appointments
- Completion rates and scheduling accuracy
- Active AI agents and their performance
- Cost savings and efficiency gains

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Start the server: `npm run dev`
5. Access the application at `http://localhost:5000`

The sample data will be automatically populated on first run, giving you a fully functional demo environment. 