# How to Run RetailPro Sales Prediction System

## Quick Start Guide

This guide will help you run the complete project in just a few minutes.

---

## Prerequisites

Before starting, make sure you have installed:

1. **Node.js** (version 18 or higher)
   - Download from: https://nodejs.org/
   - Verify: `node --version`

2. **Python** (version 3.8 or higher)
   - Download from: https://python.org/
   - Verify: `python --version` or `python3 --version`

3. **pip** (Python package manager)
   - Usually comes with Python
   - Verify: `pip --version` or `pip3 --version`

---

## Step-by-Step Instructions

### Step 1: Install Dependencies

Open a terminal in the project folder and run:

```bash
# Install Node.js packages
npm install

# Install Python packages
pip install -r ml/requirements.txt
```

**Note for Mac/Linux users:** You may need to use `pip3` instead of `pip`.

---

### Step 2: Run the ML Pipeline

Run these three commands in order:

```bash
# Command 1: Generate sales data
python ml/scripts/01_generate_data.py

# Command 2: Train the ML model
python ml/scripts/02_train_model.py

# Command 3: Generate predictions
python ml/scripts/03_generate_predictions.py
```

**Alternative - Run all at once:**
```bash
python ml/scripts/run_all.py
```

**Note for Mac/Linux users:** You may need to use `python3` instead of `python`.

---

### Step 3: Start the Web Application

```bash
npm run dev
```

---

### Step 4: Open the Dashboard

Open your web browser and go to:

**http://localhost:3000**

---

## What You Will See

1. **Dashboard Overview**
   - KPI cards with revenue, orders, and predictions
   - Sales trend chart showing historical data and forecasts
   - Product performance breakdown

2. **Predictions Tab**
   - 30-day sales forecast
   - Confidence intervals for each prediction
   - Custom prediction calculator

3. **Products Tab**
   - Product-by-product performance analysis
   - Category distribution

4. **Regions Tab**
   - Geographic sales breakdown
   - Regional comparison charts

5. **Model Info Tab**
   - ML model performance metrics
   - Feature importance analysis

---

## Troubleshooting

### Problem: "python command not found"

**Solution:** Use `python3` instead:
```bash
python3 ml/scripts/01_generate_data.py
```

### Problem: "pip command not found"

**Solution:** Use `pip3` instead:
```bash
pip3 install -r ml/requirements.txt
```

### Problem: "Module not found: sklearn"

**Solution:** Install scikit-learn manually:
```bash
pip install scikit-learn numpy
```

### Problem: "npm command not found"

**Solution:** Install Node.js from https://nodejs.org/

### Problem: Dashboard shows "Error Loading Data"

**Solution:** Make sure you ran all three Python scripts before starting the web app.

---

## File Locations

After running the scripts, these files will be created:

| File | Location | Description |
|------|----------|-------------|
| Sales Data | `ml/data/sales_data.json` | Historical sales records |
| Trained Model | `ml/output/model.pkl` | Saved ML model |
| Model Info | `ml/output/model_info.json` | Model metadata |
| Predictions | `ml/output/predictions.json` | 30-day forecast |

---

## Summary of Commands

```bash
# Install everything
npm install
pip install -r ml/requirements.txt

# Run ML pipeline
python ml/scripts/run_all.py

# Start web app
npm run dev

# Open browser: http://localhost:3000
```

That's it! The dashboard should now be fully functional with real ML predictions.
