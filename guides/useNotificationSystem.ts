import {
    createDataItemSigner,
    dryrun,
    message,
    result,
} from "@permaweb/aoconnect";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import GENIE_PROCESS from "../constants/genie_process";

// Types matching notification_system.lua structures
export interface Subscriber {
    type: "discord" | "telegram";
    identifier: string;
    webhook_url?: string;
    bot_token?: string;
    chat_id?: string;
    active?: boolean;
    created_at?: number;
}

export interface NotificationResult {
    success: boolean;
    success_count: number;
    failure_count: number;
    total_attempts: number;
}

export interface DiscordMessage {
    embeds: Array<{
        title: string;
        description: string;
        color: string;
        url: string;
        fields: Array<{
            name: string;
            value: string;
            inline: boolean;
        }>;
    }>;
}

export interface TelegramMessage {
    text: string;
    parse_mode?: string;
}

export interface Proposal {
    id: string;
    title: string;
    description: string;
    content: string;
    proposer: string;
    From: string;
    platform: string;
    governance_platform_id: string;
    status: string;
    type: string;
    url: string;
    deadline: number;
    created_at: number;
    updated_at: number;
    executed_at?: number;
    canceled_at?: number;
    for_votes: number;
    against_votes: number;
    abstain_votes: number;
    quorum: number;
    total_votes: number;
    execution_time?: number;
    timelock_id: string;
    metadata: any;
    actions: any[];
    tags: string[];
    category: string;
}

