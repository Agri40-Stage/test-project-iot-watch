"""
IoT Device Simulator Service
============================

This module simulates IoT temperature sensors and provides:
- Multiple virtual temperature sensors
- Device health monitoring
- Sensor calibration simulation
- Battery level simulation
- Network connectivity simulation
- Predictive maintenance alerts

Features:
- Realistic sensor behavior simulation
- Device health metrics
- Calibration drift simulation
- Battery life prediction
- Network latency simulation
"""

import random
import time
import threading
from datetime import datetime, timedelta
from dataclasses import dataclass
from typing import Dict, List, Optional
import json

@dataclass
class IoTSensor:
    """Represents a virtual IoT temperature sensor"""
    sensor_id: str
    name: str
    location: Dict[str, float]  # latitude, longitude
    temperature_offset: float
    calibration_drift: float
    battery_level: float
    battery_drain_rate: float
    is_online: bool
    last_maintenance: datetime
    sensor_type: str
    accuracy: float
    network_latency: float

class IoTSimulator:
    """
    IoT Device Simulator for temperature monitoring
    """
    
    def __init__(self):
        self.sensors: Dict[str, IoTSensor] = {}
        self.simulation_running = False
        self.simulation_thread = None
        
        # Initialize virtual sensors
        self._initialize_sensors()
    
    def _initialize_sensors(self):
        """Initialize virtual IoT sensors"""
        sensor_configs = [
            {
                'sensor_id': 'TEMP_001',
                'name': 'Outdoor Sensor - Main',
                'location': {'latitude': 30.4202, 'longitude': -9.5982},
                'sensor_type': 'High-Precision',
                'accuracy': 0.1
            },
            {
                'sensor_id': 'TEMP_002', 
                'name': 'Indoor Sensor - Living Room',
                'location': {'latitude': 30.4202, 'longitude': -9.5982},
                'sensor_type': 'Standard',
                'accuracy': 0.5
            },
            {
                'sensor_id': 'TEMP_003',
                'name': 'Outdoor Sensor - Garden',
                'location': {'latitude': 30.4202, 'longitude': -9.5982},
                'sensor_type': 'Weather-Resistant',
                'accuracy': 0.3
            },
            {
                'sensor_id': 'TEMP_004',
                'name': 'Indoor Sensor - Kitchen',
                'location': {'latitude': 30.4202, 'longitude': -9.5982},
                'sensor_type': 'Standard',
                'accuracy': 0.5
            }
        ]
        
        for config in sensor_configs:
            sensor = IoTSensor(
                sensor_id=config['sensor_id'],
                name=config['name'],
                location=config['location'],
                temperature_offset=random.uniform(-0.5, 0.5),
                calibration_drift=random.uniform(-0.1, 0.1),
                battery_level=random.uniform(60, 100),
                battery_drain_rate=random.uniform(0.1, 0.5),
                is_online=True,
                last_maintenance=datetime.now() - timedelta(days=random.randint(30, 180)),
                sensor_type=config['sensor_type'],
                accuracy=config['accuracy'],
                network_latency=random.uniform(10, 100)
            )
            self.sensors[config['sensor_id']] = sensor
    
    def start_simulation(self):
        """Start the IoT simulation"""
        if not self.simulation_running:
            self.simulation_running = True
            self.simulation_thread = threading.Thread(target=self._simulation_loop)
            self.simulation_thread.daemon = True
            self.simulation_thread.start()
            print("IoT simulation started")
    
    def stop_simulation(self):
        """Stop the IoT simulation"""
        self.simulation_running = False
        if self.simulation_thread:
            self.simulation_thread.join()
        print("IoT simulation stopped")
    
    def _simulation_loop(self):
        """Main simulation loop"""
        while self.simulation_running:
            try:
                # Update sensor states
                self._update_sensor_states()
                
                # Simulate sensor readings
                self._simulate_sensor_readings()
                
                # Update battery levels
                self._update_battery_levels()
                
                # Simulate network issues
                self._simulate_network_issues()
                
                # Check maintenance needs
                self._check_maintenance_needs()
                
                time.sleep(5)  # Update every 5 seconds
                
            except Exception as e:
                print(f"Error in IoT simulation: {str(e)}")
                time.sleep(5)
    
    def _update_sensor_states(self):
        """Update sensor states and health metrics"""
        for sensor in self.sensors.values():
            # Simulate calibration drift over time
            sensor.calibration_drift += random.uniform(-0.01, 0.01)
            sensor.calibration_drift = max(-1.0, min(1.0, sensor.calibration_drift))
            
            # Simulate network latency changes
            sensor.network_latency += random.uniform(-5, 5)
            sensor.network_latency = max(5, min(200, sensor.network_latency))
    
    def _simulate_sensor_readings(self):
        """Simulate temperature readings from sensors"""
        # This would integrate with the actual temperature data
        # For now, we'll just update sensor health metrics
        pass
    
    def _update_battery_levels(self):
        """Update battery levels for all sensors"""
        for sensor in self.sensors.values():
            if sensor.is_online:
                # Drain battery based on sensor type and activity
                drain_factor = 1.0
                if sensor.sensor_type == 'High-Precision':
                    drain_factor = 1.5
                elif sensor.sensor_type == 'Weather-Resistant':
                    drain_factor = 1.2
                
                sensor.battery_level -= sensor.battery_drain_rate * drain_factor * 0.01
                sensor.battery_level = max(0, sensor.battery_level)
                
                # Simulate sensor going offline when battery is low
                if sensor.battery_level < 10:
                    sensor.is_online = False
    
    def _simulate_network_issues(self):
        """Simulate network connectivity issues"""
        for sensor in self.sensors.values():
            # Random network disconnections
            if random.random() < 0.001:  # 0.1% chance per update
                sensor.is_online = False
                print(f"Network issue detected for sensor {sensor.sensor_id}")
            
            # Random reconnections
            if not sensor.is_online and random.random() < 0.01:  # 1% chance per update
                sensor.is_online = True
                print(f"Network restored for sensor {sensor.sensor_id}")
    
    def _check_maintenance_needs(self):
        """Check if sensors need maintenance"""
        for sensor in self.sensors.values():
            days_since_maintenance = (datetime.now() - sensor.last_maintenance).days
            
            # High-precision sensors need more frequent maintenance
            maintenance_interval = 90 if sensor.sensor_type == 'High-Precision' else 180
            
            if days_since_maintenance > maintenance_interval:
                print(f"Maintenance needed for sensor {sensor.sensor_id}")
    
    def get_sensor_reading(self, sensor_id: str, base_temperature: float) -> Optional[Dict]:
        """
        Get a simulated temperature reading from a specific sensor
        
        Args:
            sensor_id: ID of the sensor
            base_temperature: Base temperature to simulate from
            
        Returns:
            Dict with sensor reading and metadata
        """
        if sensor_id not in self.sensors:
            return None
        
        sensor = self.sensors[sensor_id]
        
        if not sensor.is_online:
            return {
                'sensor_id': sensor_id,
                'status': 'offline',
                'error': 'Sensor is offline'
            }
        
        # Simulate temperature reading with sensor characteristics
        noise = random.uniform(-sensor.accuracy, sensor.accuracy)
        reading = base_temperature + sensor.temperature_offset + sensor.calibration_drift + noise
        
        return {
            'sensor_id': sensor_id,
            'sensor_name': sensor.name,
            'temperature': round(reading, 2),
            'timestamp': datetime.now().isoformat(),
            'accuracy': sensor.accuracy,
            'battery_level': round(sensor.battery_level, 1),
            'network_latency': round(sensor.network_latency, 1),
            'status': 'online',
            'sensor_type': sensor.sensor_type,
            'location': sensor.location
        }
    
    def get_all_sensors_status(self) -> Dict:
        """Get status of all sensors"""
        return {
            'timestamp': datetime.now().isoformat(),
            'total_sensors': len(self.sensors),
            'online_sensors': sum(1 for s in self.sensors.values() if s.is_online),
            'offline_sensors': sum(1 for s in self.sensors.values() if not s.is_online),
            'sensors': {
                sensor_id: {
                    'name': sensor.name,
                    'status': 'online' if sensor.is_online else 'offline',
                    'battery_level': round(sensor.battery_level, 1),
                    'sensor_type': sensor.sensor_type,
                    'accuracy': sensor.accuracy,
                    'network_latency': round(sensor.network_latency, 1),
                    'days_since_maintenance': (datetime.now() - sensor.last_maintenance).days,
                    'calibration_drift': round(sensor.calibration_drift, 3)
                }
                for sensor_id, sensor in self.sensors.items()
            }
        }
    
    def get_device_health_summary(self) -> Dict:
        """Get overall device health summary"""
        online_sensors = [s for s in self.sensors.values() if s.is_online]
        offline_sensors = [s for s in self.sensors.values() if not s.is_online]
        
        avg_battery = sum(s.battery_level for s in online_sensors) / len(online_sensors) if online_sensors else 0
        avg_latency = sum(s.network_latency for s in online_sensors) / len(online_sensors) if online_sensors else 0
        
        # Calculate health score (0-100)
        battery_score = min(100, avg_battery)
        latency_score = max(0, 100 - avg_latency / 2)
        connectivity_score = (len(online_sensors) / len(self.sensors)) * 100
        
        overall_health = (battery_score + latency_score + connectivity_score) / 3
        
        return {
            'timestamp': datetime.now().isoformat(),
            'overall_health_score': round(overall_health, 1),
            'battery_score': round(battery_score, 1),
            'latency_score': round(latency_score, 1),
            'connectivity_score': round(connectivity_score, 1),
            'online_sensors': len(online_sensors),
            'offline_sensors': len(offline_sensors),
            'total_sensors': len(self.sensors),
            'average_battery_level': round(avg_battery, 1),
            'average_network_latency': round(avg_latency, 1),
            'alerts': self._generate_alerts()
        }
    
    def _generate_alerts(self) -> List[Dict]:
        """Generate alerts based on sensor conditions"""
        alerts = []
        
        for sensor in self.sensors.values():
            # Low battery alert
            if sensor.battery_level < 20:
                alerts.append({
                    'type': 'low_battery',
                    'sensor_id': sensor.sensor_id,
                    'message': f'Low battery on sensor {sensor.sensor_id}: {sensor.battery_level:.1f}%',
                    'severity': 'warning' if sensor.battery_level > 10 else 'critical'
                })
            
            # Offline sensor alert
            if not sensor.is_online:
                alerts.append({
                    'type': 'sensor_offline',
                    'sensor_id': sensor.sensor_id,
                    'message': f'Sensor {sensor.sensor_id} is offline',
                    'severity': 'warning'
                })
            
            # High calibration drift alert
            if abs(sensor.calibration_drift) > 0.5:
                alerts.append({
                    'type': 'calibration_drift',
                    'sensor_id': sensor.sensor_id,
                    'message': f'High calibration drift on sensor {sensor.sensor_id}: {sensor.calibration_drift:.3f}°C',
                    'severity': 'warning'
                })
            
            # Maintenance needed alert
            days_since_maintenance = (datetime.now() - sensor.last_maintenance).days
            maintenance_interval = 90 if sensor.sensor_type == 'High-Precision' else 180
            
            if days_since_maintenance > maintenance_interval:
                alerts.append({
                    'type': 'maintenance_needed',
                    'sensor_id': sensor.sensor_id,
                    'message': f'Maintenance needed for sensor {sensor.sensor_id} ({days_since_maintenance} days since last maintenance)',
                    'severity': 'info'
                })
        
        return alerts

# Global instance
iot_simulator = IoTSimulator() 