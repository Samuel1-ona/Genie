import {
    createDataItemSigner,
    dryrun,
    message,
    result,
} from "@permaweb/aoconnect";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import GENIE_PROCESS from "../constants/genie_process";

// Types matching proposals.lua structures
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
    contracts: any;
    isIndexing: boolean;
    isBehind: boolean;
    isPrimary: boolean;
    kind: string;
    name: string;
    organization: any;
    proposalStats: any;
    parameters: any;
    quorum: number;
    slug: string;
    timelockId: string;
    tokenId: string;
    token: any;
    type: string;
    delegatesCount: number;
    delegatesVotesCount: number;
    tokenOwnersCount: number;
    metadata: any;
    created_at: number;
    updated_at: number;
}

export interface Organization {
    id: string;
    name: string;
    description: string;
    logo_url: string;
    website: string;
    twitter: string;
    discord: string;
    github: string;
    governance_platforms: string[];
    created_at: number;
    updated_at: number;
}

export interface Token {
    id: string;
    name: string;
    symbol: string;
    decimals: number;
    total_supply: number;
    chain_id: string;
    contract_address: string;
    logo_url: string;
    created_at: number;
    updated_at: number;
}

export interface ProposalVotes {
    for_votes: number;
    against_votes: number;
    abstain_votes: number;
    quorum?: number;
}

