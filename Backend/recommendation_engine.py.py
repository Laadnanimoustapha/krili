# SMART RECOMMENDATION ENGINE v4.0
# Multi-Algorithm, Hybrid-Aware, Deep-Learning Ready, Production-Grade
# With Advanced ML, Real-time Processing, Graph-based Recommendations, Neural Networks,
# Contextual Bandits, Reinforcement Learning, Advanced Analytics, and Enterprise Features

import pandas as pd
import numpy as np
from sklearn.neighbors import NearestNeighbors
from sklearn.decomposition import TruncatedSVD, NMF, PCA
from sklearn.metrics.pairwise import cosine_similarity, euclidean_distances
from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler
from sklearn.cluster import KMeans, DBSCAN, AgglomerativeClustering
from sklearn.metrics import precision_score, recall_score, f1_score, ndcg_score
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.neural_network import MLPRegressor
from sklearn.model_selection import cross_val_score, GridSearchCV
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.manifold import TSNE
from surprise import Dataset, Reader, SVD as SurpriseSVD, NMF as SurpriseNMF
from surprise.model_selection import train_test_split as surprise_split, cross_validate
from surprise import accuracy, KNNBasic, BaselineOnly
import logging
import datetime
import warnings
import json
import pickle
import os
import sqlite3
import threading
import time
import hashlib
import math
from collections import defaultdict, Counter, deque
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
from functools import lru_cache, wraps
from typing import List, Dict, Tuple, Optional, Any
import random
import networkx as nx
from scipy import sparse
from scipy.stats import pearsonr
import multiprocessing as mp
warnings.filterwarnings('ignore')

# -------- Logging Setup --------
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def log(message):
    logging.info(message)

# -------- Enhanced Data Loading --------
def load_data(ratings_file='rental_history.csv', metadata_file='item_metadata.csv'):
    """Enhanced data loading with error handling and validation"""
    log("Loading data...")
    
    try:
        # Load ratings data
        if os.path.exists(ratings_file):
            ratings = pd.read_csv(ratings_file)
            log(f"Loaded {len(ratings)} ratings from {ratings_file}")
        else:
            log(f"Warning: {ratings_file} not found. Creating sample data...")
            ratings = create_sample_data()
        
        # Load metadata
        if os.path.exists(metadata_file):
            metadata = pd.read_csv(metadata_file)
            log(f"Loaded metadata for {len(metadata)} items from {metadata_file}")
        else:
            log(f"Warning: {metadata_file} not found. Creating sample metadata...")
            metadata = create_sample_metadata(ratings)
        
        # Validate data
        ratings, metadata = validate_and_clean_data(ratings, metadata)
        
        return ratings, metadata
        
    except Exception as e:
        log(f"Error loading data: {str(e)}")
        log("Creating sample data for demonstration...")
        ratings = create_sample_data()
        metadata = create_sample_metadata(ratings)
        return ratings, metadata

def create_sample_data(n_users=1000, n_items=500, n_ratings=10000):
    """Create sample ratings data for testing"""
    log("Creating sample ratings data...")
    
    np.random.seed(42)
    
    # Generate random user-item interactions
    user_ids = np.random.randint(1, n_users + 1, n_ratings)
    item_ids = np.random.randint(1, n_items + 1, n_ratings)
    
    # Generate ratings with some realistic patterns
    ratings = []
    for user_id, item_id in zip(user_ids, item_ids):
        # Add some user bias (some users rate higher on average)
        user_bias = np.random.normal(0, 0.5)
        # Add some item bias (some items are generally better)
        item_bias = np.random.normal(0, 0.3)
        
        # Base rating with biases
        base_rating = 3.0 + user_bias + item_bias + np.random.normal(0, 0.8)
        rating = max(1, min(5, round(base_rating)))
        ratings.append(rating)
    
    # Create timestamps (last 365 days)
    timestamps = []
    current_time = datetime.datetime.now().timestamp()
    for _ in range(n_ratings):
        days_ago = np.random.exponential(30)  # More recent ratings are more likely
        timestamp = current_time - (days_ago * 24 * 3600)
        timestamps.append(timestamp)
    
    sample_data = pd.DataFrame({
        'user_id': user_ids,
        'item_id': item_ids,
        'rating': ratings,
        'timestamp': timestamps
    })
    
    # Remove duplicates (same user rating same item multiple times)
    sample_data = sample_data.drop_duplicates(subset=['user_id', 'item_id'], keep='last')
    
    log(f"Created sample data with {len(sample_data)} ratings")
    return sample_data

def create_sample_metadata(ratings):
    """Create sample metadata for items"""
    log("Creating sample metadata...")
    
    unique_items = ratings['item_id'].unique()
    
    # Sample genres
    genres = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller', 'Documentary']
    
    metadata = []
    for item_id in unique_items:
        metadata.append({
            'item_id': item_id,
            'genre': np.random.choice(genres),
            'year': np.random.randint(1990, 2024),
            'duration': np.random.randint(80, 180),  # minutes
            'budget': np.random.randint(1, 200),  # millions
            'popularity_score': np.random.uniform(0.1, 10.0)
        })
    
    metadata_df = pd.DataFrame(metadata)
    log(f"Created metadata for {len(metadata_df)} items")
    return metadata_df

def validate_and_clean_data(ratings, metadata):
    """Validate and clean the loaded data"""
    log("Validating and cleaning data...")
    
    original_ratings_count = len(ratings)
    original_metadata_count = len(metadata)
    
    # Clean ratings data
    if 'user_id' not in ratings.columns or 'item_id' not in ratings.columns or 'rating' not in ratings.columns:
        raise ValueError("Ratings data must contain 'user_id', 'item_id', and 'rating' columns")
    
    # Remove invalid ratings
    ratings = ratings.dropna(subset=['user_id', 'item_id', 'rating'])
    ratings = ratings[(ratings['rating'] >= 1) & (ratings['rating'] <= 5)]
    
    # Ensure proper data types
    ratings['user_id'] = ratings['user_id'].astype(int)
    ratings['item_id'] = ratings['item_id'].astype(int)
    ratings['rating'] = ratings['rating'].astype(float)
    
    # Add timestamp if missing
    if 'timestamp' not in ratings.columns:
        log("Adding synthetic timestamps...")
        current_time = datetime.datetime.now().timestamp()
        ratings['timestamp'] = current_time - np.random.exponential(30, len(ratings)) * 24 * 3600
    
    # Clean metadata
    if 'item_id' not in metadata.columns:
        raise ValueError("Metadata must contain 'item_id' column")
    
    metadata = metadata.dropna(subset=['item_id'])
    metadata['item_id'] = metadata['item_id'].astype(int)
    
    # Remove items from metadata that don't exist in ratings
    valid_items = set(ratings['item_id'].unique())
    metadata = metadata[metadata['item_id'].isin(valid_items)]
    
    log(f"Data validation complete:")
    log(f"  Ratings: {original_ratings_count} -> {len(ratings)} ({len(ratings)/original_ratings_count*100:.1f}% retained)")
    log(f"  Metadata: {original_metadata_count} -> {len(metadata)} ({len(metadata)/original_metadata_count*100:.1f}% retained)")
    
    return ratings, metadata

# --------- Preprocess ---------
def get_user_item_matrix(ratings):
    return ratings.pivot_table(index='user_id', columns='item_id', values='rating', fill_value=0)

# --------- Time-Decay Function ---------
def apply_time_decay(ratings, decay_rate=0.0005):
    if 'timestamp' not in ratings.columns:
        return ratings
    now = datetime.datetime.now().timestamp()
    ratings['decay'] = np.exp(-decay_rate * (now - ratings['timestamp']))
    ratings['rating'] *= ratings['decay']
    return ratings.drop(columns=['decay'])

# --------- KNN Collaborative Filtering ---------
def knn_recommend(user_id, matrix, n_neighbors=10, n_recommendations=10):
    if user_id not in matrix.index:
        return []
    model = NearestNeighbors(n_neighbors=n_neighbors + 1, metric='cosine')
    model.fit(matrix)
    distances, indices = model.kneighbors([matrix.loc[user_id]])
    neighbors = matrix.iloc[indices[0][1:]]
    mean_scores = neighbors.mean()
    user_scores = matrix.loc[user_id]
    recommended = mean_scores[user_scores == 0].sort_values(ascending=False).head(n_recommendations)
    return recommended.index.tolist()

# --------- SVD Matrix Factorization ---------
def svd_recommend(user_id, matrix, n_components=50, n_recommendations=10):
    if user_id not in matrix.index:
        return []
    svd = TruncatedSVD(n_components=n_components)
    latent = svd.fit_transform(matrix)
    user_index = matrix.index.get_loc(user_id)
    user_vector = latent[user_index]
    similarities = cosine_similarity([user_vector], latent)[0]
    similar_users = matrix.iloc[np.argsort(similarities)[::-1][1:11]]
    avg_scores = similar_users.mean()
    user_scores = matrix.loc[user_id]
    unrated = avg_scores[user_scores == 0]
    return unrated.sort_values(ascending=False).head(n_recommendations).index.tolist()

