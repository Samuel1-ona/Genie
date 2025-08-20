import {
    createDataItemSigner,
    dryrun,
    message,
    result,
} from "@permaweb/aoconnect";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import GENIE_PROCESS from "../constants/genie_process";

// Types matching platform_adapter.lua structures
export interface ScrapingResult {
    success: boolean;
    governance_id: string;
    platform?: string;
    total_proposals?: number;
    success_count?: number;
    error_count?: number;
    proposals?: any[];
    cached?: boolean;
    cache_age?: number;
    error?: string;
    rate_limited?: boolean;
}

export interface GovernancePlatformData {
    id: string;
    chainId: string;
    contracts: {
        governor: string;
        timelock: string;
    };
    isIndexing: boolean;
    isBehind: boolean;
    isPrimary: boolean;
    kind: string;
    name: string;
    organization: {
        id: string;
        name: string;
        description: string;
    };
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
}

export interface ScrapingStatus {
    success: boolean;
    governance_id: string;
    platform_exists: boolean;
    platform?: GovernancePlatformData;
    proposals_count: number;
    proposals?: any[];
    last_scraped?: number;
    scrape_count: number;
    api_calls_made: number;
    last_error?: {
        timestamp: number;
        error: string;
    };
    is_rate_limited: boolean;
    cache_hit: boolean;
}

export interface ScrapingHistoryEntry {
    timestamp: number;
    success: boolean;
    error?: string;
}

export interface ApiRateLimit {
    is_limited: boolean;
    limited_at: number;
}

export interface CachedData {
    proposals?: any[];
    platform?: GovernancePlatformData;
    cached_at?: number;
    platform_cached_at?: number;
}

export interface ApiCallCounts {
    [governanceId: string]: number;
}

export interface ErrorLog {
    timestamp: number;
    error: string;
}

export interface PlatformConfig {
    name?: string;
    url?: string;
    api_key?: string;
    base_url?: string;
}

