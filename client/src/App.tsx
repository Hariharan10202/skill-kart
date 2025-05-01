import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Roadmap from "@/pages/roadmap";
import Community from "@/pages/community";
import Profile from "@/pages/profile";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "@/lib/protected-route";
import Navbar from "@/components/nav/navbar";
import MobileNav from "@/components/nav/mobile-nav";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/roadmap" component={Roadmap} />
      <ProtectedRoute path="/community" component={Community} />
      <ProtectedRoute path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Router />
      </main>
      <MobileNav />
      <Toaster />
    </div>
  );
}

export default App;