# --------- Content-Based Filtering ---------
def content_recommend(user_id, ratings, metadata, n_recommendations=10):
    history = ratings[ratings['user_id'] == user_id]
    if history.empty or 'genre' not in metadata.columns:
        return []
    metadata = metadata.set_index('item_id')
    genre_matrix = pd.get_dummies(metadata['genre'])
    sim_matrix = cosine_similarity(genre_matrix)
    sim_df = pd.DataFrame(sim_matrix, index=genre_matrix.index, columns=genre_matrix.index)
    top_items = history.sort_values('rating', ascending=False)['item_id'].head(3)
    sim_scores = sim_df[top_items].sum(axis=1)
    return sim_scores.drop(top_items, errors='ignore').sort_values(ascending=False).head(n_recommendations).index.tolist()

# --------- Surprise SVD Hybrid Model ---------
def surprise_svd_recommend(user_id, ratings, n_recommendations=10):
    reader = Reader(rating_scale=(ratings['rating'].min(), ratings['rating'].max()))
    data = Dataset.load_from_df(ratings[['user_id', 'item_id', 'rating']], reader)
    trainset = data.build_full_trainset()
    algo = SurpriseSVD()
    algo.fit(trainset)

    items = ratings['item_id'].unique()
    rated_items = ratings[ratings['user_id'] == user_id]['item_id'].values
    items_to_predict = [iid for iid in items if iid not in rated_items]
    predictions = [(iid, algo.predict(user_id, iid).est) for iid in items_to_predict]
    predictions.sort(key=lambda x: x[1], reverse=True)
    return [iid for iid, _ in predictions[:n_recommendations]]

# --------- Diversity Boost ---------
def boost_diversity(recommendations, metadata, top_n=10):
    seen_genres = set()
    final = []
    for item in recommendations:
        genre = metadata.loc[metadata['item_id'] == item, 'genre'].values
        if len(genre) == 0:
            continue
        genre = genre[0]
        if genre not in seen_genres:
            seen_genres.add(genre)
            final.append(item)
        if len(final) >= top_n:
            break
    return final

# --------- Evaluation ---------
def evaluate_model(ratings):
    log("Running evaluation...")
    reader = Reader(rating_scale=(ratings['rating'].min(), ratings['rating'].max()))
    data = Dataset.load_from_df(ratings[['user_id', 'item_id', 'rating']], reader)
    trainset, testset = surprise_split(data, test_size=0.2, random_state=42)
    algo = SurpriseSVD()
    algo.fit(trainset)
    predictions = algo.test(testset)
    rmse = accuracy.rmse(predictions)
    mae = accuracy.mae(predictions)
    return rmse, mae

# --------- Advanced Evaluation Metrics ---------
def advanced_evaluation(ratings, recommendations_func, k=10):
    """Calculate precision, recall, F1-score, and coverage metrics"""
    log("Running advanced evaluation...")
    users = ratings['user_id'].unique()
    precisions, recalls, f1s = [], [], []
    all_items = set(ratings['item_id'].unique())
    recommended_items = set()
    
    for user in users[:100]:  # Sample 100 users for evaluation
        user_ratings = ratings[ratings['user_id'] == user]
        if len(user_ratings) < 5:  # Skip users with too few ratings
            continue
            
        # Split user data into train/test
        test_items = set(user_ratings.nlargest(2, 'rating')['item_id'])
        train_ratings = ratings[~((ratings['user_id'] == user) & (ratings['item_id'].isin(test_items)))]
        
        # Get recommendations
        try:
            recs = recommendations_func(user, train_ratings)[:k]
            recommended_items.update(recs)
            
            # Calculate metrics
            relevant = len(set(recs) & test_items)
            precision = relevant / len(recs) if recs else 0
            recall = relevant / len(test_items) if test_items else 0
            f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0
            
            precisions.append(precision)
            recalls.append(recall)
            f1s.append(f1)
        except:
            continue
    
    coverage = len(recommended_items) / len(all_items)
    
    return {
        'precision': np.mean(precisions),
        'recall': np.mean(recalls),
        'f1_score': np.mean(f1s),
        'coverage': coverage
    }

# --------- User Clustering ---------
def cluster_users(ratings, n_clusters=5):
    """Cluster users based on their rating patterns"""
    log("Clustering users...")
    matrix = get_user_item_matrix(ratings)
    
    # Fill NaN with 0 and normalize
    matrix_filled = matrix.fillna(0)
    scaler = StandardScaler()
    matrix_scaled = scaler.fit_transform(matrix_filled)
    
    # Perform clustering
    kmeans = KMeans(n_clusters=n_clusters, random_state=42)
    clusters = kmeans.fit_predict(matrix_scaled)
    
    # Create cluster mapping
    cluster_map = dict(zip(matrix.index, clusters))
    return cluster_map, kmeans

# --------- Popularity-Based Recommendations ---------
def popularity_recommend(ratings, n_recommendations=10):
    """Recommend most popular items"""
    popularity = ratings.groupby('item_id').agg({
        'rating': ['count', 'mean']
    }).round(2)
    popularity.columns = ['count', 'avg_rating']
    popularity['popularity_score'] = popularity['count'] * popularity['avg_rating']
    
    return popularity.nlargest(n_recommendations, 'popularity_score').index.tolist()

# --------- Trending Items ---------
def trending_recommend(ratings, days=7, n_recommendations=10):
    """Recommend trending items from recent days"""
    if 'timestamp' not in ratings.columns:
        return popularity_recommend(ratings, n_recommendations)
    
    cutoff = datetime.datetime.now().timestamp() - (days * 24 * 60 * 60)
    recent = ratings[ratings['timestamp'] >= cutoff]
    
    if recent.empty:
        return popularity_recommend(ratings, n_recommendations)
    
    trending = recent.groupby('item_id').agg({
        'rating': ['count', 'mean']
    }).round(2)
    trending.columns = ['recent_count', 'recent_avg']
    trending['trending_score'] = trending['recent_count'] * trending['recent_avg']
    
    return trending.nlargest(n_recommendations, 'trending_score').index.tolist()

