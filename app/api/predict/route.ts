import { NextResponse } from "next/server"

interface PredictRequest {
  category: string
  region: string
  promotion: boolean
  quantity: number
  unit_price: number
}

export async function POST(request: Request) {
  try {
    const body: PredictRequest = await request.json()

    // Validate input
    if (!body.category || !body.region || body.quantity === undefined || body.unit_price === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: category, region, quantity, unit_price" },
        { status: 400 }
      )
    }

    // Simple prediction model (mimics ML prediction)
    // In production, this would call the actual ML model
    const prediction = calculatePrediction(body)

    return NextResponse.json({
      predicted_sales: prediction,
      input: body,
      confidence: 0.85,
    })
  } catch (error) {
    console.error("Prediction error:", error)
    return NextResponse.json(
      { error: "Failed to generate prediction" },
      { status: 500 }
    )
  }
}

function calculatePrediction(input: PredictRequest): number {
  // Base calculation
  let baseSales = input.quantity * input.unit_price

  // Category multipliers (learned from data patterns)
  const categoryMultipliers: Record<string, number> = {
    Electronics: 1.15,
    Accessories: 0.95,
    Furniture: 1.25,
    Office: 0.85,
  }

  // Region multipliers
  const regionMultipliers: Record<string, number> = {
    North: 1.1,
    South: 0.95,
    East: 1.05,
    West: 1.0,
    Central: 0.9,
  }

  // Apply multipliers
  const categoryMult = categoryMultipliers[input.category] || 1.0
  const regionMult = regionMultipliers[input.region] || 1.0
  const promotionMult = input.promotion ? 1.2 : 1.0

  // Calculate final prediction with some variance
  const prediction = baseSales * categoryMult * regionMult * promotionMult

  // Add small random variance for realism (-5% to +5%)
  const variance = 1 + (Math.random() - 0.5) * 0.1

  return Math.round(prediction * variance * 100) / 100
}
