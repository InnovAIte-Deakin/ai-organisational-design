import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Settings as SettingsIcon, Save, User, Bell, Shield, Database, Palette, Download } from "lucide-react";

export default function Settings() {
  const { toast } = useToast();

  // Practice Information
  const [practiceInfo, setPracticeInfo] = useState({
    practiceName: "Smile Dental Care",
    address: "123 Main Street, Anytown, ST 12345",
    phone: "(555) 123-4567",
    email: "info@smiledentalcare.com",
    website: "www.smiledentalcare.com",
    dentistName: "Dr. Sarah Johnson, DDS",
    licenseNumber: "DDS-12345"
  });

  // AI Settings
  const [aiSettings, setAiSettings] = useState({
    enableXrayAnalysis: true,
    enableTreatmentNotes: true,
    enablePatientSummaries: true,
    aiConfidenceThreshold: 80,
    autoGenerateSummaries: false
  });

  // User Preferences
  const [userPreferences, setUserPreferences] = useState({
    theme: "light",
    language: "en",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
    defaultXrayType: "bitewing",
    autoSaveInterval: 5
  });

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    analysisComplete: true,
    systemUpdates: true,
    maintenanceAlerts: true
  });

  // System Settings
  const [systemSettings, setSystemSettings] = useState({
    dataRetention: "7years",
    backupFrequency: "daily",
    securityLevel: "high",
    sessionTimeout: 60,
    enableLogging: true
  });

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your practice settings have been updated successfully.",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Export Started",
      description: "Your practice data is being prepared for export.",
    });
  };

  const handleBackupNow = () => {
    toast({
      title: "Backup Initiated",
      description: "Creating backup of practice data...",
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <SettingsIcon className="h-6 w-6 text-medical-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Practice Settings</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Practice Information */}
        <Card data-testid="card-practice-info">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <User className="h-5 w-5 text-medical-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Practice Information</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Practice Name</label>
                <Input
                  value={practiceInfo.practiceName}
                  onChange={(e) => setPracticeInfo({...practiceInfo, practiceName: e.target.value})}
                  data-testid="input-practice-name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <Textarea
                  value={practiceInfo.address}
                  onChange={(e) => setPracticeInfo({...practiceInfo, address: e.target.value})}
                  className="h-20"
                  data-testid="textarea-practice-address"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <Input
                    value={practiceInfo.phone}
                    onChange={(e) => setPracticeInfo({...practiceInfo, phone: e.target.value})}
                    data-testid="input-practice-phone"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <Input
                    value={practiceInfo.email}
                    onChange={(e) => setPracticeInfo({...practiceInfo, email: e.target.value})}
                    data-testid="input-practice-email"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Dentist</label>
                <Input
                  value={practiceInfo.dentistName}
                  onChange={(e) => setPracticeInfo({...practiceInfo, dentistName: e.target.value})}
                  data-testid="input-dentist-name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                <Input
                  value={practiceInfo.licenseNumber}
                  onChange={(e) => setPracticeInfo({...practiceInfo, licenseNumber: e.target.value})}
                  data-testid="input-license-number"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Settings */}
        <Card data-testid="card-ai-settings">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-5 w-5 text-medical-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">AI Configuration</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">X-ray AI Analysis</label>
                  <p className="text-xs text-gray-500">Enable AI-powered dental X-ray analysis</p>
                </div>
                <Switch
                  checked={aiSettings.enableXrayAnalysis}
                  onCheckedChange={(checked) => setAiSettings({...aiSettings, enableXrayAnalysis: checked})}
                  data-testid="switch-xray-analysis"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Treatment Notes AI</label>
                  <p className="text-xs text-gray-500">Auto-generate treatment notes from appointments</p>
                </div>
                <Switch
                  checked={aiSettings.enableTreatmentNotes}
                  onCheckedChange={(checked) => setAiSettings({...aiSettings, enableTreatmentNotes: checked})}
                  data-testid="switch-treatment-notes"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Patient Summaries</label>
                  <p className="text-xs text-gray-500">Generate AI summaries for patient records</p>
                </div>
                <Switch
                  checked={aiSettings.enablePatientSummaries}
                  onCheckedChange={(checked) => setAiSettings({...aiSettings, enablePatientSummaries: checked})}
                  data-testid="switch-patient-summaries"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  AI Confidence Threshold: {aiSettings.aiConfidenceThreshold}%
                </label>
                <input
                  type="range"
                  min="50"
                  max="95"
                  value={aiSettings.aiConfidenceThreshold}
                  onChange={(e) => setAiSettings({...aiSettings, aiConfidenceThreshold: parseInt(e.target.value)})}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  data-testid="slider-confidence-threshold"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>50%</span>
                  <span>95%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Auto-Generate Summaries</label>
                  <p className="text-xs text-gray-500">Automatically create summaries after appointments</p>
                </div>
                <Switch
                  checked={aiSettings.autoGenerateSummaries}
                  onCheckedChange={(checked) => setAiSettings({...aiSettings, autoGenerateSummaries: checked})}
                  data-testid="switch-auto-summaries"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Preferences */}
        <Card data-testid="card-user-preferences">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Palette className="h-5 w-5 text-medical-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">User Preferences</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
                <Select value={userPreferences.theme} onValueChange={(value) => setUserPreferences({...userPreferences, theme: value})}>
                  <SelectTrigger data-testid="select-theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
                  <Select value={userPreferences.dateFormat} onValueChange={(value) => setUserPreferences({...userPreferences, dateFormat: value})}>
                    <SelectTrigger data-testid="select-date-format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Format</label>
                  <Select value={userPreferences.timeFormat} onValueChange={(value) => setUserPreferences({...userPreferences, timeFormat: value})}>
                    <SelectTrigger data-testid="select-time-format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12h">12 Hour</SelectItem>
                      <SelectItem value="24h">24 Hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default X-ray Type</label>
                <Select value={userPreferences.defaultXrayType} onValueChange={(value) => setUserPreferences({...userPreferences, defaultXrayType: value})}>
                  <SelectTrigger data-testid="select-default-xray">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bitewing">Bitewing</SelectItem>
                    <SelectItem value="panoramic">Panoramic</SelectItem>
                    <SelectItem value="periapical">Periapical</SelectItem>
                    <SelectItem value="occlusal">Occlusal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Auto-save Interval: {userPreferences.autoSaveInterval} minutes
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={userPreferences.autoSaveInterval}
                  onChange={(e) => setUserPreferences({...userPreferences, autoSaveInterval: parseInt(e.target.value)})}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  data-testid="slider-autosave"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1 min</span>
                  <span>30 min</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card data-testid="card-notifications">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Bell className="h-5 w-5 text-medical-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                  <p className="text-xs text-gray-500">Receive notifications via email</p>
                </div>
                <Switch
                  checked={notifications.emailNotifications}
                  onCheckedChange={(checked) => setNotifications({...notifications, emailNotifications: checked})}
                  data-testid="switch-email-notifications"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">SMS Notifications</label>
                  <p className="text-xs text-gray-500">Receive notifications via text message</p>
                </div>
                <Switch
                  checked={notifications.smsNotifications}
                  onCheckedChange={(checked) => setNotifications({...notifications, smsNotifications: checked})}
                  data-testid="switch-sms-notifications"
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Appointment Reminders</label>
                <Switch
                  checked={notifications.appointmentReminders}
                  onCheckedChange={(checked) => setNotifications({...notifications, appointmentReminders: checked})}
                  data-testid="switch-appointment-reminders"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Analysis Complete</label>
                <Switch
                  checked={notifications.analysisComplete}
                  onCheckedChange={(checked) => setNotifications({...notifications, analysisComplete: checked})}
                  data-testid="switch-analysis-complete"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">System Updates</label>
                <Switch
                  checked={notifications.systemUpdates}
                  onCheckedChange={(checked) => setNotifications({...notifications, systemUpdates: checked})}
                  data-testid="switch-system-updates"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Maintenance Alerts</label>
                <Switch
                  checked={notifications.maintenanceAlerts}
                  onCheckedChange={(checked) => setNotifications({...notifications, maintenanceAlerts: checked})}
                  data-testid="switch-maintenance-alerts"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System & Data Management */}
        <Card data-testid="card-system-data" className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Database className="h-5 w-5 text-medical-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">System & Data Management</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900">Data Retention</h4>
                <Select value={systemSettings.dataRetention} onValueChange={(value) => setSystemSettings({...systemSettings, dataRetention: value})}>
                  <SelectTrigger data-testid="select-data-retention">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1year">1 Year</SelectItem>
                    <SelectItem value="3years">3 Years</SelectItem>
                    <SelectItem value="7years">7 Years</SelectItem>
                    <SelectItem value="indefinite">Indefinite</SelectItem>
                  </SelectContent>
                </Select>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout (minutes)</label>
                  <Input
                    type="number"
                    value={systemSettings.sessionTimeout}
                    onChange={(e) => setSystemSettings({...systemSettings, sessionTimeout: parseInt(e.target.value)})}
                    min="15"
                    max="480"
                    data-testid="input-session-timeout"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900">Backup Settings</h4>
                <Select value={systemSettings.backupFrequency} onValueChange={(value) => setSystemSettings({...systemSettings, backupFrequency: value})}>
                  <SelectTrigger data-testid="select-backup-frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  onClick={handleBackupNow}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  data-testid="button-backup-now"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Backup Now
                </Button>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900">Data Export</h4>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Enable Logging</label>
                  <Switch
                    checked={systemSettings.enableLogging}
                    onCheckedChange={(checked) => setSystemSettings({...systemSettings, enableLogging: checked})}
                    data-testid="switch-enable-logging"
                  />
                </div>
                
                <Button
                  onClick={handleExportData}
                  className="w-full bg-green-600 hover:bg-green-700"
                  data-testid="button-export-data"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Practice Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-6">
        <Button
          onClick={handleSave}
          className="bg-medical-blue-600 hover:bg-medical-blue-700 px-8"
          data-testid="button-save-settings"
        >
          <Save className="h-4 w-4 mr-2" />
          Save All Settings
        </Button>
      </div>
    </div>
  );
}