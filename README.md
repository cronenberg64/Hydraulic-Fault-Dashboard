
# Hydraulic Fault Prediction Dashboard

A comprehensive real-time hydraulic system monitoring dashboard with fault simulation, anomaly detection, and predictive analytics capabilities.

## Quick Start

### Using Docker (Recommended)
```bash
git clone <repository-url>
cd hydraulic-dashboard
docker-compose up -d
```
Access at: http://localhost:3000

### Manual Setup
1. **Backend Setup:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python run.py
   ```

2. **Frontend Setup:**
   ```bash
   npm install
   npm run dev
   ```

## Authentication

Default credentials:
- **Admin**: `admin` / `admin123` (Full access)
- **Operator**: `operator` / `operator123` (Control access)
- **Viewer**: `viewer` / `viewer123` (Read-only)

## Features

### Core Monitoring
- **Real-time Parameter Tracking**: Pressure, temperature, flow rate
- **System Health Status**: Visual indicators with automatic fault detection
- **Historical Data Visualization**: Interactive time-series charts
- **Alert System**: Real-time notifications with severity levels

### Advanced Analytics
- **Machine Learning Integration**: Isolation Forest anomaly detection
- **Predictive Analytics**: Days-to-failure calculations
- **Risk Assessment**: ML-driven risk level analysis
- **Trend Analysis**: Automated pattern recognition

### Security & Access Control
- **Role-based Authentication**: Admin, Operator, Viewer roles
- **Permission System**: Granular access control
- **Session Management**: Secure token-based authentication
- **Audit Logging**: Complete system activity tracking

### Fault Simulation
- **Pressure Drop**: Simulates hydraulic leaks
- **Temperature Spike**: Overheating scenarios
- **Flow Disruption**: Cavitation effects
- **Sensor Noise**: Equipment malfunction simulation

### Service Management
- **Service History**: Complete maintenance records
- **Event Logging**: System activity tracking
- **Data Export**: JSON export capabilities
- **Filtering System**: Advanced log filtering

## Architecture

### Technology Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Python 3.11, FastAPI, Pydantic
- **ML/AI**: Scikit-learn, Isolation Forest
- **Visualization**: Recharts
- **Containerization**: Docker, Docker Compose
- **CI/CD**: GitHub Actions

### System Components
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React App     │────│   FastAPI        │────│   ML Engine     │
│   (Frontend)    │    │   (Backend)      │    │   (Analytics)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
│                      │                      │
├─ Authentication     ├─ Data Simulation    ├─ Anomaly Detection
├─ Real-time UI       ├─ Fault Injection    ├─ Predictive Models
├─ Notifications      ├─ API Endpoints      └─ Risk Assessment
└─ Data Visualization └─ Health Monitoring
```

## API Documentation

### Core Endpoints
- `GET /status` - System status and health
- `GET /data/current` - Latest hydraulic data
- `GET /data/historical` - Historical data points
- `POST /simulation/start` - Start data simulation
- `POST /simulation/stop` - Stop simulation
- `POST /simulation/reset` - Reset system state

### Fault Management
- `POST /faults/inject/{fault_type}` - Inject specific faults
- `GET /faults/types` - Available fault types
- `GET /service/logs` - Service history logs

### Machine Learning
- `POST /ml/train` - Train anomaly detection model
- `GET /ml/predict` - Get failure predictions
- `GET /ml/metrics` - Model performance metrics

Visit `http://localhost:8000/docs` for interactive API documentation.

## Deployment

### Production Deployment
```bash
# Build production image
docker build -t hydraulic-dashboard:latest .

# Deploy with production settings
docker run -d \
  --name hydraulic-dashboard \
  -p 80:80 \
  -v hydraulic_data:/app/data \
  --restart unless-stopped \
  hydraulic-dashboard:latest
```

### Cloud Deployment
Supported platforms:
- **AWS**: ECS, EC2, Lambda
- **Google Cloud**: Cloud Run, Compute Engine
- **Azure**: Container Instances, App Service
- **Kubernetes**: Helm charts available

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## Development

### Project Structure
```
├── src/
│   ├── components/          # React components
│   ├── hooks/              # Custom hooks
│   ├── pages/              # Page components
│   └── lib/                # Utilities
├── backend/
│   ├── main.py             # FastAPI application
│   ├── ml_models.py        # ML implementations
│   └── requirements.txt    # Python dependencies
├── docker/                 # Docker configuration
├── .github/workflows/      # CI/CD pipelines
└── docs/                   # Documentation
```

### Development Commands
```bash
# Frontend development
npm run dev              # Start dev server
npm run build           # Build for production
npm run lint            # Run ESLint
npm run test            # Run tests

# Backend development
cd backend
python run.py           # Start backend server
pytest                  # Run tests
black .                 # Format code
```

### Contributing
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## Monitoring & Observability

### Health Checks
- Application health: `GET /health`
- System metrics: `GET /metrics`
- Database status: `GET /db/status`

### Logging
- Application logs: `/var/log/hydraulic-dashboard/`
- Access logs: `/var/log/nginx/`
- Error tracking: Integrated error reporting

### Performance Metrics
- Response times
- System resource usage
- ML model accuracy
- User activity tracking

## Security

### Security Features
- JWT-based authentication
- Role-based access control
- HTTPS/SSL encryption
- Input validation and sanitization
- Rate limiting
- Security headers

### Security Best Practices
- Regular security updates
- Secure configuration management
- Database connection encryption
- API endpoint protection
- Audit logging

## Documentation

- [Deployment Guide](DEPLOYMENT.md)
- [API Documentation](http://localhost:8000/docs)
- [Architecture Overview](docs/architecture.md)
- [Security Guide](docs/security.md)
- [Contributing Guidelines](CONTRIBUTING.md)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [React](https://reactjs.org/) and [FastAPI](https://fastapi.tiangolo.com/)
- UI components by [shadcn/ui](https://ui.shadcn.com/)
- Icons by [Lucide](https://lucide.dev/)
- Charts by [Recharts](https://recharts.org/)
