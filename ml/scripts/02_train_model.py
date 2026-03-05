#!/usr/bin/env python3
"""
Script 2: Model Training
========================
Trains a Random Forest regression model for sales prediction.
Includes data preprocessing, feature engineering, and model evaluation.

Run: python ml/scripts/02_train_model.py
"""

import json
import pickle
import numpy as np
from datetime import datetime
from pathlib import Path

# Check for sklearn availability
try:
    from sklearn.model_selection import train_test_split
    from sklearn.ensemble import RandomForestRegressor
    from sklearn.preprocessing import LabelEncoder
    from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    print("Warning: scikit-learn not installed. Using simplified model.")

def load_data(data_path: Path) -> list:
    """Load sales data from JSON file."""
    if not data_path.exists():
        raise FileNotFoundError(
            f"Data file not found: {data_path}\n"
            "Please run 01_generate_data.py first."
        )
    
    with open(data_path, "r") as f:
        return json.load(f)

def preprocess_data(data: list) -> tuple:
    """
    Preprocess data for model training.
    
    Features used:
    - quantity: Number of items
    - unit_price: Price per unit
    - day_of_week: 0-6 (Monday-Sunday)
    - month: 1-12
    - quarter: 1-4
    - promotion: 0 or 1
    - category_encoded: Encoded category
    - region_encoded: Encoded region
    - customer_segment_encoded: Encoded segment
    """
    print("Preprocessing data...")
    
    # Initialize encoders
    category_encoder = LabelEncoder() if SKLEARN_AVAILABLE else None
    region_encoder = LabelEncoder() if SKLEARN_AVAILABLE else None
    segment_encoder = LabelEncoder() if SKLEARN_AVAILABLE else None
    
    # Extract categories
    categories = list(set(d["category"] for d in data))
    regions = list(set(d["region"] for d in data))
    segments = list(set(d["customer_segment"] for d in data))
    
    if SKLEARN_AVAILABLE:
        category_encoder.fit(categories)
        region_encoder.fit(regions)
        segment_encoder.fit(segments)
    else:
        # Simple encoding dictionaries
        category_map = {c: i for i, c in enumerate(categories)}
        region_map = {r: i for i, r in enumerate(regions)}
        segment_map = {s: i for i, s in enumerate(segments)}
    
    # Build feature matrix
    X = []
    y = []
    
    for record in data:
        features = [
            record["quantity"],
            record["unit_price"],
            record["day_of_week"],
            record["month"],
            record["quarter"],
            1 if record["promotion"] else 0,
        ]
        
        if SKLEARN_AVAILABLE:
            features.extend([
                category_encoder.transform([record["category"]])[0],
                region_encoder.transform([record["region"]])[0],
                segment_encoder.transform([record["customer_segment"]])[0],
            ])
        else:
            features.extend([
                category_map[record["category"]],
                region_map[record["region"]],
                segment_map[record["customer_segment"]],
            ])
        
        X.append(features)
        y.append(record["total_sales"])
    
    feature_names = [
        "quantity",
        "unit_price",
        "day_of_week",
        "month",
        "quarter",
        "promotion",
        "category_encoded",
        "region_encoded",
        "customer_segment_encoded",
    ]
    
    encoders = {
        "category": category_encoder if SKLEARN_AVAILABLE else category_map,
        "region": region_encoder if SKLEARN_AVAILABLE else region_map,
        "segment": segment_encoder if SKLEARN_AVAILABLE else segment_map,
    }
    
    print(f"  - Total samples: {len(X)}")
    print(f"  - Features: {len(feature_names)}")
    
    return np.array(X), np.array(y), feature_names, encoders

def train_model(X: np.ndarray, y: np.ndarray, feature_names: list) -> tuple:
    """Train the Random Forest model."""
    print("\nTraining model...")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    print(f"  - Training samples: {len(X_train)}")
    print(f"  - Test samples: {len(X_test)}")
    
    if SKLEARN_AVAILABLE:
        # Train Random Forest
        model = RandomForestRegressor(
            n_estimators=100,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        )
        
        model.fit(X_train, y_train)
        
        # Get feature importance
        feature_importance = dict(zip(feature_names, model.feature_importances_))
    else:
        # Simple linear model fallback
        model = SimpleLinearModel()
        model.fit(X_train, y_train)
        feature_importance = {name: 1/len(feature_names) for name in feature_names}
    
    return model, X_train, X_test, y_train, y_test, feature_importance

