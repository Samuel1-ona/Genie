local notification_system = require "lib.notification_system"
local platform_adapter = require "lib.platform_adapter"
local proposals = require "lib.proposals"
local apus_agent = require "apus_agent"



-- JSON library (try cjson first, fallback to built-in)
local json
local success, cjson = pcall(require, "cjson")
if success then
    json = cjson
else
    -- Fallback to built-in JSON if available (AO environment)
    if not json then
        json = {
            encode = function(data) return "{}" end,
            decode = function(str) return {} end
        }
    end
end

-- Global system configuration
local version = "0.0.1"
local AgentName = "Genie-Proposal-Summarizer"

-- Global system state
GovernanceData = GovernanceData or {}
NotificationSubscribers = NotificationSubscribers or {}

-- Balance tracking for token-based proposal creation (shared with proposals.lua)
Balance = Balance or {}

-- Platform adapter global state (shared with platform_adapter.lua)
ScrapingHistory = ScrapingHistory or {}
ApiRateLimits = ApiRateLimits or {}
CachedData = CachedData or {}
ScrapingStatus = ScrapingStatus or {}
ApiCallCounts = ApiCallCounts or {}
ErrorLogs = ErrorLogs or {}

-- Handler to get Info
local function infoHandler(msg)
    ao.send({
        Target = msg.From,
        Version = version,
        AgentName = AgentName,
        Status = "Active",
        Features = {
            "governance_data_scraping",
            "proposal_management", 
            "notification_system",
            "platform_adapter",
            "apus_ai_summarization",
            "proposal_analysis",
            "batch_summarization"
        }
    })
end

-- Handler to scrape governance data
local function scrapeGovernanceHandler(msg)
    local governance_id = msg.Tags.GovernanceID
    local platform_config = msg.Data and json.decode(msg.Data) or {}
    
    if not governance_id then
        ao.send({
            Target = msg.From,
            Error = "GovernanceID tag is required"
        })
        return
    end
    
    print("Received governance scraping request for: " .. governance_id)
    
    local result = platform_adapter.scrape_governance_data(governance_id, platform_config)
    
    ao.send({
        Target = msg.From,
        Action = "GovernanceDataScraped",
        GovernanceID = governance_id,
        Success = result.success,
        Data = result,
        Timestamp = tostring(os.time())
    })
end

-- Handler to get governance status
local function getGovernanceStatusHandler(msg)
    local governance_id = msg.Tags.GovernanceID
    
    if not governance_id then
        ao.send({
            Target = msg.From,
            Error = "GovernanceID tag is required"
        })
        return
    end
    
    local status = platform_adapter.get_scraping_status(governance_id)
    
    ao.send({
        Target = msg.From,
        Action = "GovernanceStatus",
        GovernanceID = governance_id,
        Status = status,
        Timestamp = tostring(os.time())
    })
end

-- Handler to add proposal
local function addProposalHandler(msg)
    local proposal_data = msg.Data and json.decode(msg.Data) or {}
    
    if not proposal_data.id then
        ao.send({
            Target = msg.From,
            Error = "Proposal data with ID is required"
        })
        return
    end
    
    local success = proposals.add_proposal(proposal_data)
    
    ao.send({
        Target = msg.From,
        Action = "ProposalAdded",
        ProposalID = proposal_data.id,
        Success = success,
        Timestamp = tostring(os.time())
    })
end

-- Handler to get proposal
local function getProposalHandler(msg)
    local proposal_id = msg.Tags.ProposalID
    
    if not proposal_id then
        ao.send({
            Target = msg.From,
            Error = "ProposalID tag is required"
        })
        return
    end
    
    local proposal = proposals.get(proposal_id)
    
    ao.send({
        Target = msg.From,
        Action = "ProposalRetrieved",
        ProposalID = proposal_id,
        Proposal = proposal,
        Found = proposal ~= nil,
        Timestamp = tostring(os.time())
    })
end

