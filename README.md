# SocketSliders

A web application for generating custom 3D printable socket holders using parametric OpenSCAD designs.

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

### POST /api/v1/jobs
Submit a new socket generation job.

**Request Body:**
```json
{
  "socketConfig": {
    "orientation": "vertical",
    "isMetric": true,
    "nominalMetric": 10,
    "outerDiameter": {
      "value": 12.5,
      "unit": "mm"
    }
  }
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
  "downloadUrl": "http://localhost:3000/artifacts/uuid.zip"
}
```

### GET /api/v1/jobs/:id/download
Download the generated ZIP file containing STL and metadata.

## OpenSCAD Templates

Templates are located in `templates/`:
- `vertical-socket.scad`: Vertical socket holder design
- `horizontal-socket.scad`: Horizontal socket holder design

### Testing Templates

```bash
openscad -o test.stl templates/vertical-socket.scad \
  -D 'outer_diameter_mm=12.5' \
  -D 'nominal_label="10mm"'
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
