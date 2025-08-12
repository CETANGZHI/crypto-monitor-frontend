import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { TwitterMonitor } from './pages/TwitterMonitor';
import { WalletMonitor } from './pages/WalletMonitor';
import { BlackRock } from './pages/BlackRock';
import { NotificationCenter } from './pages/NotificationCenter';
import { Settings } from './pages/Settings';
import { Subscription } from './pages/Subscription';
import Login from './pages/Login';
import Register from './pages/Register';
import { auth } from './services/api';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { FloatingNotificationButton } from './components/Notifications/FloatingNotificationButton';
import { NotificationPanel } from './components/Notifications/NotificationPanel';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [activeMenuItem, setActiveMenuItem] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        try {
          const response = await auth.me();
          setUser(response.data);
        } catch (error) {
          console.error('Failed to fetch user info:', error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await auth.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    }
  };

  const handleMenuItemClick = (itemId) => {
    setActiveMenuItem(itemId);
    setIsMobileMenuOpen(false); // 关闭手机端菜单
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="flex min-h-screen bg-gray-900 text-white">
        {/* 侧边栏 - 始终显示 */}
        <Sidebar 
          user={user} 
          onLogout={handleLogout}
          activeItem={activeMenuItem}
          onItemClick={handleMenuItemClick}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* 头部 - 始终显示 */}
          <Header 
            user={user} 
            onNotificationClick={() => setIsNotificationPanelOpen(!isNotificationPanelOpen)}
            onMenuClick={handleMobileMenuToggle}
          />
          
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <h1>Hello from Manus!</h1>
            <Routes>
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Dashboard user={user} />} />
              <Route path="/dashboard" element={<Dashboard user={user} />} />
              <Route path="/twitter-monitor" element={<TwitterMonitor user={user} />} />
              <Route path="/wallet-monitor" element={<WalletMonitor user={user} />} />
              <Route path="/blackrock" element={<BlackRock user={user} />} />
              <Route path="/notifications" element={<NotificationCenter user={user} />} />
              <Route path="/settings" element={<Settings user={user} />} />
              <Route path="/upgrade" element={<Subscription user={user} />} />
            </Routes>
          </main>
        </div>
        
        {/* 浮动通知按钮 - 仅登录用户显示 */}
        {user && (
          <FloatingNotificationButton
            notificationCount={notifications.length}
            onClick={() => setIsNotificationPanelOpen(!isNotificationPanelOpen)}
          />
        )}
        
        {/* 通知面板 - 仅登录用户显示 */}
        {user && isNotificationPanelOpen && (
          <NotificationPanel
            notifications={notifications}
            onClose={() => setIsNotificationPanelOpen(false)}
          />
        )}
      </div>
    </Router>
  );
}

export default App;