-- Handler to get all proposals
local function getAllProposalsHandler(msg)
    local all_proposals = proposals.get_all()
    
    ao.send({
        Target = msg.From,
        Action = "AllProposalsRetrieved",
        Proposals = all_proposals,
        Count = #all_proposals,
        Timestamp = tostring(os.time())
    })
end

-- Handler to search proposals
local function searchProposalsHandler(msg)
    local query = msg.Tags.Query
    
    if not query then
        ao.send({
            Target = msg.From,
            Error = "Query tag is required"
        })
        return
    end
    
    local results = proposals.search(query)
    
    ao.send({
        Target = msg.From,
        Action = "ProposalsSearched",
        Query = query,
        Results = results,
        Count = #results,
        Timestamp = tostring(os.time())
    })
end

-- Handler to add notification subscriber
local function addSubscriberHandler(msg)
    local subscriber_data = msg.Data and json.decode(msg.Data) or {}
    
    if not subscriber_data.type then
        ao.send({
            Target = msg.From,
            Error = "Subscriber type is required"
        })
        return
    end
    
    local success = notification_system.add_subscriber(subscriber_data)
    
    ao.send({
        Target = msg.From,
        Action = "SubscriberAdded",
        SubscriberType = subscriber_data.type,
        Success = success,
        Timestamp = tostring(os.time())
    })
end

-- Handler to broadcast notification
local function broadcastNotificationHandler(msg)
    local proposal_data = msg.Data and json.decode(msg.Data) or {}
    local summary = msg.Tags.Summary or "No summary provided"
    
    if not proposal_data.id then
        ao.send({
            Target = msg.From,
            Error = "Proposal data with ID is required"
        })
        return
    end
    
    local success = notification_system.broadcast(proposal_data, summary)
    
    ao.send({
        Target = msg.From,
        Action = "NotificationBroadcasted",
        ProposalID = proposal_data.id,
        Success = success,
        Timestamp = tostring(os.time())
    })
end

-- Handler to get subscribers
local function getSubscribersHandler(msg)
    local subscribers = notification_system.get_subscribers()
    
    ao.send({
        Target = msg.From,
        Action = "SubscribersRetrieved",
        Subscribers = subscribers,
        Count = #subscribers,
        Timestamp = tostring(os.time())
    })
end

-- Handler to execute proposal
local function executeProposalHandler(msg)
    local proposal_id = msg.Tags.ProposalID
    
    if not proposal_id then
        ao.send({
            Target = msg.From,
            Error = "ProposalID tag is required"
        })
        return
    end
    
    local success = proposals.execute_proposal(proposal_id)
    
    ao.send({
        Target = msg.From,
        Action = "ProposalExecuted",
        ProposalID = proposal_id,
        Success = success,
        Timestamp = tostring(os.time())
    })
end

-- Handler to update proposal votes
local function updateVotesHandler(msg)
    local proposal_id = msg.Tags.ProposalID
    local votes_data = msg.Data and json.decode(msg.Data) or {}
    
    if not proposal_id then
        ao.send({
            Target = msg.From,
            Error = "ProposalID tag is required"
        })
        return
    end
    
    local success = proposals.update_proposal_votes(proposal_id, votes_data)
    
    ao.send({
        Target = msg.From,
        Action = "VotesUpdated",
        ProposalID = proposal_id,
        Success = success,
        Timestamp = tostring(os.time())
    })
end

-- Handler to get governance platforms
local function getGovernancePlatformsHandler(msg)
    local platforms = proposals.get_all_governance_platforms()
    
    ao.send({
        Target = msg.From,
        Action = "GovernancePlatformsRetrieved",
        Platforms = platforms,
        Count = #platforms,
        Timestamp = tostring(os.time())
    })
end

