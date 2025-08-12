local mod = {}

-- Import the proposals module
local proposals = require("proposals")

-- Global state management for platform adapter
local ScrapingHistory = {}
local ApiRateLimits = {}
local CachedData = {}
local ScrapingStatus = {}
local ApiCallCounts = {}
local ErrorLogs = {}

-- Internal function to update global state
local function update_scraping_state(governance_id, success, error_msg)
    local current_time = os.time()
    
    -- Update scraping history
    if not ScrapingHistory[governance_id] then
        ScrapingHistory[governance_id] = {}
    end
    
    table.insert(ScrapingHistory[governance_id], {
        timestamp = current_time,
        success = success,
        error = error_msg
    })
    
    -- Keep only last 10 entries per governance ID
    if #ScrapingHistory[governance_id] > 10 then
        table.remove(ScrapingHistory[governance_id], 1)
    end
    
    -- Update scraping status
    if not ScrapingStatus[governance_id] then
        ScrapingStatus[governance_id] = {}
    end
    
    ScrapingStatus[governance_id].last_scraped = current_time
    ScrapingStatus[governance_id].scrape_count = (ScrapingStatus[governance_id].scrape_count or 0) + 1
    
    -- Update API call counts
    ApiCallCounts[governance_id] = (ApiCallCounts[governance_id] or 0) + 1
    
    -- Log errors
    if error_msg then
        if not ErrorLogs[governance_id] then
            ErrorLogs[governance_id] = {}
        end
        
        table.insert(ErrorLogs[governance_id], {
            timestamp = current_time,
            error = error_msg
        })
        
        -- Keep only last 5 errors per governance ID
        if #ErrorLogs[governance_id] > 5 then
            table.remove(ErrorLogs[governance_id], 1)
        end
    end
end

-- Internal function to check rate limits
local function check_rate_limit(governance_id)
    local current_time = os.time()
    local rate_limit = ApiRateLimits[governance_id]
    
    if rate_limit and rate_limit.is_limited then
        if current_time - rate_limit.limited_at < 60 then -- 1 minute cooldown
            return false, "Rate limited. Try again in " .. (60 - (current_time - rate_limit.limited_at)) .. " seconds"
        else
            -- Reset rate limit
            ApiRateLimits[governance_id] = nil
        end
    end
    
    return true
end

-- Internal function to set rate limit
local function set_rate_limit(governance_id)
    ApiRateLimits[governance_id] = {
        is_limited = true,
        limited_at = os.time()
    }
end

-- Load environment variables directly from .env file
local function load_env_from_file()
    local env_vars = {}
    local env_file = io.open(".env", "r")
    
    if env_file then
        for line in env_file:lines() do
            -- Skip comments and empty lines
            if line:match("^%s*[^#]") and line:match("=") then
                local key, value = line:match("^%s*([^=]+)=%s*(.+)")
                if key and value then
                    -- Remove quotes if present and trim whitespace
                    key = key:gsub("%s+", "")
                    value = value:gsub("^[\"'](.*)[\"']$", "%1"):gsub("%s+$", "")
                    env_vars[key] = value
                    print("Loaded env var: " .. key .. " = " .. value)
                end
            end
        end
        env_file:close()
        print("Environment variables loaded from .env file")
    else
        print("Warning: .env file not found, using default configuration")
    end
    
    return env_vars
end

-- Load .env file and get variables
local env_vars = load_env_from_file()

-- API Configuration from .env file
local TALLY_API_KEY = env_vars["TALLY_API_KEY"]
local TALLY_BASE_URL = env_vars["TALLY_BASE_URL"] 

-- JSON library (try cjson first, fallback to built-in)
local json
local success, cjson = pcall(require, "cjson")
if success then
    json = cjson
else
    -- Fallback to built-in JSON if available (AO environment)
    json = json or {
        encode = function(data) return "{}" end,
        decode = function(str) return {} end
    }
end

-- Real HTTP request function using LuaSocket
local function make_http_request(url, headers, body)
    print("Making HTTP request to: " .. url)
    
    -- Try to use LuaSocket for HTTP requests
    local success, http = pcall(require, "socket.http")
    if not success then
        print("LuaSocket not available, using mock response")
        return {
            status = 200,
            body = '{"proposals": []}'
        }
    end
    
    local ltn12 = require("ltn12")
    local response_body = {}
    
    -- Prepare headers
    local request_headers = {}
    if headers then
        for key, value in pairs(headers) do
            request_headers[key] = value
        end
    end
    
    -- Make the HTTP request
    local result, status_code, response_headers = http.request{
        url = url,
        method = body and "POST" or "GET",
        headers = request_headers,
        source = body and ltn12.source.string(body) or nil,
        sink = ltn12.sink.table(response_body)
    }
    
    if result then
        return {
            status = status_code,
            body = table.concat(response_body),
            headers = response_headers
        }
    else
        print("HTTP request failed: " .. tostring(status_code))
        return {
            status = status_code or 500,
            body = '{"error": "HTTP request failed"}',
            headers = {}
        }
    end
