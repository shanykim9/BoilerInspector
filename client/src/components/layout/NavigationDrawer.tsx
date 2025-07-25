import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { 
  FileText, 
  History, 
  Building, 
  Users, 
  Mail, 
  Home,
  X 
} from "lucide-react";

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationItems = [
  { href: "/", icon: Home, label: "홈", color: "text-blue-600" },
  { href: "/new-inspection", icon: FileText, label: "새 점검", color: "text-green-600" },
  { href: "/inspection-history", icon: History, label: "점검 이력", color: "text-purple-600" },
  { href: "/site-management", icon: Building, label: "현장 관리", color: "text-orange-600" },
  { href: "/inspector-management", icon: Users, label: "점검자 관리", color: "text-red-600" },
];

export default function NavigationDrawer({ isOpen, onClose }: NavigationDrawerProps) {
  const [location] = useLocation();

  const handleNavigation = () => {
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-semibold text-gray-800">
              메뉴
            </SheetTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </SheetHeader>

        <nav className="p-4">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;

              return (
                <Link key={item.href} href={item.href} onClick={handleNavigation}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start h-12 ${
                      isActive 
                        ? "bg-primary text-white" 
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <Icon className={`w-5 h-5 mr-3 ${isActive ? "text-white" : item.color}`} />
                    <span className="text-left">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          <div className="mt-8 pt-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => window.location.href = "/api/logout"}
            >
              <Mail className="w-5 h-5 mr-3" />
              로그아웃
            </Button>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
