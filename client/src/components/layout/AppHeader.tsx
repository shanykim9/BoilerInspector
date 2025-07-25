import { Button } from "@/components/ui/button";
import { Menu, Bell, User } from "lucide-react";

interface AppHeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export default function AppHeader({ onMenuClick, title = "캐스케이드 시스템 점검관리" }: AppHeaderProps) {
  return (
    <header className="bg-primary text-white shadow-lg sticky top-0 z-50">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onMenuClick}
            className="text-white hover:bg-blue-600 p-2"
          >
            <Menu className="w-6 h-6" />
          </Button>
          <h1 className="text-responsive-2xl font-bold">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:bg-blue-600 p-2"
          >
            <Bell className="w-6 h-6" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:bg-blue-600 p-2"
            onClick={() => window.location.href = "/api/logout"}
          >
            <User className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </header>
  );
}
