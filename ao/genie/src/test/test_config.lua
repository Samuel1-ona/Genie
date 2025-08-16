-- Test configuration for Genie-Proposal-Summarizer

local config = {
    -- Test environment settings
    test_mode = true,
    verbose = true,
    
    -- Mock data for testing
    mock_proposals = {
        {
            id = "test-proposal-1",
            title = "Test Proposal 1",
            description = "This is a test proposal for unit testing",
            proposer = "0x1234...5678",
            status = "active",
            deadline = os.time() + 86400
        },
        {
            id = "test-proposal-2",
            title = "Test Proposal 2",
            description = "Another test proposal for unit testing",
            proposer = "0x9999...9999",
            status = "passed",
            deadline = os.time() + 172800
        }
    },
    
    mock_governance_platforms = {
        {
            id = "test-platform-1",
            name = "Test Platform 1",
            chainId = "eip155:1",
            type = "governoralpha"
        },
        {
            id = "test-platform-2",
            name = "Test Platform 2",
            chainId = "eip155:137",
            type = "governorbravo"
        }
    },
    
    mock_subscribers = {
        {
            type = "discord",
            webhook_url = "https://discord.com/api/webhooks/test",
            active = true
        },
        {
            type = "telegram",
            bot_token = "test-bot-token",
            chat_id = "test-chat-id",
            active = true
        }
    },
    
    -- Test API responses
    mock_api_responses = {
        tally_governance = {
            success = true,
            data = {
                id = "test-governance-1",
                name = "Test Governance",
                proposals = {}
            }
        },
        tally_proposals = {
            success = true,
            data = {
                proposals = {
                    {
                        id = "tally-proposal-1",
                        title = "Tally Test Proposal",
                        status = "ACTIVE"
                    }
                }
            }
        }
    },
    
    -- Test timeouts and limits
    timeouts = {
        http_request = 10,
        cache_ttl = 300,
        rate_limit_cooldown = 60
    },
    
    -- Test validation rules
    validation = {
        min_proposal_title_length = 1,
        max_proposal_title_length = 500,
        min_proposal_description_length = 1,
        max_proposal_description_length = 10000,
        valid_proposal_statuses = {
            "active", "pending", "passed", "failed", "executed", "canceled", "expired"
        }
    }
}

return config
