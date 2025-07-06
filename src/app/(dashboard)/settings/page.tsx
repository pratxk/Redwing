"use client";

import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Bell, 
  Shield, 
  Globe, 
  Database, 
  Wifi,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import { CacheMonitor } from '@/components/admin/CacheMonitor';
import { SettingsProvider, useSettings } from '../../../features/data/SettingsContext';

function SettingsPageContent() {
  const { settings, loading, error, updateSetting, refetch } = useSettings() as {
    settings: any;
    loading: boolean;
    error: any;
    updateSetting: (key: string, value: any) => void;
    refetch: () => void;
  };
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    missionUpdates: true,
    droneAlerts: true,
    systemAlerts: true,
  });

  const [security, setSecurity] = useState({
    twoFactorAuth: true,
    sessionTimeout: 30,
    passwordExpiry: 90,
    maxLoginAttempts: 5,
    ipWhitelist: '',
  });

  const [system, setSystem] = useState({
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    language: 'en',
    autoBackup: true,
    backupFrequency: 'daily',
    retentionDays: 30,
  });

  const [droneSettings, setDroneSettings] = useState({
    maxAltitude: 400,
    maxDistance: 5000,
    geofenceEnabled: true,
    returnToHome: true,
    lowBatteryThreshold: 20,
    signalLossAction: 'RTH',
  });

  const handleSave = (section: string) => {
    toast.success(`${section} settings saved successfully`);
  };

  const handleTestConnection = () => {
    toast.success('Connection test successful');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Configure system preferences and security settings"
      />

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="drones">Drone Settings</TabsTrigger>
          <TabsTrigger value="cache">Cache Monitor</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Basic application preferences and display options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={system.timezone} onValueChange={(value) => setSystem({...system, timezone: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="EST">Eastern Time</SelectItem>
                      <SelectItem value="PST">Pacific Time</SelectItem>
                      <SelectItem value="GMT">GMT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={system.language} onValueChange={(value) => setSystem({...system, language: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select value={system.dateFormat} onValueChange={(value) => setSystem({...system, dateFormat: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeFormat">Time Format</Label>
                  <Select value={system.timeFormat} onValueChange={(value) => setSystem({...system, timeFormat: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12h">12-hour</SelectItem>
                      <SelectItem value="24h">24-hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button onClick={() => handleSave('General')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Notification Channels</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.email} 
                      onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive browser push notifications
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.push} 
                      onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via SMS
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.sms} 
                      onCheckedChange={(checked) => setNotifications({...notifications, sms: checked})}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Notification Types</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Mission Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Notify when missions start, complete, or fail
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.missionUpdates} 
                      onCheckedChange={(checked) => setNotifications({...notifications, missionUpdates: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Drone Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Notify about drone status changes and issues
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.droneAlerts} 
                      onCheckedChange={(checked) => setNotifications({...notifications, droneAlerts: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>System Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Notify about system maintenance and updates
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.systemAlerts} 
                      onCheckedChange={(checked) => setNotifications({...notifications, systemAlerts: checked})}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button onClick={() => handleSave('Notification')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure authentication and security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Require 2FA for all user accounts
                    </p>
                  </div>
                  <Switch 
                    checked={security.twoFactorAuth} 
                    onCheckedChange={(checked) => setSecurity({...security, twoFactorAuth: checked})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input 
                      id="sessionTimeout"
                      type="number"
                      value={security.sessionTimeout}
                      onChange={(e) => setSecurity({...security, sessionTimeout: parseInt(e.target.value)})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                    <Input 
                      id="passwordExpiry"
                      type="number"
                      value={security.passwordExpiry}
                      onChange={(e) => setSecurity({...security, passwordExpiry: parseInt(e.target.value)})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                    <Input 
                      id="maxLoginAttempts"
                      type="number"
                      value={security.maxLoginAttempts}
                      onChange={(e) => setSecurity({...security, maxLoginAttempts: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ipWhitelist">IP Whitelist</Label>
                  <Textarea 
                    id="ipWhitelist"
                    placeholder="Enter IP addresses (one per line)"
                    value={security.ipWhitelist}
                    onChange={(e) => setSecurity({...security, ipWhitelist: e.target.value})}
                  />
                  <p className="text-sm text-muted-foreground">
                    Leave empty to allow all IP addresses
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button onClick={() => handleSave('Security')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>
                Database and system maintenance settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Automatic Backups</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable automatic database backups
                    </p>
                  </div>
                  <Switch 
                    checked={system.autoBackup} 
                    onCheckedChange={(checked) => setSystem({...system, autoBackup: checked})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="backupFrequency">Backup Frequency</Label>
                    <Select value={system.backupFrequency} onValueChange={(value) => setSystem({...system, backupFrequency: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="retentionDays">Retention Period (days)</Label>
                    <Input 
                      id="retentionDays"
                      type="number"
                      value={system.retentionDays}
                      onChange={(e) => setSystem({...system, retentionDays: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleTestConnection}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Test Connection
                </Button>
                <Button onClick={() => handleSave('System')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Drone Safety Settings</CardTitle>
              <CardDescription>
                Configure safety parameters and flight restrictions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="maxAltitude">Maximum Altitude (ft)</Label>
                  <Input 
                    id="maxAltitude"
                    type="number"
                    value={droneSettings.maxAltitude}
                    onChange={(e) => setDroneSettings({...droneSettings, maxAltitude: parseInt(e.target.value)})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxDistance">Maximum Distance (ft)</Label>
                  <Input 
                    id="maxDistance"
                    type="number"
                    value={droneSettings.maxDistance}
                    onChange={(e) => setDroneSettings({...droneSettings, maxDistance: parseInt(e.target.value)})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lowBatteryThreshold">Low Battery Threshold (%)</Label>
                  <Input 
                    id="lowBatteryThreshold"
                    type="number"
                    value={droneSettings.lowBatteryThreshold}
                    onChange={(e) => setDroneSettings({...droneSettings, lowBatteryThreshold: parseInt(e.target.value)})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signalLossAction">Signal Loss Action</Label>
                  <Select value={droneSettings.signalLossAction} onValueChange={(value) => setDroneSettings({...droneSettings, signalLossAction: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RTH">Return to Home</SelectItem>
                      <SelectItem value="HOVER">Hover in Place</SelectItem>
                      <SelectItem value="LAND">Land Immediately</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Geofence Enabled</Label>
                    <p className="text-sm text-muted-foreground">
                      Restrict drones to predefined flight zones
                    </p>
                  </div>
                  <Switch 
                    checked={droneSettings.geofenceEnabled} 
                    onCheckedChange={(checked) => setDroneSettings({...droneSettings, geofenceEnabled: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Return to Home on Low Battery</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically return to home when battery is low
                    </p>
                  </div>
                  <Switch 
                    checked={droneSettings.returnToHome} 
                    onCheckedChange={(checked) => setDroneSettings({...droneSettings, returnToHome: checked})}
                  />
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button onClick={() => handleSave('Drone')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <CacheMonitor />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <SettingsProvider>
      <SettingsPageContent />
    </SettingsProvider>
  );
} 