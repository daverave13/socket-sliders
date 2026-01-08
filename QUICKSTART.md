# Quick Start Guide

## Initial Setup

1. **Install dependencies** (from project root):
```bash
pnpm install
```

2. **Build shared package**:
```bash
cd packages/shared
pnpm build
cd ../..
```

3. **Start services with Docker**:
```bash
cd docker
docker-compose up --build
```

This will start:
- Redis (port 6379)
- API server (port 3000)
- Worker service (background)

## Testing the Application

### Option 1: Use the Web UI (Recommended)

1. Start the web development server:
```bash
cd apps/socketSlidersWeb
pnpm dev
```

2. Open http://localhost:5173 in your browser

3. Navigate to the generator and fill in the form:
   - Choose orientation (vertical/horizontal)
   - Select metric or imperial
   - Enter socket size label
   - Enter outer diameter
   - Enter length (for horizontal only)

4. Click "Generate Socket Holder" and wait for the job to complete

5. Download the ZIP file containing your STL

### Option 2: Test with API Directly

Submit a job:
```bash
curl -X POST http://localhost:3000/api/v1/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "socketConfig": {
      "orientation": "vertical",
      "isMetric": true,
      "nominalMetric": 10,
      "outerDiameter": {
        "value": 12.5,
        "unit": "mm"
      }
    }
  }'
```

Check job status (replace JOB_ID with the ID from the response):
```bash
curl http://localhost:3000/api/v1/jobs/JOB_ID
```

Download the result:
```bash
curl -O http://localhost:3000/api/v1/jobs/JOB_ID/download
```

### Option 3: Test OpenSCAD Templates Directly

```bash
# Test vertical socket
openscad -o test-vertical.stl templates/vertical-socket.scad \
  -D 'outer_diameter_mm=12.5' \
  -D 'nominal_label="10mm"'

# Test horizontal socket
openscad -o test-horizontal.stl templates/horizontal-socket.scad \
  -D 'outer_diameter_mm=12.5' \
  -D 'length_mm=25.4' \
  -D 'nominal_label="10mm"'
```

## Development Workflow

### Making Changes to Shared Package

1. Edit files in `packages/shared/src/`
2. Rebuild: `cd packages/shared && pnpm build`
3. Restart dependent services (API and worker)

### Making Changes to Worker

1. Edit files in `apps/worker/src/`
2. The worker will auto-rebuild on file changes if using `pnpm dev`
3. Or rebuild Docker: `docker-compose up --build worker`

### Making Changes to API

1. Edit files in `apps/api/src/`
2. The API will auto-restart on file changes if using `pnpm dev`
3. Or rebuild Docker: `docker-compose up --build api`

### Making Changes to Templates

1. Edit `.scad` files in `templates/`
2. No rebuild needed - templates are mounted as volumes
3. Submit a new job to test your changes

## Troubleshooting

### "Cannot find module @socketsliders/shared"
- Make sure you've built the shared package: `cd packages/shared && pnpm build`

### Worker not processing jobs
- Check Redis is running: `docker ps | grep redis`
- Check worker logs: `docker-compose logs worker`
- Verify templates directory is mounted: `docker-compose exec worker ls -la /opt/templates`

### OpenSCAD execution fails
- Check worker has OpenSCAD installed: `docker-compose exec worker which openscad`
- Check template syntax: Test templates directly with OpenSCAD CLI
- Check worker logs for OpenSCAD stderr output

### Job stays in "pending" status
- Ensure worker service is running
- Check Redis connection
- Review worker logs for errors

### Download URL returns 404
- Check artifacts directory: `docker-compose exec api ls -la /data/artifacts`
- Verify job completed successfully
- Check artifact path in job data

## Example Socket Configurations

### Metric 10mm Vertical Socket
```json
{
  "orientation": "vertical",
  "isMetric": true,
  "nominalMetric": 10,
  "outerDiameter": { "value": 12.5, "unit": "mm" }
}
```

### Imperial 3/8" Horizontal Socket
```json
{
  "orientation": "horizontal",
  "isMetric": false,
  "nominalNumerator": 3,
  "nominalDenominator": 8,
  "outerDiameter": { "value": 0.57, "unit": "in" },
  "length": { "value": 1.0, "unit": "in" }
}
```

### Metric 13mm Horizontal Socket
```json
{
  "orientation": "horizontal",
  "isMetric": true,
  "nominalMetric": 13,
  "outerDiameter": { "value": 15.8, "unit": "mm" },
  "length": { "value": 28.5, "unit": "mm" }
}
```

## Next Steps

1. Test the complete workflow end-to-end
2. Customize OpenSCAD templates for your specific needs
3. Adjust worker concurrency and timeouts based on your server capacity
4. Add authentication if deploying publicly
5. Configure proper CORS settings for production
6. Set up monitoring and logging for production deployment
