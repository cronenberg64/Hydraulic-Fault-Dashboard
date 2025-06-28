
# Deployment Guide

This guide covers various deployment options for the Hydraulic Fault Prediction Dashboard.

## Docker Deployment (Recommended)

### Prerequisites
- Docker and Docker Compose installed
- At least 2GB RAM available
- Port 3000 available

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd hydraulic-dashboard

# Build and run with Docker Compose
docker-compose up -d

# Access the application
open http://localhost:3000
```

### Production Docker Deployment
```bash
# Build production image
docker build -t hydraulic-dashboard:latest .

# Run with production settings
docker run -d \
  --name hydraulic-dashboard \
  -p 3000:80 \
  -v hydraulic_data:/app/data \
  --restart unless-stopped \
  hydraulic-dashboard:latest
```

## Manual Deployment

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

### Frontend Setup
```bash
npm install
npm run build
npm run preview
```

## Cloud Deployment Options

### AWS Deployment
1. **ECS with Fargate**: Use the provided Dockerfile
2. **EC2**: Manual deployment with Docker
3. **Lambda**: Not recommended due to stateful nature

### Google Cloud Platform
1. **Cloud Run**: Deploy using container
2. **Compute Engine**: VM-based deployment
3. **GKE**: Kubernetes deployment

### Azure
1. **Container Instances**: Simple container deployment
2. **App Service**: Platform-as-a-Service option
3. **AKS**: Kubernetes deployment

## Environment Variables

### Production Environment Variables
```bash
# Backend
API_HOST=0.0.0.0
API_PORT=8000
LOG_LEVEL=INFO
ENABLE_CORS=false

# Security
JWT_SECRET=your-secret-key
SESSION_TIMEOUT=3600
RATE_LIMIT_REQUESTS=100

# Database (if using external DB)
DATABASE_URL=postgresql://user:pass@host:port/db
```

### Frontend Environment Variables
```bash
VITE_API_BASE_URL=https://your-api-domain.com
VITE_WS_URL=wss://your-websocket-domain.com
VITE_ENVIRONMENT=production
```

## Security Configuration

### SSL/TLS Setup
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # SSL security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Authentication Setup
Default credentials for demo:
- Admin: `admin` / `admin123`
- Operator: `operator` / `operator123`
- Viewer: `viewer` / `viewer123`

**Important**: Change these credentials in production!

## Monitoring and Logging

### Health Check Endpoints
- `GET /health` - Application health status
- `GET /api/status` - System status
- `GET /metrics` - Prometheus metrics (if enabled)

### Log Configuration
Logs are written to:
- Frontend: Browser console and server logs
- Backend: `/var/log/hydraulic-dashboard/`
- Docker: Use `docker logs <container-name>`

### Monitoring Setup
```yaml
# docker-compose.monitoring.yml
version: '3.8'
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

## Backup and Recovery

### Data Backup
```bash
# Backup hydraulic data
docker run --rm -v hydraulic_data:/data -v $(pwd):/backup alpine tar czf /backup/data-backup.tar.gz /data

# Restore data
docker run --rm -v hydraulic_data:/data -v $(pwd):/backup alpine tar xzf /backup/data-backup.tar.gz -C /
```

### Database Backup (if using external DB)
```bash
# PostgreSQL backup
pg_dump -h hostname -U username -d database_name > backup.sql

# Restore
psql -h hostname -U username -d database_name < backup.sql
```

## Performance Optimization

### Production Optimizations
1. **Enable Gzip compression** in nginx
2. **Configure caching** for static assets
3. **Use CDN** for global distribution
4. **Enable HTTP/2** for better performance
5. **Optimize Docker image size** with multi-stage builds

### Scaling Considerations
- Use load balancer for multiple instances
- Implement Redis for session storage
- Consider database clustering for high availability
- Monitor resource usage and scale accordingly

## Troubleshooting

### Common Issues
1. **Port conflicts**: Ensure ports 3000, 8000 are available
2. **Memory issues**: Increase Docker memory limits
3. **Permission errors**: Check file permissions and Docker user
4. **Network issues**: Verify firewall and security group settings

### Debug Commands
```bash
# Check logs
docker logs hydraulic-dashboard

# Access container shell
docker exec -it hydraulic-dashboard /bin/bash

# Test API connectivity
curl http://localhost:3000/api/health

# Monitor resource usage
docker stats hydraulic-dashboard
```

## Support

For deployment issues:
1. Check the logs first
2. Verify all environment variables are set
3. Ensure system requirements are met
4. Contact support with error logs and system information
