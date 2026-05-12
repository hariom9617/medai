import { Sparkles, TrendingUp } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useInsights } from "@/hooks/queries";

export function AIInsightCard() {
  const { user } = useAuth();
  const { data, isLoading, error } = useInsights((user as any)?._id ?? user?.id);

  const insights = data?.insights ?? [];
  const predictions = data?.predictions ?? [];
  const primaryInsight = insights[0];
  const adherencePrediction = predictions.find(p => p.type === "adherence");

  return (
    <div className="card-base relative overflow-hidden bg-gradient-to-br from-primary to-primary-glow p-6 text-primary-foreground">
      <div className="absolute -right-10 -bottom-10 opacity-10">
        <svg width="180" height="180" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </div>
      <div className="relative">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider backdrop-blur">
          <Sparkles className="h-3 w-3" /> AI Care Insight
        </div>
        
        {isLoading ? (
          <div className="mt-4 space-y-3">
            <div className="h-6 w-3/4 animate-pulse rounded bg-white/30" />
            <div className="h-4 w-full animate-pulse rounded bg-white/20" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-white/20" />
            <div className="h-16 w-full animate-pulse rounded-lg bg-white/10" />
          </div>
        ) : error ? (
          <>
            <h3 className="mt-4 text-2xl font-bold">Insights Unavailable</h3>
            <p className="mt-3 text-sm leading-relaxed text-white/90">
              Unable to load AI insights at this time. Please try again later.
            </p>
          </>
        ) : primaryInsight ? (
          <>
            <h3 className="mt-4 text-2xl font-bold">{primaryInsight.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-white/90">
              {primaryInsight.description}
            </p>
            
            {primaryInsight.recommendation && (
              <div className="mt-4 rounded-lg bg-white/10 p-3 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/80">Recommendation</p>
                <p className="mt-1 text-sm text-white">{primaryInsight.recommendation}</p>
              </div>
            )}

            {adherencePrediction && (
              <div className="mt-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">
                  Predicted adherence: <span className="font-bold">{adherencePrediction.predictedRate}%</span>
                  <span className="ml-2 text-xs text-white/70">
                    ({Math.round(adherencePrediction.confidence * 100)}% confidence)
                  </span>
                </span>
              </div>
            )}
          </>
        ) : (
          <>
            <h3 className="mt-4 text-2xl font-bold">Your Adherence Insight</h3>
            <p className="mt-3 text-sm leading-relaxed text-white/90">
              Keep up with your medication schedule for best results. AI insights will appear here as we learn more about your routine.
            </p>
          </>
        )}

        <button className="mt-5 rounded-full bg-white px-5 py-2 text-sm font-semibold text-primary transition-transform hover:scale-[1.02]">
          View Trends
        </button>
      </div>
    </div>
  );
}