export default function useNotificationSystem() {
    const queryClient = useQueryClient();

    // ===== QUERIES (Read Operations) =====

    // Get all subscribers
    const {
        data: subscribers,
        error: subscribersError,
        isLoading: subscribersLoading,
        refetch: refetchSubscribers,
    } = useQuery({
        queryKey: ["notification-subscribers"],
        queryFn: async () => {
            const dryrunResult = await dryrun({
                process: GENIE_PROCESS,
                tags: [
                    { name: "Action", value: "GetSubscribers" },
                ],
            });

            if (dryrunResult.Messages[0].Data) {
                const data = JSON.parse(dryrunResult.Messages[0].Data);
                return data.Subscribers || [];
            }
            return [];
        },
    });

    // ===== MUTATIONS (Write Operations) =====

    // Add subscriber
    const addSubscriber = useMutation({
        mutationKey: ["AddSubscriber"],
        mutationFn: async (subscriberData: Partial<Subscriber>) => {
            const messageId = await message({
                process: GENIE_PROCESS,
                tags: [
                    { name: "Action", value: "AddSubscriber" },
                ],
                data: JSON.stringify(subscriberData),
                signer: createDataItemSigner(window.arweaveWallet),
            });

            const messageResult = await result({
                process: GENIE_PROCESS,
                message: messageId,
            });

            if (messageResult.Messages[0].Data) {
                return JSON.parse(messageResult.Messages[0].Data);
            }
            return undefined;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notification-subscribers"] });
        },
    });

    // Remove subscriber
    const removeSubscriber = useMutation({
        mutationKey: ["RemoveSubscriber"],
        mutationFn: async ({ type, identifier }: { type: string; identifier: string }) => {
            const messageId = await message({
                process: GENIE_PROCESS,
                tags: [
                    { name: "Action", value: "RemoveSubscriber" },
                    { name: "SubscriberType", value: type },
                    { name: "Identifier", value: identifier },
                ],
                data: "",
                signer: createDataItemSigner(window.arweaveWallet),
            });

            const messageResult = await result({
                process: GENIE_PROCESS,
                message: messageId,
            });

            if (messageResult.Messages[0].Data) {
                return JSON.parse(messageResult.Messages[0].Data);
            }
            return undefined;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notification-subscribers"] });
        },
    });

    // Broadcast notification
    const broadcastNotification = useMutation({
        mutationKey: ["BroadcastNotification"],
        mutationFn: async ({ proposal, summary }: { proposal: Proposal; summary: string }) => {
            const messageId = await message({
                process: GENIE_PROCESS,
                tags: [
                    { name: "Action", value: "BroadcastNotification" },
                    { name: "Summary", value: summary },
                ],
                data: JSON.stringify(proposal),
                signer: createDataItemSigner(window.arweaveWallet),
            });

            const messageResult = await result({
                process: GENIE_PROCESS,
                message: messageId,
            });

            if (messageResult.Messages[0].Data) {
                return JSON.parse(messageResult.Messages[0].Data) as NotificationResult;
            }
            return undefined;
        },
    });

    // Send Discord notification
    const sendDiscordNotification = useMutation({
        mutationKey: ["SendDiscordNotification"],
        mutationFn: async ({ proposal, summary, webhookUrl }: { proposal: Proposal; summary: string; webhookUrl: string }) => {
            const messageId = await message({
                process: GENIE_PROCESS,
                tags: [
                    { name: "Action", value: "SendDiscordNotification" },
                    { name: "Summary", value: summary },
                    { name: "WebhookURL", value: webhookUrl },
                ],
                data: JSON.stringify(proposal),
                signer: createDataItemSigner(window.arweaveWallet),
            });

            const messageResult = await result({
                process: GENIE_PROCESS,
                message: messageId,
            });

            if (messageResult.Messages[0].Data) {
                return JSON.parse(messageResult.Messages[0].Data);
            }
            return undefined;
        },
    });

    // Send Telegram notification
    const sendTelegramNotification = useMutation({
        mutationKey: ["SendTelegramNotification"],
        mutationFn: async ({ proposal, summary, botToken, chatId }: { proposal: Proposal; summary: string; botToken: string; chatId: string }) => {
            const messageId = await message({
                process: GENIE_PROCESS,
                tags: [
                    { name: "Action", value: "SendTelegramNotification" },
                    { name: "Summary", value: summary },
                    { name: "BotToken", value: botToken },
                    { name: "ChatID", value: chatId },
                ],
                data: JSON.stringify(proposal),
                signer: createDataItemSigner(window.arweaveWallet),
            });

            const messageResult = await result({
                process: GENIE_PROCESS,
                message: messageId,
            });

            if (messageResult.Messages[0].Data) {
                return JSON.parse(messageResult.Messages[0].Data);
            }
            return undefined;
        },
    });

    // Format Discord message
    const formatDiscordMessage = useMutation({
        mutationKey: ["FormatDiscordMessage"],
        mutationFn: async ({ proposal, summary }: { proposal: Proposal; summary: string }) => {
            const messageId = await message({
                process: GENIE_PROCESS,
                tags: [
                    { name: "Action", value: "FormatDiscordMessage" },
                    { name: "Summary", value: summary },
                ],
                data: JSON.stringify(proposal),
                signer: createDataItemSigner(window.arweaveWallet),
            });

            const messageResult = await result({
                process: GENIE_PROCESS,
                message: messageId,
            });

            if (messageResult.Messages[0].Data) {
                return JSON.parse(messageResult.Messages[0].Data) as DiscordMessage;
            }
            return undefined;
        },
    });

    // Format Telegram message
    const formatTelegramMessage = useMutation({
        mutationKey: ["FormatTelegramMessage"],
        mutationFn: async ({ proposal, summary }: { proposal: Proposal; summary: string }) => {
            const messageId = await message({
                process: GENIE_PROCESS,
                tags: [
                    { name: "Action", value: "FormatTelegramMessage" },
                    { name: "Summary", value: summary },
                ],
                data: JSON.stringify(proposal),
                signer: createDataItemSigner(window.arweaveWallet),
            });

            const messageResult = await result({
                process: GENIE_PROCESS,
                message: messageId,
            });

            if (messageResult.Messages[0].Data) {
                return JSON.parse(messageResult.Messages[0].Data) as TelegramMessage;
            }
            return undefined;
        },
    });

    // Get subscribers by type
    const getSubscribersByType = useMutation({
        mutationKey: ["GetSubscribersByType"],
        mutationFn: async (type: string) => {
            const messageId = await message({
                process: GENIE_PROCESS,
                tags: [
                    { name: "Action", value: "GetSubscribersByType" },
                    { name: "SubscriberType", value: type },
                ],
                data: "",
                signer: createDataItemSigner(window.arweaveWallet),
            });

            const messageResult = await result({
                process: GENIE_PROCESS,
                message: messageId,
            });

            if (messageResult.Messages[0].Data) {
                const data = JSON.parse(messageResult.Messages[0].Data);
                return data.Subscribers || [];
            }
            return [];
        },
    });

    // Update subscriber
    const updateSubscriber = useMutation({
        mutationKey: ["UpdateSubscriber"],
        mutationFn: async ({ type, identifier, updatedData }: { type: string; identifier: string; updatedData: Partial<Subscriber> }) => {
            const messageId = await message({
                process: GENIE_PROCESS,
                tags: [
                    { name: "Action", value: "UpdateSubscriber" },
                    { name: "SubscriberType", value: type },
                    { name: "Identifier", value: identifier },
                ],
                data: JSON.stringify(updatedData),
                signer: createDataItemSigner(window.arweaveWallet),
            });

            const messageResult = await result({
                process: GENIE_PROCESS,
                message: messageId,
            });

            if (messageResult.Messages[0].Data) {
                return JSON.parse(messageResult.Messages[0].Data);
            }
            return undefined;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notification-subscribers"] });
        },
    });

    // Test notification
    const testNotification = useMutation({
        mutationKey: ["TestNotification"],
        mutationFn: async ({ type, identifier, testMessage }: { type: string; identifier: string; testMessage: string }) => {
            const messageId = await message({
                process: GENIE_PROCESS,
                tags: [
                    { name: "Action", value: "TestNotification" },
                    { name: "SubscriberType", value: type },
                    { name: "Identifier", value: identifier },
                    { name: "TestMessage", value: testMessage },
                ],
                data: "",
                signer: createDataItemSigner(window.arweaveWallet),
            });

            const messageResult = await result({
                process: GENIE_PROCESS,
                message: messageId,
            });

            if (messageResult.Messages[0].Data) {
                return JSON.parse(messageResult.Messages[0].Data);
            }
            return undefined;
        },
    });

    // Get notification statistics
    const getNotificationStats = useMutation({
        mutationKey: ["GetNotificationStats"],
        mutationFn: async () => {
            const messageId = await message({
                process: GENIE_PROCESS,
                tags: [
                    { name: "Action", value: "GetNotificationStats" },
                ],
                data: "",
                signer: createDataItemSigner(window.arweaveWallet),
            });

            const messageResult = await result({
                process: GENIE_PROCESS,
                message: messageId,
            });

            if (messageResult.Messages[0].Data) {
                return JSON.parse(messageResult.Messages[0].Data);
            }
            return undefined;
        },
    });

    // Clear all subscribers
    const clearAllSubscribers = useMutation({
        mutationKey: ["ClearAllSubscribers"],
        mutationFn: async () => {
            const messageId = await message({
                process: GENIE_PROCESS,
                tags: [
                    { name: "Action", value: "ClearAllSubscribers" },
                ],
                data: "",
                signer: createDataItemSigner(window.arweaveWallet),
            });

            const messageResult = await result({
                process: GENIE_PROCESS,
                message: messageId,
            });

            if (messageResult.Messages[0].Data) {
                return JSON.parse(messageResult.Messages[0].Data);
            }
            return undefined;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notification-subscribers"] });
        },
    });

    // Enable/disable subscriber
    const toggleSubscriberStatus = useMutation({
        mutationKey: ["ToggleSubscriberStatus"],
        mutationFn: async ({ type, identifier, active }: { type: string; identifier: string; active: boolean }) => {
            const messageId = await message({
                process: GENIE_PROCESS,
                tags: [
                    { name: "Action", value: "ToggleSubscriberStatus" },
                    { name: "SubscriberType", value: type },
                    { name: "Identifier", value: identifier },
                    { name: "Active", value: active.toString() },
                ],
                data: "",
                signer: createDataItemSigner(window.arweaveWallet),
            });

            const messageResult = await result({
                process: GENIE_PROCESS,
                message: messageId,
            });

            if (messageResult.Messages[0].Data) {
                return JSON.parse(messageResult.Messages[0].Data);
            }
            return undefined;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notification-subscribers"] });
        },
    });

    return {
        // Queries
        subscribers,
        subscribersError,
        subscribersLoading,
        refetchSubscribers,

        // Mutations
        addSubscriber,
        removeSubscriber,
        broadcastNotification,
        sendDiscordNotification,
        sendTelegramNotification,
        formatDiscordMessage,
        formatTelegramMessage,
        getSubscribersByType,
        updateSubscriber,
        testNotification,
        getNotificationStats,
        clearAllSubscribers,
        toggleSubscriberStatus,
    };
}
