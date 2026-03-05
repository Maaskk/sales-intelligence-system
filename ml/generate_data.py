#!/usr/bin/env python3
"""
Sales Data Generator for RetailPro Analytics
Generates realistic retail sales data for ML model training.

Usage:
    python ml/generate_data.py

Output:
    ml/data/sales_data.json
"""

import json
import random
from datetime import datetime, timedelta
from pathlib import Path

# Configuration
NUM_RECORDS = 5000
START_DATE = datetime(2024, 1, 1)
END_DATE = datetime(2025, 1, 31)

# Product catalog
PRODUCTS = [
    {"id": "P001", "name": "Wireless Headphones", "category": "Electronics", "base_price": 149.99},
    {"id": "P002", "name": "Smart Watch Pro", "category": "Electronics", "base_price": 299.99},
    {"id": "P003", "name": "Running Shoes", "category": "Sports", "base_price": 89.99},
    {"id": "P004", "name": "Yoga Mat Premium", "category": "Sports", "base_price": 45.99},
    {"id": "P005", "name": "Coffee Maker Deluxe", "category": "Home", "base_price": 129.99},
    {"id": "P006", "name": "LED Desk Lamp", "category": "Home", "base_price": 59.99},
    {"id": "P007", "name": "Protein Powder", "category": "Health", "base_price": 39.99},
    {"id": "P008", "name": "Vitamin D3 Supplement", "category": "Health", "base_price": 24.99},
    {"id": "P009", "name": "Winter Jacket", "category": "Clothing", "base_price": 189.99},
    {"id": "P010", "name": "Denim Jeans", "category": "Clothing", "base_price": 69.99},
    {"id": "P011", "name": "Bluetooth Speaker", "category": "Electronics", "base_price": 79.99},
    {"id": "P012", "name": "Fitness Tracker", "category": "Electronics", "base_price": 99.99},
]

REGIONS = ["North", "South", "East", "West", "Central"]
CUSTOMER_SEGMENTS = ["Retail", "Corporate", "Online", "Wholesale"]

def generate_sales_data():
    """Generate realistic sales data with seasonal patterns."""
    data = []
    date_range = (END_DATE - START_DATE).days
    
    for i in range(NUM_RECORDS):
        # Random date within range
        random_days = random.randint(0, date_range)
        sale_date = START_DATE + timedelta(days=random_days)
        
        # Select product
        product = random.choice(PRODUCTS)
        
        # Generate quantity with some variability
        quantity = random.randint(1, 15)
        
        # Price variation (+/- 10%)
        price_variation = random.uniform(0.9, 1.1)
        unit_price = round(product["base_price"] * price_variation, 2)
        
        # Promotion logic (20% chance)
        has_promotion = random.random() < 0.20
        promo_discount = 0.85 if has_promotion else 1.0
        
        # Seasonal adjustments
        month = sale_date.month
        seasonal_factor = 1.0
        if month in [11, 12]:  # Holiday season
            seasonal_factor = 1.3
        elif month in [1, 2]:  # Post-holiday slump
            seasonal_factor = 0.8
        elif month in [6, 7, 8]:  # Summer
            seasonal_factor = 1.1
            
        # Weekend adjustment
        day_of_week = sale_date.weekday()
        weekend_factor = 0.85 if day_of_week >= 5 else 1.0
        
        # Calculate total sales
        total_sales = round(
            quantity * unit_price * promo_discount * seasonal_factor * weekend_factor, 2
        )
        
        record = {
            "id": f"S{str(i + 1).zfill(6)}",
            "date": sale_date.isoformat(),
            "product_id": product["id"],
            "product_name": product["name"],
            "category": product["category"],
            "region": random.choice(REGIONS),
            "quantity": quantity,
            "unit_price": unit_price,
            "total_sales": total_sales,
            "customer_segment": random.choice(CUSTOMER_SEGMENTS),
            "promotion": has_promotion,
            "day_of_week": day_of_week,
            "month": month,
            "year": sale_date.year,
            "quarter": (month - 1) // 3 + 1,
        }
        data.append(record)
    
    # Sort by date
    data.sort(key=lambda x: x["date"])
    return data

def main():
    print("=" * 60)
    print("RetailPro Analytics - Sales Data Generator")
    print("=" * 60)
    
    # Create output directory
    output_dir = Path(__file__).parent / "data"
    output_dir.mkdir(exist_ok=True)
    
    # Generate data
    print(f"\nGenerating {NUM_RECORDS} sales records...")
    sales_data = generate_sales_data()
    
    # Save to JSON
    output_file = output_dir / "sales_data.json"
    with open(output_file, "w") as f:
        json.dump(sales_data, f, indent=2)
    
    # Print statistics
    total_revenue = sum(r["total_sales"] for r in sales_data)
    categories = set(r["category"] for r in sales_data)
    regions = set(r["region"] for r in sales_data)
    
    print(f"\n{'Statistics':=^40}")
    print(f"Total Records: {len(sales_data):,}")
    print(f"Total Revenue: ${total_revenue:,.2f}")
    print(f"Categories: {len(categories)}")
    print(f"Regions: {len(regions)}")
    print(f"Date Range: {sales_data[0]['date'][:10]} to {sales_data[-1]['date'][:10]}")
    print(f"\nData saved to: {output_file}")
    print("=" * 60)

if __name__ == "__main__":
    main()
