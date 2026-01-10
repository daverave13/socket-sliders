# Socket Sliders

A web application for generating custom 3D printable socket organizers, designed for the Gridfinity system.

## About

After deciding to organize my garage toolbox using the awesome 3D printed Gridfinity system, I quickly found that existing models for organizing my sockets were either not to my liking or too tall to fit in my drawers. I set out to design a rail and slider system that is Gridfinity-compatible, low-profile, modular and customizable. The rails sit on top of the Gridfinity base while the sliders hold the sockets. Sliders can be re-ordered, added or removed at any time with minimal extra printing.

After manually modeling a handful of parts I realized I could automate the modeling using OpenSCAD. After all that effort I thought it'd be a shame not to share, so I created this web application.

## Features

- **Parametric STL Generation**: Input your socket dimensions and generate custom STL files ready to print
- **Live 3D Preview**: See your socket holder in real-time as you adjust parameters, powered by [React Three Fiber](https://github.com/pmndrs/react-three-fiber)
- **Vertical & Horizontal Orientations**: Support for both socket holder styles with configurable label positions
- **Metric & Imperial**: Full support for both measurement systems with proper labeling (e.g., "10mm" or "3/8\"")
- **Batch Generation**: Generate multiple socket holders at once and download as a ZIP file
- **Pre-made Library**: Browse existing STL files with links to download from MakerWorld

## Tech Stack

- **Frontend**: React 19, React Router 7, TailwindCSS, shadcn/ui
- **3D Preview**: Three.js, React Three Fiber, React Three Drei
- **Backend**: Fastify, BullMQ (job queue)
- **CAD Engine**: OpenSCAD (CLI)
- **Validation**: Zod (shared schemas)
- **Infrastructure**: Docker, Redis

## Architecture

### Services

- **API** (`apps/api`): Fastify REST API for job submission and management
- **Worker** (`apps/worker`): Background job processor that executes OpenSCAD
- **Web** (`apps/socketSlidersWeb`): React frontend with form and job status tracking
- **Redis**: Job queue backend (BullMQ)

### Shared Package

- **Shared** (`packages/shared`): Zod validation schemas and TypeScript types used across services

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local development)
- pnpm (recommended) or npm

### Installation

1. Install dependencies:

```bash
pnpm install
```

2. Build the shared package:

```bash
cd packages/shared
pnpm build
```

3. Start services with Docker Compose:

```bash
cd docker
docker-compose up --build
```

### Services

- **API**: http://localhost:3000
- **Web**: http://localhost:5173 (dev mode)
- **Redis**: localhost:6379

## Development

### API Development

```bash
cd apps/api
pnpm dev
```

### Worker Development

```bash
cd apps/worker
pnpm dev
```

### Web Development

```bash
cd apps/socketSlidersWeb
pnpm dev
```

## API Endpoints

### POST /api/v1/jobs/batch

Submit a batch socket generation job (1-20 sockets).

**Request Body:**

```json
{
  "socketConfigs": [
    {
      "orientation": "vertical",
      "isMetric": true,
      "nominalMetric": 10,
      "outerDiameter": { "value": 15.5, "unit": "mm" },
      "labelPosition": "topLeft"
    },
    {
      "orientation": "horizontal",
      "isMetric": false,
      "nominalNumerator": 3,
      "nominalDenominator": 8,
      "outerDiameter": { "value": 0.75, "unit": "in" },
      "length": { "value": 50, "unit": "mm" },
      "labelPosition": "bottom"
    }
  ]
}
```

**Response:**

```json
{
  "id": "uuid",
  "status": "pending",
  "createdAt": "2026-01-07T..."
}
```

### GET /api/v1/jobs/:id

Get job status.

**Response:**

```json
{
  "id": "uuid",
  "status": "completed",
  "createdAt": "2026-01-07T...",
  "completedAt": "2026-01-07T...",
  "downloadUrl": "http://localhost:3000/artifacts/uuid.stl"
}
```

_Note: Single socket jobs return `.stl`, multiple sockets return `.zip` with all STLs and metadata._

### GET /api/v1/jobs/:id/download

Download the generated STL file or ZIP archive.

## OpenSCAD Templates

Templates are located in `templates/`:

- `vertical-socket.scad`: Vertical socket holder with 6 label positions (topLeft, topMid, topRight, bottomLeft, bottomMid, bottomRight)
- `horizontal-socket.scad`: Horizontal socket holder with 2 label positions (top, bottom)

### Testing Templates

```bash
# Vertical metric socket
openscad -o test.stl templates/vertical-socket.scad \
  -D 'socketDiameter=15.5' \
  -D 'labelMetric=10' \
  -D 'labelPosition="topLeft"'

# Horizontal imperial socket
openscad -o test.stl templates/horizontal-socket.scad \
  -D 'socketDiameter=19' \
  -D 'socketLength=50' \
  -D 'labelNumerator=3' \
  -D 'labelDenominator=8' \
  -D 'labelPosition="bottom"'
```

## Configuration

### Environment Variables

**API:**

- `PORT`: API server port (default: 3000)
- `HOST`: API server host (default: 0.0.0.0)
- `REDIS_HOST`: Redis hostname (default: redis)
- `REDIS_PORT`: Redis port (default: 6379)
- `ARTIFACTS_DIR`: Directory for generated files (default: /data/artifacts)
- `LOG_LEVEL`: Logging level (default: info)

**Worker:**

- `REDIS_HOST`: Redis hostname (default: redis)
- `REDIS_PORT`: Redis port (default: 6379)
- `TEMPLATES_DIR`: OpenSCAD templates directory (default: /opt/templates)
- `ARTIFACTS_DIR`: Output directory (default: /data/artifacts)
- `WORKSPACE_DIR`: Temporary workspace (default: /tmp/work)
- `WORKER_CONCURRENCY`: Number of concurrent jobs (default: 2)
- `JOB_TIMEOUT_MS`: Job timeout in milliseconds (default: 60000)
- `LOG_LEVEL`: Logging level (default: info)

## Project Structure

```
socketSliders/
├── apps/
│   ├── api/              # Fastify REST API
│   ├── worker/           # OpenSCAD job processor
│   └── socketSlidersWeb/ # React frontend
├── packages/
│   └── shared/           # Shared Zod schemas and types
├── templates/            # OpenSCAD templates
├── docker/
│   └── docker-compose.yaml
└── docs/
    ├── BRD.md           # Business Requirements
    ├── TAD.md           # Technical Architecture
    └── requirements-sockets.md
```

## License

MIT
