import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import { ArrowLeft, Save, Trash2, Lock, User, RotateCcw, Ticket, Bell, BellOff, Send, Loader2, CheckCircle2, XCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { showTutorialDirectly } from '@/components/OnboardingManager';
import { PromoCodeInput } from '@/components/PromoCodeInput';
import { useNotifications } from '@/hooks/useNotifications';

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Profile State
  const [name, setName] = useState(user?.name || '');
  const [emailPreferences, setEmailPreferences] = useState(user?.email_preferences ?? true);

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Notifications
  const {
    permissionStatus,
    isSupported,
    isLoading: notifLoading,
    isEnabled,
    preferences,
    requestPermission,
    updatePreferences,
    disableNotifications,
    sendTestNotification
  } = useNotifications();

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authAPI.updateProfile({ name, email_preferences: emailPreferences });
      toast.success('Profile updated successfully');
      // Ideally update context user here, but a refresh works for now
      window.location.reload();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    setIsLoading(true);
    try {
      await authAPI.changePassword(currentPassword, newPassword);
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      await authAPI.deleteAccount();
      logout();
      navigate('/');
      toast.success('Account deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to delete account');
      setIsLoading(false);
    }
  };

  // Get permission status icon and text
  const getPermissionStatusUI = () => {
    switch (permissionStatus) {
      case 'granted':
        return { icon: <CheckCircle2 className="h-5 w-5 text-green-500" />, text: 'Enabled', color: 'text-green-500' };
      case 'denied':
        return { icon: <XCircle className="h-5 w-5 text-red-500" />, text: 'Blocked by browser', color: 'text-red-500' };
      case 'unsupported':
        return { icon: <AlertCircle className="h-5 w-5 text-amber-500" />, text: 'Not supported', color: 'text-amber-500' };
      default:
        return { icon: <BellOff className="h-5 w-5 text-muted-foreground" />, text: 'Not enabled', color: 'text-muted-foreground' };
    }
  };

  const statusUI = getPermissionStatusUI();

  return (
    <div className="min-h-screen bg-gradient-to-br from-cosmic-darker via-background to-cosmic-dark p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6 pl-0 hover:bg-transparent hover:text-primary"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Account Settings
        </h1>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-5 mb-8">
            <TabsTrigger value="profile">
              <User className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security">
              <Lock className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="rewards">
              <Ticket className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Rewards</span>
            </TabsTrigger>
            <TabsTrigger value="onboarding">
              <RotateCcw className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Tutorial</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="border-border/50 backdrop-blur-sm bg-card/80">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details and preferences.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user?.email} disabled className="bg-muted/50" />
                    <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-muted/50 border-border/50"
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-border/50 p-4 bg-muted/30">
                    <div className="space-y-0.5">
                      <Label className="text-base">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive updates about your charts and readings.
                      </p>
                    </div>
                    <Switch
                      checked={emailPreferences}
                      onCheckedChange={setEmailPreferences}
                    />
                  </div>

                  <Button type="submit" className="cosmic-glow" disabled={isLoading}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="border-border/50 backdrop-blur-sm bg-card/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Push Notifications
                </CardTitle>
                <CardDescription>
                  Receive personalized cosmic updates directly in your browser.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Permission Status */}
                <div className="flex items-center justify-between rounded-lg border border-border/50 p-4 bg-muted/30">
                  <div className="flex items-center gap-3">
                    {statusUI.icon}
                    <div>
                      <p className={`font-medium ${statusUI.color}`}>{statusUI.text}</p>
                      <p className="text-sm text-muted-foreground">
                        {permissionStatus === 'granted'
                          ? 'You will receive notifications in this browser'
                          : permissionStatus === 'denied'
                            ? 'Enable in browser settings to receive notifications'
                            : permissionStatus === 'unsupported'
                              ? 'Your browser does not support push notifications'
                              : 'Click the button to enable notifications'}
                      </p>
                    </div>
                  </div>
                  {permissionStatus !== 'granted' && isSupported && (
                    <Button
                      onClick={requestPermission}
                      disabled={notifLoading || permissionStatus === 'denied'}
                      className="cosmic-glow"
                    >
                      {notifLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Bell className="h-4 w-4 mr-2" />}
                      Enable
                    </Button>
                  )}
                  {permissionStatus === 'granted' && (
                    <Button
                      variant="outline"
                      onClick={disableNotifications}
                      disabled={notifLoading}
                    >
                      <BellOff className="h-4 w-4 mr-2" />
                      Disable
                    </Button>
                  )}
                </div>

                {/* Notification Preferences - Only show if permission granted */}
                {permissionStatus === 'granted' && (
                  <>
                    <div className="space-y-4">
                      <h3 className="font-semibold">Notification Types</h3>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between rounded-lg border border-border/50 p-4 bg-muted/30">
                          <div className="space-y-0.5">
                            <Label className="text-base">🌟 Daily Forecasts</Label>
                            <p className="text-sm text-muted-foreground">
                              Personalized daily cosmic insights based on your chart
                            </p>
                          </div>
                          <Switch
                            checked={preferences.daily_forecast}
                            onCheckedChange={(checked) => updatePreferences({ daily_forecast: checked })}
                            disabled={notifLoading}
                          />
                        </div>

                        <div className="flex items-center justify-between rounded-lg border border-border/50 p-4 bg-muted/30">
                          <div className="space-y-0.5">
                            <Label className="text-base">⚠️ Quota Warnings</Label>
                            <p className="text-sm text-muted-foreground">
                              Alerts when you're running low on messages
                            </p>
                          </div>
                          <Switch
                            checked={preferences.quota_warnings}
                            onCheckedChange={(checked) => updatePreferences({ quota_warnings: checked })}
                            disabled={notifLoading}
                          />
                        </div>

                        <div className="flex items-center justify-between rounded-lg border border-border/50 p-4 bg-muted/30">
                          <div className="space-y-0.5">
                            <Label className="text-base">📅 Subscription Reminders</Label>
                            <p className="text-sm text-muted-foreground">
                              Reminders before your subscription renews or expires
                            </p>
                          </div>
                          <Switch
                            checked={preferences.subscription_expiry}
                            onCheckedChange={(checked) => updatePreferences({ subscription_expiry: checked })}
                            disabled={notifLoading}
                          />
                        </div>

                        <div className="flex items-center justify-between rounded-lg border border-border/50 p-4 bg-muted/30">
                          <div className="space-y-0.5">
                            <Label className="text-base">🌙 Special Events</Label>
                            <p className="text-sm text-muted-foreground">
                              Full moons, eclipses, and significant transits
                            </p>
                          </div>
                          <Switch
                            checked={preferences.special_events}
                            onCheckedChange={(checked) => updatePreferences({ special_events: checked })}
                            disabled={notifLoading}
                          />
                        </div>

                        <div className="flex items-center justify-between rounded-lg border border-border/50 p-4 bg-muted/30">
                          <div className="space-y-0.5">
                            <Label className="text-base">💫 Re-engagement</Label>
                            <p className="text-sm text-muted-foreground">
                              Gentle reminders when you haven't visited in a while
                            </p>
                          </div>
                          <Switch
                            checked={preferences.re_engagement}
                            onCheckedChange={(checked) => updatePreferences({ re_engagement: checked })}
                            disabled={notifLoading}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Test Notification */}
                    <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">Test Notification</h3>
                          <p className="text-sm text-muted-foreground">
                            Send a sample daily forecast notification
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => sendTestNotification('daily_forecast')}
                          disabled={notifLoading}
                          className="border-primary/50"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Send Test
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                {/* Browser Settings Help */}
                {permissionStatus === 'denied' && (
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      💡 <strong>Enable notifications:</strong> Click the lock icon in your browser's address bar and allow notifications for this site.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card className="border-border/50 backdrop-blur-sm bg-card/80">
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Ensure your account is secure with a strong password.</CardDescription>
              </CardHeader>
              <CardContent>
                {user?.has_password === false ? (
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      💡 <strong>Signed in with Google</strong><br />
                      You're using Google authentication and don't have a password set.
                      To add a password, use the "Forgot Password" option on the login page.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="current"
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          required
                          className="bg-muted/50 border-border/50 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new">New Password</Label>
                      <div className="relative">
                        <Input
                          id="new"
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          minLength={6}
                          className="bg-muted/50 border-border/50 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirm"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          minLength={6}
                          className="bg-muted/50 border-border/50 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <Button type="submit" className="cosmic-glow" disabled={isLoading}>
                      Update Password
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            <Card className="border-red-500/20 backdrop-blur-sm bg-red-500/5">
              <CardHeader>
                <CardTitle className="text-red-500">Danger Zone</CardTitle>
                <CardDescription>Irreversible actions for your account.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Delete Account</h4>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all associated data.
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your account
                          and remove your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-500 hover:bg-red-600">
                          Yes, delete my account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onboarding Tab */}
          <TabsContent value="onboarding">
            <Card className="border-border/50 backdrop-blur-sm bg-card/80">
              <CardHeader>
                <CardTitle>Tutorial & Onboarding</CardTitle>
                <CardDescription>Manage your onboarding experience.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg border border-border/50 p-4 bg-muted/30 space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Restart Onboarding Tutorial</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      If you'd like to see the welcome screen and tutorial again, click the button below.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        showTutorialDirectly();
                        toast.success('Tutorial is now open!');
                      }}
                      className="border-primary/50"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Restart Onboarding
                    </Button>
                  </div>
                </div>

                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    💡 The onboarding tutorial appears once per account. Use this option if you accidentally skipped it or want to review the features.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rewards Tab */}
          <TabsContent value="rewards">
            <Card className="border-border/50 backdrop-blur-sm bg-card/80">
              <CardHeader>
                <CardTitle>Promo Codes & Rewards</CardTitle>
                <CardDescription>Redeem promo codes to unlock special features and bonuses.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <PromoCodeInput
                  onRedeemSuccess={() => {
                    toast.success('🎉 Reward Applied!', {
                      description: 'Your new benefits are now active.',
                    });
                  }}
                />

                <div className="rounded-lg border border-border/50 p-4 bg-muted/30">
                  <h3 className="font-semibold mb-2">Where to find promo codes?</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Check our newsletters for special offers</li>
                    <li>• Participate in our community events</li>
                    <li>• Watch for special promotions on our website</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
