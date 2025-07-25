import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import NewInspection from "@/pages/NewInspection";
import InspectionHistory from "@/pages/InspectionHistory";
import SiteManagement from "@/pages/SiteManagement";
import InspectorManagement from "@/pages/InspectorManagement";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Guest demo routes - no authentication required */}
      <Route path="/demo" component={Home} />
      <Route path="/demo/new-inspection" component={NewInspection} />
      <Route path="/demo/inspection-history" component={InspectionHistory} />
      <Route path="/demo/site-management" component={SiteManagement} />
      <Route path="/demo/inspector-management" component={InspectorManagement} />
      
      {/* Authenticated routes */}
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/new-inspection" component={NewInspection} />
          <Route path="/inspection-history" component={InspectionHistory} />
          <Route path="/site-management" component={SiteManagement} />
          <Route path="/inspector-management" component={InspectorManagement} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
