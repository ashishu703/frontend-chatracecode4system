"use client"
import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "@/store/store"
import { toggleSidebar } from "@/store/slices/uiSlice"
import AdminSidebar from "@/components/admin/AdminSidebar"
import AdminDashboardView from "@/components/admin/AdminDashboardView"
import PlansManagement from "@/components/admin/PlansManagement"
import UserManagement from "@/components/admin/UserManagement"
import PaymentGateway from "@/components/admin/PaymentGateway"
import LeadsManage from "@/components/admin/LeadsManage"
import FAQsManagement from "@/components/admin/FAQsManagement"
import TestimonialsManagement from "@/components/admin/TestimonialsManagement"
import OrdersManagement from "@/components/admin/OrdersManagement"
import SocialLogin from "@/components/admin/SocialLogin"
import AppConfiguration from "@/components/admin/AppConfiguration"
import SMTPSettings from "@/components/admin/SMTPSettings"
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import serverHandler from '@/utils/serverHandler';
import { useEffect, useState } from 'react';

export default function AdminDashboardPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { logout } = useAuth();
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);
  const { currentView } = useSelector((state: RootState) => state.dashboard);
  const [adminDashboardData, setAdminDashboardData] = useState<AdminDashboardData | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchAdminDashboard = async () => {
      setLoading(true);
      setError(undefined);
      try {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('serviceToken') || localStorage.getItem('adminToken')) : '';
        const res = await serverHandler.get('/api/admin/dashboard', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAdminDashboardData((res.data as any).data);
      } catch (err) {
        setError('Failed to load admin dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchAdminDashboard();
  }, []);

  const renderCurrentView = () => {
    switch (currentView) {
      case "dashboard":
        return (
          loading ? (
            <div className="text-center py-10">Loading dashboard...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-10">{error}</div>
          ) : (
            <AdminDashboardView data={adminDashboardData} />
          )
        );
      case "plans":
        return <PlansManagement />
      case "users":
        return <UserManagement />
      case "payment":
        return <PaymentGateway />
      case "leads":
        return <LeadsManage />
      case "faqs":
        return <FAQsManagement />
      case "testimonials":
        return <TestimonialsManagement />
      case "orders":
        return <OrdersManagement />
      case "social":
        return <SocialLogin />
      case "config":
        return <AppConfiguration />
      case "smtp":
        return <SMTPSettings />
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />

      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-16"}`}>
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => dispatch(toggleSidebar())}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <i className="fas fa-bars text-gray-600"></i>
              </button>
              <h1 className="text-2xl font-bold text-gray-800 capitalize">Admin {currentView}</h1>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <i className="fas fa-bell text-gray-600"></i>
              </button>
              <div className="relative group">
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <i className="fas fa-user-shield text-gray-600 text-xl"></i>
                </button>
                <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      logout();
                      router.push('/admin/login');
                    }}
                  >
                    <i className="fas fa-sign-out-alt mr-2"></i>Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">{renderCurrentView()}</main>
      </div>
    </div>
  )
}
