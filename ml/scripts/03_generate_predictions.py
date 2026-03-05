#!/usr/bin/env python3
"""
Script 3: Generate Predictions
==============================
Uses the trained model to generate 30-day sales forecasts.
Outputs predictions with confidence intervals.

Run: python ml/scripts/03_generate_predictions.py
"""

import json
import pickle
import numpy as np
from datetime import datetime, timedelta
from pathlib import Path

# Try to import sklearn
try:
    from sklearn.ensemble import RandomForestRegressor
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False

def load_model(model_dir: Path) -> tuple:
    """Load trained model and encoders."""
    model_path = model_dir / "model.pkl"
    encoders_path = model_dir / "encoders.pkl"
    
    if not model_path.exists():
        raise FileNotFoundError(
            f"Model not found: {model_path}\n"
            "Please run 02_train_model.py first."
        )
    
    with open(model_path, "rb") as f:
        model = pickle.load(f)
    
    with open(encoders_path, "rb") as f:
        encoders = pickle.load(f)
    
    return model, encoders

def load_historical_data(data_path: Path) -> list:
    """Load historical sales data for analysis."""
    with open(data_path, "r") as f:
        return json.load(f)

def analyze_historical_patterns(data: list) -> dict:
    """Analyze historical data to inform predictions."""
    
    # Calculate average daily sales
    daily_sales = {}
    for record in data:
        date = record["date"].split("T")[0]
        if date not in daily_sales:
            daily_sales[date] = 0
        daily_sales[date] += record["total_sales"]
    
    sales_values = list(daily_sales.values())
    
    patterns = {
        "avg_daily_sales": np.mean(sales_values),
        "std_daily_sales": np.std(sales_values),
        "min_daily_sales": np.min(sales_values),
        "max_daily_sales": np.max(sales_values),
    }
    
    # Day of week patterns
    dow_sales = {i: [] for i in range(7)}
    for record in data:
        dow_sales[record["day_of_week"]].append(record["total_sales"])
    
    patterns["dow_multipliers"] = {
        dow: np.mean(sales) / patterns["avg_daily_sales"] * len(data) / len(sales)
        for dow, sales in dow_sales.items()
        if sales
    }
    
    # Monthly patterns
    month_sales = {i: [] for i in range(1, 13)}
    for record in data:
        month_sales[record["month"]].append(record["total_sales"])
    
    patterns["month_multipliers"] = {
        month: np.mean(sales) / patterns["avg_daily_sales"] * len(data) / len(sales)
        for month, sales in month_sales.items()
        if sales
    }
    
    return patterns

def generate_predictions(model, encoders: dict, patterns: dict, 
                        num_days: int = 30) -> list:
    """Generate sales predictions for the next N days."""
    print(f"\nGenerating {num_days}-day forecast...")
    
    predictions = []
    today = datetime.now()
    
    # Get most common values for categorical features
    # (In a real system, you might aggregate predictions across all combinations)
    default_category_encoded = 0  # Electronics
    default_region_encoded = 0    # First region
    default_segment_encoded = 1   # Business
    
    # Average values for numeric features
    avg_quantity = 5
    avg_unit_price = 400
    
    previous_prediction = patterns["avg_daily_sales"]
    
    for day_offset in range(1, num_days + 1):
        future_date = today + timedelta(days=day_offset)
        
        day_of_week = future_date.weekday()
        month = future_date.month
        quarter = (month - 1) // 3 + 1
        
        # Adjust for promotions (weekends and holiday season)
        is_weekend = day_of_week in [5, 6]
        is_holiday_season = month in [11, 12]
        has_promotion = is_weekend or is_holiday_season
        
        # Build feature vector
        features = np.array([[
            avg_quantity,
            avg_unit_price,
            day_of_week,
            month,
            quarter,
            1 if has_promotion else 0,
            default_category_encoded,
            default_region_encoded,
            default_segment_encoded,
        ]])
        
        # Make prediction
        base_prediction = model.predict(features)[0]
        
        # Scale to daily level (model predicts per-transaction, we want daily)
        # Estimate number of daily transactions
        dow_mult = patterns["dow_multipliers"].get(day_of_week, 1.0)
        month_mult = patterns["month_multipliers"].get(month, 1.0)
        
        # Scale prediction
        daily_prediction = base_prediction * dow_mult * month_mult * 20  # ~20 transactions/day
        
        # Add some realistic variation
        noise_factor = np.random.normal(1.0, 0.08)
        daily_prediction *= noise_factor
        
        # Ensure reasonable bounds
        daily_prediction = max(
            patterns["min_daily_sales"] * 0.8,
            min(patterns["max_daily_sales"] * 1.2, daily_prediction)
        )
        
        # Calculate confidence interval (wider for further dates)
        confidence_width = patterns["std_daily_sales"] * (1 + day_offset * 0.02)
        confidence_lower = max(0, daily_prediction - confidence_width)
        confidence_upper = daily_prediction + confidence_width
        
        # Determine trend
        if daily_prediction > previous_prediction * 1.05:
            trend = "up"
        elif daily_prediction < previous_prediction * 0.95:
            trend = "down"
        else:
            trend = "stable"
        
        predictions.append({
            "date": future_date.strftime("%Y-%m-%d"),
            "predicted_sales": round(daily_prediction, 2),
            "confidence_lower": round(confidence_lower, 2),
            "confidence_upper": round(confidence_upper, 2),
            "trend": trend,
        })
        
        previous_prediction = daily_prediction
    
    return predictions

