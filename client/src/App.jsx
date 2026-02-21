import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import WriteArticle from './pages/WriteArticle';
import ArticleDetail from './pages/ArticleDetail';
import Profile from './pages/Profile';
import Bookmarks from './pages/Bookmarks';
import Search from './pages/Search';
import AdminDashboard from './pages/AdminDashboard';

// Scroll to top on navigation
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Protected route wrapper
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="animate-spin w-8 h-8 border-2 border-ink border-t-transparent rounded-full" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" />;
  return children;
};

function AppContent() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1" key={location.pathname}>
        <div className="fade-in">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/article/:slug" element={<ArticleDetail />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/search" element={<Search />} />
            <Route path="/write" element={
              <ProtectedRoute><WriteArticle /></ProtectedRoute>
            } />
            <Route path="/write/:id" element={
              <ProtectedRoute><WriteArticle /></ProtectedRoute>
            } />
            <Route path="/bookmarks" element={
              <ProtectedRoute><Bookmarks /></ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
            } />
          </Routes>
        </div>
      </main>
      <Footer />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1A1A2E',
            color: '#FFF8E7',
            fontSize: '14px',
            borderRadius: '12px',
            padding: '12px 16px',
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
