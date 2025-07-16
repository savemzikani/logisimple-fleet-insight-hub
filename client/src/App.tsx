import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Vehicles from "./pages/Vehicles";
import Drivers from "./pages/Drivers";
import NotFound from "./pages/NotFound";
import AuthTest from "./components/debug/AuthTest";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/vehicles" element={
              <ProtectedRoute>
                <Layout>
                  <Vehicles />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/drivers" element={
              <ProtectedRoute>
                <Layout>
                  <Drivers />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/fleet-map" element={
              <ProtectedRoute>
                <Layout>
                  <div className="flex-1 p-6">
                    <h1 className="text-3xl font-bold mb-4">Fleet Map</h1>
                    <p className="text-muted-foreground">Real-time fleet tracking coming soon...</p>
                  </div>
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <Layout>
                  <div className="flex-1 p-6">
                    <h1 className="text-3xl font-bold mb-4">Analytics</h1>
                    <p className="text-muted-foreground">Advanced analytics dashboard coming soon...</p>
                  </div>
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/maintenance" element={
              <ProtectedRoute>
                <Layout>
                  <div className="flex-1 p-6">
                    <h1 className="text-3xl font-bold mb-4">Maintenance</h1>
                    <p className="text-muted-foreground">Vehicle maintenance management coming soon...</p>
                  </div>
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/fuel" element={
              <ProtectedRoute>
                <Layout>
                  <div className="flex-1 p-6">
                    <h1 className="text-3xl font-bold mb-4">Fuel Records</h1>
                    <p className="text-muted-foreground">Fuel management system coming soon...</p>
                  </div>
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/customers" element={
              <ProtectedRoute>
                <Layout>
                  <div className="flex-1 p-6">
                    <h1 className="text-3xl font-bold mb-4">Customers</h1>
                    <p className="text-muted-foreground">Customer management system coming soon...</p>
                  </div>
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/company" element={
              <ProtectedRoute>
                <Layout>
                  <div className="flex-1 p-6">
                    <h1 className="text-3xl font-bold mb-4">Company Settings</h1>
                    <p className="text-muted-foreground">Company management coming soon...</p>
                  </div>
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Layout>
                  <div className="flex-1 p-6">
                    <h1 className="text-3xl font-bold mb-4">Settings</h1>
                    <p className="text-muted-foreground">Application settings coming soon...</p>
                  </div>
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
            <Route path="/test" element={
              <ProtectedRoute>
                <Layout>
                  <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                      <h1 className="text-2xl font-bold text-center mb-8">Auth Test Page</h1>
                      <AuthTest />
                    </div>
                  </div>
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
