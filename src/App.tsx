import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider } from "./hooks/useAuth";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Historia from "./pages/Historia";
import Projetos from "./pages/Projetos";
import ProjetoDetalhe from "./pages/ProjetoDetalhe";
import Galeria from "./pages/Galeria";
import Blog from "./pages/Blog";
import BlogDetalhe from "./pages/BlogDetalhe";
import Contato from "./pages/Contato";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import PostsList from "./pages/admin/PostsList";
import PostForm from "./pages/admin/PostForm";
import GalleryList from "./pages/admin/GalleryList";
import GalleryForm from "./pages/admin/GalleryForm";
import ProjectsList from "./pages/admin/ProjectsList";
import ProjectForm from "./pages/admin/ProjectForm";
import VolunteersList from "./pages/admin/VolunteersList";
import VolunteerForm from "./pages/admin/VolunteerForm";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Analytics />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes with Navbar and Footer */}
            <Route path="/" element={
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow"><Home /></main>
                <Footer />
              </div>
            } />
            <Route path="/historia" element={
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow"><Historia /></main>
                <Footer />
              </div>
            } />
            <Route path="/projetos" element={
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow"><Projetos /></main>
                <Footer />
              </div>
            } />
            <Route path="/projetos/:slug" element={
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow"><ProjetoDetalhe /></main>
                <Footer />
              </div>
            } />
            <Route path="/galeria" element={
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow"><Galeria /></main>
                <Footer />
              </div>
            } />
            <Route path="/blog" element={
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow"><Blog /></main>
                <Footer />
              </div>
            } />
            <Route path="/blog/:slug" element={
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow"><BlogDetalhe /></main>
                <Footer />
              </div>
            } />
            <Route path="/contato" element={
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow"><Contato /></main>
                <Footer />
              </div>
            } />
            
            {/* Auth route */}
            <Route path="/auth" element={<Auth />} />
            
            {/* Admin routes - protected */}
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin>
                <AdminLayout><Dashboard /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/posts" element={
              <ProtectedRoute requireAdmin>
                <AdminLayout><PostsList /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/posts/novo" element={
              <ProtectedRoute requireAdmin>
                <AdminLayout><PostForm /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/posts/:id" element={
              <ProtectedRoute requireAdmin>
                <AdminLayout><PostForm /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/galeria" element={
              <ProtectedRoute requireAdmin>
                <AdminLayout><GalleryList /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/galeria/novo" element={
              <ProtectedRoute requireAdmin>
                <AdminLayout><GalleryForm /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/galeria/:id" element={
              <ProtectedRoute requireAdmin>
                <AdminLayout><GalleryForm /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/projetos" element={
              <ProtectedRoute requireAdmin>
                <AdminLayout><ProjectsList /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/projetos/novo" element={
              <ProtectedRoute requireAdmin>
                <AdminLayout><ProjectForm /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/projetos/:id" element={
              <ProtectedRoute requireAdmin>
                <AdminLayout><ProjectForm /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/voluntarios" element={
              <ProtectedRoute requireAdmin>
                <AdminLayout><VolunteersList /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/voluntarios/novo" element={
              <ProtectedRoute requireAdmin>
                <AdminLayout><VolunteerForm /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/voluntarios/:id" element={
              <ProtectedRoute requireAdmin>
                <AdminLayout><VolunteerForm /></AdminLayout>
              </ProtectedRoute>
            } />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
