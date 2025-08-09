"""
🛡️ ML-Powered Chat Moderation System
A comprehensive chat moderation system that detects and blocks:
- Personal information (emails, phone numbers, addresses)
- External platform mentions (PayPal, WhatsApp, Telegram, etc.)
- Off-platform transaction attempts
- Smart bypasses and obfuscated content

Features:
- Regex-based fast detection
- ML-powered intent analysis
- Real-time confidence scoring
- SQLite logging and analytics
- Flask API for integration
- Trainable models that improve over time
"""

import re
import sqlite3
import json
import time
import os
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')

# Core dependencies
try:
    import numpy as np
    import pandas as pd
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.model_selection import train_test_split
    from sklearn.pipeline import Pipeline
    import pickle
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    print("⚠️ scikit-learn not available. ML features will be limited.")

try:
    import phonenumbers
    PHONENUMBERS_AVAILABLE = True
except ImportError:
    PHONENUMBERS_AVAILABLE = False
    print("⚠️ phonenumbers not available. Phone validation will be basic.")

try:
    from langdetect import detect
    LANGDETECT_AVAILABLE = True
except ImportError:
    LANGDETECT_AVAILABLE = False
    print("⚠️ langdetect not available. Language detection disabled.")

try:
    from flask import Flask, request, jsonify, render_template_string
    from flask_cors import CORS
    FLASK_AVAILABLE = True
except ImportError:
    FLASK_AVAILABLE = False
    print("⚠️ Flask not available. API server will be disabled.")

# ================================
# CONFIGURATION
# ================================

class Config:
    """Configuration settings for the moderation system"""
    
    # Database settings
    DATABASE_PATH = "chat_moderation.db"
    
    # Platform name for warnings
    PLATFORM_NAME = "KRILI"
    
    # Confidence thresholds
    REGEX_CONFIDENCE = 0.9
    ML_CONFIDENCE_THRESHOLD = 0.7
    COMBINED_CONFIDENCE_THRESHOLD = 0.6
    
    # Warning messages
    WARNING_MESSAGES = {
        "personal_info": f"🚫 Sharing personal info or off-platform payment methods is not allowed. Please use the secure system inside {PLATFORM_NAME}.",
        "external_platform": f"🚫 Mentions of external platforms are not allowed. Please keep all communications within {PLATFORM_NAME}.",
        "off_platform_transaction": f"🚫 Attempting to move transactions outside {PLATFORM_NAME} is prohibited. Use our secure payment system.",
        "general": f"🚫 This message violates our community guidelines. Please use {PLATFORM_NAME}'s secure features."
    }
    
    # Regex patterns for fast detection
    REGEX_PATTERNS = {
        "email": [
            r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
            r'\b[A-Za-z0-9._%+-]+\s*@\s*[A-Za-z0-9.-]+\s*\.\s*[A-Z|a-z]{2,}\b',
            r'\b[A-Za-z0-9._%+-]+\s*\[\s*at\s*\]\s*[A-Za-z0-9.-]+\s*\[\s*dot\s*\]\s*[A-Z|a-z]{2,}\b'
        ],
        "phone": [
            r'\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b',
            r'\b(?:\+?[1-9]\d{0,3}[-.\s]?)?\(?([0-9]{2,4})\)?[-.\s]?([0-9]{3,4})[-.\s]?([0-9]{3,4})\b',
            r'\b(?:zero|one|two|three|four|five|six|seven|eight|nine)[\s-]*(?:zero|one|two|three|four|five|six|seven|eight|nine)[\s-]*(?:zero|one|two|three|four|five|six|seven|eight|nine)\b'
        ],
        "payment_links": [
            r'\b(?:paypal\.me|venmo\.com|cashapp\.com|zelle|cash\.app)/[A-Za-z0-9_-]+\b',
            r'\b(?:bit\.ly|tinyurl\.com|t\.co)/[A-Za-z0-9_-]+\b'
        ],
        "external_platforms": [
            r'\b(?:whatsapp|telegram|discord|skype|snapchat|instagram|facebook|twitter|tiktok)\b',
            r'\b(?:paypal|venmo|cashapp|zelle|western union|moneygram)\b',
            r'\b(?:gmail|yahoo|hotmail|outlook|protonmail)\b'
        ],
        "off_platform_keywords": [
            r'\b(?:contact me|reach me|message me|call me|text me)\s+(?:at|on|via)\b',
            r'\b(?:send|transfer|pay)\s+(?:money|payment|cash)\s+(?:to|via|through)\b',
            r'\b(?:meet|transaction|deal)\s+(?:outside|off)\s+(?:platform|site|app)\b'
        ]
    }

# ================================
# DATABASE MODULE
# ================================

