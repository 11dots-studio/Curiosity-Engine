import { useAtom } from "jotai";
import { selectedAppIdAtom } from "@/atoms/appAtoms";
import { useLoadApps } from "@/hooks/useLoadApps";
import { useRouter } from "@tanstack/react-router";

export const TitleBar = () => {
  const [selectedAppId] = useAtom(selectedAppIdAtom);
  const { apps } = useLoadApps();
  const { navigate } = useRouter();

  // Get selected app name
  const selectedApp = apps.find((app) => app.id === selectedAppId);
  const displayText = selectedApp
    ? `App: ${selectedApp.name}`
    : "(no app selected)";

  return (
    <div className="z-11 w-full h-8 bg-(--sidebar) absolute top-0 left-0 app-region-drag flex items-center justify-between border-b border-border/40">
      <div className="flex-1 flex pl-6">
        <span className="text-[13px] font-semibold tracking-wide opacity-80">Curiosity Engine</span>
      </div>
      <div className="flex-1 flex justify-center no-app-region-drag">
        <span className="text-[12px] font-medium text-muted-foreground bg-secondary/60 px-3 py-0.5 rounded-full border border-border/50">
          {displayText}
        </span>
      </div>
      <div className="flex-1 pr-24"></div>
    </div>
  );
};
