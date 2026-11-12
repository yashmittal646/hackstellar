import { Router, Request, Response } from "express";
import { Return } from "../models/Return";

const router = Router();

/** ─── Gemini Vision quality analysis ───────────────────────────────────── */

interface AnalysisResult {
  conditionScore: number;
  confidence: number;
  conditionLabel: string;
  defects: string[];
  positives: string[];
  routing: "direct_to_customer" | "nearby_hub" | "main_warehouse";
  routingReason: string;
  recommendation: string;
  summary: string;
  analysedByAI: true;
  isFraud?: boolean;
  fraudRisk?: string;
  fraudScore?: number;
}

async function analyzeWithGemini(
  images: string[],           // base64 strings (data URL or raw)
  productName: string,
  barcode: string,
  checklist: { sealed: boolean; noDamage: boolean; correctItem: boolean }
): Promise<AnalysisResult> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY not configured in server/.env");

  const checklistSummary = [
    checklist.sealed ? "✅ Packaging intact & factory seal present" : "❌ Packaging NOT intact / seal broken",
    checklist.noDamage ? "✅ No visible water damage or dents" : "❌ Water damage or dents observed",
    checklist.correctItem ? "✅ Item matches order label" : "❌ Item does NOT match order label",
  ].join("\n");

  const prompt = `You are OrbitRider's AI Quality Inspector, embedded in a delivery returns management system.

Product being inspected:
- Name: ${productName || "Unknown Product"}
- Barcode: ${barcode || "N/A"}

Rider's physical checklist at doorstep:
${checklistSummary}

Your task: Carefully analyze the ${images.length} product photo(s) provided and produce a quality inspection report.

DECISION THRESHOLD: If you are ≥90% confident in your assessment, make a DEFINITIVE decision. Do NOT default to the middle-ground option just to be safe. A clear, confident verdict is more valuable than a hedged one.

Return ONLY valid JSON (no markdown, no explanation outside JSON):
{
  "conditionScore": <integer 0-100>,
  "confidence": <integer 0-100 — your confidence in this assessment>,
  "conditionLabel": <"PRISTINE" | "LIKE_NEW" | "GOOD" | "FAIR" | "DEFECTIVE">,
  "defects": [<list of specific defects observed, e.g. "scratched surface", "dented corner", "broken seal">],
  "positives": [<list of good observations, e.g. "original packaging intact", "no visible wear">],
  "routing": <"direct_to_customer" | "nearby_hub" | "main_warehouse">,
  "routingReason": <one clear sentence explaining the routing decision>,
  "recommendation": <"APPROVE_RETURN" | "SEND_TO_HUB" | "ESCALATE_TO_WAREHOUSE">,
  "summary": <2–3 sentence human-readable verdict a delivery rider can understand>
}

Routing rules (apply these strictly):
- "direct_to_customer": conditionScore ≥ 70, item clearly resaleable, no fraud signals → deliver to a nearby buyer
- "nearby_hub": conditionScore 40–69, item needs minor cleaning/check but is usable → drop at local hub
- "main_warehouse": conditionScore < 40 OR defective OR broken seal + wrong item (fraud signal) → must go to central warehouse

Score guide:
90–100 → PRISTINE (unused/unopened)
70–89  → LIKE_NEW (minimal use, excellent condition)
50–69  → GOOD (moderate use, fully functional)
30–49  → FAIR (heavy use or cosmetic damage)
0–29   → DEFECTIVE (broken, non-functional, or fraud suspected)

If the checklist shows broken seal + item mismatch, heavily penalise the score and flag as potential fraud.`;

  // Build parts array: text prompt + inline images
  const parts: any[] = [{ text: prompt }];

  for (const img of images) {
    // Strip data URL prefix if present
    const base64 = img.replace(/^data:image\/\w+;base64,/, "");
    // Detect mime type from data URL prefix if available
    const mimeMatch = img.match(/^data:(image\/\w+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";

    parts.push({
      inline_data: {
        mime_type: mimeType,
        data: base64,
      },
    });
  }

  const body = {
    contents: [{ parts }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 1024,
      responseMimeType: "application/json",
    },
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${key}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("[Gemini] HTTP", response.status, errText);
    throw new Error(`Gemini API error ${response.status}: ${errText.slice(0, 200)}`);
  }

  const json = (await response.json()) as any;
  const rawText: string =
    json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  if (!rawText) {
    throw new Error("Gemini returned empty response");
  }

  // Parse JSON — strip any accidental markdown fences
  const cleaned = rawText.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();

  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Gemini response was not valid JSON: " + cleaned.slice(0, 300));
  }

  const defects = Array.isArray(parsed.defects) ? parsed.defects.filter(Boolean) : [];
  const score = Math.max(0, Math.min(100, Number(parsed.conditionScore) || 50));
  const hasDefects = defects.length > 0 || score < 70 || parsed.conditionLabel === "DEFECTIVE" || parsed.conditionLabel === "FAIR";

  // STRICT RULE: If there is ANY defect, return directly to main_warehouse!
  let routing: "direct_to_customer" | "nearby_hub" | "main_warehouse" = parsed.routing || "nearby_hub";
  let routingReason = parsed.routingReason || "Standard return processing.";

  if (hasDefects) {
    routing = "main_warehouse";
    routingReason = defects.length > 0
      ? `Defect detected during photo inspection: ${defects.join(", ")}. Returned to central warehouse.`
      : `Item condition rated ${parsed.conditionLabel || "DEFECTIVE"} (${score}/100). Routed to central warehouse.`;
  }

  const isFraud = parsed.isFraud === true || (!checklist.sealed && !checklist.correctItem) || score <= 20;

  return {
    conditionScore: score,
    confidence: Math.max(90, Math.min(100, Number(parsed.confidence) || 92)),
    conditionLabel: parsed.conditionLabel || (score >= 80 ? "LIKE_NEW" : score >= 60 ? "GOOD" : "DEFECTIVE"),
    defects,
    positives: Array.isArray(parsed.positives) ? parsed.positives : [],
    routing,
    routingReason,
    recommendation: hasDefects ? "ESCALATE_TO_WAREHOUSE" : (parsed.recommendation || "APPROVE_RETURN"),
    summary: parsed.summary || "Analysis complete.",
    isFraud,
    fraudRisk: isFraud ? "high" : "low",
    fraudScore: isFraud ? 92 : 12,
    analysedByAI: true,
  };
}

