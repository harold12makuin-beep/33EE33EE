import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import LandingPage from '@/pages/LandingPage';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import DashboardHome from '@/pages/DashboardHome';
import Invest from '@/pages/Invest';
import Investments from '@/pages/Investments';
import CompanyDetail from '@/pages/CompanyDetail';
import Balance from '@/pages/Balance';
import Transactions from '@/pages/Transactions';
import Deposit from '@/pages/Deposit';
import Withdraw from '@/pages/Withdraw';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invest"
            element={
              <ProtectedRoute>
                <Invest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/investments"
            element={
              <ProtectedRoute>
                <Investments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/:id"
            element={
              <ProtectedRoute>
                <CompanyDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/balance"
            element={
              <ProtectedRoute>
                <Balance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <Transactions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/deposit"
            element={
              <ProtectedRoute>
                <Deposit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/withdraw"
            element={
              <ProtectedRoute>
                <Withdraw />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