def save_predictions(predictions: list, output_dir: Path):
    """Save predictions to JSON file."""
    output_path = output_dir / "predictions.json"
    
    with open(output_path, "w") as f:
        json.dump(predictions, f, indent=2)
    
    print(f"  - Predictions saved to: {output_path}")

def print_forecast_summary(predictions: list):
    """Print a summary of the forecast."""
    print("\n" + "=" * 50)
    print("30-DAY FORECAST SUMMARY")
    print("=" * 50)
    
    total_predicted = sum(p["predicted_sales"] for p in predictions)
    avg_daily = total_predicted / len(predictions)
    
    print(f"\nTotal Predicted Revenue: ${total_predicted:,.2f}")
    print(f"Average Daily Sales: ${avg_daily:,.2f}")
    
    # Trend analysis
    up_days = sum(1 for p in predictions if p["trend"] == "up")
    down_days = sum(1 for p in predictions if p["trend"] == "down")
    stable_days = sum(1 for p in predictions if p["trend"] == "stable")
    
    print(f"\nTrend Distribution:")
    print(f"  - Upward days: {up_days}")
    print(f"  - Downward days: {down_days}")
    print(f"  - Stable days: {stable_days}")
    
    # Best and worst days
    best_day = max(predictions, key=lambda x: x["predicted_sales"])
    worst_day = min(predictions, key=lambda x: x["predicted_sales"])
    
    print(f"\nBest Predicted Day: {best_day['date']} - ${best_day['predicted_sales']:,.2f}")
    print(f"Lowest Predicted Day: {worst_day['date']} - ${worst_day['predicted_sales']:,.2f}")
    
    # Weekly breakdown
    print("\nWeekly Breakdown:")
    for week in range(4):
        week_data = predictions[week*7:(week+1)*7]
        week_total = sum(p["predicted_sales"] for p in week_data)
        print(f"  Week {week+1}: ${week_total:,.2f}")
    
    # First 10 days preview
    print("\nFirst 10 Days Preview:")
    print("-" * 60)
    print(f"{'Date':<12} {'Predicted':>12} {'Range':>25} {'Trend':>8}")
    print("-" * 60)
    
    for pred in predictions[:10]:
        range_str = f"${pred['confidence_lower']:,.0f} - ${pred['confidence_upper']:,.0f}"
        print(f"{pred['date']:<12} ${pred['predicted_sales']:>10,.2f} {range_str:>25} {pred['trend']:>8}")

def main():
    """Main prediction pipeline."""
    print("=" * 50)
    print("RETAILPRO SALES FORECASTING")
    print("=" * 50)
    print()
    
    # Paths
    base_dir = Path(__file__).parent.parent
    data_path = base_dir / "data" / "sales_data.json"
    model_dir = base_dir / "output"
    
    # Load model
    print("Loading trained model...")
    model, encoders = load_model(model_dir)
    print("  - Model loaded successfully")
    
    # Load and analyze historical data
    print("\nAnalyzing historical patterns...")
    historical_data = load_historical_data(data_path)
    patterns = analyze_historical_patterns(historical_data)
    print(f"  - Average daily sales: ${patterns['avg_daily_sales']:,.2f}")
    print(f"  - Sales std dev: ${patterns['std_daily_sales']:,.2f}")
    
    # Generate predictions
    predictions = generate_predictions(model, encoders, patterns, num_days=30)
    
    # Save predictions
    save_predictions(predictions, model_dir)
    
    # Print summary
    print_forecast_summary(predictions)
    
    print("\n" + "=" * 50)
    print("PREDICTION GENERATION COMPLETE")
    print("=" * 50)
    print("\nThe dashboard is now ready!")
    print("Start the Next.js app with: npm run dev")
    print("Then open: http://localhost:3000")

if __name__ == "__main__":
    main()
