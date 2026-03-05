#!/usr/bin/env python3
"""
Script 8: Generate Rossmann Predictions with LightGBM
=====================================================
Generates sales predictions using the trained LightGBM model.

Run: python3 ml/scripts/08_generate_predictions_rossmann_lgb.py
"""

import pandas as pd
import numpy as np
import pickle
from pathlib import Path
from datetime import datetime

from sklearn.preprocessing import LabelEncoder

def load_model(output_dir: Path):
    """Load trained LightGBM model and encoders."""
    model_path = output_dir / "lgb_model.pkl"
    encoders_path = output_dir / "lgb_encoders.pkl"
    
    with open(model_path, "rb") as f:
        model = pickle.load(f)
    
    with open(encoders_path, "rb") as f:
        encoders = pickle.load(f)
    
    return model, encoders

def preprocess_test_data(test_df: pd.DataFrame, store_df: pd.DataFrame, encoders: dict):
    """Preprocess test data for LightGBM."""
    df = test_df.merge(store_df, on="Store", how="left")
    
    # Fill missing
    df["CompetitionDistance"].fillna(df["CompetitionDistance"].median(), inplace=True)
    df["CompetitionOpenSinceMonth"].fillna(1, inplace=True)
    df["CompetitionOpenSinceYear"].fillna(df["Date"].str[:4].astype(int), inplace=True)
    df["Promo2SinceWeek"].fillna(0, inplace=True)
    df["Promo2SinceYear"].fillna(df["Date"].str[:4].astype(int), inplace=True)
    df["Open"].fillna(1, inplace=True)
    
    # Encode holidays
    df["StateHoliday"] = df["StateHoliday"].astype(str).map({"0":0, "a":1, "b":2, "c":3}).fillna(0)
    
    # Date features
    df["Date"] = pd.to_datetime(df["Date"])
    df["Year"] = df["Date"].dt.year
    df["Month"] = df["Date"].dt.month
    df["DayOfWeek"] = df["Date"].dt.dayofweek
    df["WeekOfYear"] = df["Date"].dt.isocalendar().week.astype(int)
    df["Day"] = df["Date"].dt.day
    
    # Encode categoricals using saved encoders
    df["StoreType_encoded"] = encoders["storetype"].transform(df["StoreType"])
    df["Assortment_encoded"] = encoders["assortment"].transform(df["Assortment"])
    
    # Feature columns
    feature_cols = [
        "Store", "DayOfWeek", "Open", "Promo", "StateHoliday", "SchoolHoliday",
        "StoreType_encoded", "Assortment_encoded", "CompetitionDistance",
        "Year", "Month", "WeekOfYear", "Day"
    ]
    
    X_test = df[feature_cols].copy()
    return X_test, df

def generate_predictions(model, X_test: pd.DataFrame):
    """Generate predictions with LightGBM model."""
    preds = model.predict(X_test, num_iteration=model.best_iteration)
    # Ensure non-negative sales
    preds = np.clip(preds, 0, None)
    return preds

def save_submission(df: pd.DataFrame, predictions: np.ndarray, output_dir: Path):
    """Save predictions to CSV."""
    submission = pd.DataFrame({
        "Id": df["Id"],
        "Sales": np.round(predictions, 2)
    })
    
    output_path = output_dir / "submission_rossmann_lgb.csv"
    submission.to_csv(output_path, index=False)
    print(f"Submission saved to: {output_path}")

def main():
    base_dir = Path(__file__).parent.parent
    test_path = base_dir / "rossmann-store-sales/test.csv"
    store_path = base_dir / "rossmann-store-sales/store.csv"
    output_dir = base_dir / "output"
    
    # Load model and encoders
    print("Loading model...")
    model, encoders = load_model(output_dir)
    
    # Load test data
    print("Loading test data...")
    test_df = pd.read_csv(test_path)
    store_df = pd.read_csv(store_path)
    
    # Preprocess
    print("Preprocessing test data...")
    X_test, merged_df = preprocess_test_data(test_df, store_df, encoders)
    
    # Generate predictions
    print("Generating predictions...")
    predictions = generate_predictions(model, X_test)
    
    # Save submission
    save_submission(merged_df, predictions, output_dir)
    
    print("Rossmann LightGBM predictions complete!")

if __name__ == "__main__":
    main()
