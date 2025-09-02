# AO Contract Data Structure Alignment

This document outlines how the frontend data structures are aligned with the AO contract expectations.

## 📋 Overview

All frontend API calls now match exactly what the AO process expects, ensuring seamless communication between the frontend and the AO contract.

## 🔧 Data Structure Alignment

### 1. **Subscribers** (`AddSubscriber` action)

**AO Contract Expects:**

```lua
-- Required fields
subscriber_data.type -- "discord" or "telegram"

-- Discord-specific
subscriber_data.webhook_url -- Discord webhook URL

-- Telegram-specific
subscriber_data.bot_token -- Telegram bot token
subscriber_data.chat_id -- Telegram chat ID

-- Optional fields
subscriber_data.active -- boolean
subscriber_data.name -- string
```

**Frontend Implementation:**

```typescript
// notificationsApi.add()
const subscriberData = {
    type: subscriber.type, // Required
    active: subscriber.active,
    name: subscriber.name,
};

// Discord
if (subscriber.type === "discord") {
    subscriberData.webhook_url = subscriber.endpoint;
}

// Telegram
if (subscriber.type === "telegram") {
    const [bot_token, chat_id] = subscriber.endpoint.split(":");
    subscriberData.bot_token = bot_token;
    subscriberData.chat_id = chat_id;
}
```

### 2. **Proposals** (`AddProposal` action)

**AO Contract Expects:**

```lua
-- Required fields
proposal_data.id -- string (required)

-- All other fields are optional
proposal_data.title
proposal_data.description
proposal_data.content
proposal_data.proposer
proposal_data.platform
proposal_data.governance_platform_id
proposal_data.status
proposal_data.type
proposal_data.url
proposal_data.deadline
-- ... and many more
```

**Frontend Implementation:**

```typescript
// proposalsApi.add()
await aoSend("AddProposal", proposal); // proposal.id is required
```

### 3. **Balances** (`SetBalance`, `AddBalance` actions)

**AO Contract Expects:**

```lua
-- Tags
msg.Tags.UserID -- string (required)

-- Data body
balance_data.amount -- number (required)
```

**Frontend Implementation:**

```typescript
// balancesApi.set()
await aoSend("SetBalance", { amount }, [{ name: "UserID", value: userId }]);

// balancesApi.add()
await aoSend("AddBalance", { amount }, [{ name: "UserID", value: userId }]);
```

### 4. **Governance Platforms** (`ScrapeGovernance` action)

**AO Contract Expects:**

```lua
-- Tags
msg.Tags.GovernanceID -- string (required)

-- Data body (optional)
platform_config -- any object
```

**Frontend Implementation:**

```typescript
// governanceApi.scrape()
await aoSend("ScrapeGovernance", platformConfig, [
    { name: "GovernanceID", value: governanceId },
]);
```

### 5. **Broadcast Notifications** (`BroadcastNotification` action)

**AO Contract Expects:**

```lua
-- Data body
proposal_data.id -- string (required)
proposal_data.title
proposal_data.url

-- Tags
msg.Tags.Summary -- string (optional)
```

**Frontend Implementation:**

```typescript
// notificationsApi.broadcast()
const tags = summary ? [{ name: "Summary", value: summary }] : undefined;
await aoSend(
    "BroadcastNotification",
    {
        id: proposal.id,
        title: proposal.title,
        url: proposal.url,
    },
    tags
);
```

### 6. **Vote Updates** (`UpdateVotes` action)

**AO Contract Expects:**

```lua
-- Tags
msg.Tags.ProposalID -- string (required)

-- Data body
votes_data.for_votes -- number
votes_data.against_votes -- number
votes_data.abstain_votes -- number
votes_data.quorum -- number
```

**Frontend Implementation:**

```typescript
// proposalsApi.updateVotes()
await aoSend("UpdateVotes", votes, [{ name: "ProposalID", value: id }]);
```

## 🎯 Key Benefits

1. **Exact Contract Match**: All data structures match exactly what the AO process expects
2. **Type Safety**: TypeScript interfaces ensure correct data types
3. **Error Prevention**: Proper field mapping prevents contract errors
4. **Maintainability**: Clear documentation of expected data formats
5. **Consistency**: All API calls follow the same pattern

## 🔍 Validation

The frontend now includes:

- **Required Field Validation**: Ensures required fields are present
- **Type-Specific Validation**: Discord/Telegram specific field validation
- **Format Validation**: Proper data format validation (e.g., `bot_token:chat_id`)
- **Error Handling**: Comprehensive error handling and user feedback

## 📝 Usage Examples

### Adding a Discord Subscriber

```typescript
await notificationsApi.add({
    name: "Test Discord",
    type: "discord",
    endpoint: "https://discord.com/api/webhooks/...",
    active: true,
});
```

### Adding a Telegram Subscriber

```typescript
await notificationsApi.add({
    name: "Test Telegram",
    type: "telegram",
    endpoint: "bot_token:chat_id",
    active: true,
});
```

### Adding a Proposal

```typescript
await proposalsApi.add({
    id: "proposal-123",
    title: "Test Proposal",
    description: "Test description",
    status: "active",
});
```

### Setting a Balance

```typescript
await balancesApi.set("user-123", 100);
```

## ✅ Status

- ✅ **Subscribers**: Fully aligned
- ✅ **Proposals**: Fully aligned
- ✅ **Balances**: Fully aligned
- ✅ **Governance**: Fully aligned
- ✅ **Notifications**: Fully aligned
- ✅ **Runtime**: Fully aligned

All frontend data structures are now perfectly aligned with the AO contract expectations!