-- Handler to get proposals by platform
local function getProposalsByPlatformHandler(msg)
    local platform_id = msg.Tags.PlatformID
    
    if not platform_id then
        ao.send({
            Target = msg.From,
            Error = "PlatformID tag is required"
        })
        return
    end
    
    local platform_proposals = proposals.get_proposals_by_platform(platform_id)
    
    ao.send({
        Target = msg.From,
        Action = "PlatformProposalsRetrieved",
        PlatformID = platform_id,
        Proposals = platform_proposals,
        Count = #platform_proposals,
        Timestamp = tostring(os.time())
    })
end

-- Handler to get scraping history
local function getScrapingHistoryHandler(msg)
    local governance_id = msg.Tags.GovernanceID
    
    local history = platform_adapter.get_scraping_history(governance_id)
    
    ao.send({
        Target = msg.From,
        Action = "ScrapingHistoryRetrieved",
        GovernanceID = governance_id,
        History = history,
        Timestamp = tostring(os.time())
    })
end

-- Handler to get API rate limits
local function getApiRateLimitsHandler(msg)
    local rate_limits = platform_adapter.get_api_rate_limits()
    
    ao.send({
        Target = msg.From,
        Action = "ApiRateLimitsRetrieved",
        RateLimits = rate_limits,
        Timestamp = tostring(os.time())
    })
end

-- Handler to get cached data
local function getCachedDataHandler(msg)
    local governance_id = msg.Tags.GovernanceID
    
    local cached_data = platform_adapter.get_cached_data(governance_id)
    
    ao.send({
        Target = msg.From,
        Action = "CachedDataRetrieved",
        GovernanceID = governance_id,
        CachedData = cached_data,
        Timestamp = tostring(os.time())
    })
end

-- Handler to get API call counts
local function getApiCallCountsHandler(msg)
    local call_counts = platform_adapter.get_api_call_counts()
    
    ao.send({
        Target = msg.From,
        Action = "ApiCallCountsRetrieved",
        CallCounts = call_counts,
        Timestamp = tostring(os.time())
    })
end

-- Handler to get error logs
local function getErrorLogsHandler(msg)
    local governance_id = msg.Tags.GovernanceID
    
    local error_logs = platform_adapter.get_error_logs(governance_id)
    
    ao.send({
        Target = msg.From,
        Action = "ErrorLogsRetrieved",
        GovernanceID = governance_id,
        ErrorLogs = error_logs,
        Timestamp = tostring(os.time())
    })
end

-- Handler to clear cache
local function clearCacheHandler(msg)
    local governance_id = msg.Tags.GovernanceID
    
    platform_adapter.clear_cache(governance_id)
    
    ao.send({
        Target = msg.From,
        Action = "CacheCleared",
        GovernanceID = governance_id,
        Success = true,
        Timestamp = tostring(os.time())
    })
end

-- Handler to reset rate limits
local function resetRateLimitsHandler(msg)
    local governance_id = msg.Tags.GovernanceID
    
    platform_adapter.reset_rate_limits(governance_id)
    
    ao.send({
        Target = msg.From,
        Action = "RateLimitsReset",
        GovernanceID = governance_id,
        Success = true,
        Timestamp = tostring(os.time())
    })
end

-- Handler to get balance for a user
local function getBalanceHandler(msg)
    local user_id = msg.Tags.UserID
    
    if not user_id then
        ao.send({
            Target = msg.From,
            Error = "UserID tag is required"
        })
        return
    end
    
    local balance = Balance[user_id] or 0
    
    ao.send({
        Target = msg.From,
        Action = "BalanceRetrieved",
        UserID = user_id,
        Balance = balance,
        Timestamp = tostring(os.time())
    })
end

-- Handler to set balance for a user
local function setBalanceHandler(msg)
    local user_id = msg.Tags.UserID
    local balance_data = msg.Data and json.decode(msg.Data) or {}
    local amount = balance_data.amount
    
    if not user_id then
        ao.send({
            Target = msg.From,
            Error = "UserID tag is required"
        })
        return
    end
    
    if not amount or type(amount) ~= "number" then
        ao.send({
            Target = msg.From,
            Error = "Valid amount is required in Data"
        })
        return
    end
    
    Balance[user_id] = amount
    
    ao.send({
        Target = msg.From,
        Action = "BalanceSet",
        UserID = user_id,
        Balance = amount,
        Success = true,
        Timestamp = tostring(os.time())
    })