class ModerationDatabase:
    """Database operations for the moderation system"""
    
    def __init__(self, db_path: str = None):
        self.db_path = db_path or Config.DATABASE_PATH
        self.init_database()
    
    def init_database(self):
        """Initialize the database with required tables"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Flagged messages table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS flagged_messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT NOT NULL,
                    message TEXT NOT NULL,
                    violation_type TEXT NOT NULL,
                    confidence_score REAL NOT NULL,
                    detection_method TEXT NOT NULL,
                    patterns_matched TEXT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    is_false_positive BOOLEAN DEFAULT FALSE,
                    admin_reviewed BOOLEAN DEFAULT FALSE,
                    admin_notes TEXT
                )
            ''')
            
            # Training data table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS training_data (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    message TEXT NOT NULL,
                    label INTEGER NOT NULL,
                    violation_type TEXT,
                    confidence_score REAL,
                    source TEXT DEFAULT 'manual',
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # User statistics table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS user_stats (
                    user_id TEXT PRIMARY KEY,
                    total_messages INTEGER DEFAULT 0,
                    flagged_messages INTEGER DEFAULT 0,
                    false_positives INTEGER DEFAULT 0,
                    last_violation DATETIME,
                    risk_score REAL DEFAULT 0.0,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            conn.commit()
    
    def log_flagged_message(self, user_id: str, message: str, violation_type: str, 
                           confidence_score: float, detection_method: str, 
                           patterns_matched: List[str] = None) -> int:
        """Log a flagged message to the database"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            patterns_json = json.dumps(patterns_matched) if patterns_matched else None
            
            cursor.execute('''
                INSERT INTO flagged_messages 
                (user_id, message, violation_type, confidence_score, detection_method, patterns_matched)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (user_id, message, violation_type, confidence_score, detection_method, patterns_json))
            
            message_id = cursor.lastrowid
            
            # Update user statistics
            self._update_user_stats(cursor, user_id, flagged=True)
            
            conn.commit()
            return message_id
    
    def log_safe_message(self, user_id: str):
        """Log a safe message (for statistics)"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            self._update_user_stats(cursor, user_id, flagged=False)
            conn.commit()
    
    def get_flagged_messages(self, user_id: str = None, limit: int = 100) -> List[Dict]:
        """Get flagged messages with optional user filter"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            if user_id:
                cursor.execute('''
                    SELECT * FROM flagged_messages 
                    WHERE user_id = ? 
                    ORDER BY timestamp DESC 
                    LIMIT ?
                ''', (user_id, limit))
            else:
                cursor.execute('''
                    SELECT * FROM flagged_messages 
                    ORDER BY timestamp DESC 
                    LIMIT ?
                ''', (limit,))
            
            columns = [description[0] for description in cursor.description]
            results = []
            
            for row in cursor.fetchall():
                result = dict(zip(columns, row))
                if result['patterns_matched']:
                    try:
                        result['patterns_matched'] = json.loads(result['patterns_matched'])
                    except:
                        result['patterns_matched'] = []
                results.append(result)
            
            return results
    
    def get_user_stats(self, user_id: str) -> Dict:
        """Get statistics for a specific user"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            cursor.execute('SELECT * FROM user_stats WHERE user_id = ?', (user_id,))
            result = cursor.fetchone()
            
            if result:
                columns = [description[0] for description in cursor.description]
                return dict(zip(columns, result))
            else:
                return {
                    'user_id': user_id,
                    'total_messages': 0,
                    'flagged_messages': 0,
                    'false_positives': 0,
                    'last_violation': None,
                    'risk_score': 0.0
                }
    
    def _update_user_stats(self, cursor, user_id: str, flagged: bool):
        """Update user statistics"""
        cursor.execute('''
            INSERT OR IGNORE INTO user_stats (user_id) VALUES (?)
        ''', (user_id,))
        
        if flagged:
            cursor.execute('''
                UPDATE user_stats 
                SET total_messages = total_messages + 1,
                    flagged_messages = flagged_messages + 1,
                    last_violation = CURRENT_TIMESTAMP,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
            ''', (user_id,))
        else:
            cursor.execute('''
                UPDATE user_stats 
                SET total_messages = total_messages + 1,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
            ''', (user_id,))
        
        # Update risk score
        cursor.execute('''
            UPDATE user_stats 
            SET risk_score = CAST(flagged_messages AS REAL) / CAST(total_messages AS REAL)
            WHERE user_id = ? AND total_messages > 0
        ''', (user_id,))

# ================================
# REGEX DETECTOR
# ================================

class RegexDetector:
    """Regex-based pattern detection for fast message screening"""
    
    def __init__(self):
        self.patterns = Config.REGEX_PATTERNS
        self.confidence = Config.REGEX_CONFIDENCE
        
        # Compile regex patterns for better performance
        self.compiled_patterns = {}
        for category, pattern_list in self.patterns.items():
            self.compiled_patterns[category] = [
                re.compile(pattern, re.IGNORECASE) for pattern in pattern_list
            ]
    
    def detect_violations(self, message: str) -> Dict:
        """Detect violations in a message using regex patterns"""
        results = {
            'is_violation': False,
            'violation_type': None,
            'confidence': 0.0,
            'matched_patterns': [],
            'details': {}
        }
        
        # Normalize message for better detection
        normalized_message = self._normalize_message(message)
        
        # Check each category
        for category, compiled_patterns in self.compiled_patterns.items():
            matches = []
            
            for pattern in compiled_patterns:
                found_matches = pattern.findall(normalized_message)
                if found_matches:
                    matches.extend(found_matches)
            
            if matches:
                results['is_violation'] = True
                results['violation_type'] = category
                results['confidence'] = self.confidence
                results['matched_patterns'] = matches
                results['details'][category] = matches
                break  # Return first violation found
        
        return results
    
    def _normalize_message(self, message: str) -> str:
        """Normalize message for better pattern matching"""
        # Convert common obfuscation techniques
        replacements = {
            '@': ['at', '(at)', '[at]', ' at ', '_at_'],
            '.': ['dot', '(dot)', '[dot]', ' dot ', '_dot_'],
            '0': ['zero', 'o', 'O'],
            '1': ['one', 'l', 'I'],
            '2': ['two', 'to'],
            '3': ['three', 'tree'],
            '4': ['four', 'for'],
            '5': ['five'],
            '6': ['six'],
            '7': ['seven'],
            '8': ['eight'],
            '9': ['nine']
        }
        
        normalized = message.lower()
        
        # Replace common obfuscations
        for original, alternatives in replacements.items():
            for alt in alternatives:
                normalized = normalized.replace(alt, original)
        
        # Remove extra spaces
        normalized = re.sub(r'\s+', ' ', normalized)
        
        return normalized
    
    def detect_smart_bypasses(self, message: str) -> Dict:
        """Detect smart bypass attempts using contextual patterns"""
        results = {
            'is_bypass': False,
            'bypass_type': None,
            'confidence': 0.0,
            'matched_patterns': [],
            'context': None
        }
        
        bypass_patterns = [
            # Contact information bypasses
            (r'(?:contact|reach|message|call|text)\s+me\s+(?:at|on|via)', 'contact_bypass'),
            (r'(?:my|the)\s+(?:number|email|phone)\s+is', 'info_sharing'),
            (r'(?:send|transfer|pay)\s+(?:to|via|through)\s+(?:my|this)', 'payment_bypass'),
            (r'(?:meet|deal|transaction)\s+(?:outside|off)\s+(?:platform|site|app)', 'off_platform'),
            
            # Obfuscated contact info
            (r'(?:zero|one|two|three|four|five|six|seven|eight|nine)[\s-]*(?:zero|one|two|three|four|five|six|seven|eight|nine)', 'number_words'),
            (r'[a-zA-Z0-9._%+-]+\s*\[\s*at\s*\]\s*[a-zA-Z0-9.-]+', 'obfuscated_email'),
            (r'(?:gmail|yahoo|hotmail|outlook)\s*\[\s*dot\s*\]\s*com', 'obfuscated_domain'),
            
            # Platform mentions with context
            (r'(?:add|contact|find)\s+me\s+on\s+(?:whatsapp|telegram|discord|instagram)', 'platform_redirect'),
            (r'(?:paypal|venmo|cashapp|zelle)\s+(?:me|link|account)', 'payment_platform'),
        ]
        
        message_lower = message.lower()
        
        for pattern, bypass_type in bypass_patterns:
            matches = re.findall(pattern, message_lower, re.IGNORECASE)
            if matches:
                results['is_bypass'] = True
                results['bypass_type'] = bypass_type
                results['confidence'] = 0.8
                results['matched_patterns'] = matches
                results['context'] = self._extract_context(message, pattern)
                break
        
        return results
    
    def _extract_context(self, message: str, pattern: str) -> str:
        """Extract context around matched pattern"""
        try:
            match = re.search(pattern, message, re.IGNORECASE)
            if match:
                start = max(0, match.start() - 20)
                end = min(len(message), match.end() + 20)
                return message[start:end].strip()
        except:
            pass
        return None
    
    def analyze_message_risk(self, message: str) -> Dict:
        """Comprehensive risk analysis of a message"""
        # Standard violation detection
        violation_results = self.detect_violations(message)
        
        # Smart bypass detection
        bypass_results = self.detect_smart_bypasses(message)
        
        # Combine results
        risk_analysis = {
            'message': message,
            'has_violation': violation_results['is_violation'],
            'has_bypass': bypass_results['is_bypass'],
            'overall_risk': 'low',
            'confidence': 0.0,
            'violation_details': violation_results,
            'bypass_details': bypass_results,
            'recommended_action': 'allow'
        }
        
        # Calculate overall risk and confidence
        if violation_results['is_violation'] and bypass_results['is_bypass']:
            risk_analysis['overall_risk'] = 'critical'
            risk_analysis['confidence'] = max(violation_results['confidence'], bypass_results['confidence'])
            risk_analysis['recommended_action'] = 'block'
        elif violation_results['is_violation']:
            risk_analysis['overall_risk'] = 'high'
            risk_analysis['confidence'] = violation_results['confidence']
            risk_analysis['recommended_action'] = 'block'
        elif bypass_results['is_bypass']:
            risk_analysis['overall_risk'] = 'medium'
            risk_analysis['confidence'] = bypass_results['confidence']
            risk_analysis['recommended_action'] = 'warn'
        
        return risk_analysis

# ================================
# ML DETECTOR
# ================================

class MLDetector:
    """Machine Learning-based detection for advanced message analysis"""
    
    def __init__(self, model_path: str = "models/"):
        self.model_path = model_path
        self.models = {}
        
        # Create models directory if it doesn't exist
        os.makedirs(self.model_path, exist_ok=True)
        
        if SKLEARN_AVAILABLE:
            self._load_or_create_models()
    
    def _load_or_create_models(self):
        """Load existing models or create new ones"""
        model_files = {
            'violation_classifier': 'violation_classifier.pkl',
        }
        
        for model_name, filename in model_files.items():
            filepath = os.path.join(self.model_path, filename)
            if os.path.exists(filepath):
                try:
                    with open(filepath, 'rb') as f:
                        self.models[model_name] = pickle.load(f)
                    print(f"✅ Loaded {model_name}")
                except Exception as e:
                    print(f"❌ Error loading {model_name}: {e}")
                    self.models[model_name] = self._create_default_model()
            else:
                self.models[model_name] = self._create_default_model()
    
    def _create_default_model(self):
        """Create a default model pipeline"""
        if not SKLEARN_AVAILABLE:
            return None
        
        return Pipeline([
            ('tfidf', TfidfVectorizer(max_features=5000, ngram_range=(1, 3))),
            ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))
        ])
    
    def extract_features(self, message: str) -> Dict:
        """Extract comprehensive features from a message"""
        features = {}
        
        # Basic text features
        features['message_length'] = len(message)
        features['word_count'] = len(message.split())
        features['char_count'] = len(message)
        features['avg_word_length'] = np.mean([len(word) for word in message.split()]) if message.split() else 0
        
        # Character-based features
        features['uppercase_ratio'] = sum(1 for c in message if c.isupper()) / len(message) if message else 0
        features['digit_ratio'] = sum(1 for c in message if c.isdigit()) / len(message) if message else 0
        features['special_char_ratio'] = sum(1 for c in message if not c.isalnum() and not c.isspace()) / len(message) if message else 0
        
        # Language detection
        if LANGDETECT_AVAILABLE:
            try:
                detected_lang = detect(message)
                features['language'] = detected_lang
                features['is_english'] = detected_lang == 'en'
            except:
                features['language'] = 'unknown'
                features['is_english'] = True
        else:
            features['language'] = 'unknown'
            features['is_english'] = True
        
        # Suspicious pattern features
        suspicious_patterns = [
            r'\b(?:contact|call|text|message)\s+me\b',
            r'\b(?:send|transfer|pay)\s+(?:money|payment)\b',
            r'\b(?:outside|off)\s+(?:platform|site|app)\b',
            r'\b(?:whatsapp|telegram|discord|skype)\b',
            r'\b(?:paypal|venmo|cashapp|zelle)\b',
            r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
            r'\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b'
        ]
        
        for i, pattern in enumerate(suspicious_patterns):
            features[f'pattern_{i}'] = len(re.findall(pattern, message, re.IGNORECASE))
        
        return features
    
    def predict_violation(self, message: str) -> Dict:
        """Predict if a message contains violations using ML models"""
        results = {
            'is_violation': False,
            'confidence': 0.0,
            'violation_type': None,
            'ml_features': {},
            'model_predictions': {}
        }
        
        if not SKLEARN_AVAILABLE:
            results['confidence'] = 0.1
            results['model_predictions']['sklearn'] = 'not_available'
            return results
        
        # Extract features
        features = self.extract_features(message)
        results['ml_features'] = features
        
        # Use violation classifier
        if 'violation_classifier' in self.models and self.models['violation_classifier']:
            try:
                # For new models that haven't been trained yet, return default
                if not hasattr(self.models['violation_classifier'], 'classes_'):
                    results['confidence'] = 0.1
                    results['model_predictions']['violation_classifier'] = 'untrained'
                else:
                    prediction = self.models['violation_classifier'].predict([message])[0]
                    confidence = self.models['violation_classifier'].predict_proba([message])[0].max()
                    
                    results['is_violation'] = prediction == 1
                    results['confidence'] = confidence
                    results['model_predictions']['violation_classifier'] = {
                        'prediction': prediction,
                        'confidence': confidence
                    }
            except Exception as e:
                print(f"Error in violation prediction: {e}")
                results['confidence'] = 0.1
        
        return results
    
    def train_models(self, training_data: List[Tuple[str, int]], validation_split: float = 0.2):
        """Train ML models with provided training data"""
        if not SKLEARN_AVAILABLE or not training_data:
            print("❌ Cannot train models: scikit-learn not available or no training data")
            return
        
        # Prepare data
        messages, labels = zip(*training_data)
        
        if len(set(labels)) < 2:
            print("❌ Training data must contain both safe and violation examples")
            return
        
        X_train, X_test, y_train, y_test = train_test_split(
            messages, labels, test_size=validation_split, random_state=42, stratify=labels
        )
        
        # Train violation classifier
        print("🎓 Training violation classifier...")
        self.models['violation_classifier'].fit(X_train, y_train)
        
        # Evaluate model
        train_score = self.models['violation_classifier'].score(X_train, y_train)
        test_score = self.models['violation_classifier'].score(X_test, y_test)
        
        print(f"✅ Training complete - Train Score: {train_score:.3f}, Test Score: {test_score:.3f}")
        
        # Save trained model
        self._save_model('violation_classifier')
    
    def _save_model(self, model_name: str):
        """Save a trained model to disk"""
        if model_name in self.models:
            filepath = os.path.join(self.model_path, f"{model_name}.pkl")
            try:
                with open(filepath, 'wb') as f:
                    pickle.dump(self.models[model_name], f)
                print(f"💾 Saved {model_name} to {filepath}")
            except Exception as e:
                print(f"❌ Error saving {model_name}: {e}")
    
    def get_model_info(self) -> Dict:
        """Get information about loaded models"""
        info = {}
        
        for model_name, model in self.models.items():
            if model and hasattr(model, 'classes_'):
                info[model_name] = {
                    'trained': True,
                    'classes': list(model.classes_) if hasattr(model, 'classes_') else [],
                    'type': type(model.named_steps['classifier']).__name__ if hasattr(model, 'named_steps') else type(model).__name__
                }
            else:
                info[model_name] = {
                    'trained': False,
                    'classes': [],
                    'type': type(model).__name__ if model else 'None'
                }
        
        info['sklearn_available'] = SKLEARN_AVAILABLE
        info['phonenumbers_available'] = PHONENUMBERS_AVAILABLE
        info['langdetect_available'] = LANGDETECT_AVAILABLE
        
        return info

# ================================
# MODERATION ENGINE
# ================================

class ModerationEngine:
    """Main moderation engine that combines regex and ML detection"""
    
    def __init__(self, db_path: str = None):
        self.config = Config()
        self.db = ModerationDatabase(db_path)
        self.regex_detector = RegexDetector()
        self.ml_detector = MLDetector()
        
        # Performance tracking
        self.stats = {
            'total_messages': 0,
            'flagged_messages': 0,
            'false_positives': 0,
            'processing_times': []
        }
    
    def moderate_message(self, message: str, user_id: str, context: Dict = None) -> Dict:
        """Main moderation function that analyzes a message"""
        start_time = time.time()
        
        # Initialize result structure
        result = {
            'message': message,
            'user_id': user_id,
            'timestamp': datetime.now().isoformat(),
            'is_flagged': False,
            'action': 'allow',  # allow, warn, block
            'confidence': 0.0,
            'violation_type': None,
            'warning_message': None,
            'details': {
                'regex_results': {},
                'ml_results': {},
                'combined_analysis': {},
                'processing_time': 0.0
            }
        }
        
        try:
            # Step 1: Fast regex-based detection
            regex_results = self.regex_detector.analyze_message_risk(message)
            result['details']['regex_results'] = regex_results
            
            # Step 2: ML-based detection
            ml_results = self.ml_detector.predict_violation(message)
            result['details']['ml_results'] = ml_results
            
            # Step 3: Combine results and make decision
            combined_analysis = self._combine_detection_results(
                regex_results, ml_results, user_id
            )
            result['details']['combined_analysis'] = combined_analysis
            
            # Step 4: Determine final action
            final_decision = self._make_final_decision(combined_analysis)
            result.update(final_decision)
            
            # Step 5: Log results
            if result['is_flagged']:
                self._log_flagged_message(result)
            else:
                self.db.log_safe_message(user_id)
            
            # Update statistics
            self.stats['total_messages'] += 1
            if result['is_flagged']:
                self.stats['flagged_messages'] += 1
            
        except Exception as e:
            print(f"❌ Error in moderation: {e}")
            result['action'] = 'allow'  # Fail open for safety
            result['details']['error'] = str(e)
        
        # Record processing time
        processing_time = time.time() - start_time
        result['details']['processing_time'] = processing_time
        self.stats['processing_times'].append(processing_time)
        
        return result
    
    def _combine_detection_results(self, regex_results: Dict, ml_results: Dict, user_id: str) -> Dict:
        """Combine results from different detection methods"""
        
        combined = {
            'has_violation': False,
            'confidence': 0.0,
            'violation_type': None,
            'risk_level': 'low',
            'evidence': [],
            'user_risk_factor': 0.0
        }
        
        # Get user statistics for risk assessment
        user_stats = self.db.get_user_stats(user_id)
        combined['user_risk_factor'] = user_stats.get('risk_score', 0.0)
        
        # Analyze regex results
        if regex_results['has_violation']:
            combined['has_violation'] = True
            combined['confidence'] = max(combined['confidence'], regex_results['confidence'])
            combined['violation_type'] = regex_results['violation_details']['violation_type']
            combined['evidence'].append({
                'source': 'regex',
                'type': regex_results['violation_details']['violation_type'],
                'confidence': regex_results['confidence'],
                'patterns': regex_results['violation_details']['matched_patterns']
            })
        
        if regex_results['has_bypass']:
            combined['has_violation'] = True
            combined['confidence'] = max(combined['confidence'], regex_results['bypass_details']['confidence'])
            combined['evidence'].append({
                'source': 'regex_bypass',
                'type': regex_results['bypass_details']['bypass_type'],
                'confidence': regex_results['bypass_details']['confidence'],
                'patterns': regex_results['bypass_details']['matched_patterns']
            })
        
        # Analyze ML results
        if ml_results['is_violation']:
            combined['has_violation'] = True
            ml_confidence = ml_results['confidence']
            
            # Adjust ML confidence based on model reliability
            model_info = self.ml_detector.get_model_info()
            if not model_info.get('violation_classifier', {}).get('trained', False):
                ml_confidence *= 0.5  # Reduce confidence for untrained models
            
            combined['confidence'] = max(combined['confidence'], ml_confidence)
            combined['evidence'].append({
                'source': 'ml',
                'type': ml_results.get('violation_type', 'ml_detected'),
                'confidence': ml_confidence,
                'features': ml_results.get('ml_features', {})
            })
        
        # Adjust confidence based on user history
        if combined['user_risk_factor'] > 0.5:
            combined['confidence'] = min(1.0, combined['confidence'] * 1.2)
        elif combined['user_risk_factor'] < 0.1:
            combined['confidence'] *= 0.9
        
        # Determine risk level
        if combined['confidence'] >= 0.9:
            combined['risk_level'] = 'critical'
        elif combined['confidence'] >= 0.7:
            combined['risk_level'] = 'high'
        elif combined['confidence'] >= 0.5:
            combined['risk_level'] = 'medium'
        else:
            combined['risk_level'] = 'low'
        
        return combined
    
    def _make_final_decision(self, combined_analysis: Dict) -> Dict:
        """Make the final moderation decision"""
        decision = {
            'is_flagged': False,
            'action': 'allow',
            'confidence': combined_analysis['confidence'],
            'violation_type': combined_analysis['violation_type'],
            'warning_message': None
        }
        
        # Decision logic based on confidence and risk level
        if combined_analysis['has_violation']:
            decision['is_flagged'] = True
            
            if combined_analysis['confidence'] >= self.config.COMBINED_CONFIDENCE_THRESHOLD:
                if combined_analysis['risk_level'] in ['critical', 'high']:
                    decision['action'] = 'block'
                    decision['warning_message'] = self._get_warning_message(
                        combined_analysis['violation_type']
                    )
                else:
                    decision['action'] = 'warn'
                    decision['warning_message'] = self._get_warning_message(
                        combined_analysis['violation_type']
                    )
            else:
                # Low confidence violations get warnings
                decision['action'] = 'warn'
                decision['warning_message'] = self.config.WARNING_MESSAGES['general']
        
        return decision
    
    def _get_warning_message(self, violation_type: str) -> str:
        """Get appropriate warning message for violation type"""
        warning_mapping = {
            'email': 'personal_info',
            'phone': 'personal_info',
            'payment_links': 'off_platform_transaction',
            'external_platforms': 'external_platform',
            'off_platform_keywords': 'off_platform_transaction',
            'contact_sharing': 'personal_info',
            'payment_request': 'off_platform_transaction',
            'platform_redirect': 'external_platform'
        }
        
        warning_key = warning_mapping.get(violation_type, 'general')
        return self.config.WARNING_MESSAGES[warning_key]
    
    def _log_flagged_message(self, result: Dict):
        """Log flagged message to database"""
        patterns_matched = []
        
        # Extract patterns from evidence
        for evidence in result['details']['combined_analysis']['evidence']:
            if 'patterns' in evidence:
                patterns_matched.extend(evidence['patterns'])
        
        # Determine detection method
        detection_methods = [e['source'] for e in result['details']['combined_analysis']['evidence']]
        detection_method = '+'.join(set(detection_methods))
        
        self.db.log_flagged_message(
            user_id=result['user_id'],
            message=result['message'],
            violation_type=result['violation_type'] or 'unknown',
            confidence_score=result['confidence'],
            detection_method=detection_method,
            patterns_matched=patterns_matched
        )
    
    def batch_moderate(self, messages: List[Tuple[str, str]]) -> List[Dict]:
        """Moderate multiple messages in batch"""
        results = []
        
        for message, user_id in messages:
            result = self.moderate_message(message, user_id)
            results.append(result)
        
        return results
    
    def get_statistics(self) -> Dict:
        """Get moderation statistics"""
        stats = self.stats.copy()
        
        # Calculate additional metrics
        if stats['total_messages'] > 0:
            stats['flagged_rate'] = stats['flagged_messages'] / stats['total_messages']
            stats['false_positive_rate'] = stats['false_positives'] / stats['flagged_messages'] if stats['flagged_messages'] > 0 else 0
        else:
            stats['flagged_rate'] = 0
            stats['false_positive_rate'] = 0
        
        if stats['processing_times']:
            stats['avg_processing_time'] = sum(stats['processing_times']) / len(stats['processing_times'])
            stats['max_processing_time'] = max(stats['processing_times'])
        else:
            stats['avg_processing_time'] = 0
            stats['max_processing_time'] = 0
        
        return stats
    
    def export_training_data(self, filename: str = None) -> str:
        """Export flagged messages as training data"""
        if not filename:
            filename = f"training_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        # Get flagged messages
        flagged_messages = self.db.get_flagged_messages(limit=1000)
        
        # Convert to training format
        training_data = []
        for msg in flagged_messages:
            training_data.append({
                'message': msg['message'],
                'label': 0 if msg['is_false_positive'] else 1,
                'violation_type': msg['violation_type'],
                'confidence': msg['confidence_score'],
                'timestamp': msg['timestamp']
            })
        
        # Save to file
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(training_data, f, indent=2, ensure_ascii=False)
        
        return filename
    
    def health_check(self) -> Dict:
        """Perform system health check"""
        health = {
            'status': 'healthy',
            'components': {},
            'issues': []
        }
        
        # Check database
        try:
            self.db.get_user_stats('health_check')
            health['components']['database'] = 'healthy'
        except Exception as e:
            health['components']['database'] = 'error'
            health['issues'].append(f"Database error: {e}")
            health['status'] = 'degraded'
        
        # Check ML models
        model_info = self.ml_detector.get_model_info()
        if SKLEARN_AVAILABLE and any(info.get('trained', False) for info in model_info.values() if isinstance(info, dict)):
            health['components']['ml_models'] = 'healthy'
        else:
            health['components']['ml_models'] = 'warning'
            health['issues'].append("No trained ML models available")
            if health['status'] == 'healthy':
                health['status'] = 'degraded'
        
        # Check regex detector
        try:
            test_result = self.regex_detector.detect_violations("test message")
            health['components']['regex_detector'] = 'healthy'
        except Exception as e:
            health['components']['regex_detector'] = 'error'
            health['issues'].append(f"Regex detector error: {e}")
            health['status'] = 'degraded'
        
        return health

# ================================
# FLASK API
# ================================

if FLASK_AVAILABLE:
    app = Flask(__name__)
    CORS(app)
    
    # Initialize moderation engine
    moderation_engine = ModerationEngine()
    
    # HTML template for simple web interface
    HTML_TEMPLATE = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>🛡️ Chat Moderation API</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #333; text-align: center; }
            .form-group { margin: 20px 0; }
            label { display: block; margin-bottom: 5px; font-weight: bold; }
            input, textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px; }
            button { background: #007bff; color: white; padding: 12px 24px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; }
            button:hover { background: #0056b3; }
            .result { margin: 20px 0; padding: 15px; border-radius: 5px; }
            .safe { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
            .flagged { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; }
            .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
            .stat-card { background: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center; }
            .stat-number { font-size: 24px; font-weight: bold; color: #007bff; }
            .endpoints { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .endpoint { margin: 10px 0; font-family: monospace; background: white; padding: 10px; border-radius: 3px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🛡️ Chat Moderation System API</h1>
            
            <div class="form-group">
                <label for="message">Test Message:</label>
                <textarea id="message" rows="4" placeholder="Enter a message to test moderation..."></textarea>
            </div>
            
            <div class="form-group">
                <label for="userId">User ID:</label>
                <input type="text" id="userId" value="test_user" placeholder="Enter user ID">
            </div>
            
            <button onclick="testMessage()">🔍 Test Moderation</button>
            
            <div id="result"></div>
            
            <h2>📊 System Statistics</h2>
            <div class="stats" id="stats"></div>
            
            <h2>🔗 API Endpoints</h2>
            <div class="endpoints">
                <div class="endpoint">POST /moderate - Moderate a single message</div>
                <div class="endpoint">POST /batch_moderate - Moderate multiple messages</div>
                <div class="endpoint">GET /stats - Get system statistics</div>
                <div class="endpoint">GET /health - Health check</div>
                <div class="endpoint">GET /flagged - Get flagged messages</div>
            </div>
            
            <button onclick="loadStats()">🔄 Refresh Statistics</button>
        </div>

        <script>
            async function testMessage() {
                const message = document.getElementById('message').value;
                const userId = document.getElementById('userId').value;
                
                if (!message.trim()) {
                    alert('Please enter a message to test');
                    return;
                }
                
                try {
                    const response = await fetch('/moderate', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            message: message,
                            user_id: userId
                        })
                    });
                    
                    const result = await response.json();
                    displayResult(result);
                } catch (error) {
                    console.error('Error:', error);
                    alert('Error testing message');
                }
            }
            
            function displayResult(result) {
                const resultDiv = document.getElementById('result');
                let className = 'safe';
                let icon = '✅';
                
                if (result.is_flagged) {
                    if (result.action === 'block') {
                        className = 'flagged';
                        icon = '🚫';
                    } else {
                        className = 'warning';
                        icon = '⚠️';
                    }
                }
                
                resultDiv.innerHTML = `
                    <div class="result ${className}">
                        <h3>${icon} ${result.action.toUpperCase()}</h3>
                        <p><strong>Confidence:</strong> ${(result.confidence * 100).toFixed(1)}%</p>
                        ${result.violation_type ? `<p><strong>Violation Type:</strong> ${result.violation_type}</p>` : ''}
                        ${result.warning_message ? `<p><strong>Warning:</strong> ${result.warning_message}</p>` : ''}
                        <p><strong>Processing Time:</strong> ${(result.details.processing_time * 1000).toFixed(1)}ms</p>
                    </div>
                `;
            }
            
            async function loadStats() {
                try {
                    const response = await fetch('/stats');
                    const stats = await response.json();
                    
                    const statsDiv = document.getElementById('stats');
                    statsDiv.innerHTML = `
                        <div class="stat-card">
                            <div class="stat-number">${stats.total_messages.toLocaleString()}</div>
                            <div>Total Messages</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${stats.flagged_messages.toLocaleString()}</div>
                            <div>Flagged Messages</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${(stats.flagged_rate * 100).toFixed(1)}%</div>
                            <div>Flagged Rate</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${(stats.avg_processing_time * 1000).toFixed(1)}ms</div>
                            <div>Avg Processing Time</div>
                        </div>
                    `;
                } catch (error) {
                    console.error('Error loading stats:', error);
                }
            }
            
            // Load stats on page load
            loadStats();
        </script>
    </body>
    </html>
    """
    
    @app.route('/')
    def index():
        """Serve the web interface"""
        return render_template_string(HTML_TEMPLATE)
    
    @app.route('/moderate', methods=['POST'])
    def moderate_message():
        """Moderate a single message"""
        try:
            data = request.get_json()
            
            if not data or 'message' not in data or 'user_id' not in data:
                return jsonify({
                    'error': 'Missing required fields: message, user_id'
                }), 400
            
            message = data['message']
            user_id = data['user_id']
            context = data.get('context', {})
            
            # Moderate the message
            result = moderation_engine.moderate_message(message, user_id, context)
            
            return jsonify(result)
        
        except Exception as e:
            return jsonify({
                'error': f'Internal server error: {str(e)}'
            }), 500
    
    @app.route('/batch_moderate', methods=['POST'])
    def batch_moderate():
        """Moderate multiple messages"""
        try:
            data = request.get_json()
            
            if not data or 'messages' not in data:
                return jsonify({
                    'error': 'Missing required field: messages'
                }), 400
            
            messages = data['messages']
            
            if not isinstance(messages, list):
                return jsonify({
                    'error': 'messages must be a list'
                }), 400
            
            # Validate message format
            for i, msg in enumerate(messages):
                if not isinstance(msg, dict) or 'message' not in msg or 'user_id' not in msg:
                    return jsonify({
                        'error': f'Invalid message format at index {i}'
                    }), 400
            
            # Convert to format expected by batch_moderate
            message_tuples = [(msg['message'], msg['user_id']) for msg in messages]
            
            # Moderate messages
            results = moderation_engine.batch_moderate(message_tuples)
            
            return jsonify({
                'results': results,
                'total_processed': len(results),
                'flagged_count': sum(1 for r in results if r['is_flagged'])
            })
        
        except Exception as e:
            return jsonify({
                'error': f'Internal server error: {str(e)}'
            }), 500
    
    @app.route('/stats', methods=['GET'])
    def get_statistics():
        """Get system statistics"""
        try:
            stats = moderation_engine.get_statistics()
            return jsonify(stats)
        
        except Exception as e:
            return jsonify({
                'error': f'Internal server error: {str(e)}'
            }), 500
    
    @app.route('/health', methods=['GET'])
    def health_check():
        """System health check"""
        try:
            health = moderation_engine.health_check()
            
            # Return appropriate HTTP status based on health
            status_code = 200
            if health['status'] == 'degraded':
                status_code = 206  # Partial Content
            elif health['status'] == 'error':
                status_code = 503  # Service Unavailable
            
            return jsonify(health), status_code
        
        except Exception as e:
            return jsonify({
                'status': 'error',
                'error': f'Health check failed: {str(e)}'
            }), 503
    
    @app.route('/flagged', methods=['GET'])
    def get_flagged_messages():
        """Get flagged messages with optional filters"""
        try:
            # Get query parameters
            user_id = request.args.get('user_id')
            limit = int(request.args.get('limit', 50))
            
            # Validate limit
            if limit > 500:
                limit = 500
            
            # Get flagged messages
            flagged_messages = moderation_engine.db.get_flagged_messages(user_id=user_id, limit=limit)
            
            return jsonify({
                'flagged_messages': flagged_messages,
                'count': len(flagged_messages)
            })
        
        except Exception as e:
            return jsonify({
                'error': f'Internal server error: {str(e)}'
            }), 500

# ================================
# EXAMPLE USAGE AND TESTING
# ================================

def run_examples():
    """Run example usage of the moderation system"""
    print("🛡️ Chat Moderation System - Example Usage")
    print("=" * 50)
    
    # Initialize the moderation engine
    engine = ModerationEngine()
    
    # Test messages (various violation types)
    test_messages = [
        # Safe messages
        ("Hello, how are you today?", "user1"),
        ("I'm interested in buying this item", "user2"),
        ("What's the price for this product?", "user3"),
        ("Thank you for the quick response!", "user4"),
        
        # Email violations
        ("Contact me at john.doe@gmail.com", "user5"),
        ("My email is jane[at]yahoo[dot]com", "user6"),
        ("Send details to myemail at hotmail dot com", "user7"),
        
        # Phone number violations
        ("Call me at 555-123-4567", "user8"),
        ("My number is +1 (555) 987-6543", "user9"),
        ("Text me: five five five one two three four", "user10"),
        
        # External platform violations
        ("Add me on WhatsApp", "user11"),
        ("Find me on Telegram @username", "user12"),
        ("Contact me via Discord", "user13"),
        
        # Payment violations
        ("Send payment to my PayPal", "user14"),
        ("Pay me through Venmo", "user15"),
        ("Use this link: paypal.me/username", "user16"),
        
        # Smart bypass attempts
        ("Send to my number: zero six one two three four five", "user17"),
        ("Contact me at my g mail account", "user18"),
        ("Let's deal outside this platform", "user19"),
        ("Meet me off site for transaction", "user20"),
    ]
    
    print("\n📝 Testing Messages:")
    print("-" * 30)
    
    results = []
    for message, user_id in test_messages:
        print(f"\n🔍 Testing: '{message}' (User: {user_id})")
        
        # Moderate the message
        result = engine.moderate_message(message, user_id)
        results.append(result)
        
        # Display result
        if result['is_flagged']:
            action_emoji = "🚫" if result['action'] == 'block' else "⚠️"
            print(f"   {action_emoji} {result['action'].upper()}")
            print(f"   📊 Confidence: {result['confidence']:.2%}")
            print(f"   🏷️  Type: {result['violation_type']}")
            if result['warning_message']:
                print(f"   💬 Warning: {result['warning_message']}")
        else:
            print("   ✅ SAFE")
        
        print(f"   ⏱️  Processing time: {result['details']['processing_time']:.3f}s")
    
    # Display statistics
    print("\n📊 System Statistics:")
    print("-" * 30)
    stats = engine.get_statistics()
    
    print(f"Total messages processed: {stats['total_messages']}")
    print(f"Flagged messages: {stats['flagged_messages']}")
    print(f"Flagged rate: {stats['flagged_rate']:.2%}")
    print(f"Average processing time: {stats['avg_processing_time']:.3f}s")
    
    # Show flagged message breakdown
    flagged_results = [r for r in results if r['is_flagged']]
    if flagged_results:
        print(f"\n🚨 Flagged Messages Breakdown:")
        print("-" * 30)
        
        violation_counts = {}
        for result in flagged_results:
            vtype = result['violation_type'] or 'unknown'
            violation_counts[vtype] = violation_counts.get(vtype, 0) + 1
        
        for vtype, count in violation_counts.items():
            print(f"   {vtype}: {count}")
    
    # Health check
    print(f"\n🏥 System Health Check:")
    print("-" * 30)
    
    health = engine.health_check()
    print(f"Overall status: {health['status'].upper()}")
    
    for component, status in health['components'].items():
        status_emoji = {"healthy": "✅", "warning": "⚠️", "error": "❌"}.get(status, "❓")
        print(f"   {component}: {status_emoji} {status}")
    
    if health['issues']:
        print("Issues:")
        for issue in health['issues']:
            print(f"   ⚠️ {issue}")
    
    # Export training data
    print(f"\n📤 Exporting Training Data:")
    print("-" * 30)
    
    filename = engine.export_training_data()
    print(f"Training data exported to: {filename}")
    
    print(f"\n🎯 Example Complete!")
    print("=" * 50)

def start_api_server():
    """Start the Flask API server"""
    if not FLASK_AVAILABLE:
        print("❌ Flask not available. Cannot start API server.")
        print("Install Flask with: pip install flask flask-cors")
        return
    
    print("🛡️ Starting Chat Moderation API...")
    print("📊 Dashboard available at: http://localhost:5000")
    print("🔗 API endpoints available at: http://localhost:5000")
    
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )

# ================================
# MAIN EXECUTION
# ================================

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "api":
            start_api_server()
        elif sys.argv[1] == "example":
            run_examples()
        elif sys.argv[1] == "train":
            # Example training
            engine = ModerationEngine()
            
            # Sample training data
            training_data = [
                ("Hello, how are you?", 0),
                ("What's the price?", 0),
                ("Thank you very much", 0),
                ("Great product!", 0),
                ("Contact me at email@domain.com", 1),
                ("Call me at 555-1234", 1),
                ("Add me on WhatsApp", 1),
                ("Send payment to PayPal", 1),
                ("Let's deal outside platform", 1),
                ("My number is five five five", 1),
            ]
            
            print("🎓 Training models with sample data...")
            engine.ml_detector.train_models(training_data)
        else:
            print("Usage:")
            print("  python chat_moderation_system.py example  - Run examples")
            print("  python chat_moderation_system.py api      - Start API server")
            print("  python chat_moderation_system.py train    - Train models")
    else:
        # Default: run examples
        run_examples()
        
        # Ask if user wants to start API
        try:
            response = input("\n🚀 Start API server? (y/n): ").lower().strip()
            if response == 'y':
                start_api_server()
        except KeyboardInterrupt:
            print("\n👋 Goodbye!")