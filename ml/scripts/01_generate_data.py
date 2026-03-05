#!/usr/bin/env python3
"""
Script 1: Data Generation
=========================
Generates realistic synthetic sales data for RetailPro Electronics.
This script creates a professional dataset mimicking a real retail company.

Run: python ml/scripts/01_generate_data.py
"""

import json
import random
import os
from datetime import datetime, timedelta
from pathlib import Path

# Configuration
NUM_RECORDS = 2000
START_DATE = datetime(2023, 1, 1)
END_DATE = datetime(2025, 12, 31)

# Product Catalog - RetailPro Electronics
PRODUCTS = [
    {"id": "ELEC-001", "name": "Laptop Pro 15", "category": "Electronics", "base_price": 1299, "cost": 850},
    {"id": "ELEC-002", "name": "Laptop Air 13", "category": "Electronics", "base_price": 999, "cost": 650},
    {"id": "ELEC-003", "name": "Desktop Workstation", "category": "Electronics", "base_price": 1899, "cost": 1200},
    {"id": "ELEC-004", "name": "Monitor 27 4K", "category": "Electronics", "base_price": 549, "cost": 320},
    {"id": "ELEC-005", "name": "Monitor 32 Curved", "category": "Electronics", "base_price": 699, "cost": 420},
    {"id": "ELEC-006", "name": "Webcam HD Pro", "category": "Electronics", "base_price": 129, "cost": 65},
    {"id": "ELEC-007", "name": "Noise Canceling Headphones", "category": "Electronics", "base_price": 299, "cost": 150},
    {"id": "ELEC-008", "name": "Wireless Earbuds", "category": "Electronics", "base_price": 179, "cost": 85},
    {"id": "ACC-001", "name": "Wireless Mouse Pro", "category": "Accessories", "base_price": 79, "cost": 35},
    {"id": "ACC-002", "name": "Mechanical Keyboard RGB", "category": "Accessories", "base_price": 159, "cost": 75},
    {"id": "ACC-003", "name": "USB-C Hub 7-in-1", "category": "Accessories", "base_price": 89, "cost": 40},
    {"id": "ACC-004", "name": "Laptop Stand Aluminum", "category": "Accessories", "base_price": 69, "cost": 30},
    {"id": "ACC-005", "name": "Wireless Charger Pad", "category": "Accessories", "base_price": 49, "cost": 20},
    {"id": "ACC-006", "name": "Cable Management Kit", "category": "Accessories", "base_price": 29, "cost": 12},
    {"id": "FURN-001", "name": "Standing Desk Electric", "category": "Furniture", "base_price": 699, "cost": 400},
    {"id": "FURN-002", "name": "Ergonomic Office Chair", "category": "Furniture", "base_price": 449, "cost": 250},
    {"id": "FURN-003", "name": "Monitor Arm Dual", "category": "Furniture", "base_price": 149, "cost": 70},
    {"id": "FURN-004", "name": "Desk Drawer Unit", "category": "Furniture", "base_price": 199, "cost": 100},
    {"id": "OFF-001", "name": "Desk Lamp LED Smart", "category": "Office", "base_price": 79, "cost": 35},
    {"id": "OFF-002", "name": "Whiteboard 48x36", "category": "Office", "base_price": 129, "cost": 60},
    {"id": "OFF-003", "name": "Document Scanner", "category": "Office", "base_price": 249, "cost": 130},
    {"id": "OFF-004", "name": "Label Printer Pro", "category": "Office", "base_price": 89, "cost": 45},
]

# Regions with different market characteristics
REGIONS = {
    "North": {"population_factor": 1.2, "growth_rate": 1.08},
    "South": {"population_factor": 1.0, "growth_rate": 1.05},
    "East": {"population_factor": 1.3, "growth_rate": 1.10},
    "West": {"population_factor": 1.1, "growth_rate": 1.06},
    "Central": {"population_factor": 0.8, "growth_rate": 1.03},
}

# Customer segments
CUSTOMER_SEGMENTS = {
    "Consumer": {"volume_range": (1, 3), "price_sensitivity": 0.15},
    "Business": {"volume_range": (2, 8), "price_sensitivity": 0.08},
    "Enterprise": {"volume_range": (5, 25), "price_sensitivity": 0.05},
}

# Seasonal patterns (monthly multipliers)
SEASONAL_FACTORS = {
    1: 0.85,   # January - post-holiday slowdown
    2: 0.80,   # February - low season
    3: 0.90,   # March - spring pickup
    4: 0.95,   # April
    5: 1.00,   # May
    6: 1.05,   # June - summer start
    7: 0.95,   # July - vacation season
    8: 1.10,   # August - back to school
    9: 1.15,   # September - business cycle
    10: 1.10,  # October
    11: 1.30,  # November - Black Friday
    12: 1.40,  # December - holiday peak
}

def random_date(start: datetime, end: datetime) -> datetime:
    """Generate a random date between start and end."""
    delta = end - start
    random_days = random.randint(0, delta.days)
    return start + timedelta(days=random_days)

def get_promotion_probability(month: int, day_of_week: int) -> float:
    """Calculate promotion probability based on timing."""
    base_prob = 0.15
    
    # Higher promotion probability during peak seasons
    if month in [11, 12]:
        base_prob += 0.25
    elif month in [8, 9]:
        base_prob += 0.15
    
    # Weekend promotions
    if day_of_week in [5, 6]:  # Saturday, Sunday
        base_prob += 0.10
    
    return min(base_prob, 0.50)

