#!/usr/bin/env python3
"""
Script 4: Train XGBoost Model for Rossmann Dataset
==================================================
Trains an XGBoost regression model for daily store sales.
"""

import pandas as pd
import numpy as np
import pickle
from pathlib import Path
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import xgboost as xgb

def load_rossmann_data(train_path: Path, store_path: Path):
    train = pd.read_csv(train_path, low_memory=False)
    store = pd.read_csv(store_path, low_memory=False)
    
    # Merge store metadata
    train = train.merge(store, on='Store', how='left')
    return train

def preprocess_rossmann_data(df: pd.DataFrame):
    # Fill missing values
    df['CompetitionDistance'].fillna(df['CompetitionDistance'].median(), inplace=True)
    df['CompetitionOpenSinceMonth'].fillna(1, inplace=True)
    df['CompetitionOpenSinceYear'].fillna(df['Date'].str[:4].astype(int), inplace=True)
    df['Promo2SinceWeek'].fillna(1, inplace=True)
    df['Promo2SinceYear'].fillna(df['Date'].str[:4].astype(int), inplace=True)
    df['Open'].fillna(1, inplace=True)
    
    # Convert dates
    df['Date'] = pd.to_datetime(df['Date'])
    df['Year'] = df['Date'].dt.year
    df['Month'] = df['Date'].dt.month
    df['Day'] = df['Date'].dt.day
    df['WeekOfYear'] = df['Date'].dt.isocalendar().week.astype(int)
    df['DayOfWeek'] = df['Date'].dt.dayofweek  # Monday=0
    
    # Encode StateHoliday
    df['StateHoliday'] = df['StateHoliday'].astype(str)
    df['StateHoliday'] = df['StateHoliday'].map({'0':0,'a':1,'b':2,'c':3}).fillna(0).astype(int)
    
    # Encode StoreType and Assortment
    df['StoreType'] = df['StoreType'].astype(str)
    df['Assortment'] = df['Assortment'].astype(str)
    df['StoreType_encoded'] = df['StoreType'].astype('category').cat.codes
    df['Assortment_encoded'] = df['Assortment'].astype('category').cat.codes
    
    # Target & features
    feature_cols = [
        'Store','DayOfWeek','Open','Promo','StateHoliday','SchoolHoliday',
        'StoreType_encoded','Assortment_encoded','CompetitionDistance',
        'CompetitionOpenSinceMonth','CompetitionOpenSinceYear',
        'Promo2','Promo2SinceWeek','Promo2SinceYear','Year','Month','WeekOfYear'
    ]
    
    X = df[df['Open']==1][feature_cols].copy()
    y = df[df['Open']==1]['Sales'].copy()
    
    return X, y, feature_cols

def train_xgb_model(X, y):
    X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = xgb.XGBRegressor(
        n_estimators=1000,
        max_depth=8,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        tree_method='hist'
    )
    
    model.fit(
        X_train, y_train,
        eval_set=[(X_val, y_val)],
        early_stopping_rounds=50,
        verbose=50
    )
    
    # Evaluation
    y_pred = model.predict(X_val)
    mae = mean_absolute_error(y_val, y_pred)
    rmse = np.sqrt(mean_squared_error(y_val, y_pred))
    r2 = r2_score(y_val, y_pred)
    
    print(f"\nMAE: {mae:.2f}, RMSE: {rmse:.2f}, R²: {r2:.4f}")
    
    return model, mae, rmse, r2

def save_model(model, feature_cols, output_dir: Path):
    output_dir.mkdir(parents=True, exist_ok=True)
    
    model_path = output_dir / "xgb_model.pkl"
    with open(model_path, "wb") as f:
        pickle.dump(model, f)
    
    feature_path = output_dir / "xgb_features.pkl"
    with open(feature_path, "wb") as f:
        pickle.dump(feature_cols, f)
    
    print(f"\nModel saved to {model_path}")

def main():
    print("Training XGBoost model for Rossmann dataset...")
    base_dir = Path(__file__).parent.parent.parent
    train_path = base_dir / "rossmann-store-sales/train.csv"
    store_path = base_dir / "rossmann-store-sales/store.csv"
    output_dir = base_dir / "ml/output"
    
    df = load_rossmann_data(train_path, store_path)
    print("Data loaded.")
    
    X, y, feature_cols = preprocess_rossmann_data(df)
    print(f"Preprocessing done. {len(X)} samples.")
    
    model, mae, rmse, r2 = train_xgb_model(X, y)
    
    save_model(model, feature_cols, output_dir)
    
    print("Rossmann XGBoost model training complete!")

if __name__ == "__main__":
    main()
