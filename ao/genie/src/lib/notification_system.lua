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
            title = "📋 {title}",
            description = "📝 {description}",
            color = "0x00ff00",
            url = "{url}",
            fields = {
                { name = "⏰ Deadline", value = "{deadline}", inline = true},
                { name = "👤 Proposer", value = "{proposer}", inline = true},
                { name = "🏛️ Platform", value = "{platform}", inline = true}
            }
        }
    },
    telegram = {
        message = "📋 *{title}*\n\n📝 {summary}\n\n⏰ Deadline: {deadline}\n👤 Proposer: {proposer}\n🏛️ Platform: {platform}\n🔗 [View Proposal]({url})"
    }
}

local function format_discord_message(proposal, summary)
    local message = notifications.discord
    local embed = message.embed

    local formatted_embed = {
        title = embed.title:gsub("{title}", (proposal.title or "Unknown"):gsub("%%", "%%%%")),
        description = embed.description:gsub("{description}", (summary or "No summary available"):gsub("%%", "%%%%")),
        color = embed.color,
        fields = {},
        url = embed.url:gsub("{url}", (proposal.url or ""):gsub("%%", "%%%%"))
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
        :gsub("{title}", (proposal.title or "Unknown"):gsub("%%", "%%%%"))
        :gsub("{summary}", (summary or "No summary available"):gsub("%%", "%%%%"))
        :gsub("{deadline}", proposal.deadline and os.date("%B %d, %Y", proposal.deadline) or "No deadline")
        :gsub("{proposer}", (proposal.proposer or "Unknown"):gsub("%%", "%%%%"))
        :gsub("{platform}", (proposal.platform or "Unknown"):gsub("%%", "%%%%"))
        :gsub("{url}", (proposal.url or ""):gsub("%%", "%%%%"))
    
    return formatted_text
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

function mod.remove_subscriber(type, identifier)
    if not type or not identifier then
        return false
    end
    
    for i = #subscribers, 1, -1 do
        local subscriber = subscribers[i]
        if subscriber.type == type then
            if type == "discord" and subscriber.webhook_url == identifier then
                table.remove(subscribers, i)
                print("Discord subscriber removed: " .. identifier)
                return true
            elseif type == "telegram" and subscriber.bot_token == identifier then
                table.remove(subscribers, i)
                print("Telegram subscriber removed: " .. identifier)
                return true
            end
        end
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
    return {
        success = success_count > 0,
        success_count = success_count,
        failure_count = total_attempts - success_count,
        total_attempts = total_attempts
    }
end

-- Export the formatting and sending functions
mod.format_discord_message = format_discord_message
mod.format_telegram_message = format_telegram_message
mod.send_discord_notification = send_discord_notification
mod.send_telegram_notification = send_telegram_notification

return mod