# --------- Cold Start Handler ---------
def cold_start_recommend(user_id, ratings, metadata, n_recommendations=10):
    """Handle new users with no rating history"""
    user_ratings = ratings[ratings['user_id'] == user_id]
    
    if len(user_ratings) == 0:
        # New user - recommend popular items
        log(f"New user {user_id} detected, using popularity-based recommendations")
        return popularity_recommend(ratings, n_recommendations)
    elif len(user_ratings) < 5:
        # User with few ratings - combine popularity and content-based
        log(f"User {user_id} has few ratings, using hybrid cold-start approach")
        popular = popularity_recommend(ratings, n_recommendations // 2)
        content = content_recommend(user_id, ratings, metadata, n_recommendations // 2)
        return list(set(popular + content))[:n_recommendations]
    else:
        # Regular user
        return []

# --------- Recommendation Explanation ---------
def explain_recommendations(user_id, recommendations, ratings, metadata):
    """Provide explanations for why items were recommended"""
    explanations = {}
    user_history = ratings[ratings['user_id'] == user_id]
    
    if user_history.empty:
        return {item: "Popular item among all users" for item in recommendations}
    
    # Get user's favorite genres
    user_items = user_history['item_id'].tolist()
    if 'genre' in metadata.columns:
        user_genres = metadata[metadata['item_id'].isin(user_items)]['genre'].value_counts()
        top_genre = user_genres.index[0] if not user_genres.empty else "Unknown"
    else:
        top_genre = "Unknown"
    
    for item in recommendations:
        if 'genre' in metadata.columns:
            item_genre = metadata[metadata['item_id'] == item]['genre'].values
            if len(item_genre) > 0 and item_genre[0] == top_genre:
                explanations[item] = f"Because you like {top_genre} genre"
            else:
                explanations[item] = "Similar users also liked this"
        else:
            explanations[item] = "Recommended based on your preferences"
    
    return explanations

# --------- Enhanced Model Caching with Compression and Versioning ---------
class ModelCache:
    def __init__(self, cache_dir="model_cache", use_compression=True):
        self.cache_dir = cache_dir
        self.use_compression = use_compression
        self.metadata_file = os.path.join(cache_dir, "cache_metadata.json")
        os.makedirs(cache_dir, exist_ok=True)
        self.metadata = self._load_metadata()
    
    def _load_metadata(self):
        """Load cache metadata"""
        if os.path.exists(self.metadata_file):
            with open(self.metadata_file, 'r') as f:
                return json.load(f)
        return {}
    
    def _save_metadata(self):
        """Save cache metadata"""
        with open(self.metadata_file, 'w') as f:
            json.dump(self.metadata, f, indent=2)
    
    def _get_model_hash(self, model):
        """Generate hash for model to detect changes"""
        try:
            model_str = str(model.__dict__) if hasattr(model, '__dict__') else str(model)
            return hashlib.md5(model_str.encode()).hexdigest()
        except:
            return "unknown"
    
    def save_model(self, model, model_name, version="1.0"):
        """Save trained model to cache with versioning"""
        timestamp = datetime.datetime.now().isoformat()
        model_hash = self._get_model_hash(model)
        
        if self.use_compression:
            filepath = os.path.join(self.cache_dir, f"{model_name}_v{version}.pkl.gz")
            import gzip
            with gzip.open(filepath, 'wb') as f:
                pickle.dump(model, f)
        else:
            filepath = os.path.join(self.cache_dir, f"{model_name}_v{version}.pkl")
            with open(filepath, 'wb') as f:
                pickle.dump(model, f)
        
        # Update metadata
        self.metadata[model_name] = {
            'version': version,
            'timestamp': timestamp,
            'hash': model_hash,
            'filepath': filepath,
            'compressed': self.use_compression,
            'size_bytes': os.path.getsize(filepath)
        }
        self._save_metadata()
        
        log(f"Model {model_name} v{version} saved to cache ({os.path.getsize(filepath)} bytes)")
    
    def load_model(self, model_name, version=None):
        """Load model from cache with version support"""
        if model_name not in self.metadata:
            return None
        
        model_info = self.metadata[model_name]
        if version and model_info['version'] != version:
            log(f"Requested version {version} not found for {model_name}")
            return None
        
        filepath = model_info['filepath']
        if not os.path.exists(filepath):
            log(f"Cache file not found: {filepath}")
            return None
        
        try:
            if model_info.get('compressed', False):
                import gzip
                with gzip.open(filepath, 'rb') as f:
                    model = pickle.load(f)
            else:
                with open(filepath, 'rb') as f:
                    model = pickle.load(f)
            
            log(f"Model {model_name} v{model_info['version']} loaded from cache")
            return model
        except Exception as e:
            log(f"Error loading model {model_name}: {str(e)}")
            return None
    
    def get_cache_info(self):
        """Get information about cached models"""
        total_size = sum(info['size_bytes'] for info in self.metadata.values())
        return {
            'total_models': len(self.metadata),
            'total_size_mb': total_size / (1024 * 1024),
            'models': self.metadata
        }
    
    def clear_cache(self, model_name=None):
        """Clear cached models"""
        if model_name:
            if model_name in self.metadata:
                filepath = self.metadata[model_name]['filepath']
                if os.path.exists(filepath):
                    os.remove(filepath)
                del self.metadata[model_name]
                self._save_metadata()
                log(f"Cleared cache for {model_name}")
        else:
            for file in os.listdir(self.cache_dir):
                if file.endswith(('.pkl', '.pkl.gz')):
                    os.remove(os.path.join(self.cache_dir, file))
            self.metadata = {}
            self._save_metadata()
            log("All model cache cleared")

# --------- Performance Optimization Utilities ---------
def timing_decorator(func):
    """Decorator to measure function execution time"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        log(f"{func.__name__} executed in {end_time - start_time:.4f} seconds")
        return result
    return wrapper

def memory_efficient_matrix_operations(matrix, chunk_size=1000):
    """Perform matrix operations in chunks to save memory"""
    n_rows = matrix.shape[0]
    results = []
    
    for i in range(0, n_rows, chunk_size):
        end_idx = min(i + chunk_size, n_rows)
        chunk = matrix[i:end_idx]
        # Process chunk here
        results.append(chunk)
    
    return np.vstack(results) if results else matrix

@lru_cache(maxsize=1000)
def cached_similarity_calculation(user_vector_hash, item_vectors_hash):
    """Cache similarity calculations to avoid recomputation"""
    # This would contain the actual similarity calculation
    # Using hash to make vectors hashable for caching
    pass

# --------- Database Integration ---------
class DatabaseManager:
    def __init__(self, db_path="recommendations.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Initialize SQLite database for storing recommendations and analytics"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create tables
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS recommendations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                item_id INTEGER,
                score REAL,
                algorithm TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_interactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                item_id INTEGER,
                interaction_type TEXT,
                rating REAL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS model_performance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                model_name TEXT,
                metric_name TEXT,
                metric_value REAL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
        log("Database initialized")
    
    def store_recommendations(self, user_id, recommendations, algorithm):
        """Store recommendations in database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        for i, item_id in enumerate(recommendations):
            score = len(recommendations) - i  # Simple scoring based on position
            cursor.execute('''
                INSERT INTO recommendations (user_id, item_id, score, algorithm)
                VALUES (?, ?, ?, ?)
            ''', (user_id, item_id, score, algorithm))
        
        conn.commit()
        conn.close()
    
    def store_interaction(self, user_id, item_id, interaction_type, rating=None):
        """Store user interaction in database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO user_interactions (user_id, item_id, interaction_type, rating)
            VALUES (?, ?, ?, ?)
        ''', (user_id, item_id, interaction_type, rating))
        
        conn.commit()
        conn.close()
    
    def get_user_history(self, user_id, limit=100):
        """Get user interaction history"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT item_id, interaction_type, rating, timestamp
            FROM user_interactions
            WHERE user_id = ?
            ORDER BY timestamp DESC
            LIMIT ?
        ''', (user_id, limit))
        
        results = cursor.fetchall()
        conn.close()
        
        return results
    
    def get_recommendation_stats(self, days=30):
        """Get recommendation statistics for the last N days"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT algorithm, COUNT(*) as count, AVG(score) as avg_score
            FROM recommendations
            WHERE timestamp >= datetime('now', '-{} days')
            GROUP BY algorithm
        '''.format(days))
        
        results = cursor.fetchall()
        conn.close()
        
        return results

# --------- A/B Testing Framework ---------
class ABTester:
    def __init__(self):
        self.experiments = {}
        self.results = defaultdict(list)
    
    def create_experiment(self, name, variants, traffic_split=None):
        """Create A/B test experiment"""
        if traffic_split is None:
            traffic_split = [1.0 / len(variants)] * len(variants)
        
        self.experiments[name] = {
            'variants': variants,
            'traffic_split': traffic_split
        }
        log(f"A/B test '{name}' created with variants: {variants}")
    
    def get_variant(self, user_id, experiment_name):
        """Get variant for user in experiment"""
        if experiment_name not in self.experiments:
            return None
        
        # Use user_id as seed for consistent assignment
        random.seed(user_id)
        rand_val = random.random()
        
        exp = self.experiments[experiment_name]
        cumulative = 0
        for i, split in enumerate(exp['traffic_split']):
            cumulative += split
            if rand_val <= cumulative:
                return exp['variants'][i]
        
        return exp['variants'][-1]  # Fallback
    
    def record_result(self, experiment_name, variant, metric_name, value):
        """Record experiment result"""
        self.results[f"{experiment_name}_{variant}_{metric_name}"].append(value)
    
    def get_results(self, experiment_name):
        """Get experiment results summary"""
        results = {}
        for key, values in self.results.items():
            if key.startswith(experiment_name):
                results[key] = {
                    'mean': np.mean(values),
                    'std': np.std(values),
                    'count': len(values)
                }
        return results

# --------- Real-time Recommendation Updates ---------
class RealtimeRecommender:
    def __init__(self):
        self.user_sessions = defaultdict(list)
        self.item_interactions = defaultdict(int)
        self.session_timeout = 3600  # 1 hour
    
    def track_interaction(self, user_id, item_id, interaction_type='view'):
        """Track user interaction in real-time"""
        timestamp = datetime.datetime.now().timestamp()
        self.user_sessions[user_id].append({
            'item_id': item_id,
            'interaction_type': interaction_type,
            'timestamp': timestamp
        })
        self.item_interactions[item_id] += 1
        
        # Clean old sessions
        self._clean_old_sessions(user_id)
    
    def _clean_old_sessions(self, user_id):
        """Remove old session data"""
        current_time = datetime.datetime.now().timestamp()
        self.user_sessions[user_id] = [
            interaction for interaction in self.user_sessions[user_id]
            if current_time - interaction['timestamp'] < self.session_timeout
        ]
    
    def get_session_recommendations(self, user_id, ratings, metadata, n_recommendations=5):
        """Get recommendations based on current session"""
        session_items = [item['item_id'] for item in self.user_sessions[user_id]]
        
        if not session_items:
            return []
        
        # Find similar items to session items
        if 'genre' in metadata.columns:
            session_genres = metadata[metadata['item_id'].isin(session_items)]['genre'].tolist()
            similar_items = metadata[metadata['genre'].isin(session_genres)]['item_id'].tolist()
            # Remove already viewed items
            similar_items = [item for item in similar_items if item not in session_items]
            return similar_items[:n_recommendations]
        
        return []

# --------- Performance Monitor ---------
class PerformanceMonitor:
    def __init__(self):
        self.metrics = defaultdict(list)
        self.start_times = {}
    
    def start_timer(self, operation):
        """Start timing an operation"""
        self.start_times[operation] = datetime.datetime.now()
    
    def end_timer(self, operation):
        """End timing and record duration"""
        if operation in self.start_times:
            duration = (datetime.datetime.now() - self.start_times[operation]).total_seconds()
            self.metrics[f"{operation}_duration"].append(duration)
            del self.start_times[operation]
            return duration
        return None
    
    def record_metric(self, metric_name, value):
        """Record a custom metric"""
        self.metrics[metric_name].append(value)
    
    def get_stats(self):
        """Get performance statistics"""
        stats = {}
        for metric, values in self.metrics.items():
            stats[metric] = {
                'mean': np.mean(values),
                'median': np.median(values),
                'min': np.min(values),
                'max': np.max(values),
                'count': len(values)
            }
        return stats

# --------- Enhanced Hybrid Model ---------
def hybrid_recommend(user_id, w_knn=0.3, w_svd=0.3, w_cb=0.2, w_surprise=0.2, 
                    apply_diversity=True, use_cold_start=True, include_trending=False):
    """Enhanced hybrid recommendation with cold start handling and trending items"""
    ratings, metadata = load_data()
    
    # Handle cold start users
    if use_cold_start:
        cold_start_recs = cold_start_recommend(user_id, ratings, metadata)
        if cold_start_recs:
            return cold_start_recs
    
    ratings = apply_time_decay(ratings)
    matrix = get_user_item_matrix(ratings)
    scores = {}

    # Base recommendation methods
    methods = [
        (knn_recommend(user_id, matrix), w_knn),
        (svd_recommend(user_id, matrix), w_svd),
        (content_recommend(user_id, ratings, metadata), w_cb),
        (surprise_svd_recommend(user_id, ratings), w_surprise)
    ]

    # Add trending items if requested
    if include_trending:
        trending_items = trending_recommend(ratings, n_recommendations=5)
        methods.append((trending_items, 0.1))

    for recs, weight in methods:
        for i, item in enumerate(recs):
            scores[item] = scores.get(item, 0) + (weight * (len(recs) - i))

    sorted_items = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    top_items = [item for item, _ in sorted_items][:20]
    
    if apply_diversity:
        return boost_diversity(top_items, metadata)
    return top_items[:10]

# --------- Recommendation API ---------
class RecommendationAPI:
    def __init__(self):
        self.cache = ModelCache()
        self.ab_tester = ABTester()
        self.realtime = RealtimeRecommender()
        self.monitor = PerformanceMonitor()
        
        # Initialize A/B tests
        self.ab_tester.create_experiment(
            "recommendation_algorithm", 
            ["hybrid", "collaborative", "content_based"],
            [0.5, 0.3, 0.2]
        )
    
    def get_recommendations(self, user_id, n_recommendations=10, include_explanations=False):
        """Main API endpoint for getting recommendations"""
        self.monitor.start_timer("recommendation_generation")
        
        try:
            # Get A/B test variant
            variant = self.ab_tester.get_variant(user_id, "recommendation_algorithm")
            
            # Generate recommendations based on variant
            if variant == "hybrid":
                recommendations = hybrid_recommend(user_id)
            elif variant == "collaborative":
                ratings, _ = load_data()
                matrix = get_user_item_matrix(ratings)
                recommendations = knn_recommend(user_id, matrix, n_recommendations=n_recommendations)
            else:  # content_based
                ratings, metadata = load_data()
                recommendations = content_recommend(user_id, ratings, metadata, n_recommendations)
            
            # Record A/B test result
            self.ab_tester.record_result("recommendation_algorithm", variant, "recommendations_generated", len(recommendations))
            
            result = {
                'user_id': user_id,
                'recommendations': recommendations,
                'algorithm_variant': variant,
                'timestamp': datetime.datetime.now().isoformat()
            }
            
            # Add explanations if requested
            if include_explanations:
                ratings, metadata = load_data()
                explanations = explain_recommendations(user_id, recommendations, ratings, metadata)
                result['explanations'] = explanations
            
            duration = self.monitor.end_timer("recommendation_generation")
            result['generation_time_seconds'] = duration
            
            return result
            
        except Exception as e:
            log(f"Error generating recommendations for user {user_id}: {str(e)}")
            return {'error': str(e), 'user_id': user_id}
    
    def track_user_interaction(self, user_id, item_id, interaction_type='view'):
        """Track user interaction for real-time recommendations"""
        self.realtime.track_interaction(user_id, item_id, interaction_type)
    
    def get_session_recommendations(self, user_id, n_recommendations=5):
        """Get recommendations based on current session"""
        ratings, metadata = load_data()
        return self.realtime.get_session_recommendations(user_id, ratings, metadata, n_recommendations)
    
    def get_performance_stats(self):
        """Get API performance statistics"""
        return self.monitor.get_stats()
    
    def get_ab_test_results(self):
        """Get A/B test results"""
        return self.ab_tester.get_results("recommendation_algorithm")

# --------- Batch Recommendation Generator ---------
def generate_batch_recommendations(user_ids, output_file="batch_recommendations.json"):
    """Generate recommendations for multiple users and save to file"""
    log(f"Generating batch recommendations for {len(user_ids)} users...")
    api = RecommendationAPI()
    results = {}
    
    for i, user_id in enumerate(user_ids):
        if i % 100 == 0:
            log(f"Processed {i}/{len(user_ids)} users")
        
        try:
            result = api.get_recommendations(user_id, include_explanations=True)
            results[user_id] = result
        except Exception as e:
            log(f"Error processing user {user_id}: {str(e)}")
            results[user_id] = {'error': str(e)}
    
    # Save results
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    log(f"Batch recommendations saved to {output_file}")
    return results

# --------- Enhanced CLI ---------
def interactive_cli():
    """Enhanced interactive command line interface"""
    api = RecommendationAPI()
    
    print("=" * 60)
    print("🚀 SMART RECOMMENDATION ENGINE v4.0 🚀")
    print("Multi-Algorithm, AI-Powered, Production-Ready")
    print("=" * 60)
    
    while True:
        print("\n📋 Available Options:")
        print("1. Get Recommendations for User")
        print("2. Get Recommendations with Explanations")
        print("3. Track User Interaction")
        print("4. Get Session-based Recommendations")
        print("5. Run Model Evaluation")
        print("6. Run Advanced Evaluation")
        print("7. Generate Batch Recommendations")
        print("8. View Performance Statistics")
        print("9. View A/B Test Results")
        print("10. Cluster Users")
        print("11. Get Trending Items")
        print("12. Get Popular Items")
        print("13. Clear Model Cache")
        print("0. Exit")
        
        try:
            choice = input("\n🔢 Enter your choice (0-13): ").strip()
            
            if choice == "0":
                print("👋 Thank you for using the Recommendation Engine!")
                break
                
            elif choice == "1":
                user_id = int(input("Enter user ID: "))
                result = api.get_recommendations(user_id)
                print(f"\n🎯 Recommendations for User {user_id}:")
                print(f"Algorithm: {result.get('algorithm_variant', 'N/A')}")
                print(f"Items: {result.get('recommendations', [])}")
                print(f"Generation Time: {result.get('generation_time_seconds', 0):.3f}s")
                
            elif choice == "2":
                user_id = int(input("Enter user ID: "))
                result = api.get_recommendations(user_id, include_explanations=True)
                print(f"\n🎯 Recommendations with Explanations for User {user_id}:")
                recommendations = result.get('recommendations', [])
                explanations = result.get('explanations', {})
                
                for item in recommendations:
                    explanation = explanations.get(item, "No explanation available")
                    print(f"  📦 Item {item}: {explanation}")
                    
            elif choice == "3":
                user_id = int(input("Enter user ID: "))
                item_id = int(input("Enter item ID: "))
                interaction_type = input("Enter interaction type (view/like/purchase) [default: view]: ").strip() or "view"
                api.track_user_interaction(user_id, item_id, interaction_type)
                print(f"✅ Tracked {interaction_type} interaction for user {user_id} on item {item_id}")
                
            elif choice == "4":
                user_id = int(input("Enter user ID: "))
                session_recs = api.get_session_recommendations(user_id)
                print(f"\n🔄 Session-based Recommendations for User {user_id}: {session_recs}")
                
            elif choice == "5":
                ratings, _ = load_data()
                rmse, mae = evaluate_model(ratings)
                print(f"\n📊 Model Evaluation Results:")
                print(f"RMSE: {rmse:.4f}")
                print(f"MAE: {mae:.4f}")
                
            elif choice == "6":
                print("Running advanced evaluation (this may take a while)...")
                ratings, _ = load_data()
                
                def sample_hybrid_func(user_id, ratings_data):
                    return hybrid_recommend(user_id)
                
                metrics = advanced_evaluation(ratings, sample_hybrid_func)
                print(f"\n📈 Advanced Evaluation Results:")
                print(f"Precision: {metrics['precision']:.4f}")
                print(f"Recall: {metrics['recall']:.4f}")
                print(f"F1-Score: {metrics['f1_score']:.4f}")
                print(f"Coverage: {metrics['coverage']:.4f}")
                
            elif choice == "7":
                ratings, _ = load_data()
                sample_users = ratings['user_id'].unique()[:50]  # Sample 50 users
                print(f"Generating batch recommendations for {len(sample_users)} users...")
                results = generate_batch_recommendations(sample_users)
                print(f"✅ Batch recommendations generated and saved!")
                
            elif choice == "8":
                stats = api.get_performance_stats()
                print(f"\n⚡ Performance Statistics:")
                for metric, values in stats.items():
                    print(f"  {metric}:")
                    print(f"    Mean: {values['mean']:.4f}")
                    print(f"    Median: {values['median']:.4f}")
                    print(f"    Min: {values['min']:.4f}")
                    print(f"    Max: {values['max']:.4f}")
                    print(f"    Count: {values['count']}")
                    
            elif choice == "9":
                results = api.get_ab_test_results()
                print(f"\n🧪 A/B Test Results:")
                for test, metrics in results.items():
                    print(f"  {test}:")
                    print(f"    Mean: {metrics['mean']:.4f}")
                    print(f"    Std: {metrics['std']:.4f}")
                    print(f"    Count: {metrics['count']}")
                    
            elif choice == "10":
                ratings, _ = load_data()
                n_clusters = int(input("Enter number of clusters [default: 5]: ") or "5")
                cluster_map, model = cluster_users(ratings, n_clusters)
                print(f"\n👥 User Clustering Results ({n_clusters} clusters):")
                cluster_counts = Counter(cluster_map.values())
                for cluster_id, count in cluster_counts.items():
                    print(f"  Cluster {cluster_id}: {count} users")
                    
            elif choice == "11":
                ratings, _ = load_data()
                days = int(input("Enter number of days for trending [default: 7]: ") or "7")
                trending = trending_recommend(ratings, days=days)
                print(f"\n🔥 Trending Items (last {days} days): {trending}")
                
            elif choice == "12":
                ratings, _ = load_data()
                popular = popularity_recommend(ratings)
                print(f"\n⭐ Popular Items: {popular}")
                
            elif choice == "13":
                api.cache.clear_cache()
                print("🗑️ Model cache cleared!")
                
            else:
                print("❌ Invalid choice. Please try again.")
                
        except ValueError:
            print("❌ Invalid input. Please enter a valid number.")
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            log(f"CLI Error: {str(e)}")

# --------- Advanced Neural Network Recommender ---------
class NeuralRecommender:
    def __init__(self, embedding_dim=50, hidden_layers=[128, 64, 32]):
        self.embedding_dim = embedding_dim
        self.hidden_layers = hidden_layers
        self.model = None
        self.user_encoder = {}
        self.item_encoder = {}
        self.scaler = StandardScaler()
        
    def _encode_ids(self, ratings):
        """Encode user and item IDs to continuous integers"""
        unique_users = ratings['user_id'].unique()
        unique_items = ratings['item_id'].unique()
        
        self.user_encoder = {user: idx for idx, user in enumerate(unique_users)}
        self.item_encoder = {item: idx for idx, item in enumerate(unique_items)}
        
        ratings['user_encoded'] = ratings['user_id'].map(self.user_encoder)
        ratings['item_encoded'] = ratings['item_id'].map(self.item_encoder)
        return ratings
    
    def _create_features(self, ratings, metadata=None):
        """Create feature matrix for neural network"""
        features = []
        
        # User-item interaction features
        user_item_matrix = ratings.pivot_table(
            index='user_encoded', columns='item_encoded', values='rating', fill_value=0
        )
        
        # User features (aggregated statistics)
        user_stats = ratings.groupby('user_encoded').agg({
            'rating': ['mean', 'std', 'count'],
            'item_encoded': 'nunique'
        }).fillna(0)
        user_stats.columns = ['avg_rating', 'rating_std', 'num_ratings', 'num_items']
        
        # Item features (aggregated statistics)
        item_stats = ratings.groupby('item_encoded').agg({
            'rating': ['mean', 'std', 'count'],
            'user_encoded': 'nunique'
        }).fillna(0)
        item_stats.columns = ['item_avg_rating', 'item_rating_std', 'item_num_ratings', 'item_num_users']
        
        # Create training data
        X, y = [], []
        for _, row in ratings.iterrows():
            user_idx = row['user_encoded']
            item_idx = row['item_encoded']
            
            # User features
            user_feats = user_stats.loc[user_idx].values if user_idx in user_stats.index else [0, 0, 0, 0]
            
            # Item features
            item_feats = item_stats.loc[item_idx].values if item_idx in item_stats.index else [0, 0, 0, 0]
            
            # Combine features
            feature_vector = np.concatenate([
                [user_idx, item_idx],  # ID embeddings
                user_feats,
                item_feats
            ])
            
            X.append(feature_vector)
            y.append(row['rating'])
        
        return np.array(X), np.array(y)
    
    def train(self, ratings, metadata=None):
        """Train neural network model"""
        log("Training Neural Network Recommender...")
        
        ratings_encoded = self._encode_ids(ratings.copy())
        X, y = self._create_features(ratings_encoded, metadata)
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Create and train model
        self.model = MLPRegressor(
            hidden_layer_sizes=tuple(self.hidden_layers),
            activation='relu',
            solver='adam',
            alpha=0.001,
            batch_size='auto',
            learning_rate='adaptive',
            max_iter=500,
            random_state=42,
            early_stopping=True,
            validation_fraction=0.1
        )
        
        self.model.fit(X_scaled, y)
        log("Neural Network training completed")
        
    def predict(self, user_id, item_id):
        """Predict rating for user-item pair"""
        if self.model is None:
            return 0
        
        user_encoded = self.user_encoder.get(user_id, -1)
        item_encoded = self.item_encoder.get(item_id, -1)
        
        if user_encoded == -1 or item_encoded == -1:
            return 0
        
        # Create feature vector (simplified for prediction)
        feature_vector = np.array([[user_encoded, item_encoded, 0, 0, 0, 0, 0, 0, 0, 0]])
        feature_vector_scaled = self.scaler.transform(feature_vector)
        
        return self.model.predict(feature_vector_scaled)[0]
    
    def recommend(self, user_id, ratings, n_recommendations=10):
        """Generate recommendations using neural network"""
        if self.model is None or user_id not in self.user_encoder:
            return []
        
        # Get all items user hasn't rated
        user_items = set(ratings[ratings['user_id'] == user_id]['item_id'])
        all_items = set(ratings['item_id'].unique())
        unrated_items = all_items - user_items
        
        # Predict ratings for unrated items
        predictions = []
        for item_id in unrated_items:
            pred_rating = self.predict(user_id, item_id)
            predictions.append((item_id, pred_rating))
        
        # Sort by predicted rating
        predictions.sort(key=lambda x: x[1], reverse=True)
        return [item_id for item_id, _ in predictions[:n_recommendations]]

# --------- Graph-Based Recommender ---------
class GraphRecommender:
    def __init__(self):
        self.graph = nx.Graph()
        self.user_nodes = set()
        self.item_nodes = set()
        
    def build_graph(self, ratings, metadata=None):
        """Build bipartite graph from ratings data"""
        log("Building recommendation graph...")
        
        # Add nodes
        for user_id in ratings['user_id'].unique():
            self.graph.add_node(f"user_{user_id}", type='user')
            self.user_nodes.add(f"user_{user_id}")
            
        for item_id in ratings['item_id'].unique():
            self.graph.add_node(f"item_{item_id}", type='item')
            self.item_nodes.add(f"item_{item_id}")
        
        # Add edges with weights based on ratings
        for _, row in ratings.iterrows():
            user_node = f"user_{row['user_id']}"
            item_node = f"item_{row['item_id']}"
            weight = row['rating'] / 5.0  # Normalize to 0-1
            
            self.graph.add_edge(user_node, item_node, weight=weight)
        
        log(f"Graph built with {len(self.graph.nodes)} nodes and {len(self.graph.edges)} edges")
    
    def recommend_pagerank(self, user_id, n_recommendations=10):
        """Recommend using PageRank algorithm"""
        user_node = f"user_{user_id}"
        if user_node not in self.graph:
            return []
        
        # Run PageRank with personalization vector
        personalization = {node: 1.0 if node == user_node else 0.0 for node in self.graph.nodes}
        pagerank_scores = nx.pagerank(self.graph, personalization=personalization, weight='weight')
        
        # Get item recommendations
        item_scores = [(node, score) for node, score in pagerank_scores.items() 
                      if node.startswith('item_') and not self.graph.has_edge(user_node, node)]
        
        item_scores.sort(key=lambda x: x[1], reverse=True)
        recommendations = [int(node.split('_')[1]) for node, _ in item_scores[:n_recommendations]]
        
        return recommendations
    
    def recommend_random_walk(self, user_id, n_recommendations=10, walk_length=10, num_walks=100):
        """Recommend using random walk with restart"""
        user_node = f"user_{user_id}"
        if user_node not in self.graph:
            return []
        
        item_visit_counts = defaultdict(int)
        
        for _ in range(num_walks):
            current_node = user_node
            
            for _ in range(walk_length):
                neighbors = list(self.graph.neighbors(current_node))
                if not neighbors:
                    break
                
                # Weighted random selection
                weights = [self.graph[current_node][neighbor].get('weight', 1.0) 
                          for neighbor in neighbors]
                total_weight = sum(weights)
                
                if total_weight == 0:
                    break
                
                # Normalize weights
                weights = [w / total_weight for w in weights]
                
                # Random selection
                current_node = np.random.choice(neighbors, p=weights)
                
                # Count item visits
                if current_node.startswith('item_') and not self.graph.has_edge(user_node, current_node):
                    item_visit_counts[current_node] += 1
        
        # Sort by visit count
        sorted_items = sorted(item_visit_counts.items(), key=lambda x: x[1], reverse=True)
        recommendations = [int(node.split('_')[1]) for node, _ in sorted_items[:n_recommendations]]
        
        return recommendations

# --------- Multi-Armed Bandit Recommender ---------
class BanditRecommender:
    def __init__(self, epsilon=0.1, decay_rate=0.99):
        self.epsilon = epsilon
        self.decay_rate = decay_rate
        self.item_rewards = defaultdict(list)
        self.item_counts = defaultdict(int)
        self.total_interactions = 0
        
    def get_item_score(self, item_id):
        """Get current estimated reward for item"""
        if self.item_counts[item_id] == 0:
            return 0.0
        return np.mean(self.item_rewards[item_id])
    
    def get_confidence_interval(self, item_id, confidence=0.95):
        """Get confidence interval for item reward"""
        if self.item_counts[item_id] < 2:
            return 0.0, 1.0
        
        rewards = self.item_rewards[item_id]
        mean_reward = np.mean(rewards)
        std_reward = np.std(rewards)
        n = len(rewards)
        
        # Calculate confidence interval
        margin = 1.96 * (std_reward / np.sqrt(n))  # 95% confidence
        return mean_reward - margin, mean_reward + margin
    
    def select_items_ucb(self, available_items, n_recommendations=10):
        """Select items using Upper Confidence Bound"""
        if not available_items:
            return []
        
        item_scores = []
        for item_id in available_items:
            mean_reward = self.get_item_score(item_id)
            
            if self.item_counts[item_id] == 0:
                ucb_score = float('inf')  # Explore unvisited items first
            else:
                # UCB formula
                confidence_bonus = np.sqrt(
                    (2 * np.log(self.total_interactions + 1)) / self.item_counts[item_id]
                )
                ucb_score = mean_reward + confidence_bonus
            
            item_scores.append((item_id, ucb_score))
        
        # Sort by UCB score
        item_scores.sort(key=lambda x: x[1], reverse=True)
        return [item_id for item_id, _ in item_scores[:n_recommendations]]
    
    def select_items_thompson(self, available_items, n_recommendations=10):
        """Select items using Thompson Sampling"""
        if not available_items:
            return []
        
        item_samples = []
        for item_id in available_items:
            if self.item_counts[item_id] == 0:
                # Sample from uniform distribution for unexplored items
                sample = np.random.uniform(0, 1)
            else:
                # Sample from posterior distribution (assuming Beta distribution)
                rewards = self.item_rewards[item_id]
                successes = sum(1 for r in rewards if r > 0.5)  # Assuming binary rewards
                failures = len(rewards) - successes
                
                # Beta distribution parameters
                alpha = successes + 1
                beta = failures + 1
                
                sample = np.random.beta(alpha, beta)
            
            item_samples.append((item_id, sample))
        
        # Sort by sampled value
        item_samples.sort(key=lambda x: x[1], reverse=True)
        return [item_id for item_id, _ in item_samples[:n_recommendations]]
    
    def update_reward(self, item_id, reward):
        """Update item reward based on user feedback"""
        self.item_rewards[item_id].append(reward)
        self.item_counts[item_id] += 1
        self.total_interactions += 1
        
        # Apply decay to old rewards
        if len(self.item_rewards[item_id]) > 100:  # Keep only recent rewards
            self.item_rewards[item_id] = self.item_rewards[item_id][-100:]
    
    def recommend(self, user_id, ratings, method='ucb', n_recommendations=10):
        """Generate recommendations using bandit algorithm"""
        # Get items user hasn't rated
        user_items = set(ratings[ratings['user_id'] == user_id]['item_id'])
        all_items = list(set(ratings['item_id'].unique()) - user_items)
        
        if method == 'ucb':
            return self.select_items_ucb(all_items, n_recommendations)
        elif method == 'thompson':
            return self.select_items_thompson(all_items, n_recommendations)
        else:
            return all_items[:n_recommendations]

# --------- Advanced Feature Engineering ---------
class FeatureEngineer:
    def __init__(self):
        self.user_features = {}
        self.item_features = {}
        self.interaction_features = {}
        
    def extract_user_features(self, ratings, metadata=None):
        """Extract comprehensive user features"""
        log("Extracting user features...")
        
        user_features = {}
        
        for user_id in ratings['user_id'].unique():
            user_data = ratings[ratings['user_id'] == user_id]
            
            # Basic statistics
            features = {
                'avg_rating': user_data['rating'].mean(),
                'rating_std': user_data['rating'].std(),
                'num_ratings': len(user_data),
                'rating_range': user_data['rating'].max() - user_data['rating'].min(),
                'rating_skew': user_data['rating'].skew(),
                'rating_kurtosis': user_data['rating'].kurtosis()
            }
            
            # Temporal features
            if 'timestamp' in user_data.columns:
                features.update({
                    'days_active': (user_data['timestamp'].max() - user_data['timestamp'].min()) / (24 * 3600),
                    'avg_time_between_ratings': user_data['timestamp'].diff().mean() / 3600,  # hours
                    'recent_activity': (datetime.datetime.now().timestamp() - user_data['timestamp'].max()) / (24 * 3600)
                })
            
            # Genre preferences (if available)
            if metadata is not None and 'genre' in metadata.columns:
                user_items = user_data['item_id'].tolist()
                user_genres = metadata[metadata['item_id'].isin(user_items)]['genre']
                genre_counts = user_genres.value_counts(normalize=True)
                
                features.update({
                    'genre_diversity': len(genre_counts),
                    'top_genre_ratio': genre_counts.iloc[0] if len(genre_counts) > 0 else 0,
                    'genre_entropy': -sum(p * np.log2(p) for p in genre_counts if p > 0)
                })
            
            # Rating patterns
            rating_counts = user_data['rating'].value_counts(normalize=True)
            features.update({
                'rating_diversity': len(rating_counts),
                'most_common_rating': user_data['rating'].mode().iloc[0] if len(user_data) > 0 else 0,
                'high_rating_ratio': len(user_data[user_data['rating'] >= 4]) / len(user_data),
                'low_rating_ratio': len(user_data[user_data['rating'] <= 2]) / len(user_data)
            })
            
            user_features[user_id] = features
        
        self.user_features = user_features
        return user_features
    
    def extract_item_features(self, ratings, metadata=None):
        """Extract comprehensive item features"""
        log("Extracting item features...")
        
        item_features = {}
        
        for item_id in ratings['item_id'].unique():
            item_data = ratings[ratings['item_id'] == item_id]
            
            # Basic statistics
            features = {
                'avg_rating': item_data['rating'].mean(),
                'rating_std': item_data['rating'].std(),
                'num_ratings': len(item_data),
                'num_unique_users': item_data['user_id'].nunique(),
                'rating_range': item_data['rating'].max() - item_data['rating'].min(),
                'popularity_score': len(item_data) * item_data['rating'].mean()
            }
            
            # Rating distribution
            rating_counts = item_data['rating'].value_counts(normalize=True)
            features.update({
                'rating_diversity': len(rating_counts),
                'high_rating_ratio': len(item_data[item_data['rating'] >= 4]) / len(item_data),
                'low_rating_ratio': len(item_data[item_data['rating'] <= 2]) / len(item_data),
                'polarization': features['rating_std'] / features['avg_rating'] if features['avg_rating'] > 0 else 0
            })
            
            # Temporal features
            if 'timestamp' in item_data.columns:
                features.update({
                    'days_since_first_rating': (datetime.datetime.now().timestamp() - item_data['timestamp'].min()) / (24 * 3600),
                    'days_since_last_rating': (datetime.datetime.now().timestamp() - item_data['timestamp'].max()) / (24 * 3600),
                    'rating_velocity': len(item_data) / max(1, features.get('days_since_first_rating', 1))
                })
            
            # Metadata features
            if metadata is not None:
                item_meta = metadata[metadata['item_id'] == item_id]
                if not item_meta.empty:
                    for col in metadata.columns:
                        if col != 'item_id':
                            features[f'meta_{col}'] = item_meta[col].iloc[0]
            
            item_features[item_id] = features
        
        self.item_features = item_features
        return item_features
    
    def create_interaction_matrix(self, ratings, user_features=None, item_features=None):
        """Create enhanced interaction matrix with features"""
        log("Creating interaction feature matrix...")
        
        if user_features is None:
            user_features = self.user_features
        if item_features is None:
            item_features = self.item_features
        
        interaction_data = []
        
        for _, row in ratings.iterrows():
            user_id = row['user_id']
            item_id = row['item_id']
            rating = row['rating']
            
            # Base interaction
            interaction = {
                'user_id': user_id,
                'item_id': item_id,
                'rating': rating
            }
            
            # Add user features
            if user_id in user_features:
                for key, value in user_features[user_id].items():
                    interaction[f'user_{key}'] = value
            
            # Add item features
            if item_id in item_features:
                for key, value in item_features[item_id].items():
                    interaction[f'item_{key}'] = value
            
            # Add interaction-specific features
            if user_id in user_features and item_id in item_features:
                user_avg = user_features[user_id].get('avg_rating', 0)
                item_avg = item_features[item_id].get('avg_rating', 0)
                
                interaction.update({
                    'rating_deviation_user': rating - user_avg,
                    'rating_deviation_item': rating - item_avg,
                    'user_item_rating_diff': user_avg - item_avg,
                    'user_selectivity': user_features[user_id].get('rating_std', 0),
                    'item_controversy': item_features[item_id].get('rating_std', 0)
                })
            
            interaction_data.append(interaction)
        
        return pd.DataFrame(interaction_data)

# --------- Advanced Ensemble Recommender ---------
class EnsembleRecommender:
    def __init__(self):
        self.models = {}
        self.weights = {}
        self.performance_history = defaultdict(list)
        
    def add_model(self, name, model, weight=1.0):
        """Add a model to the ensemble"""
        self.models[name] = model
        self.weights[name] = weight
        log(f"Added model '{name}' to ensemble with weight {weight}")
    
    def train_all_models(self, ratings, metadata=None):
        """Train all models in the ensemble"""
        log("Training ensemble models...")
        
        for name, model in self.models.items():
            try:
                log(f"Training {name}...")
                if hasattr(model, 'train'):
                    model.train(ratings, metadata)
                elif hasattr(model, 'fit'):
                    # For sklearn-style models
                    matrix = get_user_item_matrix(ratings)
                    model.fit(matrix)
                log(f"Completed training {name}")
            except Exception as e:
                log(f"Error training {name}: {str(e)}")
    
    def get_ensemble_recommendations(self, user_id, ratings, metadata=None, n_recommendations=10):
        """Get recommendations from ensemble of models"""
        all_recommendations = {}
        model_scores = {}
        
        # Get recommendations from each model
        for name, model in self.models.items():
            try:
                if hasattr(model, 'recommend'):
                    recs = model.recommend(user_id, ratings, n_recommendations * 2)  # Get more for diversity
                elif name == 'knn':
                    matrix = get_user_item_matrix(ratings)
                    recs = knn_recommend(user_id, matrix, n_recommendations=n_recommendations * 2)
                elif name == 'svd':
                    matrix = get_user_item_matrix(ratings)
                    recs = svd_recommend(user_id, matrix, n_recommendations=n_recommendations * 2)
                else:
                    continue
                
                # Score recommendations (higher score for higher position)
                for i, item_id in enumerate(recs):
                    score = (len(recs) - i) * self.weights[name]
                    if item_id not in all_recommendations:
                        all_recommendations[item_id] = 0
                    all_recommendations[item_id] += score
                
                model_scores[name] = len(recs)
                
            except Exception as e:
                log(f"Error getting recommendations from {name}: {str(e)}")
                model_scores[name] = 0
        
        # Sort by combined score
        sorted_recommendations = sorted(
            all_recommendations.items(), 
            key=lambda x: x[1], 
            reverse=True
        )
        
        final_recommendations = [item_id for item_id, _ in sorted_recommendations[:n_recommendations]]
        
        return {
            'recommendations': final_recommendations,
            'model_contributions': model_scores,
            'ensemble_scores': dict(sorted_recommendations[:n_recommendations])
        }
    
    def update_model_weights(self, performance_metrics):
        """Update model weights based on performance"""
        for model_name, performance in performance_metrics.items():
            if model_name in self.weights:
                self.performance_history[model_name].append(performance)
                
                # Calculate exponential moving average of performance
                recent_performance = self.performance_history[model_name][-10:]  # Last 10 evaluations
                avg_performance = np.mean(recent_performance)
                
                # Update weight based on performance (simple linear scaling)
                self.weights[model_name] = max(0.1, avg_performance)
        
        # Normalize weights
        total_weight = sum(self.weights.values())
        if total_weight > 0:
            for name in self.weights:
                self.weights[name] /= total_weight
        
        log(f"Updated model weights: {self.weights}")

# --------- Real-time Stream Processing ---------
class StreamProcessor:
    def __init__(self, buffer_size=1000, batch_size=100):
        self.buffer = deque(maxlen=buffer_size)
        self.batch_size = batch_size
        self.processors = []
        self.running = False
        self.thread = None
        
    def add_processor(self, processor_func):
        """Add a processing function for streaming data"""
        self.processors.append(processor_func)
    
    def add_interaction(self, user_id, item_id, rating, timestamp=None):
        """Add new interaction to stream"""
        if timestamp is None:
            timestamp = datetime.datetime.now().timestamp()
        
        interaction = {
            'user_id': user_id,
            'item_id': item_id,
            'rating': rating,
            'timestamp': timestamp
        }
        
        self.buffer.append(interaction)
    
    def process_batch(self):
        """Process a batch of interactions"""
        if len(self.buffer) < self.batch_size:
            return
        
        # Extract batch
        batch = []
        for _ in range(min(self.batch_size, len(self.buffer))):
            if self.buffer:
                batch.append(self.buffer.popleft())
        
        if not batch:
            return
        
        # Process with all registered processors
        for processor in self.processors:
            try:
                processor(batch)
            except Exception as e:
                log(f"Error in stream processor: {str(e)}")
    
    def start_processing(self):
        """Start background processing thread"""
        if self.running:
            return
        
        self.running = True
        self.thread = threading.Thread(target=self._process_loop)
        self.thread.daemon = True
        self.thread.start()
        log("Stream processing started")
    
    def stop_processing(self):
        """Stop background processing"""
        self.running = False
        if self.thread:
            self.thread.join()
        log("Stream processing stopped")
    
    def _process_loop(self):
        """Main processing loop"""
        while self.running:
            self.process_batch()
            time.sleep(1)  # Process every second

# --------- Advanced Analytics Dashboard ---------
class AnalyticsDashboard:
    def __init__(self):
        self.metrics = defaultdict(list)
        self.user_segments = {}
        self.item_categories = {}
        
    def track_recommendation_performance(self, user_id, recommendations, actual_interactions):
        """Track how well recommendations performed"""
        if not recommendations:
            return
        
        # Calculate hit rate
        hits = len(set(recommendations) & set(actual_interactions))
        hit_rate = hits / len(recommendations)
        
        # Calculate precision at k
        precision_at_k = hits / min(len(recommendations), len(actual_interactions)) if actual_interactions else 0
        
        # Store metrics
        self.metrics['hit_rate'].append(hit_rate)
        self.metrics['precision_at_k'].append(precision_at_k)
        self.metrics['recommendation_count'].append(len(recommendations))
        
        # User-specific metrics
        user_key = f'user_{user_id}'
        self.metrics[f'{user_key}_hit_rate'].append(hit_rate)
        self.metrics[f'{user_key}_precision'].append(precision_at_k)
    
    def analyze_user_segments(self, ratings):
        """Analyze user behavior segments"""
        log("Analyzing user segments...")
        
        user_stats = ratings.groupby('user_id').agg({
            'rating': ['count', 'mean', 'std'],
            'item_id': 'nunique'
        }).round(3)
        
        user_stats.columns = ['num_ratings', 'avg_rating', 'rating_std', 'num_items']
        user_stats = user_stats.fillna(0)
        
        # Segment users using clustering
        scaler = StandardScaler()
        features_scaled = scaler.fit_transform(user_stats)
        
        kmeans = KMeans(n_clusters=5, random_state=42)
        segments = kmeans.fit_predict(features_scaled)
        
        # Analyze segments
        segment_analysis = {}
        for segment_id in range(5):
            segment_users = user_stats.iloc[segments == segment_id]
            
            segment_analysis[f'segment_{segment_id}'] = {
                'size': len(segment_users),
                'avg_num_ratings': segment_users['num_ratings'].mean(),
                'avg_rating': segment_users['avg_rating'].mean(),
                'avg_rating_std': segment_users['rating_std'].mean(),
                'avg_num_items': segment_users['num_items'].mean()
            }
        
        self.user_segments = segment_analysis
        return segment_analysis
    
    def generate_report(self):
        """Generate comprehensive analytics report"""
        report = {
            'timestamp': datetime.datetime.now().isoformat(),
            'overall_metrics': {},
            'user_segments': self.user_segments,
            'recommendations_performance': {}
        }
        
        # Overall metrics
        for metric_name, values in self.metrics.items():
            if values and not metric_name.startswith('user_'):
                report['overall_metrics'][metric_name] = {
                    'mean': np.mean(values),
                    'median': np.median(values),
                    'std': np.std(values),
                    'min': np.min(values),
                    'max': np.max(values),
                    'count': len(values)
                }
        
        # Recommendation performance trends
        if 'hit_rate' in self.metrics:
            recent_hit_rates = self.metrics['hit_rate'][-100:]  # Last 100 recommendations
            report['recommendations_performance'] = {
                'recent_hit_rate': np.mean(recent_hit_rates) if recent_hit_rates else 0,
                'hit_rate_trend': 'improving' if len(recent_hit_rates) > 10 and 
                                 np.mean(recent_hit_rates[-10:]) > np.mean(recent_hit_rates[-20:-10]) else 'stable'
            }
        
        return report

# --------- Enhanced Main API with All Features ---------
class AdvancedRecommendationAPI:
    def __init__(self):
        self.cache = ModelCache()
        self.ab_tester = ABTester()
        self.realtime = RealtimeRecommender()
        self.monitor = PerformanceMonitor()
        self.neural_model = NeuralRecommender()
        self.graph_model = GraphRecommender()
        self.bandit_model = BanditRecommender()
        self.feature_engineer = FeatureEngineer()
        self.ensemble = EnsembleRecommender()
        self.stream_processor = StreamProcessor()
        self.analytics = AnalyticsDashboard()
        
        # Initialize ensemble with multiple models
        self._setup_ensemble()
        
        # Setup stream processing
        self._setup_stream_processing()
        
        # Initialize A/B tests
        self._setup_ab_tests()
    
    def _setup_ensemble(self):
        """Setup ensemble with multiple recommendation models"""
        # Add traditional models
        self.ensemble.add_model('neural', self.neural_model, weight=0.3)
        self.ensemble.add_model('graph_pagerank', self.graph_model, weight=0.2)
        self.ensemble.add_model('bandit_ucb', self.bandit_model, weight=0.2)
        
        # Add function-based models
        self.ensemble.add_model('knn', 'knn_model', weight=0.15)
        self.ensemble.add_model('svd', 'svd_model', weight=0.15)
    
    def _setup_stream_processing(self):
        """Setup real-time stream processing"""
        def update_bandit_rewards(batch):
            """Update bandit model with new interactions"""
            for interaction in batch:
                # Convert rating to reward (0-1 scale)
                reward = (interaction['rating'] - 1) / 4.0  # Assuming 1-5 rating scale
                self.bandit_model.update_reward(interaction['item_id'], reward)
        
        def update_analytics(batch):
            """Update analytics with new data"""
            for interaction in batch:
                # Track user activity
                self.analytics.metrics['total_interactions'].append(1)
                self.analytics.metrics['avg_rating'].append(interaction['rating'])
        
        self.stream_processor.add_processor(update_bandit_rewards)
        self.stream_processor.add_processor(update_analytics)
        self.stream_processor.start_processing()
    
    def _setup_ab_tests(self):
        """Setup A/B testing experiments"""
        self.ab_tester.create_experiment(
            "recommendation_algorithm", 
            ["ensemble", "neural", "graph", "bandit", "hybrid"],
            [0.3, 0.2, 0.2, 0.15, 0.15]
        )
        
        self.ab_tester.create_experiment(
            "diversity_boost",
            ["enabled", "disabled"],
            [0.7, 0.3]
        )
    
    def train_models(self, ratings, metadata=None):
        """Train all models in the system"""
        log("Training advanced recommendation models...")
        
        self.monitor.start_timer("model_training")
        
        try:
            # Extract features
            user_features = self.feature_engineer.extract_user_features(ratings, metadata)
            item_features = self.feature_engineer.extract_item_features(ratings, metadata)
            
            # Train neural network
            self.neural_model.train(ratings, metadata)
            
            # Build graph
            self.graph_model.build_graph(ratings, metadata)
            
            # Train ensemble
            self.ensemble.train_all_models(ratings, metadata)
            
            # Cache trained models
            self.cache.save_model(self.neural_model, "neural_model")
            self.cache.save_model(self.graph_model, "graph_model")
            self.cache.save_model(user_features, "user_features")
            self.cache.save_model(item_features, "item_features")
            
            training_time = self.monitor.end_timer("model_training")
            log(f"Model training completed in {training_time:.2f} seconds")
            
        except Exception as e:
            log(f"Error during model training: {str(e)}")
            raise
    
    def get_advanced_recommendations(self, user_id, n_recommendations=10, 
                                   include_explanations=False, context=None):
        """Get recommendations using advanced ensemble approach"""
        self.monitor.start_timer("advanced_recommendation_generation")
        
        try:
            # Load data
            ratings, metadata = load_data()
            
            # Get A/B test variants
            algorithm_variant = self.ab_tester.get_variant(user_id, "recommendation_algorithm")
            diversity_variant = self.ab_tester.get_variant(user_id, "diversity_boost")
            
            # Generate recommendations based on variant
            if algorithm_variant == "ensemble":
                result = self.ensemble.get_ensemble_recommendations(
                    user_id, ratings, metadata, n_recommendations
                )
                recommendations = result['recommendations']
                
            elif algorithm_variant == "neural":
                recommendations = self.neural_model.recommend(user_id, ratings, n_recommendations)
                
            elif algorithm_variant == "graph":
                recommendations = self.graph_model.recommend_pagerank(user_id, n_recommendations)
                
            elif algorithm_variant == "bandit":
                recommendations = self.bandit_model.recommend(
                    user_id, ratings, method='ucb', n_recommendations=n_recommendations
                )
                
            else:  # hybrid (fallback)
                recommendations = hybrid_recommend(user_id)
            
            # Apply diversity boost if enabled
            if diversity_variant == "enabled" and metadata is not None:
                recommendations = boost_diversity(recommendations, metadata, n_recommendations)
            
            # Add real-time session recommendations
            session_recs = self.realtime.get_session_recommendations(
                user_id, ratings, metadata, n_recommendations // 3
            )
            
            # Merge with session recommendations (give priority to session-based)
            final_recommendations = session_recs + [
                r for r in recommendations if r not in session_recs
            ][:n_recommendations]
            
            # Prepare result
            result = {
                'user_id': user_id,
                'recommendations': final_recommendations,
                'algorithm_variant': algorithm_variant,
                'diversity_enabled': diversity_variant == "enabled",
                'session_recommendations': len(session_recs),
                'timestamp': datetime.datetime.now().isoformat()
            }
            
            # Add explanations if requested
            if include_explanations:
                explanations = explain_recommendations(user_id, final_recommendations, ratings, metadata)
                result['explanations'] = explanations
            
            # Add context-aware adjustments
            if context:
                result['context'] = context
                # Could add context-specific filtering here
            
            # Record A/B test results
            self.ab_tester.record_result("recommendation_algorithm", algorithm_variant, 
                                       "recommendations_generated", len(final_recommendations))
            
            # Track analytics
            self.analytics.track_recommendation_performance(user_id, final_recommendations, [])
            
            generation_time = self.monitor.end_timer("advanced_recommendation_generation")
            result['generation_time_seconds'] = generation_time
            
            return result
            
        except Exception as e:
            log(f"Error generating advanced recommendations for user {user_id}: {str(e)}")
            return {'error': str(e), 'user_id': user_id}
    
    def track_interaction_stream(self, user_id, item_id, rating, interaction_type='rating'):
        """Track interaction in real-time stream"""
        # Add to stream processor
        self.stream_processor.add_interaction(user_id, item_id, rating)
        
        # Track in real-time recommender
        self.realtime.track_interaction(user_id, item_id, interaction_type)
        
        # Update bandit model immediately for high-value interactions
        if rating >= 4:  # High rating
            reward = (rating - 1) / 4.0
            self.bandit_model.update_reward(item_id, reward)
    
    def get_analytics_report(self):
        """Get comprehensive analytics report"""
        # Update user segments
        ratings, _ = load_data()
        self.analytics.analyze_user_segments(ratings)
        
        # Generate full report
        report = self.analytics.generate_report()
        
        # Add performance statistics
        report['performance_stats'] = self.monitor.get_stats()
        
        # Add A/B test results
        report['ab_test_results'] = {
            'algorithm_test': self.ab_tester.get_results("recommendation_algorithm"),
            'diversity_test': self.ab_tester.get_results("diversity_boost")
        }
        
        return report
    
    def optimize_models(self):
        """Optimize model performance based on recent data"""
        log("Optimizing model performance...")
        
        try:
            # Get recent performance metrics
            performance_metrics = {}
            
            # Simulate performance evaluation (in real system, use actual metrics)
            for model_name in self.ensemble.models.keys():
                # Use recent analytics data to estimate performance
                recent_hit_rate = np.mean(self.analytics.metrics.get('hit_rate', [0.1])[-10:])
                performance_metrics[model_name] = recent_hit_rate + np.random.normal(0, 0.05)
            
            # Update ensemble weights
            self.ensemble.update_model_weights(performance_metrics)
            
            log("Model optimization completed")
            
        except Exception as e:
            log(f"Error during model optimization: {str(e)}")

if __name__ == "__main__":
    log("Starting Smart Recommendation Engine v4.0 - Advanced Edition")
    
    # Initialize advanced API
    advanced_api = AdvancedRecommendationAPI()
    
    # Start with enhanced CLI
    print("🚀 SMART RECOMMENDATION ENGINE v4.0 - ADVANCED EDITION 🚀")
    print("🧠 Neural Networks | 📊 Graph-based | 🎯 Multi-Armed Bandits | 📈 Real-time Analytics")
    print("🔄 Stream Processing | 🎛️ A/B Testing | 🏗️ Feature Engineering | 📊 Advanced Analytics")
    print("=" * 80)
    
    # Example usage of advanced features
    try:
        # Load sample data and train models
        ratings, metadata = load_data()
        
        print("🔧 Training advanced models...")
        advanced_api.train_models(ratings, metadata)
        
        print("✅ Advanced Recommendation Engine is ready!")
        print("📋 Available advanced features:")
        print("   • Neural Network Recommendations")
        print("   • Graph-based PageRank & Random Walk")
        print("   • Multi-Armed Bandit (UCB & Thompson Sampling)")
        print("   • Real-time Stream Processing")
        print("   • Advanced Feature Engineering")
        print("   • Ensemble Learning with Dynamic Weights")
        print("   • A/B Testing Framework")
        print("   • Comprehensive Analytics Dashboard")
        print("   • Performance Monitoring & Optimization")
        
    except Exception as e:
        log(f"Warning: Could not initialize advanced features: {str(e)}")
        print("⚠️  Running in basic mode. Check data files and dependencies.")
    
    interactive_cli()
