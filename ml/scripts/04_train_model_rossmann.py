#!/usr/bin/env python3
"""
Script: Train Rossmann Sales Model
==================================
Trains a Random Forest regression model for Rossmann store sales prediction.
Handles missing values, feature engineering, categorical encoding, and evaluation.

Run: python ml/scripts/02_train_model_rossmann.py
"""

from pathlib import Path
import pandas as pd
import numpy as np
import pickle
from datetime import datetime
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# ----------------------------
# Data Loading
# ----------------------------
def load_rossmann_data(train_path: Path, store_path: Path):
    train = pd.read_csv(train_path)
    store = pd.read_csv(store_path)
    train = train.merge(store, on='Store', how='left')
    return train

# ----------------------------
# Feature Engineering & Preprocessing
# ----------------------------
def preprocess_rossmann_data(df: pd.DataFrame):
    # Fill missing values
    df['CompetitionDistance'].fillna(df['CompetitionDistance'].median(), inplace=True)
    df['Open'].fillna(1, inplace=True)
    df['CompetitionOpenSinceMonth'].fillna(1, inplace=True)
    df['CompetitionOpenSinceYear'].fillna(df['CompetitionOpenSinceYear'].median(), inplace=True)
    
    df['Promo2SinceWeek'].fillna(0, inplace=True)
    df['Promo2SinceYear'].fillna(0, inplace=True)
    
    df['StateHoliday'] = df['StateHoliday'].astype(str)
    holiday_map = {'0': 0, 'a': 1, 'b': 2, 'c': 3}
    df['StateHoliday'] = df['StateHoliday'].map(holiday_map).fillna(0)

    # Date features
    df['Date'] = pd.to_datetime(df['Date'])
    df['Year'] = df['Date'].dt.year
    df['Month'] = df['Date'].dt.month
    df['DayOfWeek'] = df['Date'].dt.dayofweek
    df['WeekOfYear'] = df['Date'].dt.isocalendar().week.astype(int)
    df['Quarter'] = df['Date'].dt.quarter

    # Days since competition opened
    df['CompetitionOpenSince'] = ((df['Year'] - df['CompetitionOpenSinceYear'])*12 + 
                                  (df['Month'] - df['CompetitionOpenSinceMonth'])).clip(lower=0)

    # Promo2 active
    def is_promo2_active(row):
        if row['Promo2'] == 0:
            return 0
        if row['Promo2SinceYear'] == 0:
            return 0
        promo_start = datetime(int(row['Promo2SinceYear']), 1, 1) + pd.to_timedelta((row['Promo2SinceWeek']-1)*7, unit='d')
        promo_interval = str(row['PromoInterval'])
        if promo_interval != 'nan':
            months = promo_interval.split(',')
            if row['Date'].strftime('%b') not in months:
                return 0
        return int(row['Date'] >= promo_start)
    
    df['IsPromo2Active'] = df.apply(is_promo2_active, axis=1)

    # Encode categoricals
    le_store = LabelEncoder()
    le_type = LabelEncoder()
    le_assort = LabelEncoder()
    
    df['Store_encoded'] = le_store.fit_transform(df['Store'])
    df['StoreType_encoded'] = le_type.fit_transform(df['StoreType'])
    df['Assortment_encoded'] = le_assort.fit_transform(df['Assortment'])
    
    # Filter only open stores
    df = df[df['Open'] == 1]

    # Features & target
    feature_cols = [
        'Store_encoded', 'DayOfWeek', 'Promo', 'StateHoliday', 'SchoolHoliday',
        'StoreType_encoded', 'Assortment_encoded', 'CompetitionDistance',
        'CompetitionOpenSince', 'IsPromo2Active', 'Year', 'Month', 'WeekOfYear', 'Quarter'
    ]
    X = df[feature_cols].copy()
    y = df['Sales']
    
    encoders = {
        'store': le_store,
        'store_type': le_type,
        'assortment': le_assort
    }
    
    return X, y, feature_cols, encoders

# ----------------------------
# Model Training
# ----------------------------
def train_model(X, y, feature_names):
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestRegressor(
        n_estimators=200,
        max_depth=15,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)
    
    feature_importance = dict(zip(feature_names, model.feature_importances_))
    
    # Evaluate
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = mean_squared_error(y_test, y_pred, squared=False)
    r2 = r2_score(y_test, y_pred)
    mape = np.mean(np.abs((y_test - y_pred) / (y_test+1e-8))) * 100
    
    metrics = {
        'mae': float(mae),
        'rmse': float(rmse),
        'r2_score': float(r2),
        'mape': float(mape)
    }
    
    print(f"MAE: {mae:.2f}, RMSE: {rmse:.2f}, R²: {r2:.4f}, MAPE: {mape:.2f}%")
    
    return model, metrics, feature_importance

# ----------------------------
# Save Model
# ----------------------------
def save_model(model, encoders, feature_names, metrics, feature_importance, output_dir: Path):
    output_dir.mkdir(parents=True, exist_ok=True)
    
    with open(output_dir / 'model_rossmann.pkl', 'wb') as f:
        pickle.dump(model, f)
    with open(output_dir / 'encoders_rossmann.pkl', 'wb') as f:
        pickle.dump(encoders, f)
    with open(output_dir / 'model_info_rossmann.json', 'w') as f:
        import json
        json.dump({
            'features': feature_names,
            'metrics': metrics,
            'feature_importance': feature_importance,
            'training_date': datetime.now().isoformat()
        }, f, indent=2)
    print(f"Model saved to {output_dir}")

# ----------------------------
# Main Pipeline
# ----------------------------
def main():
    base_dir = Path(__file__).parent.parent.parent / "rossmann-store-sales"
    output_dir = Path(__file__).parent.parent / "output"
    
    train_path = base_dir / "train.csv"
    store_path = base_dir / "store.csv"
    
    print("Loading data...")
    df = load_rossmann_data(train_path, store_path)
    
    print("Preprocessing...")
    X, y, feature_names, encoders = preprocess_rossmann_data(df)
    
    print("Training model...")
    model, metrics, feature_importance = train_model(X, y, feature_names)
    
    print("Saving model...")
    save_model(model, encoders, feature_names, metrics, feature_importance, output_dir)
    
    print("Rossmann model training complete!")

if __name__ == "__main__":
    main()
