import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navigation from "@/components/Navigation";
import Dashboard from "@/pages/Dashboard";
import Library from "@/pages/Library";
import BookDetails from "@/pages/BookDetails";
import Journals from "@/pages/Journals";
import JournalEditor from "@/pages/JournalEditor";
import Writing from "@/pages/Writing";
import NotebookEditor from "@/pages/NotebookEditor";
import Planning from "@/pages/Planning";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Navigation />
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/library" element={
                  <ProtectedRoute>
                    <Library />
                  </ProtectedRoute>
                } />
                <Route path="/library/:bookId" element={
                  <ProtectedRoute>
                    <BookDetails />
                  </ProtectedRoute>
                } />
                <Route path="/journals" element={
                  <ProtectedRoute>
                    <Journals />
                  </ProtectedRoute>
                } />
                <Route path="/journals/:journalId" element={
                  <ProtectedRoute>
                    <JournalEditor />
                  </ProtectedRoute>
                } />
                <Route path="/writing" element={
                  <ProtectedRoute>
                    <Writing />
                  </ProtectedRoute>
                } />
                <Route path="/writing/:projectId" element={
                  <ProtectedRoute>
                    <NotebookEditor />
                  </ProtectedRoute>
                } />
                <Route path="/planning" element={
                  <ProtectedRoute>
                    <Planning />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Toaster />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
