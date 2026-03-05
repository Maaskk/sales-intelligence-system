# RetailPro - Intelligent Sales Forecasting System

## TP2 Scrum Project - Machine Learning Sales Prediction

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Business Context](#business-context)
3. [Technical Architecture](#technical-architecture)
4. [Installation Guide](#installation-guide)
5. [Running the Project](#running-the-project)
6. [ML Model Documentation](#ml-model-documentation)
7. [API Documentation](#api-documentation)
8. [Scrum Documentation](#scrum-documentation)
9. [Project Structure](#project-structure)

---

## Project Overview

**RetailPro** is an intelligent sales forecasting system designed for a retail electronics company. The system uses Machine Learning to analyze historical sales data and predict future sales, helping businesses make data-driven decisions.

### Key Features

- **Sales Analytics Dashboard**: Interactive visualizations of historical sales data
- **ML-Powered Predictions**: 30-day sales forecasts with confidence intervals
- **Product Performance Analysis**: Insights into top-performing products
- **Regional Analysis**: Geographic breakdown of sales performance
- **Custom Predictions**: Real-time predictions based on user inputs
- **Export Functionality**: Download reports in CSV format

### Technology Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 16, React, TypeScript, Tailwind CSS |
| UI Components | shadcn/ui, Recharts |
| Backend | Next.js API Routes |
| ML Model | Python, scikit-learn, Random Forest |
| Data Format | JSON |

---

## Business Context

### Problem Statement

Retail businesses face challenges in:
- Anticipating future demand
- Managing inventory effectively
- Making informed pricing decisions
- Allocating resources across regions

### Solution

RetailPro provides:
- Accurate sales forecasts using ML
- Visual insights for decision makers
- Product and regional performance metrics
- Confidence intervals for risk assessment

### Target Users

| User | Role | Use Case |
|------|------|----------|
| Commercial Manager | Sales Planning | Forecast-based target setting |
| Logistics Manager | Inventory | Stock level optimization |
| Executive Team | Strategy | Business performance overview |
| Data Analyst | Analysis | Model validation and insights |

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js)                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│
│  │  Dashboard  │ │  Charts     │ │  Data Tables            ││
│  │  Components │ │  (Recharts) │ │  (Product/Regional)     ││
│  └─────────────┘ └─────────────┘ └─────────────────────────┘│
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP Requests
┌────────────────────────▼────────────────────────────────────┐
│                   API ROUTES (Next.js)                       │
│  ┌────────────┐ ┌──────────────┐ ┌────────────┐ ┌─────────┐│
│  │ /api/sales │ │/api/predict  │ │/api/model  │ │/api/    ││
│  │            │ │              │ │  -info     │ │ export  ││
│  └────────────┘ └──────────────┘ └────────────┘ └─────────┘│
└────────────────────────┬────────────────────────────────────┘
                         │ File I/O
┌────────────────────────▼────────────────────────────────────┐
│                    ML PIPELINE (Python)                      │
│  ┌────────────┐ ┌──────────────┐ ┌─────────────────────────┐│
│  │ Data Gen   │ │ Model Train  │ │ Prediction Generator    ││
│  │ Script     │→│ Script       │→│ Script                  ││
│  └────────────┘ └──────────────┘ └─────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## Installation Guide

### Prerequisites

- **Node.js** >= 18.0.0
- **Python** >= 3.8
- **pip** (Python package manager)

### Step 1: Clone/Download the Project

```bash
# If using Git
git clone <repository-url>
cd retailpro-sales-prediction

# Or download and extract the ZIP file
```

### Step 2: Install Node.js Dependencies

```bash
npm install
```

### Step 3: Install Python Dependencies

```bash
pip install -r ml/requirements.txt
```

---

## Running the Project

### Quick Start (3 Commands)

```bash
# 1. Generate the sales dataset
python ml/scripts/01_generate_data.py

# 2. Train the ML model
python ml/scripts/02_train_model.py

# 3. Generate predictions
python ml/scripts/03_generate_predictions.py

# 4. Start the web application
npm run dev
```

Then open your browser at: **http://localhost:3000**

### Alternative: Run All ML Scripts at Once

```bash
python ml/scripts/run_all.py
npm run dev
```

### What Each Script Does

| Script | Purpose | Output |
|--------|---------|--------|
| `01_generate_data.py` | Creates synthetic sales dataset | `ml/data/sales_data.json` |
| `02_train_model.py` | Trains Random Forest model | `ml/output/model.pkl`, `model_info.json` |
| `03_generate_predictions.py` | Generates 30-day forecast | `ml/output/predictions.json` |

---

## ML Model Documentation

### Algorithm: Random Forest Regressor

Random Forest was chosen for its:
- High accuracy on tabular data
- Robustness to outliers
- Built-in feature importance
- No need for feature scaling
- Handles non-linear relationships

### Features Used

| Feature | Type | Description |
|---------|------|-------------|
| `quantity` | Numeric | Number of items sold |
| `unit_price` | Numeric | Price per unit |
| `day_of_week` | Categorical (0-6) | Day of the week |
| `month` | Categorical (1-12) | Month of the year |
| `quarter` | Categorical (1-4) | Business quarter |
| `promotion` | Binary (0/1) | Promotion active |
| `category_encoded` | Encoded | Product category |
| `region_encoded` | Encoded | Sales region |
| `customer_segment_encoded` | Encoded | Customer type |

### Model Performance Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| **R² Score** | Variance explained | > 0.80 |
| **MAE** | Mean Absolute Error | Minimize |
| **RMSE** | Root Mean Square Error | Minimize |
| **MAPE** | Mean Absolute % Error | < 15% |

### Prediction Confidence Intervals

Predictions include:
- **Point estimate**: Most likely value
- **Lower bound**: Conservative estimate (85% confidence)
- **Upper bound**: Optimistic estimate (85% confidence)

---

## API Documentation

### GET /api/sales

Returns historical sales data.

**Response:**
```json
{
  "data": [
    {
      "id": "TXN-000001",
      "date": "2023-01-15T00:00:00.000Z",
      "product_name": "Laptop Pro 15",
      "category": "Electronics",
      "region": "North",
      "quantity": 2,
      "unit_price": 1299,
      "total_sales": 2598,
      "promotion": false
    }
  ],
  "source": "file"
}
```

### GET /api/predictions

Returns 30-day sales forecast.

**Response:**
```json
{
  "predictions": [
    {
      "date": "2024-02-06",
      "predicted_sales": 15234.50,
      "confidence_lower": 12950.00,
      "confidence_upper": 17519.00,
      "trend": "up"
    }
  ],
  "source": "file"
}
```

### GET /api/model-info

Returns ML model metadata and performance metrics.

**Response:**
```json
{
  "model_type": "Regression",
  "algorithm": "Random Forest",
  "features": ["quantity", "unit_price", ...],
  "metrics": {
    "mae": 245.32,
    "rmse": 312.87,
    "r2_score": 0.847,
    "mape": 8.23
  },
  "feature_importance": {
    "unit_price": 0.285,
    "quantity": 0.234
  }
}
```

### POST /api/predict

Generate custom prediction.

**Request:**
```json
{
  "category": "Electronics",
  "region": "North",
  "promotion": true,
  "quantity": 5,
  "unit_price": 500
}
```

**Response:**
```json
{
  "predicted_sales": 2875.50,
  "confidence": 0.85
}
```

### GET /api/export

Downloads sales data as CSV file.

---

## Scrum Documentation

### Project Following TP2 Scrum Methodology

#### Product Backlog

| ID | User Story | Priority | Status |
|----|------------|----------|--------|
| US1 | Access historical sales data | High | Done |
| US2 | Predict future sales | High | Done |
| US3 | Visualize results | Medium | Done |
| US4 | Verify prediction quality | High | Done |

#### Sprint Breakdown

**Sprint 1: Analysis & Preparation**
- [x] Define project requirements
- [x] Design data schema
- [x] Plan ML approach

**Sprint 2: Development**
- [x] Implement data generation
- [x] Build ML pipeline
- [x] Create API endpoints
- [x] Develop dashboard UI

**Sprint 3: Verification & Improvement**
- [x] Test model accuracy
- [x] Validate predictions
- [x] Optimize performance

**Sprint 4: Testing & Delivery**
- [x] Final testing
- [x] Documentation
- [x] Project delivery

#### Scrum Team Roles

| Role | Responsibilities |
|------|------------------|
| Product Owner | Defined requirements, prioritized backlog |
| Scrum Master | Ensured methodology compliance |
| Development Team | Built the complete solution |

---

## Project Structure

```
retailpro-sales-prediction/
│
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── sales/route.ts        # Sales data endpoint
│   │   ├── predictions/route.ts  # Predictions endpoint
│   │   ├── model-info/route.ts   # Model info endpoint
│   │   ├── predict/route.ts      # Custom prediction endpoint
│   │   └── export/route.ts       # CSV export endpoint
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main dashboard page
│
├── components/
│   ├── dashboard/                # Dashboard components
│   │   ├── header.tsx            # App header
│   │   ├── kpi-cards.tsx         # KPI summary cards
│   │   ├── sales-chart.tsx       # Sales trend chart
│   │   ├── prediction-panel.tsx  # Prediction display
│   │   ├── product-performance.tsx
│   │   ├── regional-analysis.tsx
│   │   ├── data-table.tsx        # Sales data table
│   │   └── model-metrics.tsx     # ML model info
│   └── ui/                       # shadcn/ui components
│
├── lib/
│   ├── types.ts                  # TypeScript interfaces
│   └── utils.ts                  # Utility functions
│
├── ml/                           # Machine Learning
│   ├── scripts/
│   │   ├── 01_generate_data.py   # Data generation
│   │   ├── 02_train_model.py     # Model training
│   │   ├── 03_generate_predictions.py
│   │   └── run_all.py            # Run entire pipeline
│   ├── data/                     # Generated data (created by scripts)
│   │   └── sales_data.json
│   ├── output/                   # Model outputs (created by scripts)
│   │   ├── model.pkl
│   │   ├── encoders.pkl
│   │   ├── model_info.json
│   │   └── predictions.json
│   └── requirements.txt          # Python dependencies
│
├── PROJECT_DOCUMENTATION.md      # This file
├── package.json                  # Node.js dependencies
└── tsconfig.json                 # TypeScript config
```

---

## Troubleshooting

### Common Issues

**1. "Module not found: scikit-learn"**
```bash
pip install scikit-learn numpy
```

**2. "Data file not found"**
```bash
# Make sure to run the data generation script first
python ml/scripts/01_generate_data.py
```

**3. "Model not found"**
```bash
# Run the training script before predictions
python ml/scripts/02_train_model.py
```

**4. Dashboard shows demo data**
- The dashboard works with demo data even without running Python scripts
- For real predictions, run all ML scripts first

---

## Sample Screenshots

### Dashboard Overview
- KPI cards showing total revenue, orders, predictions
- Sales trend chart with historical data and ML forecasts
- Product performance breakdown

### Predictions Tab
- 30-day forecast table
- Confidence intervals
- Trend indicators
- Custom prediction calculator

### Model Info Tab
- Model type and algorithm
- Performance metrics (R², MAE, RMSE, MAPE)
- Feature importance chart
- Training statistics

---

## License

This project was created for educational purposes as part of TP2 Scrum methodology training.

---

## Contact

For questions or issues, please refer to the project documentation or contact the development team.
