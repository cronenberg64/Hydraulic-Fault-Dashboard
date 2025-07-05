from fastapi import FastAPI, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import asyncio
import json
import time
import random
import math
from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel
import uvicorn
import logging
from ml_models import ml_detector

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Hydraulic Fault Simulation API", version="2.0.0")

# Configure CORS to allow React frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:3000", "http://localhost:5173", "https://hydraulic-fault-dashboard.netlify.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class HydraulicData(BaseModel):
    pressure: float
    temperature: float
    flow: float
    timestamp: int

class Alert(BaseModel):
    id: str
    type: str  # 'info', 'warning', 'error'
    message: str
    timestamp: int

class MLPrediction(BaseModel):
    days_to_failure: Optional[int]
    confidence: float
    risk_level: str
    trend_analysis: str

class SystemStatus(BaseModel):
    health: str  # 'healthy', 'warning', 'fault'
    is_running: bool
    current_data: Optional[HydraulicData]
    alerts: List[Alert]
    ml_prediction: Optional[MLPrediction]

class ServiceLogEntry(BaseModel):
    id: str
    timestamp: int
    event_type: str  # 'system', 'maintenance', 'fault', 'ml', 'user_action'
    severity: str  # 'info', 'warning', 'error', 'critical'
    component: str  # 'hydraulic_system', 'ml_model', 'simulation', 'user_interface'
    message: str
    details: Optional[Dict] = None
    user_id: Optional[str] = None

class MaintenanceRecord(BaseModel):
    id: str
    timestamp: int
    maintenance_type: str  # 'preventive', 'corrective', 'emergency'
    component: str
    description: str
    technician: str
    duration_minutes: int
    status: str  # 'completed', 'in_progress', 'scheduled'
    cost: Optional[float] = None

# ... keep existing code (SimulationState class definition)

class SimulationState:
    def __init__(self):
        self.is_running = False
        self.current_data: Optional[HydraulicData] = None
        self.historical_data: List[HydraulicData] = []
        self.alerts: List[Alert] = []
        self.health = "healthy"
        self.fault_state = {
            "type": None,
            "start_time": 0,
            "duration": 0
        }
        self.ml_prediction: Optional[MLPrediction] = None
        self.service_logs: List[ServiceLogEntry] = []
        self.maintenance_records: List[MaintenanceRecord] = []
        
        # Base parameters for normal operation
        self.base_params = {
            "pressure": 150,  # PSI
            "temperature": 80,  # Celsius
            "flow": 50  # L/min
        }

simulation = SimulationState()

# ... keep existing code (generate_normal_data, apply_fault_signature, detect_anomalies_ml, detect_anomalies_threshold, update_ml_prediction functions)

def generate_normal_data() -> HydraulicData:
    """Generate normal hydraulic data with natural variation"""
    now = int(time.time() * 1000)
    
    # Add some natural variation
    pressure = simulation.base_params["pressure"] + (random.random() - 0.5) * 10
    temperature = simulation.base_params["temperature"] + (random.random() - 0.5) * 8
    flow = simulation.base_params["flow"] + (random.random() - 0.5) * 6

    return HydraulicData(
        pressure=max(0, pressure),
        temperature=max(0, temperature),
        flow=max(0, flow),
        timestamp=now
    )

def apply_fault_signature(data: HydraulicData, fault_type: str, intensity: float) -> HydraulicData:
    """Apply fault signatures to the data based on fault type and intensity"""
    faulted_data = data.dict()

    if fault_type == "pressure_drop":
        # Simulate leak - gradual pressure drop
        faulted_data["pressure"] = max(80, data.pressure - intensity * 40)
    elif fault_type == "temperature_spike":
        # Simulate overheating
        faulted_data["temperature"] = data.temperature + intensity * 30
    elif fault_type == "flow_disruption":
        # Simulate cavitation - erratic flow
        faulted_data["flow"] = data.flow + (random.random() - 0.5) * intensity * 30
    elif fault_type == "random_noise":
        # Simulate sensor malfunction
        faulted_data["pressure"] += (random.random() - 0.5) * intensity * 20
        faulted_data["temperature"] += (random.random() - 0.5) * intensity * 15
        faulted_data["flow"] += (random.random() - 0.5) * intensity * 15

    return HydraulicData(**faulted_data)

