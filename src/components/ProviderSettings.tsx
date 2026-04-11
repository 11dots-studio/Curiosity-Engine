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
      <h2 className="text-2xl font-bold mb-6">AI Providers</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(PROVIDERS).map(([key, provider]) => {
          const isConfigured = configuredProviders.includes(
            key as ModelProvider
          );

          return (
            <Card
              key={key}
              className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 border-border/60 bg-card/50 backdrop-blur-sm"
              onClick={() => handleProviderClick(key as ModelProvider)}
            >
              <CardHeader className="p-4">
                <CardTitle className="text-xl flex items-center justify-between">
                  {provider.displayName}
                  {isProviderSetup(key) ? (
                    <span className="ml-3 text-[13px] font-medium text-green-600 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full">
                      Ready
                    </span>
                  ) : (
                    <span className="text-[13px] font-medium text-muted-foreground bg-muted/50 border border-border/50 px-2.5 py-1 rounded-full">
                      Needs Setup
                    </span>
                  )}
                </CardTitle>
                <CardDescription>
                  {provider.hasFreeTier && (
                    <span className="text-blue-600 mt-2 dark:text-blue-400 text-sm font-medium bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full inline-flex items-center">
                      <GiftIcon className="w-4 h-4 mr-1" />
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