export default function usePlatformAdapter() {
    const queryClient = useQueryClient();

    // ===== QUERIES (Read Operations) =====

    // Get scraping history
    const {
        data: scrapingHistory,
        error: scrapingHistoryError,
        isLoading: scrapingHistoryLoading,
        refetch: refetchScrapingHistory,
    } = useQuery({
        queryKey: ["scraping-history"],
        queryFn: async () => {
            const dryrunResult = await dryrun({
                process: GENIE_PROCESS,
                tags: [
                    { name: "Action", value: "GetScrapingHistory" },
                ],
            });

            if (dryrunResult.Messages[0].Data) {
                const data = JSON.parse(dryrunResult.Messages[0].Data);
                return data.History || {};
            }
            return {};
        },
    });

    // Get API rate limits
    const {
        data: apiRateLimits,
        error: apiRateLimitsError,
        isLoading: apiRateLimitsLoading,
        refetch: refetchApiRateLimits,
    } = useQuery({
        queryKey: ["api-rate-limits"],
        queryFn: async () => {
            const dryrunResult = await dryrun({
                process: GENIE_PROCESS,
                tags: [
                    { name: "Action", value: "GetApiRateLimits" },
                ],
            });

            if (dryrunResult.Messages[0].Data) {
                const data = JSON.parse(dryrunResult.Messages[0].Data);
                return data.RateLimits || {};
            }
            return {};
        },
    });

    // Get cached data
    const {
        data: cachedData,
        error: cachedDataError,
        isLoading: cachedDataLoading,
        refetch: refetchCachedData,
    } = useQuery({
        queryKey: ["cached-data"],
        queryFn: async () => {
            const dryrunResult = await dryrun({
                process: GENIE_PROCESS,
                tags: [
                    { name: "Action", value: "GetCachedData" },
                ],
            });

            if (dryrunResult.Messages[0].Data) {
                const data = JSON.parse(dryrunResult.Messages[0].Data);
                return data.CachedData || {};
            }
            return {};
        },
    });

    // Get API call counts
    const {
        data: apiCallCounts,
        error: apiCallCountsError,
        isLoading: apiCallCountsLoading,
        refetch: refetchApiCallCounts,
    } = useQuery({
        queryKey: ["api-call-counts"],
        queryFn: async () => {
            const dryrunResult = await dryrun({
                process: GENIE_PROCESS,
                tags: [
                    { name: "Action", value: "GetApiCallCounts" },
                ],
            });

            if (dryrunResult.Messages[0].Data) {
                const data = JSON.parse(dryrunResult.Messages[0].Data);
                return data.CallCounts || {};
            }
            return {};
        },
    });

    // Get error logs
    const {
        data: errorLogs,
        error: errorLogsError,
        isLoading: errorLogsLoading,
        refetch: refetchErrorLogs,
    } = useQuery({
        queryKey: ["error-logs"],
        queryFn: async () => {
            const dryrunResult = await dryrun({
                process: GENIE_PROCESS,
                tags: [
                    { name: "Action", value: "GetErrorLogs" },
                ],
            });

            if (dryrunResult.Messages[0].Data) {
                const data = JSON.parse(dryrunResult.Messages[0].Data);
                return data.ErrorLogs || {};
            }
            return {};
        },
    });

    // ===== MUTATIONS (Write Operations) =====

    // Scrape governance data (main function)
    const scrapeGovernanceData = useMutation({
        mutationKey: ["ScrapeGovernanceData"],
        mutationFn: async ({ governanceId, platformConfig }: { governanceId: string; platformConfig?: PlatformConfig }) => {
            const messageId = await message({
                process: GENIE_PROCESS,
                tags: [
                    { name: "Action", value: "ScrapeGovernance" },
                    { name: "GovernanceID", value: governanceId },
                ],
                data: JSON.stringify(platformConfig || {}),
                signer: createDataItemSigner(window.arweaveWallet),
            });

            const messageResult = await result({
                process: GENIE_PROCESS,
                message: messageId,
            });

            if (messageResult.Messages[0].Data) {
                return JSON.parse(messageResult.Messages[0].Data) as ScrapingResult;
            }
            return undefined;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["scraping-history"] });
            queryClient.invalidateQueries({ queryKey: ["api-rate-limits"] });
            queryClient.invalidateQueries({ queryKey: ["cached-data"] });
            queryClient.invalidateQueries({ queryKey: ["api-call-counts"] });
            queryClient.invalidateQueries({ queryKey: ["error-logs"] });
            queryClient.invalidateQueries({ queryKey: ["proposals"] });
            queryClient.invalidateQueries({ queryKey: ["governance-platforms"] });
        },
    });

    // Get scraping status for specific governance ID
    const getScrapingStatus = useMutation({
        mutationKey: ["GetScrapingStatus"],
        mutationFn: async (governanceId: string) => {
            const messageId = await message({
                process: GENIE_PROCESS,
                tags: [
                    { name: "Action", value: "GetGovernanceStatus" },
                    { name: "GovernanceID", value: governanceId },
                ],
                data: "",
                signer: createDataItemSigner(window.arweaveWallet),
            });

            const messageResult = await result({
                process: GENIE_PROCESS,
                message: messageId,
            });

            if (messageResult.Messages[0].Data) {
                return JSON.parse(messageResult.Messages[0].Data) as ScrapingStatus;
            }
            return undefined;
        },
    });

    // Get scraping history for specific governance ID
    const getScrapingHistoryForId = useMutation({
        mutationKey: ["GetScrapingHistoryForId"],
        mutationFn: async (governanceId: string) => {
            const messageId = await message({
                process: GENIE_PROCESS,
                tags: [
                    { name: "Action", value: "GetScrapingHistory" },
                    { name: "GovernanceID", value: governanceId },
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
                return data.History || [];
            }
            return [];
        },
    });

    // Get cached data for specific governance ID
    const getCachedDataForId = useMutation({
        mutationKey: ["GetCachedDataForId"],
        mutationFn: async (governanceId: string) => {
            const messageId = await message({
                process: GENIE_PROCESS,
                tags: [
                    { name: "Action", value: "GetCachedData" },
                    { name: "GovernanceID", value: governanceId },
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
                return data.CachedData as CachedData;
            }
            return undefined;
        },
    });

    // Get error logs for specific governance ID
    const getErrorLogsForId = useMutation({
        mutationKey: ["GetErrorLogsForId"],
        mutationFn: async (governanceId: string) => {
            const messageId = await message({
                process: GENIE_PROCESS,
                tags: [
                    { name: "Action", value: "GetErrorLogs" },
                    { name: "GovernanceID", value: governanceId },
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
                return data.ErrorLogs || [];
            }
            return [];
        },
    });

    // Clear cache
    const clearCache = useMutation({
        mutationKey: ["ClearCache"],
        mutationFn: async (governanceId?: string) => {
            const messageId = await message({
                process: GENIE_PROCESS,
                tags: [
                    { name: "Action", value: "ClearCache" },
                    ...(governanceId ? [{ name: "GovernanceID", value: governanceId }] : []),
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
            queryClient.invalidateQueries({ queryKey: ["cached-data"] });
        },
    });

    // Reset rate limits
    const resetRateLimits = useMutation({
        mutationKey: ["ResetRateLimits"],
        mutationFn: async (governanceId?: string) => {
            const messageId = await message({
                process: GENIE_PROCESS,
                tags: [
                    { name: "Action", value: "ResetRateLimits" },
                    ...(governanceId ? [{ name: "GovernanceID", value: governanceId }] : []),
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
            queryClient.invalidateQueries({ queryKey: ["api-rate-limits"] });
        },
    });

    // Fetch Tally proposals (internal function)
    const fetchTallyProposals = useMutation({
        mutationKey: ["FetchTallyProposals"],
        mutationFn: async ({ governanceId, platformConfig }: { governanceId: string; platformConfig?: PlatformConfig }) => {
            const messageId = await message({
                process: GENIE_PROCESS,
                tags: [
                    { name: "Action", value: "FetchTallyProposals" },
                    { name: "GovernanceID", value: governanceId },
                ],
                data: JSON.stringify(platformConfig || {}),
                signer: createDataItemSigner(window.arweaveWallet),
            });

            const messageResult = await result({
                process: GENIE_PROCESS,
                message: messageId,
            });

            if (messageResult.Messages[0].Data) {
                return JSON.parse(messageResult.Messages[0].Data) as ScrapingResult;
            }
            return undefined;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["scraping-history"] });
            queryClient.invalidateQueries({ queryKey: ["api-rate-limits"] });
            queryClient.invalidateQueries({ queryKey: ["cached-data"] });
            queryClient.invalidateQueries({ queryKey: ["api-call-counts"] });
            queryClient.invalidateQueries({ queryKey: ["error-logs"] });
            queryClient.invalidateQueries({ queryKey: ["proposals"] });
        },
    });

    // Fetch governance platform (internal function)
    const fetchGovernancePlatform = useMutation({
        mutationKey: ["FetchGovernancePlatform"],
        mutationFn: async (governanceId: string) => {
            const messageId = await message({
                process: GENIE_PROCESS,
                tags: [
                    { name: "Action", value: "FetchGovernancePlatform" },
                    { name: "GovernanceID", value: governanceId },
                ],
                data: "",
                signer: createDataItemSigner(window.arweaveWallet),
            });

            const messageResult = await result({
                process: GENIE_PROCESS,
                message: messageId,
            });

            if (messageResult.Messages[0].Data) {
                return JSON.parse(messageResult.Messages[0].Data) as ScrapingResult;
            }
            return undefined;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["scraping-history"] });
            queryClient.invalidateQueries({ queryKey: ["api-rate-limits"] });
            queryClient.invalidateQueries({ queryKey: ["cached-data"] });
            queryClient.invalidateQueries({ queryKey: ["api-call-counts"] });
            queryClient.invalidateQueries({ queryKey: ["error-logs"] });
            queryClient.invalidateQueries({ queryKey: ["governance-platforms"] });
        },
    });

    return {
        // Queries
        scrapingHistory,
        scrapingHistoryError,
        scrapingHistoryLoading,
        refetchScrapingHistory,
        apiRateLimits,
        apiRateLimitsError,
        apiRateLimitsLoading,
        refetchApiRateLimits,
        cachedData,
        cachedDataError,
        cachedDataLoading,
        refetchCachedData,
        apiCallCounts,
        apiCallCountsError,
        apiCallCountsLoading,
        refetchApiCallCounts,
        errorLogs,
        errorLogsError,
        errorLogsLoading,
        refetchErrorLogs,

        // Mutations
        scrapeGovernanceData,
        getScrapingStatus,
        getScrapingHistoryForId,
        getCachedDataForId,
        getErrorLogsForId,
        clearCache,
        resetRateLimits,
        fetchTallyProposals,
        fetchGovernancePlatform,
    };
}
