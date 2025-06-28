
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import logging

logger = logging.getLogger(__name__)

class HydraulicAnomalyDetector:
    def __init__(self, contamination=0.1, random_state=42):
        """
        Initialize the Isolation Forest model for hydraulic anomaly detection
        
        Args:
            contamination: Expected proportion of outliers in the data
            random_state: Random state for reproducibility
        """
        self.model = IsolationForest(
            contamination=contamination,
            random_state=random_state,
            n_estimators=100
        )
        self.scaler = StandardScaler()
        self.is_trained = False
        self.model_path = "backend/models/"
        self.feature_columns = ['pressure', 'temperature', 'flow']
        
        # Create models directory if it doesn't exist
        os.makedirs(self.model_path, exist_ok=True)
    
    def prepare_features(self, data: List[Dict]) -> pd.DataFrame:
        """
        Prepare features from raw hydraulic data
        
        Args:
            data: List of hydraulic data points
            
        Returns:
            DataFrame with prepared features
        """
        df = pd.DataFrame(data)
        
        if len(df) < 2:
            return df[self.feature_columns] if not df.empty else pd.DataFrame(columns=self.feature_columns)
        
        # Add temporal features
        df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
        df = df.sort_values('timestamp')
        
        # Calculate rolling statistics (window of 5 points)
        window = min(5, len(df))
        for col in self.feature_columns:
            df[f'{col}_rolling_mean'] = df[col].rolling(window=window, min_periods=1).mean()
            df[f'{col}_rolling_std'] = df[col].rolling(window=window, min_periods=1).std().fillna(0)
            
            # Rate of change
            df[f'{col}_rate_change'] = df[col].diff().fillna(0)
        
        # Select features for training
        feature_cols = self.feature_columns.copy()
        for col in self.feature_columns:
            feature_cols.extend([f'{col}_rolling_mean', f'{col}_rolling_std', f'{col}_rate_change'])
        
        return df[feature_cols].fillna(0)
    
    def generate_training_data(self, n_samples=1000) -> pd.DataFrame:
        """
        Generate synthetic training data with normal and anomalous patterns
        """
        np.random.seed(42)
        
        # Normal operation data (80% of samples)
        normal_samples = int(n_samples * 0.8)
        normal_data = []
        
        for _ in range(normal_samples):
            pressure = np.random.normal(150, 5)
            temperature = np.random.normal(80, 4)
            flow = np.random.normal(50, 3)
            
            normal_data.append({
                'pressure': max(0, pressure),
                'temperature': max(0, temperature),
                'flow': max(0, flow),
                'timestamp': int((datetime.now().timestamp() + np.random.uniform(-3600, 3600)) * 1000)
            })
        
        # Anomalous data (20% of samples)
        anomaly_samples = n_samples - normal_samples
        anomaly_data = []
        
        for _ in range(anomaly_samples):
            # Generate different types of anomalies
            anomaly_type = np.random.choice(['pressure_drop', 'temperature_spike', 'flow_disruption', 'multiple_fault'])
            
            if anomaly_type == 'pressure_drop':
                pressure = np.random.uniform(80, 120)  # Low pressure
                temperature = np.random.normal(80, 4)
                flow = np.random.normal(50, 3)
            elif anomaly_type == 'temperature_spike':
                pressure = np.random.normal(150, 5)
                temperature = np.random.uniform(100, 130)  # High temperature
                flow = np.random.normal(50, 3)
            elif anomaly_type == 'flow_disruption':
                pressure = np.random.normal(150, 5)
                temperature = np.random.normal(80, 4)
                flow = np.random.uniform(20, 35)  # Low flow
            else:  # multiple_fault
                pressure = np.random.uniform(90, 130)
                temperature = np.random.uniform(90, 110)
                flow = np.random.uniform(30, 40)
            
            anomaly_data.append({
                'pressure': max(0, pressure),
                'temperature': max(0, temperature),
                'flow': max(0, flow),
                'timestamp': int((datetime.now().timestamp() + np.random.uniform(-3600, 3600)) * 1000)
            })
        
        all_data = normal_data + anomaly_data
        np.random.shuffle(all_data)
        
        return self.prepare_features(all_data)
    
    def train(self, data: Optional[List[Dict]] = None) -> bool:
        """
        Train the Isolation Forest model
        
        Args:
            data: Optional training data. If None, generates synthetic data
            
        Returns:
            True if training successful, False otherwise
        """
        try:
            if data is None:
                logger.info("Generating synthetic training data...")
                features_df = self.generate_training_data()
            else:
                logger.info(f"Training with {len(data)} data points...")
                features_df = self.prepare_features(data)
            
            if len(features_df) < 10:
                logger.warning("Insufficient data for training. Need at least 10 samples.")
                return False
            
            # Scale features
            features_scaled = self.scaler.fit_transform(features_df)
            
            # Train model
            self.model.fit(features_scaled)
            self.is_trained = True
            
            # Save model and scaler
            self.save_model()
            
            logger.info("Model training completed successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error during training: {e}")
            return False
    
    def predict(self, data: List[Dict]) -> Tuple[List[int], List[float]]:
        """
        Predict anomalies in the data
        
        Args:
            data: List of hydraulic data points
            
        Returns:
            Tuple of (anomaly_labels, anomaly_scores)
            anomaly_labels: -1 for anomaly, 1 for normal
            anomaly_scores: Lower scores indicate higher anomaly likelihood
        """
        if not self.is_trained:
            logger.warning("Model not trained. Training with synthetic data...")
            self.train()
        
        try:
            features_df = self.prepare_features(data)
            
            if len(features_df) == 0:
                return [], []
            
            features_scaled = self.scaler.transform(features_df)
            
            # Predict anomalies
            anomaly_labels = self.model.predict(features_scaled)
            anomaly_scores = self.model.score_samples(features_scaled)
            
            return anomaly_labels.tolist(), anomaly_scores.tolist()
            
        except Exception as e:
            logger.error(f"Error during prediction: {e}")
            return [], []
    
    def predict_failure_timeline(self, recent_data: List[Dict], window_hours=24) -> Dict:
        """
        Predict potential system failure timeline based on recent trends
        
        Args:
            recent_data: Recent hydraulic data points
            window_hours: Time window to analyze for trends
            
        Returns:
            Dictionary with failure prediction information
        """
        if len(recent_data) < 10:
            return {
                'days_to_failure': None,
                'confidence': 0.0,
                'risk_level': 'unknown',
                'trend_analysis': 'Insufficient data for analysis'
            }
        
        try:
            # Get anomaly scores for recent data
            _, anomaly_scores = self.predict(recent_data)
            
            if not anomaly_scores:
                return {
                    'days_to_failure': None,
                    'confidence': 0.0,
                    'risk_level': 'unknown',
                    'trend_analysis': 'Unable to calculate anomaly scores'
                }
            
            # Calculate trend in anomaly scores
            scores_array = np.array(anomaly_scores)
            avg_score = np.mean(scores_array)
            score_trend = np.polyfit(range(len(scores_array)), scores_array, 1)[0]
            
            # Determine risk level and estimated days to failure
            if avg_score > -0.1:  # Very low anomaly scores indicate high risk
                risk_level = 'high'
                base_days = 7
            elif avg_score > -0.3:
                risk_level = 'medium'
                base_days = 30
            else:
                risk_level = 'low'
                base_days = 90
            
            # Adjust based on trend
            if score_trend < -0.01:  # Worsening trend
                days_to_failure = max(1, int(base_days * 0.5))
                confidence = 0.8
            elif score_trend > 0.01:  # Improving trend
                days_to_failure = int(base_days * 1.5)
                confidence = 0.6
            else:  # Stable trend
                days_to_failure = base_days
                confidence = 0.7
            
            return {
                'days_to_failure': days_to_failure,
                'confidence': confidence,
                'risk_level': risk_level,
                'trend_analysis': f"Average anomaly score: {avg_score:.3f}, Trend: {'worsening' if score_trend < 0 else 'improving' if score_trend > 0 else 'stable'}"
            }
            
        except Exception as e:
            logger.error(f"Error in failure prediction: {e}")
            return {
                'days_to_failure': None,
                'confidence': 0.0,
                'risk_level': 'unknown',
                'trend_analysis': f'Error in analysis: {str(e)}'
            }
    
    def save_model(self):
        """Save the trained model and scaler"""
        try:
            joblib.dump(self.model, os.path.join(self.model_path, 'isolation_forest.pkl'))
            joblib.dump(self.scaler, os.path.join(self.model_path, 'scaler.pkl'))
            logger.info("Model saved successfully")
        except Exception as e:
            logger.error(f"Error saving model: {e}")
    
    def load_model(self) -> bool:
        """Load a previously trained model"""
        try:
            model_file = os.path.join(self.model_path, 'isolation_forest.pkl')
            scaler_file = os.path.join(self.model_path, 'scaler.pkl')
            
            if os.path.exists(model_file) and os.path.exists(scaler_file):
                self.model = joblib.load(model_file)
                self.scaler = joblib.load(scaler_file)
                self.is_trained = True
                logger.info("Model loaded successfully")
                return True
            else:
                logger.info("No pre-trained model found")
                return False
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            return False

# Global ML detector instance
ml_detector = HydraulicAnomalyDetector()
