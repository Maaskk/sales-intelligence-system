# RetailPro Analytics - ML Sales Forecasting Dashboard

A professional, full-stack sales forecasting application built with Next.js 16 and Machine Learning. This project demonstrates an intelligent retail analytics dashboard that uses Random Forest regression to predict future sales.

## Project Overview

**Project Name:** RetailPro Analytics  
**Project Type:** Sales Prediction System with ML Integration  
**Course:** TP2 Scrum - Machine Learning Project  

### Features

- **Real-time Dashboard** - Interactive KPI cards, charts, and data tables
- **ML Sales Forecasting** - 30-day predictions using Random Forest algorithm
- **Product Performance Analysis** - Revenue breakdown by product and category
- **Regional Analysis** - Geographic sales distribution with radar charts
- **Custom Predictions** - On-demand predictions with customizable parameters
- **Data Export** - CSV export functionality for reporting
- **Model Metrics** - Full transparency on ML model performance

---

## Quick Start (Frontend Only)

The dashboard works immediately with demo data - no Python setup required!

```bash
# Clone or download the project
cd retailpro-analytics

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

---

## Full Setup (With Python ML)

### Prerequisites

- **Node.js** 18+ 
- **Python** 3.9+
- **npm** or **yarn**

### Step 1: Install Frontend Dependencies

```bash
npm install
```

### Step 2: Set Up Python Environment

```bash
# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r ml/requirements.txt
```

### Step 3: Generate Sales Data

```bash
python ml/generate_data.py
```

This creates `ml/data/sales_data.json` with 5,000 realistic sales records.

### Step 4: Train the ML Model

```bash
python ml/train_model.py
```

This trains the Random Forest model and outputs:
- `ml/output/model.pkl` - Trained model
- `ml/output/model_info.json` - Model metadata and metrics
- `ml/output/predictions.json` - 30-day sales forecast

### Step 5: Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

---

## Project Structure

```
retailpro-analytics/
├── app/
│   ├── api/                    # API Routes
│   │   ├── sales/route.ts      # GET sales data
│   │   ├── predictions/route.ts # GET ML predictions
│   │   ├── predict/route.ts    # POST custom prediction
│   │   ├── model-info/route.ts # GET model metrics
│   │   └── export/route.ts     # GET CSV export
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Main dashboard
├── components/
│   ├── dashboard/
│   │   ├── header.tsx          # Navigation header
│   │   ├── kpi-cards.tsx       # Key performance indicators
│   │   ├── sales-chart.tsx     # Sales trend chart
│   │   ├── prediction-panel.tsx # Forecast table & custom predict
│   │   ├── product-performance.tsx # Product analytics
│   │   ├── regional-analysis.tsx   # Regional breakdown
│   │   ├── data-table.tsx      # Searchable data grid
│   │   └── model-metrics.tsx   # ML model info
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── types.ts                # TypeScript interfaces
│   ├── utils.ts                # Utility functions
│   └── mock-data.ts            # Demo data generator
├── ml/
│   ├── data/                   # Generated sales data
│   ├── output/                 # Model outputs
│   ├── generate_data.py        # Data generation script
│   ├── train_model.py          # Model training script
│   └── requirements.txt        # Python dependencies
└── README.md                   # This file
```

---

## Technology Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Modern UI components
- **Recharts** - Data visualization library
- **Lucide React** - Icon library

### Backend
- **Next.js API Routes** - RESTful endpoints
- **Python 3.9+** - ML model training
- **scikit-learn** - Machine learning library
- **pandas** - Data manipulation
- **NumPy** - Numerical computing

### ML Model
- **Algorithm:** Random Forest Regressor
- **Features:** 9 input variables
- **Target:** Total sales prediction
- **Metrics:** R², MAE, RMSE, MAPE

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/sales` | GET | Retrieve all sales data |
| `/api/predictions` | GET | Get 30-day ML predictions |
| `/api/model-info` | GET | Get model performance metrics |
| `/api/predict` | POST | Custom prediction with parameters |
| `/api/export` | GET | Download sales data as CSV |

### Custom Prediction Request

```json
POST /api/predict
{
  "category": "Electronics",
  "region": "North",
  "promotion": true,
  "quantity": 10,
  "unit_price": 149.99
}
```

---

## Dashboard Tabs

1. **Overview** - KPIs, sales trend chart, top products, and data table
2. **Predictions** - 30-day forecast with confidence intervals
3. **Products** - Detailed product performance and category breakdown
4. **Regions** - Geographic analysis with radar charts
5. **Model Info** - ML model metrics and feature importance

---

## Model Performance

After training, expect metrics similar to:

| Metric | Value | Description |
|--------|-------|-------------|
| R² Score | ~0.85 | 85% variance explained |
| MAE | ~$250 | Average prediction error |
| RMSE | ~$320 | Root mean square error |
| MAPE | ~8% | Mean absolute percentage error |

---

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Deploy (frontend works automatically)

Note: Python ML scripts run locally. For production, consider:
- Pre-generating predictions
- Using a cloud ML service (AWS SageMaker, GCP AI Platform)
- Deploying Python backend separately

### Docker

```dockerfile
# Dockerfile example for full-stack deployment
FROM node:18-alpine AS frontend
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM python:3.9-slim AS ml
WORKDIR /ml
COPY ml/requirements.txt .
RUN pip install -r requirements.txt
COPY ml/ .

FROM node:18-alpine
WORKDIR /app
COPY --from=frontend /app/.next ./.next
COPY --from=frontend /app/public ./public
COPY --from=frontend /app/package*.json ./
RUN npm install --production
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Scrum Project Details

### Product Backlog Items (PBIs)

1. ✅ Sales data generation and storage
2. ✅ ML model training pipeline
3. ✅ Interactive dashboard UI
4. ✅ KPI visualization cards
5. ✅ Sales trend charts with predictions
6. ✅ Product performance analysis
7. ✅ Regional sales breakdown
8. ✅ Custom prediction interface
9. ✅ Data export functionality
10. ✅ Model metrics transparency

### Sprint Deliverables

- **Sprint 1:** Data pipeline & ML model
- **Sprint 2:** Dashboard UI & visualizations
- **Sprint 3:** API integration & polish

---

## Troubleshooting

### "No data" showing in dashboard
- The app works with demo data by default
- For custom data, run Python scripts first

### Python import errors
```bash
pip install -r ml/requirements.txt
```

### Model not loading
- Ensure `ml/output/` directory exists
- Run `python ml/train_model.py`

### Port 3000 in use
```bash
npm run dev -- -p 3001
```

---

## License

MIT License - Free for educational and commercial use.

---

## Author

Created for TP2 Scrum - Machine Learning Project

**RetailPro Analytics** - Intelligent Sales Forecasting System
