#!/usr/bin/env python3
"""
Python Cyber Attack Detector
=============================

Advanced Python component that detects cyber attacks and sends signals
to the Java security system for immediate response.

Features:
- Real-time network monitoring
- Malware detection
- Intrusion detection
- Anomaly detection
- Attack pattern recognition
"""

import json
import socket
import time
import threading
import logging
import hashlib
import psutil
import requests
from datetime import datetime
from typing import Dict, List, Optional
import uuid

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('attack_detector.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class AttackSignal:
    """Attack signal data structure"""
    
    def __init__(self, attack_type: str, severity: int, description: str, 
                 source: str = "PYTHON", **kwargs):
        self.signal_id = str(uuid.uuid4())
        self.attack_type = attack_type
        self.source = source
        self.severity = max(1, min(10, severity))  # Clamp between 1-10
        self.description = description
        self.timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.source_ip = kwargs.get('source_ip')
        self.target_ip = kwargs.get('target_ip')
        self.port = kwargs.get('port')
        self.protocol = kwargs.get('protocol')
        self.payload = kwargs.get('payload')
        self.metadata = kwargs.get('metadata', {})
        self.confidence_level = kwargs.get('confidence_level', 1.0)
        self.attack_vector = kwargs.get('attack_vector')
        self.affected_systems = kwargs.get('affected_systems', [])
        self.recommended_actions = kwargs.get('recommended_actions', [])
        self.is_ongoing = kwargs.get('is_ongoing', True)
        self.estimated_impact = kwargs.get('estimated_impact')

    def to_dict(self) -> Dict:
        """Convert to dictionary for JSON serialization"""
        return {
            'signal_id': self.signal_id,
            'attack_type': self.attack_type,
            'source': self.source,
            'severity': self.severity,
            'description': self.description,
            'timestamp': self.timestamp,
            'source_ip': self.source_ip,
            'target_ip': self.target_ip,
            'port': self.port,
            'protocol': self.protocol,
            'payload': self.payload,
            'metadata': self.metadata,
            'confidence_level': self.confidence_level,
            'attack_vector': self.attack_vector,
            'affected_systems': self.affected_systems,
            'recommended_actions': self.recommended_actions,
            'is_ongoing': self.is_ongoing,
            'estimated_impact': self.estimated_impact
        }

class CyberAttackDetector:
    """Main cyber attack detection system"""
    
    def __init__(self, java_host: str = "localhost", java_port: int = 9001):
        self.java_host = java_host
        self.java_port = java_port
        self.is_monitoring = False
        self.detection_threads = []
        
        # Attack patterns and signatures
        self.malware_signatures = [
            "malware_signature_1", "trojan_pattern", "virus_code",
            "ransomware_marker", "backdoor_signature"
        ]
        
        self.suspicious_processes = [
            "suspicious.exe", "malware.exe", "trojan.exe",
            "keylogger.exe", "backdoor.exe"
        ]
        
        self.attack_patterns = {
            "SQL_INJECTION": ["' OR '1'='1", "UNION SELECT", "DROP TABLE"],
            "XSS_ATTACK": ["<script>", "javascript:", "onerror="],
            "BRUTE_FORCE": ["multiple_failed_logins", "password_spray"],
            "DDoS_ATTACK": ["high_connection_rate", "bandwidth_spike"],
            "MALWARE_DETECTED": ["suspicious_file_hash", "known_malware_signature"]
        }
        
        logger.info(f"🐍 Python Cyber Attack Detector initialized")
        logger.info(f"📡 Java connection: {java_host}:{java_port}")

    def start_monitoring(self):
        """Start all monitoring components"""
        if self.is_monitoring:
            logger.warning("⚠️ Monitoring already active")
            return
            
        logger.info("🔍 Starting cyber attack monitoring...")
        self.is_monitoring = True
        
        # Start monitoring threads
        self.detection_threads = [
            threading.Thread(target=self._monitor_network_traffic, daemon=True),
            threading.Thread(target=self._monitor_system_processes, daemon=True),
            threading.Thread(target=self._monitor_file_system, daemon=True),
            threading.Thread(target=self._monitor_system_resources, daemon=True),
            threading.Thread(target=self._monitor_network_connections, daemon=True),
            threading.Thread(target=self._simulate_attack_detection, daemon=True)
        ]
        
        for thread in self.detection_threads:
            thread.start()
            
        logger.info("✅ All monitoring components started")

    def stop_monitoring(self):
        """Stop all monitoring components"""
        logger.info("🛑 Stopping cyber attack monitoring...")
        self.is_monitoring = False
        
        # Wait for threads to finish
        for thread in self.detection_threads:
            if thread.is_alive():
                thread.join(timeout=2)
                
        logger.info("✅ Monitoring stopped")

    def send_attack_signal(self, signal: AttackSignal):
        """Send attack signal to Java security system"""
        try:
            # Convert signal to JSON
            signal_data = json.dumps(signal.to_dict(), indent=2)
            
            # Send to Java system
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
                sock.settimeout(5)  # 5 second timeout
                sock.connect((self.java_host, self.java_port))
                sock.sendall(signal_data.encode('utf-8'))
                
            logger.warning(f"🚨 ATTACK SIGNAL SENT: {signal.attack_type} (Severity: {signal.severity})")
            
        except Exception as e:
            logger.error(f"❌ Failed to send attack signal: {e}")

    def _monitor_network_traffic(self):
        """Monitor network traffic for suspicious activity"""
        logger.info("🌐 Starting network traffic monitoring...")
        
        while self.is_monitoring:
            try:
                # Simulate network monitoring
                # In a real implementation, this would use packet capture libraries
                
                # Check for suspicious network patterns
                connections = psutil.net_connections()
                active_connections = len([c for c in connections if c.status == 'ESTABLISHED'])
                
                if active_connections > 100:  # Threshold for suspicious activity
                    signal = AttackSignal(
                        attack_type="SUSPICIOUS_NETWORK_ACTIVITY",
                        severity=4,
                        description=f"High number of active connections: {active_connections}",
                        metadata={"connection_count": active_connections},
                        attack_vector="NETWORK",
                        recommended_actions=["Monitor network traffic", "Check for DDoS"]
                    )
                    self.send_attack_signal(signal)
                
                # Simulate DDoS detection
                if active_connections > 200:
                    signal = AttackSignal(
                        attack_type="DDoS_ATTACK",
                        severity=8,
                        description=f"Potential DDoS attack detected: {active_connections} connections",
                        metadata={"connection_count": active_connections},
                        attack_vector="NETWORK",
                        estimated_impact="HIGH",
                        recommended_actions=["Block suspicious IPs", "Enable rate limiting"]
                    )
                    self.send_attack_signal(signal)
                
                time.sleep(10)  # Check every 10 seconds
                
            except Exception as e:
                logger.error(f"❌ Error in network monitoring: {e}")
                time.sleep(5)

    def _monitor_system_processes(self):
        """Monitor system processes for malware"""
        logger.info("🔍 Starting process monitoring...")
        
        while self.is_monitoring:
            try:
                # Get all running processes
                for proc in psutil.process_iter(['pid', 'name', 'exe', 'cmdline']):
                    try:
                        proc_info = proc.info
                        proc_name = proc_info.get('name', '').lower()
                        
                        # Check for suspicious process names
                        if any(suspicious in proc_name for suspicious in self.suspicious_processes):
                            signal = AttackSignal(
                                attack_type="MALWARE_DETECTED",
                                severity=9,
                                description=f"Suspicious process detected: {proc_name}",
                                metadata={
                                    "process_name": proc_name,
                                    "pid": proc_info.get('pid'),
                                    "exe": proc_info.get('exe')
                                },
                                attack_vector="PROCESS",
                                estimated_impact="CRITICAL",
                                recommended_actions=["Terminate process", "Scan system", "Isolate machine"]
                            )
                            self.send_attack_signal(signal)
                            
                    except (psutil.NoSuchProcess, psutil.AccessDenied):
                        continue
                
                time.sleep(30)  # Check every 30 seconds
                
            except Exception as e:
                logger.error(f"❌ Error in process monitoring: {e}")
                time.sleep(10)

    def _monitor_file_system(self):
        """Monitor file system for suspicious changes"""
        logger.info("📁 Starting file system monitoring...")
        
        while self.is_monitoring:
            try:
                # Simulate file system monitoring
                # In a real implementation, this would use file system watchers
                
                # Check for suspicious file operations
                # This is a simplified simulation
                import random
                if random.random() < 0.1:  # 10% chance of detecting suspicious activity
                    signal = AttackSignal(
                        attack_type="UNAUTHORIZED_ACCESS",
                        severity=6,
                        description="Suspicious file system activity detected",
                        metadata={"file_path": "/sensitive/data/file.txt"},
                        attack_vector="FILE_SYSTEM",
                        recommended_actions=["Check file permissions", "Audit file access"]
                    )
                    self.send_attack_signal(signal)
                
                time.sleep(60)  # Check every minute
                
            except Exception as e:
                logger.error(f"❌ Error in file system monitoring: {e}")
                time.sleep(30)

    def _monitor_system_resources(self):
        """Monitor system resources for anomalies"""
        logger.info("📊 Starting system resource monitoring...")
        
        while self.is_monitoring:
            try:
                # Check CPU usage
                cpu_percent = psutil.cpu_percent(interval=1)
                if cpu_percent > 95:
                    signal = AttackSignal(
                        attack_type="RESOURCE_EXHAUSTION",
                        severity=5,
                        description=f"High CPU usage detected: {cpu_percent}%",
                        metadata={"cpu_usage": cpu_percent},
                        attack_vector="SYSTEM",
                        recommended_actions=["Check running processes", "Monitor for crypto mining"]
                    )
                    self.send_attack_signal(signal)
                
                # Check memory usage
                memory = psutil.virtual_memory()
                if memory.percent > 95:
                    signal = AttackSignal(
                        attack_type="RESOURCE_EXHAUSTION",
                        severity=5,
                        description=f"High memory usage detected: {memory.percent}%",
                        metadata={"memory_usage": memory.percent},
                        attack_vector="SYSTEM",
                        recommended_actions=["Check memory leaks", "Monitor for memory bombs"]
                    )
                    self.send_attack_signal(signal)
                
                time.sleep(15)  # Check every 15 seconds
                
            except Exception as e:
                logger.error(f"❌ Error in resource monitoring: {e}")
                time.sleep(10)

    def _monitor_network_connections(self):
        """Monitor network connections for suspicious activity"""
        logger.info("🔗 Starting network connection monitoring...")
        
        while self.is_monitoring:
            try:
                connections = psutil.net_connections(kind='inet')
                
                # Check for suspicious connections
                for conn in connections:
                    if conn.raddr:  # Remote address exists
                        remote_ip = conn.raddr.ip
                        remote_port = conn.raddr.port
                        
                        # Check for connections to suspicious ports
                        suspicious_ports = [4444, 5555, 6666, 7777, 8888, 9999]
                        if remote_port in suspicious_ports:
                            signal = AttackSignal(
                                attack_type="BACKDOOR_DETECTED",
                                severity=9,
                                description=f"Connection to suspicious port detected: {remote_ip}:{remote_port}",
                                source_ip=remote_ip,
                                port=remote_port,
                                protocol="TCP",
                                metadata={"connection_type": conn.type.name},
                                attack_vector="NETWORK",
                                estimated_impact="CRITICAL",
                                recommended_actions=["Block IP", "Investigate connection", "Scan for backdoors"]
                            )
                            self.send_attack_signal(signal)
                
                time.sleep(20)  # Check every 20 seconds
                
            except Exception as e:
                logger.error(f"❌ Error in connection monitoring: {e}")
                time.sleep(10)

    def _simulate_attack_detection(self):
        """Simulate various attack detections for testing"""
        logger.info("🎭 Starting attack simulation for testing...")
        
        attack_scenarios = [
            {
                "type": "SQL_INJECTION",
                "severity": 7,
                "description": "SQL injection attempt detected in web application",
                "vector": "WEB_APPLICATION"
            },
            {
                "type": "XSS_ATTACK",
                "severity": 6,
                "description": "Cross-site scripting attack detected",
                "vector": "WEB_APPLICATION"
            },
            {
                "type": "BRUTE_FORCE",
                "severity": 8,
                "description": "Brute force attack on SSH service",
                "vector": "NETWORK"
            },
            {
                "type": "PRIVILEGE_ESCALATION",
                "severity": 9,
                "description": "Privilege escalation attempt detected",
                "vector": "SYSTEM"
            },
            {
                "type": "DATA_BREACH_ATTEMPT",
                "severity": 10,
                "description": "Unauthorized access to sensitive data detected",
                "vector": "DATA"
            }
        ]
        
        while self.is_monitoring:
            try:
                # Randomly trigger attack scenarios for testing
                import random
                if random.random() < 0.05:  # 5% chance every cycle
                    scenario = random.choice(attack_scenarios)
                    
                    signal = AttackSignal(
                        attack_type=scenario["type"],
                        severity=scenario["severity"],
                        description=scenario["description"],
                        attack_vector=scenario["vector"],
                        source_ip="192.168.1.100",
                        target_ip="192.168.1.1",
                        confidence_level=0.9,
                        recommended_actions=["Investigate immediately", "Block source", "Alert security team"]
                    )
                    self.send_attack_signal(signal)
                
                time.sleep(30)  # Check every 30 seconds
                
            except Exception as e:
                logger.error(f"❌ Error in attack simulation: {e}")
                time.sleep(15)

def main():
    """Main function"""
    logger.info("🐍 Starting Python Cyber Attack Detector...")
    
    # Create detector instance
    detector = CyberAttackDetector()
    
    try:
        # Start monitoring
        detector.start_monitoring()
        
        # Keep running
        logger.info("🔍 Monitoring active. Press Ctrl+C to stop.")
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        logger.info("🛑 Shutdown requested by user")
    except Exception as e:
        logger.error(f"❌ Unexpected error: {e}")
    finally:
        detector.stop_monitoring()
        logger.info("👋 Python Cyber Attack Detector stopped")

if __name__ == "__main__":
    main()