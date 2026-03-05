#!/usr/bin/env python3
"""
ML Model Training for RetailPro Analytics
Trains a Random Forest model for sales prediction.

Usage:
    python ml/train_model.py

Requirements:
    pip install pandas scikit-learn numpy

Output:
    ml/output/model.pkl
    ml/output/model_info.json
    ml/output/predictions.json
"""

import json
import pickle
from datetime import datetime, timedelta
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

def load_data(data_path: Path) -> pd.DataFrame:
    """Load sales data from JSON file."""
    with open(data_path, "r") as f:
        data = json.load(f)
    return pd.DataFrame(data)

def preprocess_data(df: pd.DataFrame) -> tuple:
    """Prepare features for training."""
    # Encode categorical variables
    label_encoders = {}
    categorical_cols = ["category", "region", "customer_segment"]
    
    for col in categorical_cols:
        le = LabelEncoder()
        df[f"{col}_encoded"] = le.fit_transform(df[col])
        label_encoders[col] = le
    
    # Select features
    feature_cols = [
        "quantity",
        "unit_price",
        "promotion",
        "day_of_week",
        "month",
        "quarter",
        "category_encoded",
        "region_encoded",
        "customer_segment_encoded",
    ]
    
    X = df[feature_cols].copy()
    X["promotion"] = X["promotion"].astype(int)
    y = df["total_sales"]
    
    return X, y, feature_cols, label_encoders

def train_model(X: pd.DataFrame, y: pd.Series) -> tuple:
    """Train Random Forest model."""
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Train model
    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=15,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
    )
    
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    
    metrics = {
        "mae": mean_absolute_error(y_test, y_pred),
        "rmse": np.sqrt(mean_squared_error(y_test, y_pred)),
        "r2_score": r2_score(y_test, y_pred),
        "mape": np.mean(np.abs((y_test - y_pred) / y_test)) * 100,
    }
    
    return model, metrics, len(X_train), len(X_test)

def generate_predictions(
    model: RandomForestRegressor,
    df: pd.DataFrame,
    label_encoders: dict,
    days: int = 30,
) -> list:
    """Generate future sales predictions."""
    predictions = []
    today = datetime.now()
    
    # Get average values for prediction baseline
    avg_quantity = df["quantity"].mean()
    avg_price = df["unit_price"].mean()
    
    # Category and region distributions
    categories = df["category"].unique()
    regions = df["region"].unique()
    
    for i in range(days):
        future_date = today + timedelta(days=i + 1)
        day_of_week = future_date.weekday()
        month = future_date.month
        quarter = (month - 1) // 3 + 1
        
        # Weekend adjustment
        is_weekend = day_of_week >= 5
        quantity_factor = 0.7 if is_weekend else 1.0
        
        # Aggregate prediction across categories and regions
        daily_predictions = []
        
        for cat in categories[:3]:  # Top 3 categories
            for region in regions[:3]:  # Top 3 regions
                features = np.array([[
                    avg_quantity * quantity_factor,
                    avg_price,
                    0,  # No promotion
                    day_of_week,
                    month,
                    quarter,
                    label_encoders["category"].transform([cat])[0],
                    label_encoders["region"].transform([region])[0],
                    0,  # Default segment
                ]])
                
                pred = model.predict(features)[0]
                daily_predictions.append(pred)
        
        # Aggregate
        total_predicted = sum(daily_predictions) * 2  # Scale up for all combinations
        confidence_margin = total_predicted * 0.15
        
        # Determine trend
        trend = "stable"
        if i > 0:
            prev_pred = predictions[-1]["predicted_sales"]
            change = (total_predicted - prev_pred) / prev_pred
            if change > 0.05:
                trend = "up"
            elif change < -0.05:
                trend = "down"
        
        predictions.append({
            "date": future_date.strftime("%Y-%m-%d"),
            "predicted_sales": round(total_predicted),
            "confidence_lower": round(total_predicted - confidence_margin),
            "confidence_upper": round(total_predicted + confidence_margin),
            "trend": trend,
        })
    
    return predictions

def save_model_info(
    output_dir: Path,
    feature_cols: list,
    model: RandomForestRegressor,
    metrics: dict,
    train_samples: int,
    test_samples: int,
) -> None:
    """Save model metadata."""
    # Get feature importance
    importance = dict(zip(feature_cols, model.feature_importances_.tolist()))
    
    model_info = {
        "model_type": "Regression",
        "algorithm": "Random Forest",
        "features": feature_cols,
        "training_date": datetime.now().isoformat(),
        "metrics": {
            "mae": round(metrics["mae"], 2),
            "rmse": round(metrics["rmse"], 2),
            "r2_score": round(metrics["r2_score"], 4),
            "mape": round(metrics["mape"], 2),
        },
        "training_samples": train_samples,
        "test_samples": test_samples,
        "feature_importance": {k: round(v, 4) for k, v in importance.items()},
    }
    
    with open(output_dir / "model_info.json", "w") as f:
        json.dump(model_info, f, indent=2)

def main():
    print("=" * 60)
    print("RetailPro Analytics - ML Model Training")
    print("=" * 60)
    
    # Paths
    base_dir = Path(__file__).parent
    data_path = base_dir / "data" / "sales_data.json"
    output_dir = base_dir / "output"
    output_dir.mkdir(exist_ok=True)
    
    # Check if data exists
    if not data_path.exists():
        print("\nError: Sales data not found!")
        print("Please run 'python ml/generate_data.py' first.")
        return
    
    # Load and preprocess data
    print("\n1. Loading data...")
    df = load_data(data_path)
    print(f"   Loaded {len(df):,} records")
    
    print("\n2. Preprocessing features...")
    X, y, feature_cols, label_encoders = preprocess_data(df)
    print(f"   Features: {len(feature_cols)}")
    
    # Train model
    print("\n3. Training Random Forest model...")
    model, metrics, train_samples, test_samples = train_model(X, y)
    
    print(f"\n{'Model Performance':=^40}")
    print(f"   R² Score:  {metrics['r2_score']:.4f} ({metrics['r2_score']*100:.1f}%)")
    print(f"   MAE:       ${metrics['mae']:.2f}")
    print(f"   RMSE:      ${metrics['rmse']:.2f}")
    print(f"   MAPE:      {metrics['mape']:.2f}%")
    
    # Save model
    print("\n4. Saving model...")
    with open(output_dir / "model.pkl", "wb") as f:
        pickle.dump(model, f)
    
    # Save model info
    save_model_info(output_dir, feature_cols, model, metrics, train_samples, test_samples)
    
    # Generate predictions
    print("\n5. Generating 30-day forecast...")
    predictions = generate_predictions(model, df, label_encoders, days=30)
    
    with open(output_dir / "predictions.json", "w") as f:
        json.dump(predictions, f, indent=2)
    
    total_predicted = sum(p["predicted_sales"] for p in predictions)
    print(f"   Predicted 30-day revenue: ${total_predicted:,.0f}")
    
    print(f"\n{'Files Saved':=^40}")
    print(f"   - {output_dir / 'model.pkl'}")
    print(f"   - {output_dir / 'model_info.json'}")
    print(f"   - {output_dir / 'predictions.json'}")
    print("=" * 60)

if __name__ == "__main__":
    main()