def detect_anomalies_ml(data: HydraulicData) -> str:
    """ML-based anomaly detection using Isolation Forest"""
    try:
        # Use recent historical data for context
        recent_data = simulation.historical_data[-20:] if len(simulation.historical_data) >= 20 else simulation.historical_data
        recent_data.append(data)
        
        # Convert to dict format for ML model
        data_dicts = [point.dict() for point in recent_data]
        
        # Get ML predictions
        anomaly_labels, anomaly_scores = ml_detector.predict(data_dicts)
        
        if not anomaly_labels:
            # Fallback to threshold-based detection
            return detect_anomalies_threshold(data)
        
        # Check the latest prediction
        latest_label = anomaly_labels[-1]
        latest_score = anomaly_scores[-1]
        
        # Determine health based on ML prediction
        if latest_label == -1:  # Anomaly detected
            if latest_score < -0.3:
                return "fault"
            else:
                return "warning"
        else:
            return "healthy"
            
    except Exception as e:
        logger.error(f"ML anomaly detection failed: {e}")
        # Fallback to threshold-based detection
        return detect_anomalies_threshold(data)

def detect_anomalies_threshold(data: HydraulicData) -> str:
    """Fallback threshold-based anomaly detection"""
    pressure_normal = 140 <= data.pressure <= 160
    temperature_normal = 70 <= data.temperature <= 90
    flow_normal = 45 <= data.flow <= 55

    if not (pressure_normal and temperature_normal and flow_normal):
        pressure_deviation = abs(data.pressure - simulation.base_params["pressure"])
        temp_deviation = abs(data.temperature - simulation.base_params["temperature"])
        flow_deviation = abs(data.flow - simulation.base_params["flow"])

        if pressure_deviation > 30 or temp_deviation > 20 or flow_deviation > 15:
            return "fault"
        else:
            return "warning"

    return "healthy"

def update_ml_prediction():
    """Update ML-based failure prediction"""
    try:
        if len(simulation.historical_data) < 10:
            simulation.ml_prediction = MLPrediction(
                days_to_failure=None,
                confidence=0.0,
                risk_level="unknown",
                trend_analysis="Insufficient data for ML analysis"
            )
            return
        
        # Get recent data for prediction
        recent_data = [point.dict() for point in simulation.historical_data[-50:]]
        prediction_result = ml_detector.predict_failure_timeline(recent_data)
        
        simulation.ml_prediction = MLPrediction(**prediction_result)
        
    except Exception as e:
        logger.error(f"Error updating ML prediction: {e}")
        simulation.ml_prediction = MLPrediction(
            days_to_failure=None,
            confidence=0.0,
            risk_level="error",
            trend_analysis=f"Error in ML prediction: {str(e)}"
        )

def add_service_log(event_type: str, severity: str, component: str, message: str, details: Optional[Dict] = None, user_id: Optional[str] = None):
    """Add a service log entry"""
    log_entry = ServiceLogEntry(
        id=str(random.randint(100000, 999999)),
        timestamp=int(time.time() * 1000),
        event_type=event_type,
        severity=severity,
        component=component,
        message=message,
        details=details,
        user_id=user_id
    )
    simulation.service_logs.append(log_entry)
    # Keep only last 1000 log entries
    simulation.service_logs = simulation.service_logs[-1000:]

def add_alert(alert_type: str, message: str):
    """Add an alert to the simulation state"""
    alert = Alert(
        id=str(random.randint(100000, 999999)),
        type=alert_type,
        message=message,
        timestamp=int(time.time() * 1000)
    )
    simulation.alerts.append(alert)
    # Keep only last 20 alerts
    simulation.alerts = simulation.alerts[-20:]
    
    # Also add to service logs
    add_service_log(
        event_type="system",
        severity=alert_type,
        component="hydraulic_system",
        message=f"Alert generated: {message}",
        details={"alert_id": alert.id}
    )

def generate_data_point():
    """Generate a single data point with potential fault injection"""
    data = generate_normal_data()
    
    # Apply fault if active
    if simulation.fault_state["type"]:
        fault_age = time.time() * 1000 - simulation.fault_state["start_time"]
        intensity = min(fault_age / simulation.fault_state["duration"], 1.0)
        
        data = apply_fault_signature(data, simulation.fault_state["type"], intensity)
        
        # Clear fault after duration
        if fault_age >= simulation.fault_state["duration"]:
            simulation.fault_state = {"type": None, "start_time": 0, "duration": 0}
            add_alert("info", "Fault condition cleared - returning to normal operation")

    # Use ML-based anomaly detection
    new_health = detect_anomalies_ml(data)
    
    # Generate alerts on health changes
    if new_health != simulation.health:
        if new_health == "fault":
            add_alert("error", f"ML Model detected system fault! Pressure: {data.pressure:.1f} PSI, Temp: {data.temperature:.1f}°C, Flow: {data.flow:.1f} L/min")
        elif new_health == "warning":
            add_alert("warning", "ML Model detected anomaly - system parameters show unusual patterns")
        elif new_health == "healthy":
            add_alert("info", "System returned to normal operation")
        
        simulation.health = new_health

    simulation.current_data = data
    simulation.historical_data.append(data)
    
    # Keep last 200 points
    simulation.historical_data = simulation.historical_data[-200:]
    
    # Update ML prediction every 10 data points
    if len(simulation.historical_data) % 10 == 0:
        update_ml_prediction()