end

-- Enhanced Tally platform adapter with comprehensive data scraping
function mod.fetch_tally_proposals(governance_id, platform_config)
    if not governance_id then
        print("Governance ID is required")
        update_scraping_state(governance_id, false, "Governance ID is required")
        return { success = false, error = "Governance ID is required" }
    end

    -- Check rate limits
    local can_proceed, rate_limit_msg = check_rate_limit(governance_id)
    if not can_proceed then
        print("Rate limited: " .. rate_limit_msg)
        update_scraping_state(governance_id, false, rate_limit_msg)
        return { success = false, error = rate_limit_msg, rate_limited = true }
    end

    -- Check cache first
    if CachedData[governance_id] and CachedData[governance_id].proposals then
        local cache_age = os.time() - CachedData[governance_id].cached_at
        if cache_age < 300 then -- 5 minutes cache
            print("Returning cached proposals for governance ID: " .. governance_id)
            update_scraping_state(governance_id, true, nil)
            return {
                success = true,
                governance_id = governance_id,
                cached = true,
                cache_age = cache_age,
                proposals = CachedData[governance_id].proposals
            }
        end
    end

    print("Fetching proposals from Tally platform for governance ID: " .. governance_id)
    
    -- Default platform configuration
    platform_config = platform_config or {}
    local platform_name = platform_config.name or "tally"
    local platform_url = platform_config.url or "https://www.tally.xyz"
    
    -- Make HTTP request to Tally API
    local headers = {
        ["Authorization"] = "Bearer " .. TALLY_API_KEY,
        ["Content-Type"] = "application/json"
    }
    
    -- Construct the API URL for proposals
    local url = TALLY_BASE_URL .. "/governance/" .. governance_id .. "/proposals"
    
    local response = make_http_request(url, headers, nil)
    
    if response and response.status == 200 then
        local data = json.decode(response.body)
        if data and data.proposals then
            local scraped_proposals = {}
            local success_count = 0
            local error_count = 0
            
            print("Found " .. #data.proposals .. " proposals from Tally API")
            
            for i, proposal in ipairs(data.proposals) do
                -- Transform Tally API response to our enhanced proposal format
                local transformed_proposal = {
                    id = "tally-" .. proposal.id,
                    title = proposal.title or "Untitled Proposal",
                    description = proposal.description or proposal.body or "No description available",
                    content = proposal.description or proposal.body or "No content available",
                    proposer = proposal.proposer or proposal.proposerAddress or "Unknown",
                    platform = platform_name,
                    governance_platform_id = governance_id,
                    status = mod.map_tally_status(proposal.status),
                    type = "governance",
                    url = platform_url .. "/governance/" .. governance_id .. "/proposal/" .. proposal.id,
                    deadline = proposal.endTime and proposal.endTime / 1000 or (os.time() + 86400 * 7),
                    created_at = proposal.createdTime and proposal.createdTime / 1000 or os.time(),
                    updated_at = proposal.updatedTime and proposal.updatedTime / 1000 or os.time(),
                    executed_at = proposal.executedTime and proposal.executedTime / 1000 or nil,
                    canceled_at = proposal.canceledTime and proposal.canceledTime / 1000 or nil,
                    
                    -- Voting data
                    for_votes = proposal.forVotes or 0,
                    against_votes = proposal.againstVotes or 0,
                    abstain_votes = proposal.abstainVotes or 0,
                    quorum = proposal.quorum or 0,
                    total_votes = (proposal.forVotes or 0) + (proposal.againstVotes or 0) + (proposal.abstainVotes or 0),
                    
                    -- Execution data
                    execution_time = proposal.executionTime and proposal.executionTime / 1000 or nil,
                    timelock_id = proposal.timelockId or "",
                    
                    -- Metadata
                    metadata = {
                        tally_id = proposal.id,
                        governance_id = governance_id,
                        platform = platform_name,
                        raw_data = proposal -- Keep original data for reference
                    },
                    
                    -- Actions/Transactions (if available)
                    actions = proposal.actions or {},
                    
                    -- Tags and categories
                    tags = proposal.tags or {},
                    category = proposal.category or "general"
                }
                
                -- Try to add the proposal to our system
                local success = proposals.add_proposal(transformed_proposal)
                if success then
                    success_count = success_count + 1
                    table.insert(scraped_proposals, transformed_proposal)
                else
                    error_count = error_count + 1
                    print("Failed to add proposal: " .. transformed_proposal.id)
                end
            end
            
            -- Cache the results
            CachedData[governance_id] = {
                proposals = scraped_proposals,
                cached_at = os.time()
            }
            
            print("Data scraping completed:")
            print("  - Successfully added: " .. success_count .. " proposals")
            print("  - Failed to add: " .. error_count .. " proposals")
            
            -- Update global state
            update_scraping_state(governance_id, true, nil)
            
            return {
                success = true,
                governance_id = governance_id,
                platform = platform_name,
                total_proposals = #data.proposals,
                success_count = success_count,
                error_count = error_count,
                proposals = scraped_proposals,
                cached = false
            }
        else
            local error_msg = "No proposals found in API response"
            print(error_msg)
            update_scraping_state(governance_id, false, error_msg)
            return {
                success = false,
                error = error_msg,
                governance_id = governance_id
            }
        end
    else
        local error_msg = "API request failed"
        if response then
            error_msg = error_msg .. " (Status: " .. response.status .. ")"
            if response.body then
                local error_data = json.decode(response.body)
                if error_data and error_data.error then
                    error_msg = error_msg .. " - " .. error_data.error
                end
            end
            
            -- Check for rate limiting
            if response.status == 429 then
                set_rate_limit(governance_id)
                error_msg = error_msg .. " (Rate limited)"
            end
        end
        
        print(error_msg)
        update_scraping_state(governance_id, false, error_msg)
        return {
            success = false,
            error = error_msg,
            governance_id = governance_id
        }
    end
end

-- Map Tally status to our status format
function mod.map_tally_status(tally_status)
    if not tally_status then return "active" end
    
    local status_mapping = {
        ["ACTIVE"] = "active",
        ["PENDING"] = "pending",
        ["SUCCEEDED"] = "passed",
        ["DEFEATED"] = "failed",
        ["EXECUTED"] = "executed",
        ["CANCELED"] = "canceled",
        ["EXPIRED"] = "expired",
        ["QUEUED"] = "queued"
    }
    
    return status_mapping[tally_status:upper()] or "active"
end

-- Function to fetch governance platform data
function mod.fetch_governance_platform(governance_id)
    if not governance_id then
        print("Governance ID is required")
        update_scraping_state(governance_id, false, "Governance ID is required")
        return { success = false, error = "Governance ID is required" }
    end

    -- Check rate limits
    local can_proceed, rate_limit_msg = check_rate_limit(governance_id)
    if not can_proceed then
        print("Rate limited: " .. rate_limit_msg)
        update_scraping_state(governance_id, false, rate_limit_msg)
        return { success = false, error = rate_limit_msg, rate_limited = true }
    end

    -- Check cache first
    if CachedData[governance_id] and CachedData[governance_id].platform then
        local cache_age = os.time() - CachedData[governance_id].platform_cached_at
        if cache_age < 600 then -- 10 minutes cache for platform data
            print("Returning cached platform data for governance ID: " .. governance_id)
            update_scraping_state(governance_id, true, nil)
            return {
                success = true,
                governance_id = governance_id,
                cached = true,
                cache_age = cache_age,
                platform = CachedData[governance_id].platform
            }
        end
    end

    print("Fetching governance platform data for ID: " .. governance_id)
    
    local headers = {
        ["Authorization"] = "Bearer " .. TALLY_API_KEY,
        ["Content-Type"] = "application/json"
    }
    
    local url = TALLY_BASE_URL .. "/governance/" .. governance_id
    
    local response = make_http_request(url, headers, nil)
    
    if response and response.status == 200 then
        local data = json.decode(response.body)
        if data and data.governance then
            local platform_data = data.governance
            
            -- Transform to our governance platform format
            local transformed_platform = {
                id = governance_id,
                chainId = platform_data.chainId or "eip155:1",
                contracts = {
                    governor = platform_data.governor or "",
                    timelock = platform_data.timelock or ""
                },
                isIndexing = platform_data.isIndexing or false,
                isBehind = platform_data.isBehind or false,
                isPrimary = platform_data.isPrimary or false,
                kind = platform_data.kind or "single",
                name = platform_data.name or "Unknown Platform",
                organization = {
                    id = platform_data.organization and platform_data.organization.id or "",
                    name = platform_data.organization and platform_data.organization.name or "",
                    description = platform_data.organization and platform_data.organization.description or ""
                },
                proposalStats = platform_data.proposalStats or {},
                parameters = platform_data.parameters or {},
                quorum = platform_data.quorum or 0,
                slug = platform_data.slug or "",
                timelockId = platform_data.timelockId or "",
                tokenId = platform_data.tokenId or "",
                token = platform_data.token or {},
                type = platform_data.type or "governoralpha",
                delegatesCount = platform_data.delegatesCount or 0,
                delegatesVotesCount = platform_data.delegatesVotesCount or 0,
                tokenOwnersCount = platform_data.tokenOwnersCount or 0,
                metadata = platform_data.metadata or {}
            }
            
            -- Add the platform to our system
            local success = proposals.add_governance_platform(transformed_platform)
            
            if success then
                -- Cache the platform data
                if not CachedData[governance_id] then
                    CachedData[governance_id] = {}
                end
                CachedData[governance_id].platform = transformed_platform
                CachedData[governance_id].platform_cached_at = os.time()
                
                print("Governance platform added successfully: " .. governance_id)
                update_scraping_state(governance_id, true, nil)
                return {
                    success = true,
                    governance_id = governance_id,
                    platform = transformed_platform,
                    cached = false
                }
            else
                local error_msg = "Failed to add governance platform"
                print(error_msg .. ": " .. governance_id)
                update_scraping_state(governance_id, false, error_msg)
                return {
                    success = false,
                    error = error_msg,
                    governance_id = governance_id
                }
            end
        else
            local error_msg = "No governance data found in API response"
            print(error_msg)
            update_scraping_state(governance_id, false, error_msg)
            return {
                success = false,
                error = error_msg,
                governance_id = governance_id
            }
        end
    else
        local error_msg = "API request failed"
        if response then
            error_msg = error_msg .. " (Status: " .. response.status .. ")"
            
            -- Check for rate limiting
            if response.status == 429 then
                set_rate_limit(governance_id)
                error_msg = error_msg .. " (Rate limited)"
            end
        end
        
        print(error_msg)
        update_scraping_state(governance_id, false, error_msg)
        return {
            success = false,
            error = error_msg,
            governance_id = governance_id
        }
    end
end

-- Main function to be called from frontend - complete integration
function mod.scrape_governance_data(governance_id, platform_config)
    if not governance_id then
        return { success = false, error = "Governance ID is required" }
    end

    print("Starting comprehensive governance data scraping for: " .. governance_id)
    
    -- Step 1: Fetch governance platform data
    local platform_result = mod.fetch_governance_platform(governance_id)
    if not platform_result.success then
        print("Failed to fetch governance platform data")
        return platform_result
    end
    
    -- Step 2: Fetch proposals
    local proposals_result = mod.fetch_tally_proposals(governance_id, platform_config)
    if not proposals_result.success then
        print("Failed to fetch proposals")
        return proposals_result
    end
    
    -- Step 3: Return comprehensive results
    return {
        success = true,
        governance_id = governance_id,
        platform = platform_result.platform,
        proposals = proposals_result.proposals,
        summary = {
            platform_added = platform_result.success,
            total_proposals = proposals_result.total_proposals,
            proposals_added = proposals_result.success_count,
            proposals_failed = proposals_result.error_count
        }
    }
end

-- Global state management functions
function mod.get_scraping_history(governance_id)
    if governance_id then
        return ScrapingHistory[governance_id] or {}
    end
    return ScrapingHistory
end

function mod.get_api_rate_limits()
    return ApiRateLimits
end

function mod.get_cached_data(governance_id)
    if governance_id then
        return CachedData[governance_id]
    end
    return CachedData
end

function mod.get_scraping_status(governance_id)
    if not governance_id then
        return { success = false, error = "Governance ID is required" }
    end

    local platform = proposals.get_governance_platform(governance_id)
    local platform_proposals = proposals.get_proposals_by_platform(governance_id)
    
    -- Include global state information
    local global_status = ScrapingStatus[governance_id] or {}
    local api_calls = ApiCallCounts[governance_id] or 0
    local last_error = ErrorLogs[governance_id] and ErrorLogs[governance_id][#ErrorLogs[governance_id]] or nil
    
    return {
        success = true,
        governance_id = governance_id,
        platform_exists = platform ~= nil,
        platform = platform,
        proposals_count = #platform_proposals,
        proposals = platform_proposals,
        -- Global state info
        last_scraped = global_status.last_scraped,
        scrape_count = global_status.scrape_count or 0,
        api_calls_made = api_calls,
        last_error = last_error,
        is_rate_limited = ApiRateLimits[governance_id] and ApiRateLimits[governance_id].is_limited or false,
        cache_hit = CachedData[governance_id] ~= nil
    }
end

function mod.get_api_call_counts()
    return ApiCallCounts
end

function mod.get_error_logs(governance_id)
    if governance_id then
        return ErrorLogs[governance_id] or {}
    end
    return ErrorLogs
end

function mod.clear_cache(governance_id)
    if governance_id then
        CachedData[governance_id] = nil
        print("Cache cleared for governance ID: " .. governance_id)
    else
        CachedData = {}
        print("All cache cleared")
    end
end

function mod.reset_rate_limits(governance_id)
    if governance_id then
        ApiRateLimits[governance_id] = nil
        print("Rate limits reset for governance ID: " .. governance_id)
    else
        ApiRateLimits = {}
        print("All rate limits reset")
    end
end

return mod