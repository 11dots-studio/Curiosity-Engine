import { PROVIDERS } from "@/constants/models";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import { providerSettingsRoute } from "@/routes/settings/providers/$provider";
import type { ModelProvider } from "@/lib/schemas";
import { useSettings } from "@/hooks/useSettings";
import { GiftIcon } from "lucide-react";
interface ProviderSettingsProps {
  configuredProviders?: ModelProvider[];
}

export function ProviderSettingsGrid({
  configuredProviders = [],
}: ProviderSettingsProps) {
  const navigate = useNavigate();

  const handleProviderClick = (provider: ModelProvider) => {
    console.log("PROVIDER", provider);
    navigate({
      to: providerSettingsRoute.id,
      params: { provider },
    });
  };

  const { isProviderSetup } = useSettings();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6 text-foreground tracking-tight">AI Providers</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(PROVIDERS).map(([key, provider]) => {
          const isConfigured = configuredProviders.includes(
            key as ModelProvider
          );

          return (
            <Card
              key={key}
              className="cursor-pointer transition-all duration-300 hover:shadow-hover hover:-translate-y-1 border-border/80 bg-card rounded-[24px] overflow-hidden"
              onClick={() => handleProviderClick(key as ModelProvider)}
            >
              <CardHeader className="p-4">
                <CardTitle className="text-xl flex items-center justify-between">
                  {provider.displayName}
                  {isProviderSetup(key) ? (
                    <span className="ml-3 text-[12px] font-semibold text-foreground bg-secondary px-3 py-1 rounded-full border border-border/50 shadow-sm uppercase tracking-wide">
                      Ready
                    </span>
                  ) : (
                    <span className="text-[12px] font-semibold text-muted-foreground bg-muted/30 border border-border/50 px-3 py-1 rounded-full uppercase tracking-wide">
                      Setup
                    </span>
                  )}
                </CardTitle>
                <CardDescription>
                  {provider.hasFreeTier && (
                    <span className="text-muted-foreground mt-2 text-xs font-medium bg-secondary/80 px-2.5 py-1 rounded-lg inline-flex items-center border border-border/40">
                      <GiftIcon className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                      Free tier available
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
