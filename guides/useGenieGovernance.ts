import {
    createDataItemSigner,
    dryrun,
    message,
    result,
} from "@permaweb/aoconnect";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import GENIE_PROCESS from "../constants/genie_process";

// Types for governance data
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

export interface GovernancePlatform {
    id: string;
    chainId: string;
    name: string;
    slug: string;
    type: string;
    quorum: number;
    delegatesCount: number;
    delegatesVotesCount: number;
    tokenOwnersCount: number;
    metadata: any;
}

export interface Subscriber {
    type: string;
    identifier: string;
    webhook_url?: string;
    bot_token?: string;
    chat_id?: string;
    created_at: number;
}

export interface ScrapingResult {
    success: boolean;
    proposals_count: number;
    platforms_count: number;
    error?: string;
    data?: any;
}

export interface NotificationResult {
    success: boolean;
    success_count: number;
    failure_count: number;
    total_attempts: number;
}

export default function useGenieGovernance() {
    const queryClient = useQueryClient();

    // Get system info
    const {
        data: systemInfo,
        error: systemInfoError,
        isLoading: systemInfoLoading,
    } = useQuery({
        queryKey: ["genie-system-info"],
        queryFn: async () => {
            const dryrunResult = await dryrun({
                process: GENIE_PROCESS,
                tags: [
                    {
                        name: "Action",
                        value: "Info",
                    },
                ],
            });

            if (dryrunResult.Messages[0].Data) {
                return JSON.parse(dryrunResult.Messages[0].Data);
            }
            return undefined;
        },
    });

    // Get all proposals
    const {
        data: proposals,
        error: proposalsError,
        isLoading: proposalsLoading,
        refetch: refetchProposals,
    } = useQuery({
        queryKey: ["genie-proposals"],
        queryFn: async () => {
            const dryrunResult = await dryrun({
                process: GENIE_PROCESS,
                tags: [
                    {
                        name: "Action",
                        value: "GetAllProposals",
                    },
                ],
            });

            if (dryrunResult.Messages[0].Data) {
                const data = JSON.parse(dryrunResult.Messages[0].Data);
                return data.Proposals || [];
            }
            return [];
        },
    });

    // Get governance platforms
    const {
        data: platforms,
        error: platformsError,
        isLoading: platformsLoading,
        refetch: refetchPlatforms,
    } = useQuery({
        queryKey: ["genie-platforms"],
        queryFn: async () => {
            const dryrunResult = await dryrun({
                process: GENIE_PROCESS,
                tags: [
                    {
                        name: "Action",
                        value: "GetGovernancePlatforms",
                    },
                ],
            });

            if (dryrunResult.Messages[0].Data) {
                const data = JSON.parse(dryrunResult.Messages[0].Data);
                return data.Platforms || [];
            }
            return [];
        },
    });

    // Get subscribers
    const {
        data: subscribers,
        error: subscribersError,
        isLoading: subscribersLoading,
        refetch: refetchSubscribers,
    } = useQuery({
        queryKey: ["genie-subscribers"],
        queryFn: async () => {
            const dryrunResult = await dryrun({
                process: GENIE_PROCESS,
                tags: [
                    {
                        name: "Action",
                        value: "GetSubscribers",
                    },
                ],
            });

            if (dryrunResult.Messages[0].Data) {
                const data = JSON.parse(dryrunResult.Messages[0].Data);
                return data.Subscribers || [];
            }
            return [];
        },
    });

    // Scrape governance data
    const scrapeGovernance = useMutation({
        mutationKey: ["ScrapeGovernance"],
        mutationFn: async (governanceId: string) => {
            const messageId = await message({
                process: GENIE_PROCESS,
                tags: [
                    {
                        name: "Action",
                        value: "ScrapeGovernance",
                    },
                    {
                        name: "GovernanceID",
                        value: governanceId,
                    },
                ],
                data: JSON.stringify({}),
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
            queryClient.invalidateQueries({ queryKey: ["genie-proposals"] });
            queryClient.invalidateQueries({ queryKey: ["genie-platforms"] });
        },
    });

    // Add proposal
    const addProposal = useMutation({
        mutationKey: ["AddProposal"],
        mutationFn: async (proposalData: Partial<Proposal>) => {
            const messageId = await message({
                process: GENIE_PROCESS,
                tags: [
                    {
                        name: "Action",
                        value: "AddProposal",
                    },
                ],
                data: JSON.stringify(proposalData),
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
            queryClient.invalidateQueries({ queryKey: ["genie-proposals"] });
        },
    });

    // Get proposal by ID
    const getProposal = useMutation({
        mutationKey: ["GetProposal"],
        mutationFn: async (proposalId: string) => {
            const messageId = await message({
                process: GENIE_PROCESS,
                tags: [
                    {
                        name: "Action",
                        value: "GetProposal",
                    },
                    {
                        name: "ProposalID",
                        value: proposalId,
                    },
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

    // Search proposals
    const searchProposals = useMutation({
        mutationKey: ["SearchProposals"],
        mutationFn: async (query: string) => {
            const messageId = await message({
                process: GENIE_PROCESS,
                tags: [
                    {
                        name: "Action",
                        value: "SearchProposals",
                    },
                    {
                        name: "Query",
                        value: query,
                    },
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
                return data.Results || [];
            }
            return [];
        },
    });

    // Add subscriber
    const addSubscriber = useMutation({
        mutationKey: ["AddSubscriber"],
        mutationFn: async (subscriberData: Partial<Subscriber>) => {
            const messageId = await message({
                process: GENIE_PROCESS,
                tags: [
                    {
                        name: "Action",
                        value: "AddSubscriber",
                    },
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
            queryClient.invalidateQueries({ queryKey: ["genie-subscribers"] });
        },
    });

    // Broadcast notification
    const broadcastNotification = useMutation({
        mutationKey: ["BroadcastNotification"],
        mutationFn: async ({ proposal, summary }: { proposal: Proposal; summary: string }) => {
            const messageId = await message({
                process: GENIE_PROCESS,
                tags: [
                    {
                        name: "Action",
                        value: "BroadcastNotification",
                    },
                    {
                        name: "Summary",
                        value: summary,
                    },
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

    // Execute proposal
    const executeProposal = useMutation({
        mutationKey: ["ExecuteProposal"],
        mutationFn: async (proposalId: string) => {
            const messageId = await message({
                process: GENIE_PROCESS,
                tags: [
                    {
                        name: "Action",
                        value: "ExecuteProposal",
                    },
                    {
                        name: "ProposalID",
                        value: proposalId,
                    },
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
            queryClient.invalidateQueries({ queryKey: ["genie-proposals"] });
        },
    });

    // Update proposal votes
    const updateVotes = useMutation({
        mutationKey: ["UpdateVotes"],
        mutationFn: async ({ proposalId, votesData }: { proposalId: string; votesData: any }) => {
            const messageId = await message({
                process: GENIE_PROCESS,
                tags: [
                    {
                        name: "Action",
                        value: "UpdateVotes",
                    },
                    {
                        name: "ProposalID",
                        value: proposalId,
                    },
                ],
                data: JSON.stringify(votesData),
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
            queryClient.invalidateQueries({ queryKey: ["genie-proposals"] });
        },
    });

    // Get scraping status
    const getScrapingStatus = useMutation({
        mutationKey: ["GetScrapingStatus"],
        mutationFn: async (governanceId: string) => {
            const messageId = await message({
                process: GENIE_PROCESS,
                tags: [
                    {
                        name: "Action",
                        value: "GetGovernanceStatus",
                    },
                    {
                        name: "GovernanceID",
                        value: governanceId,
                    },
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

    // Get balance
    const getBalance = useMutation({
        mutationKey: ["GetBalance"],
        mutationFn: async (userId: string) => {
            const messageId = await message({
                process: GENIE_PROCESS,
                tags: [
                    {
                        name: "Action",
                        value: "GetBalance",
                    },
                    {
                        name: "UserID",
                        value: userId,
                    },
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

    // Set balance
    const setBalance = useMutation({
        mutationKey: ["SetBalance"],
        mutationFn: async ({ userId, amount }: { userId: string; amount: number }) => {
            const messageId = await message({
                process: GENIE_PROCESS,
                tags: [
                    {
                        name: "Action",
                        value: "SetBalance",
                    },
                    {
                        name: "UserID",
                        value: userId,
                    },
                ],
                data: JSON.stringify({ amount }),
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

    return {
        // Queries
        systemInfo,
        systemInfoError,
        systemInfoLoading,
        proposals,
        proposalsError,
        proposalsLoading,
        refetchProposals,
        platforms,
        platformsError,
        platformsLoading,
        refetchPlatforms,
        subscribers,
        subscribersError,
        subscribersLoading,
        refetchSubscribers,

        // Mutations
        scrapeGovernance,
        addProposal,
        getProposal,
        searchProposals,
        addSubscriber,
        broadcastNotification,
        executeProposal,
        updateVotes,
        getScrapingStatus,
        getBalance,
        setBalance,
    };
}
