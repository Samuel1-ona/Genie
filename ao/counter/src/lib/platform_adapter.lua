local mod = {}

-- Import the proposals module
local proposals = require("lib.proposals")

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
        return { success = false, error = "Governance ID is required" }
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
            
            print("Data scraping completed:")
            print("  - Successfully added: " .. success_count .. " proposals")
            print("  - Failed to add: " .. error_count .. " proposals")
            
            return {
                success = true,
                governance_id = governance_id,
                platform = platform_name,
                total_proposals = #data.proposals,
                success_count = success_count,
                error_count = error_count,
                proposals = scraped_proposals
            }
        else
            print("No proposals found in API response")
            return {
                success = false,
                error = "No proposals found in API response",
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
        end
        
        print(error_msg)
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
        return { success = false, error = "Governance ID is required" }
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
                print("Governance platform added successfully: " .. governance_id)
                return {
                    success = true,
                    governance_id = governance_id,
                    platform = transformed_platform
                }
            else
                print("Failed to add governance platform: " .. governance_id)
                return {
                    success = false,
                    error = "Failed to add governance platform",
                    governance_id = governance_id
                }
            end
        else
            print("No governance data found in API response")
            return {
                success = false,
                error = "No governance data found in API response",
                governance_id = governance_id
            }
        end
    else
        local error_msg = "API request failed"
        if response then
            error_msg = error_msg .. " (Status: " .. response.status .. ")"
        end
        
        print(error_msg)
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

-- Utility function to get scraping status
function mod.get_scraping_status(governance_id)
    if not governance_id then
        return { success = false, error = "Governance ID is required" }
    end

    local platform = proposals.get_governance_platform(governance_id)
    local platform_proposals = proposals.get_proposals_by_platform(governance_id)
    
    return {
        success = true,
        governance_id = governance_id,
        platform_exists = platform ~= nil,
        platform = platform,
        proposals_count = #platform_proposals,
        proposals = platform_proposals
    }
end

return mod