/**
 * POST /api/vision/analyze
 * Body: {
 *   images: string[]       — base64 or data URL encoded product photos (1–3)
 *   productName?: string
 *   barcode?: string
 *   returnId?: string
 *   checklist?: { sealed: boolean; noDamage: boolean; correctItem: boolean }
 * }
 */
router.post("/analyze", async (req: Request, res: Response) => {
  const {
    images,
    productName = "Unknown Product",
    barcode = "",
    returnId,
    checklist = { sealed: true, noDamage: true, correctItem: true },
  } = req.body as {
    images?: string[];
    productName?: string;
    barcode?: string;
    returnId?: string;
    checklist?: { sealed: boolean; noDamage: boolean; correctItem: boolean };
  };

  if (!images || images.length === 0) {
    res.status(400).json({ success: false, message: "No images provided" });
    return;
  }
  if (images.length > 4) {
    res.status(400).json({ success: false, message: "Maximum 4 images allowed" });
    return;
  }

  // Validate rough base64 size (each image < 4 MB)
  for (const img of images) {
    if (img.length > 6_000_000) {
      res.status(400).json({ success: false, message: "One or more images exceed 4 MB — please compress before sending" });
      return;
    }
  }

  try {
    console.log(`[vision/analyze] Analyzing ${images.length} photo(s) for "${productName}" (barcode: ${barcode})`);

    const analysis = await analyzeWithGemini(images, productName, barcode, checklist);

    console.log(`[vision/analyze] Score: ${analysis.conditionScore}, Routing: ${analysis.routing}, Confidence: ${analysis.confidence}%`);

    // If a returnId was passed, patch the return with AI scores
    if (returnId) {
      try {
        await Return.findByIdAndUpdate(returnId, {
          conditionScore: analysis.conditionScore,
          fraudScore: analysis.routing === "main_warehouse" && !checklist.correctItem ? 75 : 15,
          fraudRisk:
            analysis.routing === "main_warehouse" && !checklist.correctItem
              ? "high"
              : analysis.conditionScore < 30
              ? "medium"
              : "low",
          routingDestination: analysis.routing,
          status: "inspected",
          $push: {
            timeline: {
              status: "inspected",
              timestamp: new Date(),
              notes: `AI Photo Inspection (Gemini): ${analysis.conditionLabel} — ${analysis.routingReason}`,
            },
          },
        });
      } catch (e) {
        console.warn("[vision/analyze] Could not update return:", e);
      }
    }

    res.json({
      success: true,
      data: analysis,
    });
  } catch (err: any) {
    console.error("[vision/analyze] Error:", err?.message);
    res.status(500).json({
      success: false,
      message: err?.message ?? "Vision analysis failed",
    });
  }
});

export default router;