# API Endpoints
@app.get("/")
def root():
    return {"status": "ok"}

@app.get("/status", response_model=SystemStatus)
async def get_status():
    """Get current system status including ML predictions"""
    return SystemStatus(
        health=simulation.health,
        is_running=simulation.is_running,
        current_data=simulation.current_data,
        alerts=simulation.alerts[-5:],
        ml_prediction=simulation.ml_prediction
    )

@app.get("/data/current", response_model=HydraulicData)
async def get_current_data():
    """Get current hydraulic data point"""
    if not simulation.current_data:
        raise HTTPException(status_code=404, detail="No data available")
    return simulation.current_data

@app.get("/data/historical")
async def get_historical_data():
    """Get historical hydraulic data"""
    return simulation.historical_data[-50:]

@app.get("/service-logs")
async def get_service_logs(
    event_type: Optional[str] = None,
    severity: Optional[str] = None,
    component: Optional[str] = None,
    limit: int = 100,
    offset: int = 0
):
    """Get service logs with optional filtering"""
    logs = simulation.service_logs.copy()
    
    # Apply filters
    if event_type:
        logs = [log for log in logs if log.event_type == event_type]
    if severity:
        logs = [log for log in logs if log.severity == severity]
    if component:
        logs = [log for log in logs if log.component == component]
    
    # Sort by timestamp (newest first)
    logs.sort(key=lambda x: x.timestamp, reverse=True)
    
    # Apply pagination
    total = len(logs)
    logs = logs[offset:offset + limit]
    
    return {
        "logs": logs,
        "total": total,
        "limit": limit,
        "offset": offset
    }

@app.get("/maintenance-records")
async def get_maintenance_records(
    maintenance_type: Optional[str] = None,
    component: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
):
    """Get maintenance records with optional filtering"""
    records = simulation.maintenance_records.copy()
    
    # Apply filters
    if maintenance_type:
        records = [record for record in records if record.maintenance_type == maintenance_type]
    if component:
        records = [record for record in records if record.component == component]
    if status:
        records = [record for record in records if record.status == status]
    
    # Sort by timestamp (newest first)
    records.sort(key=lambda x: x.timestamp, reverse=True)
    
    # Apply pagination
    total = len(records)
    records = records[offset:offset + limit]
    
    return {
        "records": records,
        "total": total,
        "limit": limit,
        "offset": offset
    }

@app.post("/maintenance-records")
async def create_maintenance_record(record: MaintenanceRecord):
    """Create a new maintenance record"""
    # Generate ID if not provided
    if not record.id:
        record.id = str(random.randint(100000, 999999))
    
    simulation.maintenance_records.append(record)
    
    # Add to service logs
    add_service_log(
        event_type="maintenance",
        severity="info",
        component=record.component,
        message=f"Maintenance record created: {record.maintenance_type} - {record.description}",
        details={"maintenance_id": record.id, "technician": record.technician}
    )
    
    return {"message": "Maintenance record created", "id": record.id}

@app.post("/ml/train")
async def train_ml_model():
    """Train the ML model with current historical data"""
    try:
        if len(simulation.historical_data) < 50:
            # Use synthetic data for training
            success = ml_detector.train()
        else:
            # Use actual historical data
            training_data = [point.dict() for point in simulation.historical_data]
            success = ml_detector.train(training_data)
        
        if success:
            add_alert("info", "ML model training completed successfully")
            add_service_log(
                event_type="ml",
                severity="info",
                component="ml_model",
                message="ML model training completed successfully",
                details={"data_points": len(simulation.historical_data)}
            )
            # Update prediction after training
            update_ml_prediction()
            return {"message": "ML model trained successfully", "data_points": len(simulation.historical_data)}
        else:
            raise HTTPException(status_code=500, detail="ML model training failed")
            
    except Exception as e:
        logger.error(f"Error training ML model: {e}")
        add_service_log(
            event_type="ml",
            severity="error",
            component="ml_model",
            message=f"ML model training failed: {str(e)}"
        )
        raise HTTPException(status_code=500, detail=f"Training error: {str(e)}")

