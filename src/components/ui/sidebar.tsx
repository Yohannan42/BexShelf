import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./collapsible";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  defaultCollapsed?: boolean;
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  (
    {
      className,
      children,
      collapsed,
      onCollapse,
      defaultCollapsed = false,
      ...props
    },
    ref
  ) => {
    const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
    const currentCollapsed = collapsed ?? isCollapsed;

    const handleCollapse = () => {
      const newCollapsed = !currentCollapsed;
      setIsCollapsed(newCollapsed);
      onCollapse?.(newCollapsed);
    };

    return (
      <Collapsible
        defaultOpen={!defaultCollapsed}
        open={!currentCollapsed}
        onOpenChange={(open) => {
          setIsCollapsed(!open);
          onCollapse?.(!open);
        }}
      >
        <div
          ref={ref}
          className={cn(
            "flex h-full flex-col border-r bg-background transition-all duration-300",
            currentCollapsed ? "w-16" : "w-64",
            className
          )}
          {...props}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between px-4 py-2">
              <CollapsibleContent className="flex-1">
                {!currentCollapsed && children}
              </CollapsibleContent>
              <CollapsibleTrigger asChild>
                <button
                  onClick={handleCollapse}
                  className="rounded-md p-2 hover:bg-accent hover:text-accent-foreground"
                >
                  {currentCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                </button>
              </CollapsibleTrigger>
            </div>
          </div>
        </div>
      </Collapsible>
    );
  }
);
Sidebar.displayName = "Sidebar";

const SidebarSection = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-4 py-4", className)} {...props} />
));
SidebarSection.displayName = "SidebarSection";

const SidebarItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
      className
    )}
    {...props}
  />
));
SidebarItem.displayName = "SidebarItem";

export { Sidebar, SidebarSection, SidebarItem };