def generate_sale_record(record_id: int) -> dict:
    """Generate a single sale record with realistic patterns."""
    
    # Random date
    sale_date = random_date(START_DATE, END_DATE)
    
    # Select product (weighted by category popularity)
    category_weights = {"Electronics": 0.40, "Accessories": 0.35, "Furniture": 0.15, "Office": 0.10}
    category = random.choices(
        list(category_weights.keys()),
        weights=list(category_weights.values())
    )[0]
    
    category_products = [p for p in PRODUCTS if p["category"] == category]
    product = random.choice(category_products)
    
    # Select region
    region = random.choice(list(REGIONS.keys()))
    region_data = REGIONS[region]
    
    # Select customer segment (weighted)
    segment_weights = {"Consumer": 0.55, "Business": 0.35, "Enterprise": 0.10}
    segment = random.choices(
        list(segment_weights.keys()),
        weights=list(segment_weights.values())
    )[0]
    segment_data = CUSTOMER_SEGMENTS[segment]
    
    # Calculate quantity
    min_qty, max_qty = segment_data["volume_range"]
    quantity = random.randint(min_qty, max_qty)
    
    # Determine if promotion is active
    promotion_prob = get_promotion_probability(sale_date.month, sale_date.weekday())
    has_promotion = random.random() < promotion_prob
    
    # Calculate price
    base_price = product["base_price"]
    
    # Apply seasonal factor
    seasonal_factor = SEASONAL_FACTORS[sale_date.month]
    
    # Apply promotion discount
    promotion_discount = random.uniform(0.10, 0.25) if has_promotion else 0
    
    # Apply slight price variation
    price_variation = random.uniform(-0.05, 0.05)
    
    # Final unit price
    unit_price = round(base_price * (1 - promotion_discount) * (1 + price_variation), 2)
    
    # Calculate total sales
    total_sales = round(quantity * unit_price, 2)
    
    # Apply regional and seasonal adjustments to simulate realistic patterns
    # (This affects the overall distribution but keeps individual records valid)
    
    return {
        "id": f"TXN-{record_id:06d}",
        "date": sale_date.isoformat(),
        "product_id": product["id"],
        "product_name": product["name"],
        "category": category,
        "region": region,
        "quantity": quantity,
        "unit_price": unit_price,
        "total_sales": total_sales,
        "customer_segment": segment,
        "promotion": has_promotion,
        "day_of_week": sale_date.weekday(),
        "month": sale_date.month,
        "year": sale_date.year,
        "quarter": (sale_date.month - 1) // 3 + 1,
    }

def generate_dataset() -> list:
    """Generate the complete dataset."""
    print("Generating sales dataset...")
    print(f"  - Number of records: {NUM_RECORDS}")
    print(f"  - Date range: {START_DATE.date()} to {END_DATE.date()}")
    print(f"  - Products: {len(PRODUCTS)}")
    print(f"  - Regions: {len(REGIONS)}")
    print()
    
    data = []
    for i in range(1, NUM_RECORDS + 1):
        record = generate_sale_record(i)
        data.append(record)
        
        if i % 500 == 0:
            print(f"  Generated {i}/{NUM_RECORDS} records...")
    
    # Sort by date
    data.sort(key=lambda x: x["date"])
    
    return data

def print_statistics(data: list):
    """Print dataset statistics."""
    print("\n" + "=" * 50)
    print("DATASET STATISTICS")
    print("=" * 50)
    
    total_revenue = sum(d["total_sales"] for d in data)
    total_quantity = sum(d["quantity"] for d in data)
    
    print(f"\nTotal Records: {len(data)}")
    print(f"Total Revenue: ${total_revenue:,.2f}")
    print(f"Total Units Sold: {total_quantity:,}")
    print(f"Average Order Value: ${total_revenue / len(data):,.2f}")
    
    # By category
    print("\nBy Category:")
    categories = {}
    for d in data:
        cat = d["category"]
        if cat not in categories:
            categories[cat] = {"count": 0, "revenue": 0}
        categories[cat]["count"] += 1
        categories[cat]["revenue"] += d["total_sales"]
    
    for cat, stats in sorted(categories.items(), key=lambda x: x[1]["revenue"], reverse=True):
        print(f"  {cat}: {stats['count']} orders, ${stats['revenue']:,.2f} revenue")
    
    # By region
    print("\nBy Region:")
    regions = {}
    for d in data:
        reg = d["region"]
        if reg not in regions:
            regions[reg] = {"count": 0, "revenue": 0}
        regions[reg]["count"] += 1
        regions[reg]["revenue"] += d["total_sales"]
    
    for reg, stats in sorted(regions.items(), key=lambda x: x[1]["revenue"], reverse=True):
        print(f"  {reg}: {stats['count']} orders, ${stats['revenue']:,.2f} revenue")
    
    # Promotion impact
    promo_sales = [d for d in data if d["promotion"]]
    non_promo_sales = [d for d in data if not d["promotion"]]
    
    print(f"\nPromotion Impact:")
    print(f"  With promotion: {len(promo_sales)} orders ({len(promo_sales)/len(data)*100:.1f}%)")
    print(f"  Without promotion: {len(non_promo_sales)} orders ({len(non_promo_sales)/len(data)*100:.1f}%)")

def main():
    """Main execution function."""
    print("=" * 50)
    print("RETAILPRO SALES DATA GENERATOR")
    print("=" * 50)
    print()
    
    # Create directories
    data_dir = Path(__file__).parent.parent / "data"
    data_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate data
    data = generate_dataset()
    
    # Save to JSON
    output_path = data_dir / "sales_data.json"
    with open(output_path, "w") as f:
        json.dump(data, f, indent=2)
    
    print(f"\nData saved to: {output_path}")
    
    # Print statistics
    print_statistics(data)
    
    print("\n" + "=" * 50)
    print("DATA GENERATION COMPLETE")
    print("=" * 50)
    print("\nNext step: Run 02_train_model.py to train the ML model")

if __name__ == "__main__":
    main()