export default function useProposals() {
    const queryClient = useQueryClient();

    // ===== QUERIES (Read Operations) =====

    // Get all proposals
    const {
        data: proposals,
        error: proposalsError,
        isLoading: proposalsLoading,
        refetch: refetchProposals,
    } = useQuery({
        queryKey: ["proposals"],
        queryFn: async () => {
            const dryrunResult = await dryrun({
                process: GENIE_PROCESS,
                tags: [
                    { name: "Action", value: "GetAllProposals" },
                ],
            });

            if (dryrunResult.Messages[0].Data) {
                const data = JSON.parse(dryrunResult.Messages[0].Data);
                return data.Proposals || [];
            }
            return [];
        },
    });

    // Get all governance platforms
    const {
        data: platforms,
        error: platformsError,
        isLoading: platformsLoading,
        refetch: refetchPlatforms,
    } = useQuery({
        queryKey: ["governance-platforms"],
        queryFn: async () => {
            const dryrunResult = await dryrun({
                process: GENIE_PROCESS,
                tags: [
                    { name: "Action", value: "GetGovernancePlatforms" },
                ],
            });

            if (dryrunResult.Messages[0].Data) {
                const data = JSON.parse(dryrunResult.Messages[0].Data);
                return data.Platforms || [];
            }
            return [];
        },
    });

    // ===== MUTATIONS (Write Operations) =====

    // Add proposal
    const addProposal = useMutation({
        mutationKey: ["AddProposal"],
        mutationFn: async (proposalData: Partial<Proposal>) => {
            const messageId = await message({
                process: GENIE_PROCESS,
                tags: [
                    { name: "Action", value: "AddProposal" },
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
            queryClient.invalidateQueries({ queryKey: ["proposals"] });
        },
    });

    // Get proposal by ID
    const getProposal = useMutation({
        mutationKey: ["GetProposal"],
        mutationFn: async (proposalId: string) => {
            const messageId = await message({
                process: GENIE_PROCESS,
                tags: [
                    { name: "Action", value: "GetProposal" },
                    { name: "ProposalID", value: proposalId },
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

    // Update proposal
    const updateProposal = useMutation({
        mutationKey: ["UpdateProposal"],
        mutationFn: async ({ proposalId, updatedData }: { proposalId: string; updatedData: Partial<Proposal> }) => {
            const messageId = await message({
                process: GENIE_PROCESS,
                tags: [
                    { name: "Action", value: "UpdateProposal" },
                    { name: "ProposalID", value: proposalId },
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
            queryClient.invalidateQueries({ queryKey: ["proposals"] });
        },
    });

    // Delete proposal
    const deleteProposal = useMutation({
        mutationKey: ["DeleteProposal"],
        mutationFn: async ({ proposalId, creator }: { proposalId: string; creator: string }) => {
            const messageId = await message({
                process: GENIE_PROCESS,
                tags: [
                    { name: "Action", value: "DeleteProposal" },
                    { name: "ProposalID", value: proposalId },
                    { name: "Creator", value: creator },
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
            queryClient.invalidateQueries({ queryKey: ["proposals"] });
        },
    });

    // Search proposals
    const searchProposals = useMutation({
        mutationKey: ["SearchProposals"],
        mutationFn: async (query: string) => {
            const messageId = await message({
                process: GENIE_PROCESS,
                tags: [
                    { name: "Action", value: "SearchProposals" },
                    { name: "Query", value: query },
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

    // Get proposals by creator
    const getProposalsByCreator = useMutation({
        mutationKey: ["GetProposalsByCreator"],
        mutationFn: async (creator: string) => {
            const messageId = await message({
                process: GENIE_PROCESS,
                tags: [
                    { name: "Action", value: "GetProposalsByCreator" },
                    { name: "Creator", value: creator },
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
                return data.Proposals || [];
            }
            return [];
        },
    });

    // Get proposals by status
    const getProposalsByStatus = useMutation({
        mutationKey: ["GetProposalsByStatus"],
        mutationFn: async (status: string) => {
            const messageId = await message({
                process: GENIE_PROCESS,
                tags: [
                    { name: "Action", value: "GetProposalsByStatus" },
                    { name: "Status", value: status },
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
                return data.Proposals || [];
            }
            return [];
        },
    });

    // Get proposals by platform
    const getProposalsByPlatform = useMutation({
        mutationKey: ["GetProposalsByPlatform"],
        mutationFn: async (platformId: string) => {
            const messageId = await message({
                process: GENIE_PROCESS,
                tags: [
                    { name: "Action", value: "GetProposalsByPlatform" },
                    { name: "PlatformID", value: platformId },
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
                return data.Proposals || [];
            }
            return [];
        },
    });

    // Update proposal votes
    const updateProposalVotes = useMutation({
        mutationKey: ["UpdateProposalVotes"],
        mutationFn: async ({ proposalId, votesData }: { proposalId: string; votesData: ProposalVotes }) => {
            const messageId = await message({
                process: GENIE_PROCESS,
                tags: [
                    { name: "Action", value: "UpdateVotes" },
                    { name: "ProposalID", value: proposalId },
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
            queryClient.invalidateQueries({ queryKey: ["proposals"] });
        },
    });

    // Execute proposal
    const executeProposal = useMutation({
        mutationKey: ["ExecuteProposal"],
        mutationFn: async (proposalId: string) => {
            const messageId = await message({
                process: GENIE_PROCESS,
                tags: [
                    { name: "Action", value: "ExecuteProposal" },
                    { name: "ProposalID", value: proposalId },
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
            queryClient.invalidateQueries({ queryKey: ["proposals"] });
        },
    });

    // Add governance platform
    const addGovernancePlatform = useMutation({
        mutationKey: ["AddGovernancePlatform"],
        mutationFn: async (platformData: Partial<GovernancePlatform>) => {
            const messageId = await message({
                process: GENIE_PROCESS,
                tags: [
                    { name: "Action", value: "AddGovernancePlatform" },
                ],
                data: JSON.stringify(platformData),
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
            queryClient.invalidateQueries({ queryKey: ["governance-platforms"] });
        },
    });

    // Get governance platform by ID
    const getGovernancePlatform = useMutation({
        mutationKey: ["GetGovernancePlatform"],
        mutationFn: async (platformId: string) => {
            const messageId = await message({
                process: GENIE_PROCESS,
                tags: [
                    { name: "Action", value: "GetGovernancePlatform" },
                    { name: "PlatformID", value: platformId },
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

    // Add organization
    const addOrganization = useMutation({
        mutationKey: ["AddOrganization"],
        mutationFn: async (orgData: Partial<Organization>) => {
            const messageId = await message({
                process: GENIE_PROCESS,
                tags: [
                    { name: "Action", value: "AddOrganization" },
                ],
                data: JSON.stringify(orgData),
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

    // Add token
    const addToken = useMutation({
        mutationKey: ["AddToken"],
        mutationFn: async (tokenData: Partial<Token>) => {
            const messageId = await message({
                process: GENIE_PROCESS,
                tags: [
                    { name: "Action", value: "AddToken" },
                ],
                data: JSON.stringify(tokenData),
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

    // Check if proposal exists
    const checkProposalExists = useMutation({
        mutationKey: ["CheckProposalExists"],
        mutationFn: async (proposalId: string) => {
            const messageId = await message({
                process: GENIE_PROCESS,
                tags: [
                    { name: "Action", value: "CheckProposalExists" },
                    { name: "ProposalID", value: proposalId },
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

    return {
        // Queries
        proposals,
        proposalsError,
        proposalsLoading,
        refetchProposals,
        platforms,
        platformsError,
        platformsLoading,
        refetchPlatforms,

        // Mutations
        addProposal,
        getProposal,
        updateProposal,
        deleteProposal,
        searchProposals,
        getProposalsByCreator,
        getProposalsByStatus,
        getProposalsByPlatform,
        updateProposalVotes,
        executeProposal,
        addGovernancePlatform,
        getGovernancePlatform,
        addOrganization,
        addToken,
        checkProposalExists,
    };
}
