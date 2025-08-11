import { useState, useEffect } from 'react'
import { User, Bell, Shield, Palette, Globe, Smartphone, Mail, Key, Trash2, Save, RefreshCw, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { api } from '@/services/api'

export function Settings({ user }) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', content: '' })
  const [showPassword, setShowPassword] = useState(false)
  
  // 用户信息状态
  const [userInfo, setUserInfo] = useState({
    username: user?.username || '',
    email: user?.email || '',
    avatar: user?.avatar || ''
  })
  
  // 通知设置状态
  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: user?.email_notifications || true,
    sms_notifications: user?.sms_notifications || false,
    push_notifications: user?.push_notifications || true,
    twitter_alerts: true,
    wallet_alerts: true,
    price_alerts: true,
    system_alerts: true,
    alert_frequency: 'realtime'
  })
  
  // 安全设置状态
  const [securitySettings, setSecuritySettings] = useState({
    two_factor_enabled: false,
    login_alerts: true,
    session_timeout: '24h'
  })
  
  // 密码修改状态
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })
  
  // 界面设置状态
  const [interfaceSettings, setInterfaceSettings] = useState({
    theme: 'dark',
    language: 'zh-CN',
    timezone: 'Asia/Shanghai',
    currency: 'USD',
    date_format: 'YYYY-MM-DD',
    auto_refresh: true,
    refresh_interval: 30
  })

  useEffect(() => {
    if (user) {
      fetchUserSettings()
    }
  }, [user])

  const fetchUserSettings = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/v1/users/settings')
      const settings = response.data.data
      
      setNotificationSettings(prev => ({ ...prev, ...settings.notifications }))
      setSecuritySettings(prev => ({ ...prev, ...settings.security }))
      setInterfaceSettings(prev => ({ ...prev, ...settings.interface }))
    } catch (error) {
      console.error('Failed to fetch user settings:', error)
      showMessage('error', '获取设置失败')
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (type, content) => {
    setMessage({ type, content })
    setTimeout(() => setMessage({ type: '', content: '' }), 3000)
  }

  const saveUserInfo = async () => {
    try {
      setSaving(true)
      await api.put('/api/v1/users/profile', userInfo)
      showMessage('success', '个人信息更新成功')
    } catch (error) {
      console.error('Failed to update user info:', error)
      showMessage('error', '更新失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  const saveNotificationSettings = async () => {
    try {
      setSaving(true)
      await api.put('/api/v1/users/notification-settings', notificationSettings)
      showMessage('success', '通知设置更新成功')
    } catch (error) {
      console.error('Failed to update notification settings:', error)
      showMessage('error', '更新失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  const saveSecuritySettings = async () => {
    try {
      setSaving(true)
      await api.put('/api/v1/users/security-settings', securitySettings)
      showMessage('success', '安全设置更新成功')
    } catch (error) {
      console.error('Failed to update security settings:', error)
      showMessage('error', '更新失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      showMessage('error', '新密码确认不匹配')
      return
    }
    
    if (passwordForm.new_password.length < 6) {
      showMessage('error', '新密码长度至少6位')
      return
    }

    try {
      setSaving(true)
      await api.post('/api/v1/users/change-password', {
        old_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      })
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' })
      showMessage('success', '密码修改成功')
    } catch (error) {
      console.error('Failed to change password:', error)
      showMessage('error', '密码修改失败，请检查当前密码')
    } finally {
      setSaving(false)
    }
  }

  const saveInterfaceSettings = async () => {
    try {
      setSaving(true)
      await api.put('/api/v1/users/interface-settings', interfaceSettings)
      showMessage('success', '界面设置更新成功')
    } catch (error) {
      console.error('Failed to update interface settings:', error)
      showMessage('error', '更新失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  const deleteAccount = async () => {
    if (window.confirm('确定要删除账户吗？此操作不可恢复！')) {
      try {
        await api.delete('/api/v1/users/account')
        showMessage('success', '账户删除成功')
        // 清除本地存储并重定向到首页
        localStorage.clear()
        window.location.href = '/'
      } catch (error) {
        console.error('Failed to delete account:', error)
        showMessage('error', '账户删除失败')
      }
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">设置</h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-8 bg-gray-300 rounded w-1/2"></div>
                <div className="h-3 bg-gray-300 rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">设置</h1>
          <p className="text-muted-foreground mt-2">
            管理您的账户设置和偏好
          </p>
        </div>
        {user && (
          <Badge variant="outline" className="text-lg px-3 py-1">
            {user.user_type === 'trial' ? '试用用户' : '付费用户'}
          </Badge>
        )}
      </div>

      {/* 消息提示 */}
      {message.content && (
        <Card className={`border-l-4 ${
          message.type === 'success' ? 'border-green-500 bg-green-50 dark:bg-green-950' : 
          'border-red-500 bg-red-50 dark:bg-red-950'
        }`}>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <span className={message.type === 'success' ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}>
                {message.content}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">个人信息</TabsTrigger>
          <TabsTrigger value="notifications">通知设置</TabsTrigger>
          <TabsTrigger value="security">安全设置</TabsTrigger>
          <TabsTrigger value="interface">界面设置</TabsTrigger>
          <TabsTrigger value="account">账户管理</TabsTrigger>
        </TabsList>

        {/* 个人信息 */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>个人信息</span>
              </CardTitle>
              <CardDescription>
                更新您的个人资料信息
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="username">用户名</Label>
                  <Input
                    id="username"
                    value={userInfo.username}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="请输入用户名"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱地址</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userInfo.email}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="请输入邮箱地址"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="avatar">头像URL</Label>
                <Input
                  id="avatar"
                  value={userInfo.avatar}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, avatar: e.target.value }))}
                  placeholder="请输入头像URL"
                />
              </div>
              
              <Button onClick={saveUserInfo} disabled={saving}>
                {saving ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                保存更改
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 通知设置 */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>通知设置</span>
              </CardTitle>
              <CardDescription>
                配置您希望接收的通知类型和方式
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">通知方式</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>邮件通知</Label>
                      <p className="text-sm text-muted-foreground">通过邮件接收重要通知</p>
                    </div>
                    <Switch
                      checked={notificationSettings.email_notifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, email_notifications: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>短信通知</Label>
                      <p className="text-sm text-muted-foreground">通过短信接收紧急通知</p>
                    </div>
                    <Switch
                      checked={notificationSettings.sms_notifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, sms_notifications: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>推送通知</Label>
                      <p className="text-sm text-muted-foreground">浏览器推送通知</p>
                    </div>
                    <Switch
                      checked={notificationSettings.push_notifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, push_notifications: checked }))
                      }
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h4 className="font-medium">通知类型</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>推特监控提醒</Label>
                      <p className="text-sm text-muted-foreground">关注的推特账号发布新内容时通知</p>
                    </div>
                    <Switch
                      checked={notificationSettings.twitter_alerts}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, twitter_alerts: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>钱包监控提醒</Label>
                      <p className="text-sm text-muted-foreground">监控钱包发生交易时通知</p>
                    </div>
                    <Switch
                      checked={notificationSettings.wallet_alerts}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, wallet_alerts: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>价格提醒</Label>
                      <p className="text-sm text-muted-foreground">价格达到设定阈值时通知</p>
                    </div>
                    <Switch
                      checked={notificationSettings.price_alerts}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, price_alerts: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>系统通知</Label>
                      <p className="text-sm text-muted-foreground">系统维护和重要公告</p>
                    </div>
                    <Switch
                      checked={notificationSettings.system_alerts}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, system_alerts: checked }))
                      }
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label>通知频率</Label>
                <Select
                  value={notificationSettings.alert_frequency}
                  onValueChange={(value) => 
                    setNotificationSettings(prev => ({ ...prev, alert_frequency: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">实时通知</SelectItem>
                    <SelectItem value="hourly">每小时汇总</SelectItem>
                    <SelectItem value="daily">每日汇总</SelectItem>
                    <SelectItem value="weekly">每周汇总</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={saveNotificationSettings} disabled={saving}>
                {saving ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                保存设置
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 安全设置 */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>安全设置</span>
              </CardTitle>
              <CardDescription>
                管理您的账户安全和隐私设置
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">密码修改</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="current_password">当前密码</Label>
                    <div className="relative">
                      <Input
                        id="current_password"
                        type={showPassword ? "text" : "password"}
                        value={passwordForm.current_password}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))}
                        placeholder="请输入当前密码"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new_password">新密码</Label>
                    <Input
                      id="new_password"
                      type="password"
                      value={passwordForm.new_password}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password: e.target.value }))}
                      placeholder="请输入新密码"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">确认新密码</Label>
                    <Input
                      id="confirm_password"
                      type="password"
                      value={passwordForm.confirm_password}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                      placeholder="请再次输入新密码"
                    />
                  </div>
                </div>
                
                <Button onClick={changePassword} disabled={saving}>
                  {saving ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Key className="h-4 w-4 mr-2" />
                  )}
                  修改密码
                </Button>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h4 className="font-medium">安全选项</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>双因素认证</Label>
                      <p className="text-sm text-muted-foreground">使用手机应用进行二次验证</p>
                    </div>
                    <Switch
                      checked={securitySettings.two_factor_enabled}
                      onCheckedChange={(checked) => 
                        setSecuritySettings(prev => ({ ...prev, two_factor_enabled: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>登录提醒</Label>
                      <p className="text-sm text-muted-foreground">新设备登录时发送邮件通知</p>
                    </div>
                    <Switch
                      checked={securitySettings.login_alerts}
                      onCheckedChange={(checked) => 
                        setSecuritySettings(prev => ({ ...prev, login_alerts: checked }))
                      }
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>会话超时</Label>
                <Select
                  value={securitySettings.session_timeout}
                  onValueChange={(value) => 
                    setSecuritySettings(prev => ({ ...prev, session_timeout: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">1小时</SelectItem>
                    <SelectItem value="6h">6小时</SelectItem>
                    <SelectItem value="24h">24小时</SelectItem>
                    <SelectItem value="7d">7天</SelectItem>
                    <SelectItem value="30d">30天</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={saveSecuritySettings} disabled={saving}>
                {saving ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                保存设置
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 界面设置 */}
        <TabsContent value="interface" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>界面设置</span>
              </CardTitle>
              <CardDescription>
                自定义您的界面外观和行为
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>主题</Label>
                  <Select
                    value={interfaceSettings.theme}
                    onValueChange={(value) => 
                      setInterfaceSettings(prev => ({ ...prev, theme: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">浅色主题</SelectItem>
                      <SelectItem value="dark">深色主题</SelectItem>
                      <SelectItem value="auto">跟随系统</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>语言</Label>
                  <Select
                    value={interfaceSettings.language}
                    onValueChange={(value) => 
                      setInterfaceSettings(prev => ({ ...prev, language: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zh-CN">简体中文</SelectItem>
                      <SelectItem value="zh-TW">繁体中文</SelectItem>
                      <SelectItem value="en-US">English</SelectItem>
                      <SelectItem value="ja-JP">日本語</SelectItem>
                      <SelectItem value="ko-KR">한국어</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>时区</Label>
                  <Select
                    value={interfaceSettings.timezone}
                    onValueChange={(value) => 
                      setInterfaceSettings(prev => ({ ...prev, timezone: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Shanghai">北京时间 (UTC+8)</SelectItem>
                      <SelectItem value="Asia/Tokyo">东京时间 (UTC+9)</SelectItem>
                      <SelectItem value="America/New_York">纽约时间 (UTC-5)</SelectItem>
                      <SelectItem value="Europe/London">伦敦时间 (UTC+0)</SelectItem>
                      <SelectItem value="UTC">协调世界时 (UTC)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>货币单位</Label>
                  <Select
                    value={interfaceSettings.currency}
                    onValueChange={(value) => 
                      setInterfaceSettings(prev => ({ ...prev, currency: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">美元 (USD)</SelectItem>
                      <SelectItem value="CNY">人民币 (CNY)</SelectItem>
                      <SelectItem value="EUR">欧元 (EUR)</SelectItem>
                      <SelectItem value="JPY">日元 (JPY)</SelectItem>
                      <SelectItem value="KRW">韩元 (KRW)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h4 className="font-medium">数据刷新</h4>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>自动刷新</Label>
                    <p className="text-sm text-muted-foreground">自动刷新页面数据</p>
                  </div>
                  <Switch
                    checked={interfaceSettings.auto_refresh}
                    onCheckedChange={(checked) => 
                      setInterfaceSettings(prev => ({ ...prev, auto_refresh: checked }))
                    }
                  />
                </div>
                
                {interfaceSettings.auto_refresh && (
                  <div className="space-y-2">
                    <Label>刷新间隔 (秒)</Label>
                    <Select
                      value={interfaceSettings.refresh_interval.toString()}
                      onValueChange={(value) => 
                        setInterfaceSettings(prev => ({ ...prev, refresh_interval: parseInt(value) }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10秒</SelectItem>
                        <SelectItem value="30">30秒</SelectItem>
                        <SelectItem value="60">1分钟</SelectItem>
                        <SelectItem value="300">5分钟</SelectItem>
                        <SelectItem value="600">10分钟</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              
              <Button onClick={saveInterfaceSettings} disabled={saving}>
                {saving ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                保存设置
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 账户管理 */}
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>账户管理</span>
              </CardTitle>
              <CardDescription>
                管理您的账户状态和数据
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {user && (
                <div className="space-y-4">
                  <h4 className="font-medium">账户信息</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">用户类型</Label>
                      <p className="font-medium">
                        {user.user_type === 'trial' ? '试用用户' : '付费用户'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">注册时间</Label>
                      <p className="font-medium">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString('zh-CN') : '未知'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">最后登录</Label>
                      <p className="font-medium">
                        {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString('zh-CN') : '未知'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">监控数量</Label>
                      <p className="font-medium">
                        {user.current_follows || 0} / {user.max_follows || 0}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <Separator />
              
              <div className="space-y-4">
                <h4 className="font-medium text-red-600">危险操作</h4>
                <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-950">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <h5 className="font-medium text-red-900 dark:text-red-100">删除账户</h5>
                      <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                        删除账户将永久删除您的所有数据，包括监控设置、通知历史等。此操作不可恢复。
                      </p>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="mt-3"
                        onClick={deleteAccount}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        删除账户
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

