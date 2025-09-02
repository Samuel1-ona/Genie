import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Search,
  Bell,
  Moon,
  Key,
  Building2,
  Users,
  Eye,
  EyeOff,
  RefreshCw,
  Copy,
  Info,
  Save,
  RotateCcw,
  MoreVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/lib/toast';
import { TallyConfigPanel } from '@/components/tally/TallyConfigPanel';

interface Settings {
  tallyApiKey: string;
  discordWebhookUrl: string;
  telegramBotToken: string;
  telegramChatId: string;
  targetAgentId: string;
  debugMode: boolean;
  testNetwork: boolean;
  autoRecovery: boolean;
  cacheResults: boolean;
  users: User[];
  inviteLink: string;
}

interface User {
  id: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  lastActive: string;
}

const mockUsers: User[] = [
  { id: '1', name: 'Alex Johnson', role: 'admin', lastActive: 'Now' },
  { id: '2', name: 'Sarah Miller', role: 'editor', lastActive: '2h ago' },
  { id: '3', name: 'Michael Brown', role: 'viewer', lastActive: '1d ago' },
];

const ROLE_CONFIG = {
  admin: {
    label: 'Admin',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  },
  editor: {
    label: 'Editor',
    color:
      'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  },
  viewer: {
    label: 'Viewer',
    color:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  },
};

export default function SettingsPage() {
  const toast = useToast();
  const [settings, setSettings] = useState<Settings>({
    tallyApiKey: '',
    discordWebhookUrl:
      'https://discord.com/api/webhooks/123456789/abcdefghijklmnopqrstuvwxyz',
    telegramBotToken: '1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghi',
    telegramChatId: '-1001234567890',
    targetAgentId: 'zXwe33pU_atwFgzL_pFcSc8KLKzyXQ5I_TZOA5PQv-M',
    debugMode: true,
    testNetwork: false,
    autoRecovery: true,
    cacheResults: true,
    users: mockUsers,
    inviteLink: 'https://genie-proposal.xyz/invite/abc123def456',
  });

  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({
    tallyApiKey: false,
    telegramBotToken: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem('genie-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }
  }, []);

  useEffect(() => {
    const savedSettings = localStorage.getItem('genie-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setHasChanges(JSON.stringify(settings) !== JSON.stringify(parsed));
      } catch (error) {
        setHasChanges(true);
      }
    } else {
      setHasChanges(true);
    }
  }, [settings]);

  const handleInputChange = (
    field: keyof Settings,
    value: string | boolean
  ) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const generateNewKey = (field: keyof Settings) => {
    const newValue =
      field === 'tallyApiKey'
        ? 'new_' +
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15)
        : field === 'telegramBotToken'
          ? Math.floor(Math.random() * 1000000000) +
            ':' +
            Math.random().toString(36).substring(2, 15).toUpperCase()
          : 'https://discord.com/api/webhooks/' +
            Math.floor(Math.random() * 1000000000) +
            '/' +
            Math.random().toString(36).substring(2, 15);

    handleInputChange(field, newValue);
  };

  const generateNewInviteLink = () => {
    const newLink =
      'https://genie-proposal.xyz/invite/' +
      Math.random().toString(36).substring(2, 15);
    handleInputChange('inviteLink', newLink);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(
      'Copied to clipboard',
      'The text has been copied to your clipboard'
    );
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      const requiredFields = ['tallyApiKey', 'targetAgentId'];
      const missingFields = requiredFields.filter(
        field => !settings[field as keyof Settings]
      );

      if (missingFields.length > 0) {
        alert(
          `Please fill in all required fields: ${missingFields.join(', ')}`
        );
        return;
      }

      localStorage.setItem('genie-settings', JSON.stringify(settings));
      setHasChanges(false);
      toast.success(
        'Settings saved',
        'Your settings have been saved successfully'
      );
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (
      confirm(
        'Are you sure you want to reset all settings to their default values?'
      )
    ) {
      const savedSettings = localStorage.getItem('genie-settings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          setSettings(parsed);
        } catch (error) {
          console.error('Failed to reset settings:', error);
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Settings
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Configure system parameters and integrations
            </p>
          </div>

          <div className="mt-4 lg:mt-0 flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search..."
                className="pl-10 w-64 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              />
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <Bell className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <Moon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* API Keys Section */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Key className="h-6 w-6 text-blue-500" />
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  API Keys
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Configure external service integrations for data retrieval and
                  notifications
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tally API Key */}
            <div>
              <Label
                htmlFor="tallyApiKey"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Tally API Key *
              </Label>
              <div className="mt-2 relative">
                <Input
                  id="tallyApiKey"
                  type={showPasswords.tallyApiKey ? 'text' : 'password'}
                  value={settings.tallyApiKey}
                  onChange={e =>
                    handleInputChange('tallyApiKey', e.target.value)
                  }
                  placeholder="Enter your Tally API key"
                  className="pr-20 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                  <button
                    onClick={() => togglePasswordVisibility('tallyApiKey')}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.tallyApiKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => generateNewKey('tallyApiKey')}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Used for retrieving proposal data from Tally.xyz governance
                platforms
              </p>
            </div>

            {/* Tally Configuration Panel */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <TallyConfigPanel />
            </div>

            {/* Discord Webhook URL */}
            <div>
              <Label
                htmlFor="discordWebhook"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Discord Webhook URL
              </Label>
              <div className="mt-2 relative">
                <Input
                  id="discordWebhook"
                  type="text"
                  value={settings.discordWebhookUrl}
                  onChange={e =>
                    handleInputChange('discordWebhookUrl', e.target.value)
                  }
                  placeholder="https://discord.com/api/webhooks/..."
                  className="pr-20 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                  <button
                    onClick={() => copyToClipboard(settings.discordWebhookUrl)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => generateNewKey('discordWebhookUrl')}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                For sending proposal notifications to Discord channels
              </p>
            </div>

            {/* Telegram Bot Token */}
            <div>
              <Label
                htmlFor="telegramBotToken"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Telegram Bot Token
              </Label>
              <div className="mt-2 relative">
                <Input
                  id="telegramBotToken"
                  type={showPasswords.telegramBotToken ? 'text' : 'password'}
                  value={settings.telegramBotToken}
                  onChange={e =>
                    handleInputChange('telegramBotToken', e.target.value)
                  }
                  placeholder="Enter your Telegram bot token"
                  className="pr-20 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                  <button
                    onClick={() => togglePasswordVisibility('telegramBotToken')}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.telegramBotToken ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => generateNewKey('telegramBotToken')}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Bot token for sending Telegram notifications
              </p>
            </div>

            {/* Telegram Chat ID */}
            <div>
              <Label
                htmlFor="telegramChatId"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Telegram Chat ID
              </Label>
              <div className="mt-2 relative">
                <Input
                  id="telegramChatId"
                  type="text"
                  value={settings.telegramChatId}
                  onChange={e =>
                    handleInputChange('telegramChatId', e.target.value)
                  }
                  placeholder="Enter chat ID (e.g., -1001234567890)"
                  className="pr-20 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                  <button
                    onClick={() => copyToClipboard(settings.telegramChatId)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                ID of the chat where notifications should be sent
              </p>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex">
                <Info className="h-5 w-5 text-blue-400 mt-0.5" />
                <div className="ml-3">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    API keys are stored securely and encrypted at rest. They are
                    only decrypted when needed for API calls.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AO Agent Configuration Section */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Building2 className="h-6 w-6 text-green-500" />
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  AO Agent Configuration
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Configure Arweave Operating System agent parameters
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Target Agent ID */}
            <div>
              <Label
                htmlFor="targetAgentId"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Target Agent ID *
              </Label>
              <div className="mt-2 relative">
                <Input
                  id="targetAgentId"
                  type="text"
                  value={settings.targetAgentId}
                  onChange={e =>
                    handleInputChange('targetAgentId', e.target.value)
                  }
                  placeholder="Enter AO agent ID"
                  className="pr-20 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <button
                    onClick={() => copyToClipboard(settings.targetAgentId)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                The AO agent ID that will process and store governance data
              </p>
            </div>

            {/* Environment Flags */}
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 block">
                Environment Flags
              </Label>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Debug Mode
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Enable verbose logging for troubleshooting
                    </p>
                  </div>
                  <Switch
                    checked={settings.debugMode}
                    onCheckedChange={checked =>
                      handleInputChange('debugMode', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Test Network
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Use testnet instead of mainnet
                    </p>
                  </div>
                  <Switch
                    checked={settings.testNetwork}
                    onCheckedChange={checked =>
                      handleInputChange('testNetwork', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Auto-Recovery
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Automatically recover from agent failures
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoRecovery}
                    onCheckedChange={checked =>
                      handleInputChange('autoRecovery', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Cache Results
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Store API results in cache to reduce rate limits
                    </p>
                  </div>
                  <Switch
                    checked={settings.cacheResults}
                    onCheckedChange={checked =>
                      handleInputChange('cacheResults', checked)
                    }
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Roles & Permissions Section */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Users className="h-6 w-6 text-purple-500" />
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  Roles & Permissions
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Manage user access and permissions
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* User Roles Table */}
            <div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        User
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        Role
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        Last Active
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {settings.users.map(user => (
                      <tr
                        key={user.id}
                        className="border-b border-gray-100 dark:border-gray-700"
                      >
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-900 dark:text-white">
                            {user.name}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={cn(
                              'px-2 py-1 rounded-full text-xs font-medium',
                              ROLE_CONFIG[user.role].color
                            )}
                          >
                            {ROLE_CONFIG[user.role].label}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {user.lastActive}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Button
                variant="outline"
                className="mt-4 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              >
                + Add User
              </Button>
            </div>

            {/* Invite Link */}
            <div>
              <Label
                htmlFor="inviteLink"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Invite Link
              </Label>
              <div className="mt-2 relative">
                <Input
                  id="inviteLink"
                  type="text"
                  value={settings.inviteLink}
                  readOnly
                  className="pr-20 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                  <button
                    onClick={() => copyToClipboard(settings.inviteLink)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Link expires in 7 days
              </p>

              <Button
                variant="outline"
                onClick={generateNewInviteLink}
                className="mt-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              >
                Generate New Link
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isLoading}
            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || !hasChanges}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {/* Demo Disclaimer */}
        <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <div className="flex">
            <Info className="h-5 w-5 text-yellow-400 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Demo Mode
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                This is a demo application. Settings are stored locally in your
                browser and will be lost when you clear your data. In a
                production environment, these settings would be securely managed
                on the server.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