end

-- Handler to add balance to a user
local function addBalanceHandler(msg)
    local user_id = msg.Tags.UserID
    local balance_data = msg.Data and json.decode(msg.Data) or {}
    local amount = balance_data.amount
    
    if not user_id then
        ao.send({
            Target = msg.From,
            Error = "UserID tag is required"
        })
        return
    end
    
    if not amount or type(amount) ~= "number" then
        ao.send({
            Target = msg.From,
            Error = "Valid amount is required in Data"
        })
        return
    end
    
    Balance[user_id] = (Balance[user_id] or 0) + amount
    
    ao.send({
        Target = msg.From,
        Action = "BalanceAdded",
        UserID = user_id,
        Amount = amount,
        NewBalance = Balance[user_id],
        Success = true,
        Timestamp = tostring(os.time())
    })
end

-- Handler to get all balances
local function getAllBalancesHandler(msg)
    ao.send({
        Target = msg.From,
        Action = "AllBalancesRetrieved",
        Balances = Balance,
        Count = 0, -- Count non-zero balances
        Timestamp = tostring(os.time())
    })
end

-- Handler to summarize proposals using APUS AI
local function summarizeProposalHandler(msg)
    local proposal_data = msg.Data and json.decode(msg.Data) or {}
    
    if not proposal_data.id or not proposal_data.title then
        ao.send({
            Target = msg.From,
            Action = "ProposalSummarizationError",
            Error = "Proposal ID and title are required",
            Timestamp = tostring(os.time())
        })
        return
    end
    
    -- Generate a unique reference for this summarization task
    local reference = "summarize_" .. proposal_data.id .. "_" .. tostring(os.time())
    
    -- Create the summarization request
    local summarizationRequest = {
        Target = msg.From,
        Action = "SummarizeProposal",
        Data = json.encode(proposal_data),
        Tags = {
            ["X-Reference"] = reference
        }
    }
    
    -- Send the request to the APUS agent
    ao.send(summarizationRequest)
    
    -- Also send a confirmation to the requester
    ao.send({
        Target = msg.From,
        Action = "ProposalSummarizationStarted",
        ProposalID = proposal_data.id,
        TaskReference = reference,
        Status = "processing",
        Timestamp = tostring(os.time())
    })
end

-- Handler to get proposal summary
local function getProposalSummaryHandler(msg)
    local proposal_id = msg.Tags.ProposalID
    
    if not proposal_id then
        ao.send({
            Target = msg.From,
            Action = "ProposalSummaryError",
            Error = "ProposalID tag is required",
            Timestamp = tostring(os.time())
        })
        return
    end
    
    -- Create the request to get the summary
    local summaryRequest = {
        Target = msg.From,
        Action = "GetProposalSummary",
        Tags = {
            ProposalId = proposal_id
        }
    }
    
    -- Send the request to the APUS agent
    ao.send(summaryRequest)
end

-- Handler to get all proposal summaries
local function getAllProposalSummariesHandler(msg)
    -- Create the request to get all summaries
    local summariesRequest = {
        Target = msg.From,
        Action = "GetAllProposalSummaries"
    }
    
    -- Send the request to the APUS agent
    ao.send(summariesRequest)
end

-- Register all handlers
Handlers.add("info",
    Handlers.utils.hasMatchingTag("Action", "Info"),
    infoHandler
)

Handlers.add("scrape_governance",
    Handlers.utils.hasMatchingTag("Action", "ScrapeGovernance"),
    scrapeGovernanceHandler
)

Handlers.add("get_governance_status",
    Handlers.utils.hasMatchingTag("Action", "GetGovernanceStatus"),
    getGovernanceStatusHandler
)

