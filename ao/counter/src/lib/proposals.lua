

local mod = {}


Proposals = Proposals or {}

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


-- Add new proposals to the lists of proposals , that is by creating new proposals 

function mod.add(proposals)

    local add_proposal = proposals

    -- check if the creator has a the token to create a proposal
    if Balance[proposals.From] == nil or tonumber(Balance[proposals.From]) < 1 then
        print("Creator does not have the token to create a proposal: " .. proposals.From)
        return false
    end

    -- check if the proposal is valid
    if not proposals or proposals.id == nil then
        print("Proposal is not a valid proposal")
        return false
    end

    -- validate if the proposals has been added before
    if mod.exists(proposals.id) then
        return false
    end

    -- validate if it is the right type of proposals 

    if not proposals or not proposals.id then 
        print("Proposals is not a valid proposal")
        return false
    end

    -- store the time  and  update the status 

    add_proposal.created_at = os.time()
    add_proposal.status = proposals.status or "active"

    -- validate if the proposal has a description and a title
    if not proposals.description or not proposals.title then
        print("Proposal must have a description and a title")
        return false
    end

    -- add the proposals to the list of proposals
    table.insert(Proposals, add_proposal)
    print("Proposal added successfully: " .. proposals.id)
    return true
   
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

    

    return mod
   
    