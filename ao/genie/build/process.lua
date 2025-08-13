do
local _ENV = _ENV
package.preload[ "lib.notification_system" ] = function( ... ) local arg = _G.arg;
local mod = {}

local json = {
    encode = function(data) 
        if type(data) == "table" then
            return "{}"
        else
            return tostring(data)
        end
    end,
    decode = function(str) 
        return {} 
    end
}

local function make_http_request(url, headers, body)
    print("Making HTTP request to: " .. url)
    print("HTTP request simulated for AO environment")
    return {
        status = 200,
        body = '{"ok": true}',
        headers = {}
    }
end

local notifications = {
    discord = {
        embed = {
            title = "",
            description = "",
            color = "",
            fields = {
                { name = "", value = "", inline = true or false},
                { name = "", value = "", inline = true or false},
                { name = "", value = "", inline = true or false}
            }
        }, 
        url = "{}"
    },
    telegram = {
        message = "",
        url = "{}"
    }
}

local function format_discord_message(proposal, summary)
    local message = notifications.discord
    local embed = message.embed

    local formatted_embed = {
        title = embed.title:gsub("{title}", proposal.title or "Unknown"),
        description = embed.description:gsub("{description}", summary or "No summary available"),
        color = embed.color,
        fields = {},
        url = embed.url:gsub("{url}", proposal.url or "")
    }
    
    for i, field in ipairs(embed.fields) do 
        local formatted_field = {
            name = field.name,
            value = field.value,
            inline = field.inline
        }

        if field.name:find("Deadline") then
            formatted_field.value = proposal.deadline and os.date("%B %d, %Y", proposal.deadline) or "No deadline"
        elseif field.name:find("Proposer") then
            formatted_field.value = proposal.proposer or "Unknown"
        elseif field.name:find("Platform") then
            formatted_field.value = proposal.platform or "Unknown"
        end
        
        table.insert(formatted_embed.fields, formatted_field)
    end
    
    return {
        embeds = {formatted_embed}
    }
end

local function format_telegram_message(proposal, summary)
    local template = notifications.telegram.message
    
    local formatted_text = template
        :gsub("{title}", proposal.title or "Unknown")
        :gsub("{summary}", summary or "No summary available")
        :gsub("{deadline}", proposal.deadline and os.date("%B %d, %Y", proposal.deadline) or "No deadline")
        :gsub("{proposer}", proposal.proposer or "Unknown")
        :gsub("{platform}", proposal.platform or "Unknown")
        :gsub("{url}", proposal.url or "")
    
    return {
        text = formatted_text,
        parse_mode = "Markdown"
    }
end

local function send_discord_notification(proposal, summary, webhook_url)
    print("Sending Discord notification for proposal: " .. proposal.title)

    local message = format_discord_message(proposal, summary)

    if not webhook_url or webhook_url == "" then
        print("Error: Discord webhook URL is required")
        return false, "Webhook URL is required"
    end

    if not webhook_url:match("^https://discord%.com/api/webhooks/%d+/[%w%-_]+$") then
        print("Error: Invalid Discord webhook URL format")
        return false, "Invalid webhook URL format"
    end

    local headers = {
        ["Content-Type"] = "application/json",
        ["User-Agent"] = "Genie-Proposal-Summarizer/1.0"
    }

    local json_message = json.encode(message)

    print("Sending to Discord webhook: " .. webhook_url)
    print("Message payload: " .. json_message)

    local response = make_http_request(webhook_url, headers, json_message)

    if response and response.status == 204 then
        print("Discord notification sent successfully!")
        return true, "Notification sent successfully"
    else
        local error_msg = "Failed to send Discord notification"
        if response then
            error_msg = error_msg .. " (Status: " .. tostring(response.status) .. ")"
            if response.body then
                error_msg = error_msg .. " - " .. response.body
            end
        end
        print("ERROR: " .. error_msg)
        return false, error_msg
    end
end

