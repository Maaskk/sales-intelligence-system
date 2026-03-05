#!/usr/bin/env python3
"""
Script 5: Generate Predictions with Rossmann XGBoost Model
=========================================================
Loads XGBoost model, preprocesses test data, generates submission CSV.
"""

import pandas as pd
import pickle
from pathlib import Path

def load_test_data(test_path: Path, store_path: Path):
    test = pd.read_csv(test_path, low_memory=False)
    store = pd.read_csv(store_path, low_memory=False)
    test = test.merge(store, on='Store', how='left')
    return test

def preprocess_test_data(df: pd.DataFrame):
    df['CompetitionDistance'].fillna(df['CompetitionDistance'].median(), inplace=True)
    df['CompetitionOpenSinceMonth'].fillna(1, inplace=True)
    df['CompetitionOpenSinceYear'].fillna(df['Date'].str[:4].astype(int), inplace=True)
    df['Promo2SinceWeek'].fillna(1, inplace=True)
    df['Promo2SinceYear'].fillna(df['Date'].str[:4].astype(int), inplace=True)
    df['Open'].fillna(1, inplace=True)
    
    df['Date'] = pd.to_datetime(df['Date'])
    df['Year'] = df['Date'].dt.year
    df['Month'] = df['Date'].dt.month
    df['Day'] = df['Date'].dt.day
    df['WeekOfYear'] = df['Date'].dt.isocalendar().week.astype(int)
    df['DayOfWeek'] = df['Date'].dt.dayofweek
    
    df['StateHoliday'] = df['StateHoliday'].astype(str)
    df['StateHoliday'] = df['StateHoliday'].map({'0':0,'a':1,'b':2,'c':3}).fillna(0).astype(int)
    
    df['StoreType_encoded'] = df['StoreType'].astype('category').cat.codes
    df['Assortment_encoded'] = df['Assortment'].astype('category').cat.codes
    
    return df

def generate_predictions(model, df, feature_cols):
    X_test = df[feature_cols].copy()
    preds = model.predict(X_test)
    df['Sales'] = preds
    # Ensure 0 sales if store is closed
    df.loc[df['Open']==0, 'Sales'] = 0
    return df[['Id','Sales']]

def main():
    print("Generating Rossmann XGBoost predictions...")
    base_dir = Path(__file__).parent.parent.parent
    test_path = base_dir / "rossmann-store-sales/test.csv"
    store_path = base_dir / "rossmann-store-sales/store.csv"
    output_dir = base_dir / "ml/output"
    
    # Load model
    model_path = output_dir / "xgb_model.pkl"
    feature_path = output_dir / "xgb_features.pkl"
    
    with open(model_path, "rb") as f:
        model = pickle.load(f)
    with open(feature_path, "rb") as f:
        feature_cols = pickle.load(f)
    
    # Load and preprocess test
    df_test = load_test_data(test_path, store_path)
    df_test = preprocess_test_data(df_test)
    
    # Predict
    submission = generate_predictions(model, df_test, feature_cols)
    
    # Save CSV
    submission_path = output_dir / "submission_rossmann_xgb.csv"
    submission.to_csv(submission_path, index=False)
    print(f"Submission saved to {submission_path}")
    print("Rossmann XGBoost predictions complete!")

if __name__ == "__main__":
    main()
