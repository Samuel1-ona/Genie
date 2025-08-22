# Subscriber Flows Implementation

This document describes the end-to-end implementation of Discord and Telegram subscriber flows for the Genie frontend.

## Overview

The subscriber flows allow users to add Discord webhook and Telegram chat ID subscribers, test broadcasts with proposal data, and view last success times and status indicators.

## Features Implemented

### 1. Add Subscriber Dialog

#### Discord Support

- **Data Format**: `{ type: 'discord', webhook_url, active }`
- **Validation**: Webhook URL format validation
- **UI**: Discord icon and webhook URL placeholder
- **Integration**: Sends data via `AddSubscriber` AO action

#### Telegram Support

- **Data Format**: `{ type: 'telegram', chat_id, active }`
- **Validation**: Chat ID format validation (e.g., -1001234567890)
- **UI**: Telegram icon and chat ID placeholder
- **Integration**: Sends data via `AddSubscriber` AO action

### 2. Test Broadcast Functionality

#### Proposal Data Building

- **Structure**: `{ id, title, url }` from selected proposal
- **Selection**: Dropdown with recent proposals
- **Preview**: Discord and Telegram message previews

#### Broadcast Process

- **API Call**: `TestBroadcast` with proposal data and subscriber IDs
- **Results**: Individual success/failure status for each subscriber
- **UI Feedback**: Real-time status indicators and result display

### 3. Subscriber Table

#### Last Success Time

- **Display**: Relative time (e.g., "2h ago", "Just now")
- **Format**: Smart formatting based on time difference
- **Fallback**: "Never" for inactive subscribers

#### Status Indicators

- **Recently Active**: Green checkmark (< 1 hour)
- **Active Today**: Yellow checkmark (< 24 hours)
- **Inactive**: Red X (> 24 hours)
- **Never Active**: Red X with "Never active" text

## Implementation Details

### API Integration

#### AddSubscriber

```typescript
// Data format sent to AO
{
  name: string;
  type: 'discord' | 'telegram';
  endpoint: string; // webhook_url for Discord, chat_id for Telegram
  active: boolean;
}
```

#### TestBroadcast

```typescript
// Data format sent to AO
{
  proposal: {
    id: string;
    title: string;
    url: string;
  };
  subscriberIds: string[];
  summary: string;
  timestamp: number;
}
```

#### Response Format

```typescript
{
  messageId: string;
  proposal: ProposalData;
  results: BroadcastResult[];
  totalSent: number;
  totalFailed: number;
  timestamp: string;
}
```

### Mock Data

#### Subscriber Examples

```typescript
// Discord subscriber
{
  id: 'sub-1',
  name: 'Genie Alerts',
  type: 'discord',
  endpoint: 'https://discord.com/api/webhooks/1234567890/...',
  isActive: true,
  lastActiveAt: '2024-08-13T20:06:00.000Z'
}

// Telegram subscriber
{
  id: 'sub-2',
  name: 'DAO News Channel',
  type: 'telegram',
  endpoint: '-1001234567890',
  isActive: true,
  lastActiveAt: '2024-08-13T19:45:00.000Z'
}
```

### UI Components

#### AddSubscriberDialog

- **Platform Selection**: Visual cards for Discord/Telegram
- **Form Validation**: Required fields and format validation
- **Error Handling**: Toast notifications for success/failure
- **Loading States**: Submit button with loading indicator

#### TestBroadcast

- **Proposal Selection**: Dropdown with proposal titles and metadata
- **Subscriber Selection**: Checkboxes with select all functionality
- **Message Preview**: Discord and Telegram formatted previews
- **Results Display**: Individual status for each subscriber

#### SubscriberTable

- **Search**: Filter by name or endpoint
- **Status Filter**: Active/inactive toggle
- **Type Filter**: Discord/Telegram filter
- **Actions**: Copy endpoint, edit, delete
- **Status Display**: Visual indicators with timestamps

## Testing

### Test Script

Run the automated test script:

```bash
node scripts/test-subscriber-flows.js
```

### Manual Testing

1. **Add Discord Subscriber**:
   - Enter Discord webhook URL
   - Verify it appears in the list
   - Test broadcast confirms success

2. **Add Telegram Subscriber**:
   - Enter Telegram chat ID
   - Verify it appears in the list
   - Test broadcast confirms success

3. **Test Broadcast**:
   - Select a proposal
   - Choose subscribers
   - Send test broadcast
   - Verify results display

## Acceptance Criteria Met

### ✅ Discord Webhook Support

- Add subscriber dialog accepts Discord webhook URLs
- Data format: `{ type: 'discord', webhook_url, active }`
- Shows in subscriber list with Discord icon
- Test broadcast confirms success

### ✅ Telegram Chat ID Support

- Add subscriber dialog accepts Telegram chat IDs
- Data format: `{ type: 'telegram', chat_id, active }`
- Shows in subscriber list with Telegram icon
- Test broadcast confirms success

### ✅ Test Broadcast Functionality

- Builds `{ id, title, url }` from selected proposal
- Calls `BroadcastNotification` with proper data
- Shows individual results for each subscriber
- Displays success/failure status

### ✅ Last Success Time & Status

- Shows relative time (e.g., "2h ago")
- Status indicators: Recently active, Active today, Inactive
- Visual feedback with colored icons
- Proper fallback for never-active subscribers

## Benefits

### 1. User Experience

- **Intuitive Interface**: Clear platform selection and form fields
- **Real-time Feedback**: Immediate status updates and results
- **Visual Indicators**: Status icons and color coding
- **Message Preview**: See how notifications will look

### 2. Developer Experience

- **Type Safety**: Proper TypeScript interfaces
- **Error Handling**: Comprehensive error states
- **Mock Data**: Realistic testing environment
- **API Integration**: Clean separation of concerns

### 3. Maintainability

- **Modular Components**: Reusable UI components
- **Consistent Patterns**: Standardized data formats
- **Test Coverage**: Automated testing scripts
- **Documentation**: Clear implementation guides

## Future Enhancements

1. **Message Templates**: Customizable notification templates
2. **Scheduled Broadcasts**: Time-based notification scheduling
3. **Analytics**: Track delivery rates and engagement
4. **Bulk Operations**: Add/remove multiple subscribers
5. **Webhook Validation**: Real-time webhook testing
6. **Rate Limiting**: Prevent spam and abuse
