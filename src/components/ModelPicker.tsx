import type { LargeLanguageModel, ModelProvider } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { MODEL_OPTIONS } from "@/constants/models";

interface ModelPickerProps {
  selectedModel: LargeLanguageModel;
  onModelSelect: (model: LargeLanguageModel) => void;
}

export function ModelPicker({
  selectedModel,
  onModelSelect,
}: ModelPickerProps) {
  const [open, setOpen] = useState(false);
  const modelDisplayName = MODEL_OPTIONS[selectedModel.provider].find(
    (model) => model.name === selectedModel.name
  )?.displayName;

  // Flatten the model options into a single array with provider information
  const allModels = Object.entries(MODEL_OPTIONS).flatMap(
    ([provider, models]) =>
      models.map((model) => ({
        ...model,
        provider: provider as ModelProvider,
      }))
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 h-9 rounded-xl px-4 text-[13px] bg-secondary/40 hover:bg-secondary/80 transition-all duration-300 border-border/80 shadow-sm font-medium"
        >
          <span>
            <span className="text-xs text-muted-foreground font-normal">Model:</span>{" "}
            {modelDisplayName}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-1.5 rounded-[20px] shadow-elevated border-border/60 bg-card/95 backdrop-blur-md" align="start">
        <div className="grid gap-2">
          {allModels.map((model) => (
            <Tooltip key={model.name}>
              <TooltipTrigger asChild>
                <Button
                  variant={
                    selectedModel.name === model.name ? "secondary" : "ghost"
                  }
                  className="w-full justify-start font-normal"
                  onClick={() => {
                    onModelSelect({
                      name: model.name,
                      provider: model.provider,
                    });
                    setOpen(false);
                  }}
                >
                  <div className="flex justify-between items-start w-full">
                    <span className="flex flex-col items-start">
                      <span>{model.displayName}</span>
                      <span className="text-xs text-muted-foreground">
                        {model.provider}
                      </span>
                    </span>
                    {model.tag && (
                      <span className="text-[10px] bg-foreground/5 text-foreground/80 px-2 py-0.5 rounded-md font-semibold uppercase tracking-wider border border-border/40">
                        {model.tag}
                      </span>
                    )}
                  </div>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">{model.description}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
