
# Hydraulic Fault Simulation Backend

Python FastAPI backend for the Hydraulic Fault Prediction Dashboard.

## Setup

1. **Create a virtual environment:**
   ```bash
   cd backend
   python -m venv venv
   ```

2. **Activate the virtual environment:**
   - On Windows: `venv\Scripts\activate`
   - On macOS/Linux: `source venv/bin/activate`

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the backend:**
   ```bash
   python run.py
   ```

The API will be available at `http://localhost:8000`

## API Documentation

Once running, visit `http://localhost:8000/docs` for interactive API documentation.

## API Endpoints

- `GET /status` - Get current system status
- `GET /data/current` - Get current hydraulic data point
- `GET /data/historical` - Get historical data (last 50 points)
- `POST /simulation/start` - Start the simulation
- `POST /simulation/stop` - Stop the simulation
- `POST /simulation/reset` - Reset simulation state
- `POST /faults/inject/{fault_type}` - Inject specific fault types

### Fault Types
- `pressure_drop` - Simulates a leak
- `temperature_spike` - Simulates overheating
- `flow_disruption` - Simulates cavitation
- `random_noise` - Simulates sensor malfunction

## Development

The backend automatically generates realistic hydraulic data with:
- Pressure: 150 ± 5 PSI (normal operation)
- Temperature: 80 ± 4°C (normal operation)
- Flow Rate: 50 ± 3 L/min (normal operation)

Fault signatures are applied when injected, and threshold-based anomaly detection determines system health.
