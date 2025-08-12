

local mod = {}

-- Enhanced data structures for governance platforms
GovernancePlatforms = GovernancePlatforms or {}
Proposals = Proposals or {}
Organizations = Organizations or {}
Tokens = Tokens or {}
Contracts = Contracts or {}
GovernorParameters = GovernorParameters or {}
GovernorMetadata = GovernorMetadata or {}

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
function mod.add(proposals)
    if not proposals or not proposals.id then
        print("Proposal data and ID are required")
        return false
    end

    -- check if the creator has the token to create a proposal
    if Balance[proposals.From] == nil or tonumber(Balance[proposals.From]) < 1 then
        print("Creator does not have the token to create a proposal: " .. proposals.From)
        return false
    end

    -- validate if the proposals has been added before
    if mod.exists(proposals.id) then
        print("Proposal already exists: " .. proposals.id)
        return false
    end

    -- validate if the proposal has a description and a title
    if not proposals.description or not proposals.title then
        print("Proposal must have a description and a title")
        return false
    end

    -- Use the enhanced proposal creation function
    return mod.add_proposal(proposals)
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

    -- check if the creator is updating its own proposal
    if updated_data.From ~= existing_proposal.From then
        print("Creator is not updating its own proposal: " .. updated_data.From)
        return false
    end

    -- check if the creator has the token to update a proposal
    if Balance[updated_data.From] == nil or tonumber(Balance[updated_data.From]) < 1 then
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

        -- check if the creator is deleting its own proposal
        if creator ~= existing_proposal.From then
            print("Creator is not deleting its own proposal: " .. creator)
            return false
        end

        -- check if the creator has the token to delete a proposal
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
   
    