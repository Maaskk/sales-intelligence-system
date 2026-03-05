#!/usr/bin/env python3
"""
Transform Rossmann data to frontend format
Converts Rossmann store sales data to match frontend schema
"""

import pandas as pd
import json
from pathlib import Path
from datetime import datetime, timedelta

def transform_rossmann_data():
    """Transform Rossmann data to frontend-compatible format"""
    base_dir = Path(__file__).parent.parent.parent
    
    # Load Rossmann data
    train_path = base_dir / "rossmann-store-sales/train.csv"
    store_path = base_dir / "rossmann-store-sales/store.csv"
    
    try:
        train = pd.read_csv(train_path, low_memory=False)
        store = pd.read_csv(store_path, low_memory=False)
        
        # Merge data
        df = train.merge(store, on='Store', how='left')
        
        # Filter to open stores only (where sales happened)
        df = df[df['Open'] == 1].copy()
        
        # Take a sample for performance (keep it manageable)
        if len(df) > 10000:
            df = df.sample(n=10000, random_state=42)
        
        transformed_data = []
        
        for idx, row in df.iterrows():
            # Create product-like representation from store data
            store_id = f"STORE-{row['Store']:03d}"
            
            # Map StoreType to product categories
            category_map = {
                'a': 'Electronics',
                'b': 'Clothing', 
                'c': 'Home',
                'd': 'Office'
            }
            category = category_map.get(row['StoreType'], 'General')
            
            # Create product name
            product_name = f"Store {row['Store']} - {category} Items"
            
            # Map store to regions
            region_map = {
                1: 'North', 2: 'North', 3: 'East',
                4: 'East', 5: 'South', 6: 'South',
                7: 'West', 8: 'West', 9: 'Central', 10: 'Central'
            }
            region = region_map.get(row['Store'] % 10 + 1, 'Central')
            
            # Customer segment based on sales volume
            if row['Sales'] > 10000:
                segment = 'Enterprise'
            elif row['Sales'] > 5000:
                segment = 'Business'
            else:
                segment = 'Consumer'
            
            transformed_data.append({
                'id': f"ROSS-{idx:06d}",
                'date': pd.to_datetime(row['Date']).isoformat(),
                'product_id': store_id,
                'product_name': product_name,
                'category': category,
                'region': region,
                'quantity': max(1, int(row['Sales'] / 100)),  # Estimate quantity
                'unit_price': round(row['Sales'] / max(1, int(row['Sales'] / 100)), 2),
                'total_sales': float(row['Sales']),
                'customer_segment': segment,
                'promotion': bool(row['Promo']),
                'day_of_week': int(row['DayOfWeek']),
                'month': int(row['Date'].split('-')[1]),
                'year': int(row['Date'].split('-')[0]),
                'quarter': (int(row['Date'].split('-')[1]) - 1) // 3 + 1,
                'dataset': 'rossmann'  # Mark as Rossmann data
            })
        
        return transformed_data
        
    except Exception as e:
        print(f"Error transforming Rossmann data: {e}")
        return []

def create_combined_data():
    """Create combined dataset with old and new data"""
    base_dir = Path(__file__).parent.parent.parent
    
    # Load existing sales data
    old_data_path = base_dir / "ml" / "data" / "sales_data.json"
    old_data = []
    
    try:
        with open(old_data_path, 'r') as f:
            old_data = json.load(f)
        # Mark as old data
        for item in old_data:
            item['dataset'] = 'legacy'
    except:
        print("Could not load old sales data")
    
    # Get transformed Rossmann data
    rossmann_data = transform_rossmann_data()
    
    # Combine datasets
    combined_data = old_data + rossmann_data
    
    # Sort by date
    combined_data.sort(key=lambda x: x['date'])
    
    return combined_data

def save_transformed_data():
    """Save the transformed data"""
    base_dir = Path(__file__).parent.parent.parent
    
    # Create combined sales data
    combined_data = create_combined_data()
    
    # Save combined data
    output_path = base_dir / "ml" / "data" / "combined_sales_data.json"
    with open(output_path, 'w') as f:
        json.dump(combined_data, f, indent=2)
    
    print(f"Saved {len(combined_data)} records to {output_path}")
    print(f"Legacy records: {sum(1 for item in combined_data if item.get('dataset') == 'legacy')}")
    print(f"Rossmann records: {sum(1 for item in combined_data if item.get('dataset') == 'rossmann')}")

if __name__ == "__main__":
    save_transformed_data()
