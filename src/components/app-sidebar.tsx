import { Home, Inbox, Settings, Github } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useSidebar } from "@/components/ui/sidebar"; // import useSidebar hook
import { useEffect, useState, useRef } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ChatList } from "./ChatList";
import { AppList } from "./AppList";

// Menu items.
const items = [
  {
    title: "Apps",
    to: "/",
    icon: Home,
  },
  {
    title: "Chat",
    to: "/chat",
    icon: Inbox,
  },
];

// Hover state types
type HoverState =
  | "start-hover:app"
  | "start-hover:chat"
  | "clear-hover"
  | "no-hover";

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar(); // retrieve current sidebar state
  const [hoverState, setHoverState] = useState<HoverState>("no-hover");
  const expandedByHover = useRef(false);

  useEffect(() => {
    if (
      (hoverState === "start-hover:app" || hoverState === "start-hover:chat") &&
      state === "collapsed"
    ) {
      expandedByHover.current = true;
      toggleSidebar();
    }
    if (
      hoverState === "clear-hover" &&
      state === "expanded" &&
      expandedByHover.current
    ) {
      toggleSidebar();
      expandedByHover.current = false;
      setHoverState("no-hover");
    }
  }, [hoverState, toggleSidebar, state, setHoverState]);

  const routerState = useRouterState();
  const isAppRoute =
    routerState.location.pathname === "/" ||
    routerState.location.pathname.startsWith("/app-details");
  const isChatRoute = routerState.location.pathname === "/chat";

  let selectedItem: string | null = null;
  if (hoverState === "start-hover:app") {
    selectedItem = "Apps";
  } else if (hoverState === "start-hover:chat") {
    selectedItem = "Chat";
  } else if (state === "expanded") {
    if (isAppRoute) {
      selectedItem = "Apps";
    } else if (isChatRoute) {
      selectedItem = "Chat";
    }
  }

  return (
    <Sidebar
      collapsible="icon"
      onMouseLeave={() => {
        setHoverState("clear-hover");
      }}
    >
      <SidebarContent className="overflow-hidden">
        <div className="flex mt-8 h-[calc(100vh-4rem)]">
          {/* Left Column: Menu items */}
          <div className="flex flex-col h-full pb-4 shrink-0">
            <div>
              <SidebarTrigger
                onMouseEnter={() => {
                  setHoverState("clear-hover");
                }}
              />
              <AppIcons onHoverChange={setHoverState} />
            </div>
            <div className="flex flex-col items-center w-full px-2 gap-2 mt-auto">
              <a
                href="https://github.com/11dots-studio/CE.git"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-[44px] h-[44px] rounded-xl transition-colors duration-200 hover:bg-sidebar-accent/40 text-muted-foreground hover:text-foreground active:scale-95"
                title="GitHub Repository"
              >
                <Github className="h-[22px] w-[22px] opacity-90" />
              </a>
              <Link
                to="/settings"
                className="flex items-center justify-center w-[44px] h-[44px] rounded-xl transition-colors duration-200 hover:bg-sidebar-accent/40 text-muted-foreground hover:text-foreground active:scale-95"
                title="Settings"
              >
                <Settings className="h-[22px] w-[22px] opacity-90" />
              </Link>
            </div>
          </div>
          {/* Right Column: Chat List Section */}
          <div className="w-[240px] h-full overflow-y-auto">
            <AppList show={selectedItem === "Apps"} />
            <ChatList show={selectedItem === "Chat"} />
          </div>
        </div>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}

function AppIcons({
  onHoverChange,
}: {
  onHoverChange: (state: HoverState) => void;
}) {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  return (
    // When collapsed: only show the main menu
    <SidebarGroup className="pr-0">
      {/* <SidebarGroupLabel>Curiosity Engine</SidebarGroupLabel> */}

      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive =
              (item.to === "/" && pathname === "/") ||
              (item.to !== "/" && pathname.startsWith(item.to));

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  size="sm"
                  className="font-medium w-14"
                >
                  <Link
                    to={item.to}
                    className={`flex flex-col items-center gap-1.5 h-[60px] justify-center mb-3 rounded-xl transition-colors duration-200 ${
                      isActive ? "bg-sidebar-accent/80 text-sidebar-accent-foreground shadow-sm" : "hover:bg-sidebar-accent/40"
                    }`}
                    onMouseEnter={() => {
                      if (item.title === "Apps") {
                        onHoverChange("start-hover:app");
                      } else if (item.title === "Chat") {
                        onHoverChange("start-hover:chat");
                      }
                    }}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <item.icon className="h-5 w-5 opacity-90" />
                      <span className={"text-[11px] font-medium tracking-wide"}>{item.title}</span>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
