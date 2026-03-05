#!/usr/bin/env python3
"""
Script 7: Train Rossmann Model with LightGBM
============================================
Trains a LightGBM regression model for Rossmann sales prediction.

Run: python3 ml/scripts/07_train_model_rossmann_lgb.py
"""

import pandas as pd
import numpy as np
import pickle
from pathlib import Path
from datetime import datetime

from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

import lightgbm as lgb

def load_rossmann_data(train_path, store_path):
    """Load and merge Rossmann data."""
    train = pd.read_csv(train_path, low_memory=False)
    store = pd.read_csv(store_path)
    train = train.merge(store, on="Store", how="left")
    return train

def preprocess_rossmann_data(df):
    """Preprocess Rossmann data for LightGBM."""
    # Fill missing values
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
    
    # Encode categoricals
    le_storetype = LabelEncoder()
    le_assort = LabelEncoder()
    
    df["StoreType_encoded"] = le_storetype.fit_transform(df["StoreType"])
    df["Assortment_encoded"] = le_assort.fit_transform(df["Assortment"])
    
    # Features & target
    feature_cols = [
        "Store", "DayOfWeek", "Open", "Promo", "StateHoliday", "SchoolHoliday",
        "StoreType_encoded", "Assortment_encoded", "CompetitionDistance",
        "Year", "Month", "WeekOfYear", "Day"
    ]
    
    # Filter out closed stores
    mask = df["Open"] == 1
    X = df.loc[mask, feature_cols].copy()
    y = df.loc[mask, "Sales"]
    
    encoders = {
        "storetype": le_storetype,
        "assortment": le_assort
    }
    
    return X, y, feature_cols, encoders

def train_lgb_model(X, y):
    """Train LightGBM model."""
    X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42)
    
    lgb_train = lgb.Dataset(X_train, y_train)
    lgb_val = lgb.Dataset(X_val, y_val, reference=lgb_train)
    
    params = {
        "objective": "regression",
        "metric": "rmse",
        "boosting_type": "gbdt",
        "num_leaves": 64,
        "learning_rate": 0.05,
        "feature_fraction": 0.8,
        "bagging_fraction": 0.8,
        "bagging_freq": 5,
        "verbose": -1,
        "n_jobs": -1,
        "seed": 42
    }
    
    print("Training LightGBM model...")
    model = lgb.train(
        params,
        lgb_train,
        num_boost_round=2000,
        valid_sets=[lgb_train, lgb_val],
        early_stopping_rounds=100,
        verbose_eval=100
    )
    
    # Evaluate
    y_pred = model.predict(X_val, num_iteration=model.best_iteration)
    mae = mean_absolute_error(y_val, y_pred)
    rmse = mean_squared_error(y_val, y_pred, squared=False)
    r2 = r2_score(y_val, y_pred)
    
    print(f"MAE: {mae:.2f}, RMSE: {rmse:.2f}, R²: {r2:.4f}")
    
    return model, X_train.shape[0], X_val.shape[0]

def save_model(model, encoders, feature_cols, train_samples, val_samples, output_dir):
    """Save trained model and metadata."""
    output_dir.mkdir(parents=True, exist_ok=True)
    
    model_path = output_dir / "lgb_model.pkl"
    with open(model_path, "wb") as f:
        pickle.dump(model, f)
    
    enc_path = output_dir / "lgb_encoders.pkl"
    with open(enc_path, "wb") as f:
        pickle.dump(encoders, f)
    
    info = {
        "model_type": "Regression",
        "algorithm": "LightGBM",
        "features": feature_cols,
        "training_samples": train_samples,
        "validation_samples": val_samples,
        "training_date": datetime.now().isoformat()
    }
    info_path = output_dir / "lgb_model_info.json"
    with open(info_path, "w") as f:
        import json
        json.dump(info, f, indent=2)
    
    print(f"Model saved to {output_dir}")

def main():
    base_dir = Path(__file__).parent.parent
    train_path = base_dir / "rossmann-store-sales/train.csv"
    store_path = base_dir / "rossmann-store-sales/store.csv"
    output_dir = base_dir / "output"
    
    # Load data
    print("Loading data...")
    train_df = load_rossmann_data(train_path, store_path)
    
    # Preprocess
    print("Preprocessing...")
    X, y, feature_cols, encoders = preprocess_rossmann_data(train_df)
    
    # Train
    model, train_samples, val_samples = train_lgb_model(X, y)
    
    # Save
    save_model(model, encoders, feature_cols, train_samples, val_samples, output_dir)
    print("Rossmann LightGBM model training complete!")

if __name__ == "__main__":
    main()
