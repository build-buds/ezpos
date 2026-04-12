import { ReactNode } from "react";
import BottomNav from "./BottomNav";
import DesktopSidebar from "./DesktopSidebar";

const MobileLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <DesktopSidebar />
      <div className="min-h-screen bg-background relative lg:ml-60">
        {/* Mobile/Tablet: constrained width, bottom nav padding */}
        <div className="lg:hidden max-w-lg md:max-w-3xl mx-auto">
          <div className="bottom-nav-safe">
            {children}
          </div>
        </div>
        {/* Desktop: full width content */}
        <div className="hidden lg:block max-w-5xl mx-auto">
          {children}
        </div>
        <BottomNav />
      </div>
    </>
  );
};

export default MobileLayout;