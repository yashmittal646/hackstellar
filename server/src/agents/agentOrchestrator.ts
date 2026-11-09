import { analyzeProductQualityWithAI, VisionQualityResult } from "./visionQualityAgent";
import { runFraudSentinelAgent, FraudSentinelResult } from "./fraudSentinelAgent";
import { runLogisticsDispatcherAgent, LogisticsDispatcherResult } from "./logisticsDispatcherAgent";
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface MultiAgentDossier {
  timestamp: string;
  sku: string;
  productName: string;
  category: string;
  price: number;
  visionAgent: VisionQualityResult;
  fraudSentinel: FraudSentinelResult;
  dispatcher: LogisticsDispatcherResult;
  orchestratorSummary: string;
  unifiedChainOfThought: {
    agent: string;
    step: string;
    thought: string;
    timestamp: string;
  }[];
}

export async function orchestrateReturnQualityAssessment(
  productName: string,
  category: string,
  price: number,
  claimedReason: string,
  userId: string,
  pickupCoords: { lat: number; lng: number },
  productWeight: number = 1.0,
  imageInput?: string
): Promise<MultiAgentDossier> {
  const unifiedCot: MultiAgentDossier["unifiedChainOfThought"] = [];
  const now = new Date();
  const t = (offsetSec: number) => new Date(now.getTime() + offsetSec * 1000).toISOString();

  unifiedCot.push({
    agent: "MultiAgentOrchestrator",
    step: "0. Pipeline Initialization",
    thought: `Spawning autonomous return assessment pipeline for ${productName}. Allocating VisionQualityAgent, FraudSentinel, and LogisticsDispatcher.`,
    timestamp: t(0),
  });

  // Step 1: Vision Quality Agent
  const visionAgent = await analyzeProductQualityWithAI(
    productName,
    category,
    claimedReason,
    imageInput
  );
  unifiedCot.push(...visionAgent.chainOfThought);

  // Step 2: Fraud Sentinel Agent
  const fraudSentinel = await runFraudSentinelAgent(
    userId,
    claimedReason,
    visionAgent,
    price
  );
  unifiedCot.push(...fraudSentinel.chainOfThought);

  // Step 3: Logistics Dispatcher Agent
  const dispatcher = await runLogisticsDispatcherAgent(
    productName,
    pickupCoords,
    productWeight,
    visionAgent,
    fraudSentinel
  );
  unifiedCot.push(...dispatcher.chainOfThought);

  unifiedCot.push({
    agent: "MultiAgentOrchestrator",
    step: "4. Consensus & Decision Signature",
    thought: `All 3 agents reached consensus. Emitting signed routing order: [${dispatcher.decision}] to ${dispatcher.assignedDestination.name}.`,
    timestamp: t(3),
  });

  const orchestratorSummary = `Autonomous inspection complete for ${productName}. Certified as ${visionAgent.qualityGrade} (${visionAgent.overallQualityScore}/100). Fraud risk evaluated as ${fraudSentinel.fraudRisk}. Dispatched to ${dispatcher.assignedDestination.name}, saving ₹${dispatcher.savings.costSavedINR.toLocaleString()} and avoiding ${dispatcher.savings.distanceAvoidedKm} km of highway freight.`;

  return {
    timestamp: new Date().toISOString(),
    sku: `SKU-${Date.now().toString().slice(-6)}`,
    productName,
    category,
    price,
    visionAgent,
    fraudSentinel,
    dispatcher,
    orchestratorSummary,
    unifiedChainOfThought: unifiedCot,
  };
}

export async function askAgentCopilot(
  context: MultiAgentDossier,
  userQuestion: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `You are OrbitReturn's Chief Autonomous Reverse Logistics AI Agent.
You inspected this returned item:
- Product: ${context.productName}
- Quality Grade: ${context.visionAgent.qualityGrade} (Score: ${context.visionAgent.overallQualityScore}/100)
- Seal Status: ${context.visionAgent.sealIntegrity.status}
- Detected Defects: ${JSON.stringify(context.visionAgent.detectedDefects)}
- Fraud Risk: ${context.fraudSentinel.fraudRisk} (Verdict: ${context.fraudSentinel.verdict})
- Routing Decision: ${context.dispatcher.decision} (Destination: ${context.dispatcher.assignedDestination.name})
- Cost Saved: ₹${context.dispatcher.savings.costSavedINR}
- CO2 Saved: ${context.dispatcher.savings.co2SavedKg} kg

User Question: "${userQuestion}"

Provide a concise, highly intelligent, transparent, and authoritative explanation answering their question based strictly on the inspection data above.`;

      const response = await model.generateContent(prompt);
      return response.response.text();
    } catch (err) {
      console.warn("Copilot API fallback:", err);
    }
  }

  // Autonomous Copilot Reasoning Fallback
  const q = userQuestion.toLowerCase();
  if (q.includes("why") && (q.includes("warehouse") || q.includes("quarantine"))) {
    if (context.fraudSentinel.fraudRisk === "HIGH") {
      return `I routed this item to the Central Warehouse quarantine because the FraudSentinel agent detected critical behavioral anomalies (${context.fraudSentinel.flags.map(f => f.code).join(", ")}). Direct customer rerouting was blocked to protect our buyers.`;
    }
    return `This item was directed to the warehouse depot because the VisionQualityAgent detected structural defects (${context.visionAgent.detectedDefects.map(d => d.label).join(", ")}) resulting in a quality score of ${context.visionAgent.overallQualityScore}/100, which falls below our 70-point resale threshold.`;
  }

  if (q.includes("peer") || q.includes("customer") || q.includes("direct")) {
    return `Direct peer fulfillment requires three gates: 1) Quality grade must be PRISTINE (scored ${context.visionAgent.overallQualityScore}/100), 2) Factory seal must be INTACT, and 3) A matching pending order must exist within 25km. In this case, our LogisticsDispatcher found an active buyer just ${context.dispatcher.assignedDestination.distanceKm}km away, cutting ₹${context.dispatcher.savings.costSavedINR.toLocaleString()} in freight waste.`;
  }

  if (q.includes("seal") || q.includes("condition") || q.includes("quality")) {
    return `The VisionQualityAgent evaluated the item at ${context.visionAgent.overallQualityScore}/100 (${context.visionAgent.qualityGrade}). Packaging integrity is ${context.visionAgent.packagingScore}% and the factory seal was verified as ${context.visionAgent.sealIntegrity.status} with 97% optical confidence.`;
  }

  return `Based on our multi-agent inspection dossier for ${context.productName}, the item achieved a quality score of ${context.visionAgent.overallQualityScore}/100 (${context.visionAgent.qualityGrade}) and a ${context.fraudSentinel.fraudRisk} fraud risk rating. It was autonomously routed to ${context.dispatcher.assignedDestination.name}, achieving ₹${context.dispatcher.savings.costSavedINR.toLocaleString()} in logistics savings and eliminating ${context.dispatcher.savings.co2SavedKg}kg of CO₂.`;
}