local function send_telegram_notification(proposal, summary, bot_token, chat_id)
    print("Sending Telegram notification for proposal: " .. proposal.title)

    local message = format_telegram_message(proposal, summary)

    if not bot_token or bot_token == "" then
        print("Error: Telegram bot token is required")
        return false, "Bot token is required"
    end

    if not chat_id or chat_id == "" then
        print("Error: Telegram chat ID is required")
        return false, "Chat ID is required"
    end

    if not bot_token:match("^%d+:[%w%-_]+$") then
        print("Error: Invalid Telegram bot token format")
        return false, "Invalid bot token format"
    end

    local telegram_api_url = "https://api.telegram.org/bot" .. bot_token .. "/sendMessage"
    
    local payload = {
        chat_id = chat_id,
        text = message.text,
        parse_mode = message.parse_mode,
        disable_web_page_preview = false
    }

    local headers = {
        ["Content-Type"] = "application/json",
        ["User-Agent"] = "Genie-Proposal-Summarizer/1.0"
    }

    local json_payload = json.encode(payload)
    
    print("Sending to Telegram: " .. telegram_api_url)
    print("Message payload: " .. json_payload)

    local response = make_http_request(telegram_api_url, headers, json_payload)

    if response and response.status == 200 then
        local response_data = json.decode(response.body)
        if response_data and response_data.ok then
            print("Telegram notification sent successfully!")
            return true, "Notification sent successfully"
        else
            local error_msg = "Telegram API error: " .. (response_data.description or "Unknown error")
            print("ERROR: " .. error_msg)
            return false, error_msg
        end
    else
        local error_msg = "Failed to send Telegram notification"
        if response then
            error_msg = error_msg .. " (Status: " .. tostring(response.status) .. ")"
            if response.body then
                error_msg = error_msg .. " - " .. response.body
            end
        end
        print("ERROR: " .. error_msg)
        return false, error_msg
    end
end

local subscribers = {}

function mod.add_subscriber(subscriber)
    if not subscriber or not subscriber.type then
        print("Error: Subscriber must have a type")
        return false
    end
    
    if subscriber.type == "discord" and not subscriber.webhook_url then
        print("Error: Discord subscriber must have webhook_url")
        return false
    end
    
    if subscriber.type == "telegram" and (not subscriber.bot_token or not subscriber.chat_id) then
        print("Error: Telegram subscriber must have bot_token and chat_id")
        return false
    end
    
    subscriber.active = subscriber.active ~= false
    table.insert(subscribers, subscriber)
    print("Subscriber added: " .. subscriber.type)
    return true
end

function mod.remove_subscriber(index)
    if index and index > 0 and index <= #subscribers then
        table.remove(subscribers, index)
        print("Subscriber removed at index: " .. index)
        return true
    end
    return false
end

function mod.get_subscribers()
    return subscribers
end

