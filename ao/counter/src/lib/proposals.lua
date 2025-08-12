

local mod = {}


Proposals = Proposals or {}

-- Check for existing proposals , if the proposals exists it returns true if the proposals does not exists it returns false

function mod.exists(proposal_id)
    if not proposal_id then 
        return false
    end

    for i, Proposal in ipairs(Proposals) do 
        if Proposal.id == proposal_id then
            return true
        end
    end

    return false
end


-- Add new proposals to the lists of proposals , that is by creating new proposals 

function mod.add(proposals)

    -- check if the creator has a the token to create a proposal
    if Balance[proposals.From] == nil or tonumber(Balance[proposals.From]) < 1 then
        print("Creator does not have the token to create a proposal" .. proposals.From)
        return 
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

    if not proposals or proposal.id  then 
        print("Proposals is not a valid proposal")
        return false
    end

    -- store the time  and  update the status 

    proposals.created_at = os.time()
    proposals.status = proposals.status or "active"


    -- validate if the proposal has a description and a title
    if not proposals.description or not proposals.title then
        print("Proposal must have a description and a title")
        return false
    end



    -- add the proposals to the list of proposals
    table.insert(Proposals, proposals)
    print("Proposal added successfully" .. proposals.id)
    return true
   
end


 function mod.update(proposal_id, updated_data)
    -- check if the creator is updating its own proposal
    if updated_data.From ~= proposal_id then
        print("Creator is not updating its own proposal" .. updated_data.From)
        return false
    end

    -- check if the proposal is valid
    if not proposals or proposals.id == nil then
        print("Proposal is not a valid proposal")
        return false
    end

       -- check if the creator has a the token to create a proposal
       if Balance[proposals.From] == nil or tonumber(Balance[proposals.From]) < 1 then
        print("Creator does not have the token to create a proposal" .. proposals.From)
        return 
       end


        for i, proposal in ipairs(Proposals) do 
            if proposal.id == proposal_id then
                for key, value in pairs(updated_data) do
                    proposal[key] = value
                end
                proposal.updated_at = os.time()
                print("Proposal updated successfully" .. proposal_id)
                return true
            end
        end 

        print("Proposal not found" .. proposal_id)
        return false
    end





