import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, MessageCircle, Copy, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

const DEFAULT_DISCORD_TEMPLATE = `{
  "embeds": [
    {
      "title": "{title}",
      "description": "{summary}",
      "color": 3447003,
      "fields": [
        {
          "name": "Status",
          "value": "{status}",
          "inline": true
        },
        {
          "name": "Deadline",
          "value": "{deadline}",
          "inline": true
        },
        {
          "name": "Votes",
          "value": "{votes}",
          "inline": true
        }
      ],
      "url": "{url}",
      "footer": {
        "text": "Genie Governance Alerts"
      }
    }
  ]
}`;

const DEFAULT_TELEGRAM_TEMPLATE = `🚨 **{title}**

{summary}

📊 **Status:** {status}
⏰ **Deadline:** {deadline}
🗳️ **Votes:** {votes}

🔗 [View Proposal]({url})

_Genie Governance Alerts_`;

const SAMPLE_DATA = {
  title: 'UIP-001: Increase Uniswap Treasury',
  summary:
    'Proposal to increase the Uniswap treasury allocation by 500 ETH for ongoing development initiatives, community grants, and strategic partnerships.',
  status: 'Active',
  deadline: '2024-08-15 20:00 UTC',
  votes: '780,000 For • 120,000 Against • 50,000 Abstain',
  url: 'https://snapshot.org/#/uniswap/proposal/0x1234567890abcdef',
};

export function TemplatePreview() {
  const [discordTemplate, setDiscordTemplate] = useState(
    DEFAULT_DISCORD_TEMPLATE
  );
  const [telegramTemplate, setTelegramTemplate] = useState(
    DEFAULT_TELEGRAM_TEMPLATE
  );
  const [isEditing, setIsEditing] = useState(false);

  const replaceVariables = (template: string, data: typeof SAMPLE_DATA) => {
    return template
      .replace(/{title}/g, data.title)
      .replace(/{summary}/g, data.summary)
      .replace(/{status}/g, data.status)
      .replace(/{deadline}/g, data.deadline)
      .replace(/{votes}/g, data.votes)
      .replace(/{url}/g, data.url);
  };

  const handleSave = () => {
    // TODO: Implement save logic
    console.log('Saving templates:', { discordTemplate, telegramTemplate });
    setIsEditing(false);
  };

  const handleReset = () => {
    setDiscordTemplate(DEFAULT_DISCORD_TEMPLATE);
    setTelegramTemplate(DEFAULT_TELEGRAM_TEMPLATE);
    setIsEditing(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // TODO: Show success toast
  };

  const renderDiscordPreview = () => {
    try {
      const processedTemplate = replaceVariables(discordTemplate, SAMPLE_DATA);
      const embed = JSON.parse(processedTemplate).embeds[0];

      return (
        <div className="bg-gray-900 text-white p-4 rounded-lg max-w-md">
          <div className="border-l-4 border-blue-500 pl-3">
            <h3 className="font-semibold text-blue-400 mb-2">{embed.title}</h3>
            <p className="text-gray-300 text-sm mb-3">{embed.description}</p>

            <div className="space-y-2 mb-3">
              {embed.fields?.map((field: any, index: number) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-400">{field.name}:</span>
                  <span className="text-white">{field.value}</span>
                </div>
              ))}
            </div>

            <div className="text-blue-400 text-sm underline">{embed.url}</div>

            <div className="text-gray-500 text-xs mt-2">
              {embed.footer?.text}
            </div>
          </div>
        </div>
      );
    } catch (error) {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-sm">
            Invalid JSON template
          </p>
        </div>
      );
    }
  };

  const renderTelegramPreview = () => {
    const processedTemplate = replaceVariables(telegramTemplate, SAMPLE_DATA);

    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg max-w-md">
        <div className="whitespace-pre-wrap text-sm text-gray-900 dark:text-white">
          {processedTemplate}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Notification Templates
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Customize how notifications appear in Discord and Telegram
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={handleReset}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              >
                Reset
              </Button>
              <Button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Edit Templates
            </Button>
          )}
        </div>
      </div>

      {/* Template Variables */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">
            Available Variables
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(SAMPLE_DATA).map(([key, value]) => (
              <div
                key={key}
                className="bg-white dark:bg-gray-800 p-3 rounded border"
              >
                <div className="font-mono text-sm text-blue-600 dark:text-blue-400">
                  {'{'}
                  {key}
                  {'}'}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {value.length > 30 ? value.substring(0, 30) + '...' : value}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Discord Template */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <span>Discord Template</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={discordTemplate}
                  onChange={e => setDiscordTemplate(e.target.value)}
                  className="font-mono text-sm h-64 bg-gray-50 dark:bg-gray-800"
                  placeholder="Enter Discord webhook JSON template..."
                />
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(discordTemplate)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Template
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <pre className="bg-gray-50 dark:bg-gray-800 p-4 rounded text-sm overflow-x-auto">
                  <code>{discordTemplate}</code>
                </pre>
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(discordTemplate)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Template
                  </Button>
                </div>
              </div>
            )}

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Preview
              </h4>
              {renderDiscordPreview()}
            </div>
          </CardContent>
        </Card>

        {/* Telegram Template */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-blue-400" />
              <span>Telegram Template</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={telegramTemplate}
                  onChange={e => setTelegramTemplate(e.target.value)}
                  className="font-mono text-sm h-64 bg-gray-50 dark:bg-gray-800"
                  placeholder="Enter Telegram message template..."
                />
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(telegramTemplate)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Template
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <pre className="bg-gray-50 dark:bg-gray-800 p-4 rounded text-sm overflow-x-auto">
                  <code>{telegramTemplate}</code>
                </pre>
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(telegramTemplate)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Template
                  </Button>
                </div>
              </div>
            )}

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Preview
              </h4>
              {renderTelegramPreview()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
