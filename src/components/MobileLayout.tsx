import { ReactNode } from "react";
import BottomNav from "./BottomNav";

const MobileLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen max-w-lg mx-auto bg-background relative">
      <div className="bottom-nav-safe">
        {children}
      </div>
      <BottomNav />
    </div>
  );
};

export default MobileLayout;
