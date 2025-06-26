'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Settings, 
  Bell, 
  Shield,
  CreditCard,
  Download,
  Upload,
  Edit,
  Camera,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  DollarSign,
  Target,
  TrendingUp,
  Award
} from 'lucide-react';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+60 12-345 6789',
    location: 'Kuala Lumpur, Malaysia',
    occupation: 'Software Engineer',
    company: 'Tech Solutions Sdn Bhd',
    joinDate: '2024-01-15',
    monthlyIncome: 8000,
    financialGoals: 'Build emergency fund and save for property down payment',
    riskTolerance: 'Moderate'
  });

  const [preferences, setPreferences] = useState({
    currency: 'MYR',
    language: 'English',
    timezone: 'Asia/Kuala_Lumpur',
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    goalReminders: true
  });

  const stats = {
    totalSavings: 45000,
    goalsCompleted: 3,
    currentStreak: 28,
    totalPoints: 2850,
    level: 12,
    joinedDaysAgo: Math.floor((new Date().getTime() - new Date('2024-01-15').getTime()) / (1000 * 60 * 60 * 24))
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    // Here you would typically save to an API
    console.log('Saving profile:', profileData);
  };

  const handleSavePreferences = () => {
    // Here you would typically save to an API
    console.log('Saving preferences:', preferences);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto p-4 lg:p-6 space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold gradient-text">
              Profile
            </h1>
            <p className="text-muted-foreground mt-1 lg:mt-2 text-sm lg:text-base">
              Manage your account and preferences
            </p>
          </div>
          <Button 
            onClick={() => setIsEditing(!isEditing)}
            className="btn-primary"
          >
            <Edit className="h-4 w-4 mr-2" />
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>

        {/* Profile Overview */}
        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-cyan-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {profileData.name.split(' ').map(n => n[0]).join('')}
                </div>
                <Button
                  size="sm"
                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                  onClick={() => console.log('Change avatar')}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{profileData.name}</h2>
                <p className="text-muted-foreground">{profileData.email}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge className="bg-primary/20 text-primary">
                    Level {stats.level}
                  </Badge>
                  <Badge variant="outline">
                    <Award className="h-3 w-3 mr-1" />
                    {stats.totalPoints} points
                  </Badge>
                  <Badge variant="outline">
                    {stats.joinedDaysAgo} days member
                  </Badge>
                </div>
              </div>
              <div className="text-right space-y-2">
                <div className="text-sm text-muted-foreground">Total Savings</div>
                <div className="text-2xl font-bold text-green-600">
                  RM {stats.totalSavings.toLocaleString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="metric-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <span>Goals Completed</span>
                <Target className="h-4 w-4 text-green-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.goalsCompleted}</div>
              <p className="text-xs text-muted-foreground mt-1">Financial milestones</p>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <span>Current Streak</span>
                <TrendingUp className="h-4 w-4 text-orange-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.currentStreak}</div>
              <p className="text-xs text-muted-foreground mt-1">Days tracking</p>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <span>Achievement Points</span>
                <Award className="h-4 w-4 text-yellow-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPoints}</div>
              <p className="text-xs text-muted-foreground mt-1">XP earned</p>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <span>Member Level</span>
                <Shield className="h-4 w-4 text-purple-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.level}</div>
              <p className="text-xs text-muted-foreground mt-1">Current tier</p>
            </CardContent>
          </Card>
        </div>

        {/* Profile Tabs */}
        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-6">
            <Card className="metric-card">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        disabled={!isEditing}
                        className="glassmorphism-button"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        disabled={!isEditing}
                        className="glassmorphism-button"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={!isEditing}
                        className="glassmorphism-button"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        value={profileData.location}
                        onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                        disabled={!isEditing}
                        className="glassmorphism-button"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="occupation">Occupation</Label>
                    <div className="flex items-center space-x-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="occupation"
                        value={profileData.occupation}
                        onChange={(e) => setProfileData(prev => ({ ...prev, occupation: e.target.value }))}
                        disabled={!isEditing}
                        className="glassmorphism-button"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <div className="flex items-center space-x-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="company"
                        value={profileData.company}
                        onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                        disabled={!isEditing}
                        className="glassmorphism-button"
                      />
                    </div>
                  </div>
                </div>
                {isEditing && (
                  <div className="flex space-x-3">
                    <Button onClick={handleSaveProfile} className="btn-primary">
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <Card className="metric-card">
              <CardHeader>
                <CardTitle>Financial Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="income">Monthly Income (RM)</Label>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="income"
                        type="number"
                        value={profileData.monthlyIncome}
                        onChange={(e) => setProfileData(prev => ({ ...prev, monthlyIncome: Number(e.target.value) }))}
                        disabled={!isEditing}
                        className="glassmorphism-button"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="risk">Risk Tolerance</Label>
                    <select
                      id="risk"
                      value={profileData.riskTolerance}
                      onChange={(e) => setProfileData(prev => ({ ...prev, riskTolerance: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border rounded-lg glassmorphism-button"
                    >
                      <option value="Conservative">Conservative</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Aggressive">Aggressive</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goals">Financial Goals</Label>
                  <textarea
                    id="goals"
                    value={profileData.financialGoals}
                    onChange={(e) => setProfileData(prev => ({ ...prev, financialGoals: e.target.value }))}
                    disabled={!isEditing}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg glassmorphism-button resize-none"
                    placeholder="Describe your financial goals..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card className="metric-card">
              <CardHeader>
                <CardTitle>App Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <select
                      id="currency"
                      value={preferences.currency}
                      onChange={(e) => setPreferences(prev => ({ ...prev, currency: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg glassmorphism-button"
                    >
                      <option value="MYR">Malaysian Ringgit (RM)</option>
                      <option value="USD">US Dollar ($)</option>
                      <option value="EUR">Euro (€)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <select
                      id="language"
                      value={preferences.language}
                      onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg glassmorphism-button"
                    >
                      <option value="English">English</option>
                      <option value="Bahasa Malaysia">Bahasa Malaysia</option>
                      <option value="中文">中文</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <select
                      id="timezone"
                      value={preferences.timezone}
                      onChange={(e) => setPreferences(prev => ({ ...prev, timezone: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg glassmorphism-button"
                    >
                      <option value="Asia/Kuala_Lumpur">Kuala Lumpur</option>
                      <option value="Asia/Singapore">Singapore</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Notifications</h4>
                  <div className="space-y-3">
                    {[
                      { key: 'emailNotifications', label: 'Email Notifications', icon: <Mail className="h-4 w-4" /> },
                      { key: 'pushNotifications', label: 'Push Notifications', icon: <Bell className="h-4 w-4" /> },
                      { key: 'weeklyReports', label: 'Weekly Reports', icon: <TrendingUp className="h-4 w-4" /> },
                      { key: 'goalReminders', label: 'Goal Reminders', icon: <Target className="h-4 w-4" /> }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {item.icon}
                          <span className="text-sm font-medium">{item.label}</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={preferences[item.key as keyof typeof preferences] as boolean}
                            onChange={(e) => setPreferences(prev => ({ 
                              ...prev, 
                              [item.key]: e.target.checked 
                            }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={handleSavePreferences} className="btn-primary">
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card className="metric-card">
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <h4 className="font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Enable 2FA
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <h4 className="font-medium">Change Password</h4>
                      <p className="text-sm text-muted-foreground">Update your account password</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Change
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <h4 className="font-medium">Login History</h4>
                      <p className="text-sm text-muted-foreground">View recent account activity</p>
                    </div>
                    <Button variant="outline" size="sm">
                      View History
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <h4 className="font-medium">Export Data</h4>
                      <p className="text-sm text-muted-foreground">Download your financial data</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 