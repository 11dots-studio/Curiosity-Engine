import { useNavigate } from "@tanstack/react-router";
import { ChevronRight, GiftIcon, Sparkles } from "lucide-react";
import { providerSettingsRoute } from "@/routes/settings/providers/$provider";

export function SetupBanner() {
  const navigate = useNavigate();

  const handleSetupClick = () => {
    navigate({
      to: providerSettingsRoute.id,
      params: { provider: "google" },
    });
  };

  return (
    <div
      className="w-full mb-8 p-6 bg-secondary/50 backdrop-blur-md border border-border/80 rounded-[24px] shadow-soft cursor-pointer hover:bg-secondary/80 hover:shadow-hover hover:-translate-y-1 transition-all duration-300"
      onClick={handleSetupClick}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-background/80 p-3 rounded-2xl shadow-sm border border-border/50">
            <Sparkles className="w-5 h-5 text-foreground/80" />
          </div>
          <div>
            <h3 className="text-[17px] font-semibold text-foreground tracking-tight">
              Setup your AI API access
            </h3>
            <p className="text-sm text-muted-foreground/90 mt-0.5 flex items-center gap-1.5 font-medium">
              <GiftIcon className="w-4 h-4 opacity-70" />
              Use Google Gemini for free
            </p>
          </div>
        </div>
        <div className="bg-foreground/5 p-2 rounded-full">
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}