class SimpleLinearModel:
    """Simple linear model fallback when sklearn is not available."""
    
    def __init__(self):
        self.coefficients = None
        self.intercept = 0
    
    def fit(self, X, y):
        # Simple approach: weighted average based on correlation
        self.means = np.mean(X, axis=0)
        self.stds = np.std(X, axis=0) + 1e-8
        self.y_mean = np.mean(y)
        self.y_std = np.std(y) + 1e-8
        
        # Normalize
        X_norm = (X - self.means) / self.stds
        y_norm = (y - self.y_mean) / self.y_std
        
        # Calculate correlations as weights
        correlations = np.corrcoef(X_norm.T, y_norm)[-1, :-1]
        self.coefficients = correlations * self.y_std / self.stds
        self.intercept = self.y_mean - np.dot(self.means, self.coefficients)
    
    def predict(self, X):
        return np.dot(X, self.coefficients) + self.intercept

def evaluate_model(model, X_test: np.ndarray, y_test: np.ndarray) -> dict:
    """Evaluate model performance."""
    print("\nEvaluating model...")
    
    y_pred = model.predict(X_test)
    
    mae = mean_absolute_error(y_test, y_pred) if SKLEARN_AVAILABLE else np.mean(np.abs(y_test - y_pred))
    mse = mean_squared_error(y_test, y_pred) if SKLEARN_AVAILABLE else np.mean((y_test - y_pred) ** 2)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_test, y_pred) if SKLEARN_AVAILABLE else 1 - (np.sum((y_test - y_pred) ** 2) / np.sum((y_test - np.mean(y_test)) ** 2))
    
    # MAPE (Mean Absolute Percentage Error)
    mape = np.mean(np.abs((y_test - y_pred) / (y_test + 1e-8))) * 100
    
    metrics = {
        "mae": float(mae),
        "rmse": float(rmse),
        "r2_score": float(r2),
        "mape": float(mape),
    }
    
    print(f"  - MAE: ${mae:.2f}")
    print(f"  - RMSE: ${rmse:.2f}")
    print(f"  - R² Score: {r2:.4f} ({r2*100:.1f}%)")
    print(f"  - MAPE: {mape:.2f}%")
    
    return metrics

def save_model(model, encoders: dict, feature_names: list, metrics: dict, 
               training_samples: int, test_samples: int, feature_importance: dict,
               output_dir: Path):
    """Save trained model and metadata."""
    print("\nSaving model...")
    
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Save model
    model_path = output_dir / "model.pkl"
    with open(model_path, "wb") as f:
        pickle.dump(model, f)
    print(f"  - Model saved to: {model_path}")
    
    # Save encoders
    encoders_path = output_dir / "encoders.pkl"
    with open(encoders_path, "wb") as f:
        pickle.dump(encoders, f)
    print(f"  - Encoders saved to: {encoders_path}")
    
    # Save model info
    model_info = {
        "model_type": "Regression",
        "algorithm": "Random Forest" if SKLEARN_AVAILABLE else "Linear Regression",
        "features": feature_names,
        "training_date": datetime.now().isoformat(),
        "metrics": metrics,
        "training_samples": training_samples,
        "test_samples": test_samples,
        "feature_importance": feature_importance,
    }
    
    model_info_path = output_dir / "model_info.json"
    with open(model_info_path, "w") as f:
        json.dump(model_info, f, indent=2)
    print(f"  - Model info saved to: {model_info_path}")

def main():
    """Main training pipeline."""
    print("=" * 50)
    print("RETAILPRO ML MODEL TRAINING")
    print("=" * 50)
    print()
    
    # Paths
    base_dir = Path(__file__).parent.parent
    data_path = base_dir / "data" / "sales_data.json"
    output_dir = base_dir / "output"
    
    # Load data
    print("Loading data...")
    data = load_data(data_path)
    print(f"  - Loaded {len(data)} records")
    
    # Preprocess
    X, y, feature_names, encoders = preprocess_data(data)
    
    # Train
    model, X_train, X_test, y_train, y_test, feature_importance = train_model(X, y, feature_names)
    
    # Evaluate
    metrics = evaluate_model(model, X_test, y_test)
    
    # Save
    save_model(
        model=model,
        encoders=encoders,
        feature_names=feature_names,
        metrics=metrics,
        training_samples=len(X_train),
        test_samples=len(X_test),
        feature_importance=feature_importance,
        output_dir=output_dir
    )
    
    # Print feature importance
    print("\nFeature Importance:")
    sorted_importance = sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)
    for feature, importance in sorted_importance:
        bar = "█" * int(importance * 50)
        print(f"  {feature:30s} {importance:.3f} {bar}")
    
    print("\n" + "=" * 50)
    print("MODEL TRAINING COMPLETE")
    print("=" * 50)
    print("\nNext step: Run 03_generate_predictions.py to generate forecasts")

if __name__ == "__main__":
    main()
