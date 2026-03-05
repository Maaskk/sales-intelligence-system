#!/usr/bin/env python3
"""
Script: Generate Predictions for Rossmann
=========================================
Generates sales predictions for Rossmann test data using the trained model.
Outputs a CSV ready for Kaggle submission.

Run: python ml/scripts/03_generate_predictions_rossmann.py
"""

from pathlib import Path
import pandas as pd
import numpy as np
import pickle
from datetime import datetime

# ----------------------------
# Load Model & Encoders
# ----------------------------
def load_model(model_dir: Path):
    model_path = model_dir / "model_rossmann.pkl"
    encoders_path = model_dir / "encoders_rossmann.pkl"
    
    with open(model_path, "rb") as f:
        model = pickle.load(f)
    with open(encoders_path, "rb") as f:
        encoders = pickle.load(f)
    return model, encoders

# ----------------------------
# Preprocess Test Data
# ----------------------------
def preprocess_test(df_test: pd.DataFrame, store_df: pd.DataFrame, encoders: dict):
    df_test = df_test.merge(store_df, on='Store', how='left')

    # Fill missing
    df_test['CompetitionDistance'].fillna(store_df['CompetitionDistance'].median(), inplace=True)
    df_test['Open'].fillna(1, inplace=True)
    df_test['CompetitionOpenSinceMonth'].fillna(1, inplace=True)
    df_test['CompetitionOpenSinceYear'].fillna(store_df['CompetitionOpenSinceYear'].median(), inplace=True)
    df_test['Promo2SinceWeek'].fillna(0, inplace=True)
    df_test['Promo2SinceYear'].fillna(0, inplace=True)
    
    df_test['StateHoliday'] = df_test['StateHoliday'].astype(str)
    holiday_map = {'0':0, 'a':1, 'b':2, 'c':3}
    df_test['StateHoliday'] = df_test['StateHoliday'].map(holiday_map).fillna(0)

    # Date features
    df_test['Date'] = pd.to_datetime(df_test['Date'])
    df_test['Year'] = df_test['Date'].dt.year
    df_test['Month'] = df_test['Date'].dt.month
    df_test['DayOfWeek'] = df_test['Date'].dt.dayofweek
    df_test['WeekOfYear'] = df_test['Date'].dt.isocalendar().week.astype(int)
    df_test['Quarter'] = df_test['Date'].dt.quarter

    df_test['CompetitionOpenSince'] = ((df_test['Year'] - df_test['CompetitionOpenSinceYear'])*12 +
                                       (df_test['Month'] - df_test['CompetitionOpenSinceMonth'])).clip(lower=0)

    # Promo2 active
    def is_promo2_active(row):
        if row['Promo2'] == 0:
            return 0
        if row['Promo2SinceYear'] == 0:
            return 0
        promo_start = datetime(int(row['Promo2SinceYear']),1,1) + pd.to_timedelta((row['Promo2SinceWeek']-1)*7, unit='d')
        promo_interval = str(row['PromoInterval'])
        if promo_interval != 'nan':
            months = promo_interval.split(',')
            if row['Date'].strftime('%b') not in months:
                return 0
        return int(row['Date'] >= promo_start)
    
    df_test['IsPromo2Active'] = df_test.apply(is_promo2_active, axis=1)

    # Encode categoricals
    df_test['Store_encoded'] = encoders['store'].transform(df_test['Store'])
    df_test['StoreType_encoded'] = encoders['store_type'].transform(df_test['StoreType'])
    df_test['Assortment_encoded'] = encoders['assortment'].transform(df_test['Assortment'])
    
    feature_cols = [
        'Store_encoded', 'DayOfWeek', 'Promo', 'StateHoliday', 'SchoolHoliday',
        'StoreType_encoded', 'Assortment_encoded', 'CompetitionDistance',
        'CompetitionOpenSince', 'IsPromo2Active', 'Year', 'Month', 'WeekOfYear', 'Quarter'
    ]
    
    X_test = df_test[feature_cols].copy()
    ids = df_test['Id']
    
    return X_test, ids

# ----------------------------
# Generate Predictions
# ----------------------------
def generate_predictions(model, X_test: pd.DataFrame):
    preds = model.predict(X_test)
    # Rossmann Kaggle rule: Sales cannot be negative
    preds = np.where(preds < 0, 0, preds)
    return preds

# ----------------------------
# Save Submission
# ----------------------------
def save_submission(ids, preds, output_dir: Path):
    output_dir.mkdir(parents=True, exist_ok=True)
    submission = pd.DataFrame({
        'Id': ids,
        'Sales': preds
    })
    submission_path = output_dir / 'submission_rossmann.csv'
    submission.to_csv(submission_path, index=False)
    print(f"Submission saved to {submission_path}")

# ----------------------------
# Main Pipeline
# ----------------------------
def main():
    base_dir = Path(__file__).parent.parent.parent / "rossmann-store-sales"
    output_dir = Path(__file__).parent.parent / "output"
    
    test_path = base_dir / "test.csv"
    store_path = base_dir / "store.csv"
    
    print("Loading model...")
    model, encoders = load_model(output_dir)
    
    print("Loading test data...")
    test_df = pd.read_csv(test_path)
    store_df = pd.read_csv(store_path)
    
    print("Preprocessing test data...")
    X_test, ids = preprocess_test(test_df, store_df, encoders)
    
    print("Generating predictions...")
    preds = generate_predictions(model, X_test)
    
    print("Saving submission...")
    save_submission(ids, preds, output_dir)
    
    print("Rossmann predictions complete!")

if __name__ == "__main__":
    main()
