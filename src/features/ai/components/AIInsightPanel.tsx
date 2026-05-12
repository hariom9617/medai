import { Sparkles } from "lucide-react";
import type { MockAIPrediction } from "@/features/shared/mock/patients";

export function AIInsightPanel({ prediction }: { prediction: MockAIPrediction }) {
  return (
    <div className="card-base bg-gradient-to-br from-primary to-primary-glow p-5 text-white">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4" />
        <p className="text-xs font-bold uppercase tracking-wider">AI Adherence Insight</p>
      </div>
      <p className="mt-3 text-base font-semibold">{prediction.insight}</p>
      <p className="mt-3 text-xs opacity-80">
        Predicted 7-day adherence: {prediction.predictedRate7d}% · Confidence {Math.round(prediction.confidence * 100)}%
      </p>
    </div>
  );
}