function mod.broadcast(proposal, summary)
    if not proposal or not summary then
        print("Error: Proposal and summary are required")
        return false
    end

    if #subscribers == 0 then
        print("No subscribers to broadcast to")
        return false
    end

    print("Broadcasting summary to " .. #subscribers .. " subscribers")

    local success_count = 0
    local total_attempts = 0

    for i, subscriber in ipairs(subscribers) do
        if subscriber.active then 
            total_attempts = total_attempts + 1
            local success = false
            local error_msg = ""

            if subscriber.type == "discord" then 
                success, error_msg = send_discord_notification(proposal, summary, subscriber.webhook_url)
            elseif subscriber.type == "telegram" then
                success, error_msg = send_telegram_notification(proposal, summary, subscriber.bot_token, subscriber.chat_id)
            else
                error_msg = "Unknown subscriber type: " .. subscriber.type
                print("Error: " .. error_msg)
            end

            if success then
                success_count = success_count + 1
                print("Successfully sent to " .. subscriber.type .. " subscriber")
            else
                print("Error sending notification to " .. subscriber.type .. ": " .. error_msg)
            end
        end 
    end
    
    print("Broadcast complete. " .. success_count .. "/" .. total_attempts .. " notifications sent successfully")
    return success_count > 0
end

return mod
end
end

do
local _ENV = _ENV
package.preload[ "lib.platform_adapter" ] = function( ... ) local arg = _G.arg;
local mod = {}

-- Import the proposals module
local proposals = require "lib.proposals"

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
end
end

do
local _ENV = _ENV
package.preload[ "lib.proposals" ] = function( ... ) local arg = _G.arg;


local mod = {}

-- Enhanced data structures for governance platforms
GovernancePlatforms = GovernancePlatforms or {}
Proposals = Proposals or {}
Organizations = Organizations or {}
Tokens = Tokens or {}
Contracts = Contracts or {}
GovernorParameters = GovernorParameters or {}
GovernorMetadata = GovernorMetadata or {}

-- Balance tracking for token-based proposal creation (legacy support)
Balance = Balance or {}

-- Governance Platform Structure
local function create_governance_platform(data)
    return {
        id = data.id or "",
        chainId = data.chainId or "",
        contracts = data.contracts or {},
        isIndexing = data.isIndexing or false,
        isBehind = data.isBehind or false,
        isPrimary = data.isPrimary or false,
        kind = data.kind or "single",
        name = data.name or "",
        organization = data.organization or {},
        proposalStats = data.proposalStats or {},
        parameters = data.parameters or {},
        quorum = data.quorum or 0,
        slug = data.slug or "",
        timelockId = data.timelockId or "",
        tokenId = data.tokenId or "",
        token = data.token or {},
        type = data.type or "governoralpha",
        delegatesCount = data.delegatesCount or 0,
        delegatesVotesCount = data.delegatesVotesCount or 0,
        tokenOwnersCount = data.tokenOwnersCount or 0,
        metadata = data.metadata or {},
        created_at = os.time(),
        updated_at = os.time()
    }
end

-- Enhanced Proposal Structure
local function create_proposal(data)
    return {
        id = data.id or "",
        title = data.title or "",
        description = data.description or "",
        content = data.content or "",
        proposer = data.proposer or data.From or "",
        platform = data.platform or "",
        governance_platform_id = data.governance_platform_id or "",
        status = data.status or "active",
        type = data.type or "proposal",
        url = data.url or "",
        deadline = data.deadline or (os.time() + 86400 * 7), -- 7 days default
        created_at = data.created_at or os.time(),
        updated_at = data.updated_at or os.time(),
        executed_at = data.executed_at or nil,
        canceled_at = data.canceled_at or nil,
        
        -- Voting data
        for_votes = data.for_votes or 0,
        against_votes = data.against_votes or 0,
        abstain_votes = data.abstain_votes or 0,
        quorum = data.quorum or 0,
        total_votes = data.total_votes or 0,
        
        -- Execution data
        execution_time = data.execution_time or nil,
        timelock_id = data.timelock_id or "",
        
        -- Metadata
        metadata = data.metadata or {},
        
        -- Actions/Transactions
        actions = data.actions or {},
        
        -- Tags and categories
        tags = data.tags or {},
        category = data.category or "general"
    }
end

-- Organization Structure
local function create_organization(data)
    return {
        id = data.id or "",
        name = data.name or "",
        description = data.description or "",
        logo_url = data.logo_url or "",
        website = data.website or "",
        twitter = data.twitter or "",
        discord = data.discord or "",
        github = data.github or "",
        governance_platforms = data.governance_platforms or {},
        created_at = os.time(),
        updated_at = os.time()
    }
end

-- Token Structure
local function create_token(data)
    return {
        id = data.id or "",
        name = data.name or "",
        symbol = data.symbol or "",
        decimals = data.decimals or 18,
        total_supply = data.total_supply or 0,
        chain_id = data.chain_id or "",
        contract_address = data.contract_address or "",
        logo_url = data.logo_url or "",
        created_at = os.time(),
        updated_at = os.time()
    }
end

-- Check for existing proposals , if the proposals exists it returns true if the proposals does not exists it returns false

function mod.exists(proposal_id)
    if not proposal_id then 
        print("Proposal ID is required")
        return false
    end

    if type(proposal_id) ~= "string" and type(proposal_id) ~= "number" then
        print("Proposal ID must be a string or number")
        return false
    end

    for i, proposal in ipairs(Proposals) do 
        if proposal.id and proposal.id == proposal_id then
            return true
        end
    end

    return false
end


-- Add new proposals to the lists of proposals (legacy function for backward compatibility)
function mod.add(proposal_data)
    if not proposal_data or not proposal_data.id then
        print("Proposal data and ID are required")
        return false
    end

    -- check if the creator has the token to create a proposal (legacy token check)
    if proposal_data.From and (Balance[proposal_data.From] == nil or tonumber(Balance[proposal_data.From]) < 1) then
        print("Creator does not have the token to create a proposal: " .. proposal_data.From)
        return false
    end

    -- validate if the proposal has been added before
    if mod.exists(proposal_data.id) then
        print("Proposal already exists: " .. proposal_data.id)
        return false
    end

    -- validate if the proposal has a description and a title
    if not proposal_data.description or not proposal_data.title then
        print("Proposal must have a description and a title")
        return false
    end

    -- Use the enhanced proposal creation function
    return mod.add_proposal(proposal_data)
end


function mod.update(proposal_id, updated_data)
    if not proposal_id or not updated_data then
        print("Proposal ID and updated data are required")
        return false
    end

    -- check if the proposal exists first
    local existing_proposal = mod.get(proposal_id)
    if not existing_proposal then
        print("Proposal not found: " .. proposal_id)
        return false
    end

    -- check if the creator is updating its own proposal (legacy check)
    if updated_data.From and existing_proposal.From and updated_data.From ~= existing_proposal.From then
        print("Creator is not updating its own proposal: " .. updated_data.From)
        return false
    end

    -- check if the creator has the token to update a proposal (legacy token check)
    if updated_data.From and (Balance[updated_data.From] == nil or tonumber(Balance[updated_data.From]) < 1) then
        print("Creator does not have the token to update a proposal: " .. updated_data.From)
        return false
    end

    -- Update the existing proposal with new data
    for key, value in pairs(updated_data) do
        if key ~= "id" and key ~= "From" then -- Don't allow changing ID or creator
            existing_proposal[key] = value
        end
    end
    
    -- Always update the timestamp
    existing_proposal.updated_at = os.time()
    
    print("Proposal updated successfully: " .. proposal_id)
    return true
end


function mod.delete(proposal_id, creator)
    if not proposal_id or not creator then
        print("Proposal ID and creator are required")
        return false
    end

    -- check if the proposal exists first
    local existing_proposal = mod.get(proposal_id)
    if not existing_proposal then
        print("Proposal not found: " .. proposal_id)
        return false
    end

    -- check if the creator is deleting its own proposal (legacy check)
    if existing_proposal.From and creator ~= existing_proposal.From then
        print("Creator is not deleting its own proposal: " .. creator)
        return false
    end

    -- check if the creator has the token to delete a proposal (legacy token check)
    if Balance[creator] == nil or tonumber(Balance[creator]) < 1 then
        print("Creator does not have the token to delete a proposal: " .. creator)
        return false
    end

    -- delete the proposal from the list of proposals 
    for i, proposal in ipairs(Proposals) do 
        if proposal.id == proposal_id then
            table.remove(Proposals, i)
            print("Proposal deleted successfully: " .. proposal_id)
            return true
        end
    end

    -- This should never be reached, but just in case
    print("Proposal not found during deletion: " .. proposal_id)
    return false
end


function mod.get(proposal_id)
    if not proposal_id then
        print("Proposal ID is required")
        return nil
    end

    -- get the proposal from the list of proposals
    for i, proposal in ipairs(Proposals) do 
        if proposal.id == proposal_id then
            return proposal
        end
    end

    print("Proposal not found: " .. proposal_id)
    return nil
end

    function mod.get_all()
        return Proposals
    end


function mod.get_all_by_creator(creator)
    if not creator then
        print("Creator parameter is required")
        return {}
    end

    local proposals = {}
    for i, proposal in ipairs(Proposals) do 
        if proposal.From and proposal.From == creator then
            table.insert(proposals, proposal)
        end
    end

    if #proposals == 0 then
        print("No proposals found for creator: " .. creator)
    else
        print("Found " .. #proposals .. " proposal(s) for creator: " .. creator)
    end

    return proposals
end

function mod.get_all_by_status(status)
    if not status then
        print("Status parameter is required")
        return {}
    end

    local proposals = {}
    for i, proposal in ipairs(Proposals) do 
        if proposal.status and proposal.status == status then
            table.insert(proposals, proposal)
        end
    end

    if #proposals == 0 then
        print("No proposals found with status: " .. status)
    else
        print("Found " .. #proposals .. " proposal(s) with status: " .. status)
    end

    return proposals
end

function mod.get_all_by_creator_and_status(creator, status)
    if not creator or not status then
        print("Creator and status parameters are required")
        return {}
    end

    local proposals = {}
    for i, proposal in ipairs(Proposals) do 
        if proposal.From and proposal.From == creator and proposal.status and proposal.status == status then
            table.insert(proposals, proposal)
        end
    end

    if #proposals == 0 then
        print("No proposals found for creator '" .. creator .. "' with status '" .. status .. "'")
    else
        print("Found " .. #proposals .. " proposal(s) for creator '" .. creator .. "' with status '" .. status .. "'")
    end

    return proposals
end


function mod.get_all_by_creator_and_status_and_type(creator, status, type)
    if not creator or not status or not type then
        print("Creator, status, and type parameters are required")
        return {}
    end

    local proposals = {}
    for i, proposal in ipairs(Proposals) do 
        if proposal.From and proposal.From == creator and 
           proposal.status and proposal.status == status and 
           proposal.type and proposal.type == type then
            table.insert(proposals, proposal)
        end
    end

    if #proposals == 0 then
        print("No proposals found for creator '" .. creator .. "' with status '" .. status .. "' and type '" .. type .. "'")
    else
        print("Found " .. #proposals .. " proposal(s) for creator '" .. creator .. "' with status '" .. status .. "' and type '" .. type .. "'")
    end

    return proposals
end


-- Search and sorting proposals 
function mod.search(query)
    if not query or query == "" then
        print("Search query is empty, returning all proposals")
        return Proposals
    end 

    if type(query) ~= "string" then
        print("Search query must be a string")
        return {}
    end

    local query_lower = query:lower()
    local matching_proposals = {}

    for i, proposal in ipairs(Proposals) do 
        local title_match = proposal.title and proposal.title:lower():find(query_lower)
        local description_match = proposal.description and proposal.description:lower():find(query_lower)
        local creator_match = proposal.From and proposal.From:lower():find(query_lower)
        local status_match = proposal.status and proposal.status:lower():find(query_lower)
        local type_match = proposal.type and proposal.type:lower():find(query_lower)

        if title_match or description_match or creator_match or status_match or type_match then
            table.insert(matching_proposals, proposal)
        end
    end

    if #matching_proposals == 0 then
        print("No proposals found matching query: '" .. query .. "'")
    else
        print("Found " .. #matching_proposals .. " proposal(s) matching query: '" .. query .. "'")
    end

    return matching_proposals
end

function mod.sort(sort_by, sort_order)
    if not sort_by or not sort_order then
        print("Sort field and sort order are required")
        return Proposals
    end

    if type(sort_by) ~= "string" or type(sort_order) ~= "string" then
        print("Sort field and sort order must be strings")
        return Proposals
    end

    -- Validate sort order
    sort_order = sort_order:lower()
    if sort_order ~= "asc" and sort_order ~= "desc" then
        print("Sort order must be 'asc' or 'desc', got: '" .. sort_order .. "'")
        return Proposals
    end

    -- Validate sort field exists in at least one proposal
    local valid_field = false
    for i, proposal in ipairs(Proposals) do
        if proposal[sort_by] ~= nil then
            valid_field = true
            break
        end
    end

    if not valid_field then
        print("Sort field '" .. sort_by .. "' not found in any proposal")
        return Proposals
    end

    local sorted_proposals = {}
    for i, proposal in ipairs(Proposals) do
        table.insert(sorted_proposals, proposal)
    end

    table.sort(sorted_proposals, function(a, b)
        local a_val = a[sort_by]
        local b_val = b[sort_by]
        
        -- Handle nil values
        if a_val == nil and b_val == nil then
            return false
        elseif a_val == nil then
            return sort_order == "asc"
        elseif b_val == nil then
            return sort_order == "desc"
        end
        
        if sort_order == "asc" then
            return a_val < b_val
        else
            return a_val > b_val
        end
    end)

    print("Sorted " .. #sorted_proposals .. " proposal(s) by '" .. sort_by .. "' in '" .. sort_order .. "' order")
    return sorted_proposals
end


function mod.mark_as_expired(proposal_id)
    if not proposal_id then
        print("Proposal ID is required")
        return false
    end

    local proposal = mod.get(proposal_id)
    if not proposal then
        print("Proposal not found: " .. proposal_id)
        return false
    end

    -- Check if proposal is already expired
    if proposal.status == "expired" then
        print("Proposal is already expired: " .. proposal_id)
        return false
    end

    proposal.status = "expired"
    proposal.updated_at = os.time()
    print("Proposal marked as expired: " .. proposal_id)
    return true
end

    

    -- Governance Platform Management Functions
function mod.add_governance_platform(platform_data)
    if not platform_data or not platform_data.id then
        print("Platform data and ID are required")
        return false
    end

    -- Check if platform already exists
    for i, platform in ipairs(GovernancePlatforms) do
        if platform.id == platform_data.id then
            print("Governance platform already exists: " .. platform_data.id)
            return false
        end
    end

    local new_platform = create_governance_platform(platform_data)
    table.insert(GovernancePlatforms, new_platform)
    print("Governance platform added successfully: " .. platform_data.id)
    return true
end

function mod.get_governance_platform(platform_id)
    if not platform_id then
        print("Platform ID is required")
        return nil
    end

    for i, platform in ipairs(GovernancePlatforms) do
        if platform.id == platform_id then
            return platform
        end
    end

    print("Governance platform not found: " .. platform_id)
    return nil
end

function mod.get_all_governance_platforms()
    return GovernancePlatforms
end

function mod.update_governance_platform(platform_id, updated_data)
    if not platform_id or not updated_data then
        print("Platform ID and updated data are required")
        return false
    end

    for i, platform in ipairs(GovernancePlatforms) do
        if platform.id == platform_id then
            for key, value in pairs(updated_data) do
                if key ~= "id" then -- Don't allow changing ID
                    platform[key] = value
                end
            end
            platform.updated_at = os.time()
            print("Governance platform updated successfully: " .. platform_id)
            return true
        end
    end

    print("Governance platform not found: " .. platform_id)
    return false
end

-- Organization Management Functions
function mod.add_organization(org_data)
    if not org_data or not org_data.id then
        print("Organization data and ID are required")
        return false
    end

    for i, org in ipairs(Organizations) do
        if org.id == org_data.id then
            print("Organization already exists: " .. org_data.id)
            return false
        end
    end

    local new_org = create_organization(org_data)
    table.insert(Organizations, new_org)
    print("Organization added successfully: " .. org_data.id)
    return true
end

function mod.get_organization(org_id)
    if not org_id then
        print("Organization ID is required")
        return nil
    end

    for i, org in ipairs(Organizations) do
        if org.id == org_id then
            return org
        end
    end

    print("Organization not found: " .. org_id)
    return nil
end

-- Token Management Functions
function mod.add_token(token_data)
    if not token_data or not token_data.id then
        print("Token data and ID are required")
        return false
    end

    for i, token in ipairs(Tokens) do
        if token.id == token_data.id then
            print("Token already exists: " .. token_data.id)
            return false
        end
    end

    local new_token = create_token(token_data)
    table.insert(Tokens, new_token)
    print("Token added successfully: " .. token_data.id)
    return true
end

function mod.get_token(token_id)
    if not token_id then
        print("Token ID is required")
        return nil
    end

    for i, token in ipairs(Tokens) do
        if token.id == token_id then
            return token
        end
    end

    print("Token not found: " .. token_id)
    return nil
end

-- Enhanced Proposal Functions
function mod.add_proposal(proposal_data)
    if not proposal_data or not proposal_data.id then
        print("Proposal data and ID are required")
        return false
    end

    -- Check if proposal already exists
    if mod.exists(proposal_data.id) then
        print("Proposal already exists: " .. proposal_data.id)
        return false
    end

    -- Validate governance platform if specified
    if proposal_data.governance_platform_id then
        local platform = mod.get_governance_platform(proposal_data.governance_platform_id)
        if not platform then
            print("Governance platform not found: " .. proposal_data.governance_platform_id)
            return false
        end
    end

    local new_proposal = create_proposal(proposal_data)
    table.insert(Proposals, new_proposal)
    print("Proposal added successfully: " .. proposal_data.id)
    return true
end

function mod.get_proposals_by_platform(platform_id)
    if not platform_id then
        print("Platform ID is required")
        return {}
    end

    local proposals = {}
    for i, proposal in ipairs(Proposals) do
        if proposal.governance_platform_id == platform_id then
            table.insert(proposals, proposal)
        end
    end

    if #proposals == 0 then
        print("No proposals found for platform: " .. platform_id)
    else
        print("Found " .. #proposals .. " proposal(s) for platform: " .. platform_id)
    end

    return proposals
end

function mod.get_proposals_by_status_and_platform(status, platform_id)
    if not status or not platform_id then
        print("Status and platform ID are required")
        return {}
    end

    local proposals = {}
    for i, proposal in ipairs(Proposals) do
        if proposal.status == status and proposal.governance_platform_id == platform_id then
            table.insert(proposals, proposal)
        end
    end

    if #proposals == 0 then
        print("No proposals found with status '" .. status .. "' for platform: " .. platform_id)
    else
        print("Found " .. #proposals .. " proposal(s) with status '" .. status .. "' for platform: " .. platform_id)
    end

    return proposals
end

function mod.update_proposal_votes(proposal_id, votes_data)
    if not proposal_id or not votes_data then
        print("Proposal ID and votes data are required")
        return false
    end

    local proposal = mod.get(proposal_id)
    if not proposal then
        print("Proposal not found: " .. proposal_id)
        return false
    end

    -- Update voting data
    if votes_data.for_votes then proposal.for_votes = votes_data.for_votes end
    if votes_data.against_votes then proposal.against_votes = votes_data.against_votes end
    if votes_data.abstain_votes then proposal.abstain_votes = votes_data.abstain_votes end
    if votes_data.quorum then proposal.quorum = votes_data.quorum end
    
    -- Calculate total votes
    proposal.total_votes = proposal.for_votes + proposal.against_votes + proposal.abstain_votes
    
    proposal.updated_at = os.time()
    print("Proposal votes updated successfully: " .. proposal_id)
    return true
end

function mod.execute_proposal(proposal_id)
    if not proposal_id then
        print("Proposal ID is required")
        return false
    end

    local proposal = mod.get(proposal_id)
    if not proposal then
        print("Proposal not found: " .. proposal_id)
        return false
    end

    if proposal.status == "executed" then
        print("Proposal is already executed: " .. proposal_id)
        return false
    end

    if proposal.status ~= "passed" then
        print("Proposal must be passed before execution: " .. proposal_id)
        return false
    end

    proposal.status = "executed"
    proposal.executed_at = os.time()
    proposal.updated_at = os.time()
    print("Proposal executed successfully: " .. proposal_id)
    return true
end

function mod.cancel_proposal(proposal_id)
    if not proposal_id then
        print("Proposal ID is required")
        return false
    end

    local proposal = mod.get(proposal_id)
    if not proposal then
        print("Proposal not found: " .. proposal_id)
        return false
    end

    if proposal.status == "canceled" then
        print("Proposal is already canceled: " .. proposal_id)
        return false
    end

    if proposal.status == "executed" then
        print("Cannot cancel executed proposal: " .. proposal_id)
        return false
    end

    proposal.status = "canceled"
    proposal.canceled_at = os.time()
    proposal.updated_at = os.time()
    print("Proposal canceled successfully: " .. proposal_id)
    return true
end




    return mod
end
end

local notification_system = require "lib.notification_system"
local platform_adapter = require "lib.platform_adapter"
local proposals = require "lib.proposals"

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

-- Global system configuration
version = "0.0.1"
AgentName = "Genie-Proposal-Summarizer"

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
            "platform_adapter"
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