Handlers.add("add_proposal",
    Handlers.utils.hasMatchingTag("Action", "AddProposal"),
    addProposalHandler
)

Handlers.add("get_proposal",
    Handlers.utils.hasMatchingTag("Action", "GetProposal"),
    getProposalHandler
)

Handlers.add("get_all_proposals",
    Handlers.utils.hasMatchingTag("Action", "GetAllProposals"),
    getAllProposalsHandler
)

Handlers.add("search_proposals",
    Handlers.utils.hasMatchingTag("Action", "SearchProposals"),
    searchProposalsHandler
)

Handlers.add("add_subscriber",
    Handlers.utils.hasMatchingTag("Action", "AddSubscriber"),
    addSubscriberHandler
)

Handlers.add("broadcast_notification",
    Handlers.utils.hasMatchingTag("Action", "BroadcastNotification"),
    broadcastNotificationHandler
)

Handlers.add("get_subscribers",
    Handlers.utils.hasMatchingTag("Action", "GetSubscribers"),
    getSubscribersHandler
)

Handlers.add("execute_proposal",
    Handlers.utils.hasMatchingTag("Action", "ExecuteProposal"),
    executeProposalHandler
)

Handlers.add("update_votes",
    Handlers.utils.hasMatchingTag("Action", "UpdateVotes"),
    updateVotesHandler
)

Handlers.add("get_governance_platforms",
    Handlers.utils.hasMatchingTag("Action", "GetGovernancePlatforms"),
    getGovernancePlatformsHandler
)

Handlers.add("get_proposals_by_platform",
    Handlers.utils.hasMatchingTag("Action", "GetProposalsByPlatform"),
    getProposalsByPlatformHandler
)

Handlers.add("get_scraping_history",
    Handlers.utils.hasMatchingTag("Action", "GetScrapingHistory"),
    getScrapingHistoryHandler
)

Handlers.add("get_api_rate_limits",
    Handlers.utils.hasMatchingTag("Action", "GetApiRateLimits"),
    getApiRateLimitsHandler
)

Handlers.add("get_cached_data",
    Handlers.utils.hasMatchingTag("Action", "GetCachedData"),
    getCachedDataHandler
)

Handlers.add("get_api_call_counts",
    Handlers.utils.hasMatchingTag("Action", "GetApiCallCounts"),
    getApiCallCountsHandler
)

Handlers.add("get_error_logs",
    Handlers.utils.hasMatchingTag("Action", "GetErrorLogs"),
    getErrorLogsHandler
)

Handlers.add("clear_cache",
    Handlers.utils.hasMatchingTag("Action", "ClearCache"),
    clearCacheHandler
)

Handlers.add("reset_rate_limits",
    Handlers.utils.hasMatchingTag("Action", "ResetRateLimits"),
    resetRateLimitsHandler
)

Handlers.add("get_balance",
    Handlers.utils.hasMatchingTag("Action", "GetBalance"),
    getBalanceHandler
)

Handlers.add("set_balance",
    Handlers.utils.hasMatchingTag("Action", "SetBalance"),
    setBalanceHandler
)

Handlers.add("add_balance",
    Handlers.utils.hasMatchingTag("Action", "AddBalance"),
    addBalanceHandler
)

Handlers.add("get_all_balances",
    Handlers.utils.hasMatchingTag("Action", "GetAllBalances"),
    getAllBalancesHandler
)

Handlers.add("summarize_proposal",
    Handlers.utils.hasMatchingTag("Action", "SummarizeProposal"),
    summarizeProposalHandler
)

Handlers.add("get_proposal_summary",
    Handlers.utils.hasMatchingTag("Action", "GetProposalSummary"),
    getProposalSummaryHandler
)

Handlers.add("get_all_proposal_summaries",
    Handlers.utils.hasMatchingTag("Action", "GetAllProposalSummaries"),
    getAllProposalSummariesHandler
)