@app.get("/ml/prediction", response_model=MLPrediction)
async def get_ml_prediction():
    """Get current ML-based failure prediction"""
    if simulation.ml_prediction is None:
        update_ml_prediction()
    
    if simulation.ml_prediction is None:
        raise HTTPException(status_code=404, detail="ML prediction not available")
    
    return simulation.ml_prediction

@app.post("/simulation/start")
async def start_simulation():
    """Start the simulation"""
    simulation.is_running = True
    add_alert("info", "Hydraulic simulation started with ML integration")
    add_service_log(
        event_type="system",
        severity="info",
        component="simulation",
        message="Hydraulic simulation started"
    )
    return {"message": "Simulation started"}

@app.post("/simulation/stop")
async def stop_simulation():
    """Stop the simulation"""
    simulation.is_running = False
    add_alert("info", "Hydraulic simulation stopped")
    add_service_log(
        event_type="system",
        severity="info",
        component="simulation",
        message="Hydraulic simulation stopped"
    )
    return {"message": "Simulation stopped"}

@app.post("/simulation/reset")
async def reset_simulation():
    """Reset the simulation state"""
    simulation.fault_state = {"type": None, "start_time": 0, "duration": 0}
    simulation.health = "healthy"
    simulation.historical_data = []
    simulation.alerts = []
    simulation.ml_prediction = None
    add_alert("info", "System reset completed - all parameters restored to normal")
    add_service_log(
        event_type="system",
        severity="info",
        component="simulation",
        message="Simulation state reset - all parameters restored to normal"
    )
    return {"message": "Simulation reset"}

@app.post("/faults/inject/{fault_type}")
async def inject_fault(fault_type: str):
    """Inject a specific fault type"""
    valid_faults = ["pressure_drop", "temperature_spike", "flow_disruption", "random_noise"]
    
    if fault_type not in valid_faults:
        raise HTTPException(status_code=400, detail=f"Invalid fault type. Must be one of: {valid_faults}")
    
    simulation.fault_state = {
        "type": fault_type,
        "start_time": time.time() * 1000,
        "duration": 15000  # 15 seconds
    }

    fault_messages = {
        "pressure_drop": "Injecting pressure drop fault (simulating leak) - ML monitoring active",
        "temperature_spike": "Injecting temperature spike fault (simulating overheating) - ML monitoring active",
        "flow_disruption": "Injecting flow disruption fault (simulating cavitation) - ML monitoring active",
        "random_noise": "Injecting sensor noise fault - ML monitoring active"
    }

    add_alert("warning", fault_messages[fault_type])
    add_service_log(
        event_type="fault",
        severity="warning",
        component="hydraulic_system",
        message=f"Fault injected: {fault_type}",
        details={"fault_type": fault_type, "duration": 15000}
    )
    return {"message": f"Fault {fault_type} injected"}

@app.get("/stream")
async def stream_data():
    """Stream real-time data updates"""
    async def generate():
        while simulation.is_running:
            generate_data_point()
            
            data = {
                "current_data": simulation.current_data.dict() if simulation.current_data else None,
                "health": simulation.health,
                "alerts": [alert.dict() for alert in simulation.alerts[-1:]],
                "ml_prediction": simulation.ml_prediction.dict() if simulation.ml_prediction else None
            }
            
            yield f"data: {json.dumps(data)}\n\n"
            await asyncio.sleep(1)
    
    return StreamingResponse(generate(), media_type="text/plain")

@app.on_event("startup")
async def startup_event():
    """Initialize ML model and start background simulation"""
    logger.info("Starting up Hydraulic Fault Simulation API...")
    
    # Try to load existing ML model, otherwise train a new one
    if not ml_detector.load_model():
        logger.info("No existing ML model found. Training new model...")
        ml_detector.train()
    
    # Add startup log
    add_service_log(
        event_type="system",
        severity="info",
        component="simulation",
        message="Hydraulic Fault Simulation API started successfully"
    )
    
    # Start background simulation task
    asyncio.create_task(background_simulation())

async def background_simulation():
    """Background task that generates data when simulation is running"""
    while True:
        if simulation.is_running:
            generate_data_point()
        await asyncio.sleep(1)

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    await websocket.send_text("WebSocket connection established")
    while True:
        data = await websocket.receive_text()
        await websocket.send_text(f"Message received: {data}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
