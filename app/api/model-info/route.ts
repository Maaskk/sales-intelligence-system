import { NextResponse } from "next/server"
import { readFileSync, existsSync } from "fs"
import { join } from "path"

export async function GET() {
  try {
    // Try XGBoost model info first
    const xgbModelInfoPath = join(process.cwd(), "ml", "output", "model_info_xgb.json")
    
    if (existsSync(xgbModelInfoPath)) {
      const fileContent = readFileSync(xgbModelInfoPath, "utf-8")
      const modelInfo = JSON.parse(fileContent)
      
      return NextResponse.json({
        ...modelInfo,
        source: "xgboost_rossmann"
      })
    }

    // Fallback to original model info
    const modelInfoPath = join(process.cwd(), "ml", "output", "model_info.json")

    if (!existsSync(modelInfoPath)) {
      // Return demo model info if file doesn't exist
      return NextResponse.json({
        ...generateDemoModelInfo(),
        source: "demo"
      })
    }

    const fileContent = readFileSync(modelInfoPath, "utf-8")
    const modelInfo = JSON.parse(fileContent)

    return NextResponse.json({
      ...modelInfo,
      source: "file"
    })
  } catch (error) {
    console.error("Error loading model info:", error)
    return NextResponse.json({
      ...generateDemoModelInfo(),
      source: "demo"
    })
  }
}

function generateDemoModelInfo() {
  return {
    model_type: "Regression",
    algorithm: "Random Forest",
    features: [
      "quantity",
      "unit_price",
      "day_of_week",
      "month",
      "quarter",
      "promotion",
      "category_encoded",
      "region_encoded",
      "customer_segment_encoded",
    ],
    training_date: new Date().toISOString(),
    metrics: {
      mae: 245.32,
      rmse: 312.87,
      r2_score: 0.847,
      mape: 8.23,
    },
    training_samples: 400,
    test_samples: 100,
    feature_importance: {
      unit_price: 0.285,
      quantity: 0.234,
      promotion: 0.142,
      month: 0.098,
      category_encoded: 0.087,
      region_encoded: 0.065,
      day_of_week: 0.045,
      quarter: 0.028,
      customer_segment_encoded: 0.016,
    },
  }
}
