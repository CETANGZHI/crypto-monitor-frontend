import React, { useState } from 'react';
import { auth } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await auth.login({ email, password });
      localStorage.setItem('accessToken', response.data.access_token);
      localStorage.setItem('refreshToken', response.data.refresh_token);
      onLogin(response.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || '登录失败，请检查邮箱和密码');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      // 获取Google授权URL
      const response = await fetch('/api/v1/oauth/google/authorize');
      const data = await response.json();
      
      if (data.authorization_url) {
        // 重定向到Google授权页面
        window.location.href = data.authorization_url;
      } else {
        setError('获取Google授权链接失败');
      }
    } catch (err) {
      setError('Google登录失败，请重试');
    }
  };

  const handleAppleLogin = async () => {
    try {
      setError('');
      // 获取Apple授权URL
      const response = await fetch('/api/v1/oauth/apple/authorize');
      const data = await response.json();
      
      if (data.authorization_url) {
        // 重定向到Apple授权页面
        window.location.href = data.authorization_url;
      } else {
        setError('获取Apple授权链接失败');
      }
    } catch (err) {
      setError('Apple登录失败，请重试');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">用户登录</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        
        {/* 第三方登录按钮 */}
        <div className="mb-6">
          <div className="flex flex-col space-y-3">
            <button
              onClick={handleGoogleLogin}
              className="flex items-center justify-center w-full py-2 px-4 border border-gray-600 rounded-lg bg-white text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              使用 Google 登录
            </button>
            
            <button
              onClick={handleAppleLogin}
              className="flex items-center justify-center w-full py-2 px-4 border border-gray-600 rounded-lg bg-black text-white hover:bg-gray-900 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              使用 Apple 登录
            </button>
          </div>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800 text-gray-400">或使用邮箱登录</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-300 text-sm font-bold mb-2">邮箱</label>
            <input
              type="email"
              id="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
              placeholder="请输入邮箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-300 text-sm font-bold mb-2">密码</label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            >
              登录
            </button>
          </div>
          <p className="text-center text-gray-400 text-sm mt-4">
            还没有账号？ <a href="/register" className="text-blue-400 hover:underline">立即注册</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;

