import { ReactNode, forwardRef } from "react";
import BottomNav from "./BottomNav";

const MobileLayout = forwardRef<HTMLDivElement, { children: ReactNode }>(
  ({ children }, ref) => {
    return (
      <div ref={ref} className="min-h-screen max-w-lg mx-auto bg-background relative">
        <div className="bottom-nav-safe">
          {children}
        </div>
        <BottomNav />
      </div>
    );
  }
);

MobileLayout.displayName = "MobileLayout";

export default MobileLayout;
