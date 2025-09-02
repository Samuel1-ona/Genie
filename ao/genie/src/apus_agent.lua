local json = require("json")

-- Backend AO Process Logic (Core Flow from section 2.5)

CurrentReference = CurrentReference or 0 -- Initialize or use existing reference counter
Tasks = Tasks or {}                      -- Your process's state where results are stored
Balances = Balances or "0"               -- Store balance information for each reference

APUS_ROUTER = "Bf6JJR2tl2Wr38O2-H6VctqtduxHgKF-NzRB9HhTRzo"

-- Handler to listen for prompts from your frontend
Handlers.add(
    "SendInfer",
    Handlers.utils.hasMatchingTag("Action", "Infer"),
    function(msg)
        local reference = msg.Tags["X-Reference"] or msg.Reference
        local requestReference = reference
        local request = {
            Target = APUS_ROUTER,
            Action = "Infer",
            ["X-Prompt"] = msg.Data,
            ["X-Reference"] = reference
        }
        if msg.Tags["X-Session"] then
            request["X-Session"] = msg.Tags["X-Session"]
        end
        if msg.Tags["X-Options"] then
            request["X-Options"] = msg.Tags["X-Options"]
        end
        Tasks[requestReference] = {
            prompt = request["X-Prompt"],
            options = request["X-Options"],
            session = request["X-Session"],
            reference = reference,
            status = "processing",
            starttime = os.time(),
        }
        Send({
            device = 'patch@1.0',
            cache = {
                tasks = Tasks
            }
        })
        ao.send(request)
        
        -- Reply immediately to the frontend with the task reference
        msg.reply({
            TaskRef = reference,
            Data = "request accepted, taskRef: " .. reference
        })
    end
)

-- New handler specifically for proposal summarization
Handlers.add(
    "SummarizeProposal",
    Handlers.utils.hasMatchingTag("Action", "SummarizeProposal"),
    function(msg)
        local reference = msg.Tags["X-Reference"] or msg.Reference
        local proposalData = json.decode(msg.Data or "{}")
        
        -- Create a specialized prompt for proposal summarization
        local summarizationPrompt = string.format([[
Please provide a comprehensive summary of the following governance proposal:

Title: %s
Description: %s
Proposer: %s
Status: %s
Deadline: %s

Please include:
1. A clear, concise summary of the proposal
2. Key points and objectives
3. Potential impact analysis
4. Any notable risks or considerations
5. A neutral, factual tone suitable for governance decisions

Format the response in a structured, easy-to-read manner.
        ]], 
        proposalData.title or "N/A",
        proposalData.description or "N/A", 
        proposalData.proposer or "N/A",
        proposalData.status or "N/A",
        proposalData.deadline or "N/A"
        )
        
        local request = {
            Target = APUS_ROUTER,
            Action = "Infer",
            ["X-Prompt"] = summarizationPrompt,
            ["X-Reference"] = reference,
            ["X-Options"] = json.encode({
                max_tokens = 1000,
                temperature = 0.3, -- Lower temperature for more focused, factual responses
                system_prompt = "You are an expert governance analyst specializing in DAO proposals and blockchain governance. Provide clear, objective analysis."
            })
        }
        
        -- Store the task with proposal context
        Tasks[reference] = {
            prompt = summarizationPrompt,
            options = request["X-Options"],
            reference = reference,
            status = "processing",
            starttime = os.time(),
            proposal_id = proposalData.id,
            proposal_title = proposalData.title,
            task_type = "proposal_summarization"
        }
        
        Send({
            device = 'patch@1.0',
            cache = {
                tasks = Tasks
            }
        })
        
        ao.send(request)
        
        -- Reply with task reference
        msg.reply({
            TaskRef = reference,
            Data = "Proposal summarization request accepted, taskRef: " .. reference,
            ProposalId = proposalData.id
        })
    end
)

-- Handler for batch proposal summarization
Handlers.add(
    "SummarizeMultipleProposals",
    Handlers.utils.hasMatchingTag("Action", "SummarizeMultipleProposals"),
    function(msg)
        local proposals = json.decode(msg.Data or "[]")
        local batchReference = msg.Tags["X-Reference"] or msg.Reference
        local batchTasks = {}
        
        for i, proposal in ipairs(proposals) do
            local individualReference = batchReference .. "_" .. i
            local summarizationPrompt = string.format([[
Please provide a concise summary of this governance proposal:

Title: %s
Description: %s
Status: %s

Focus on the key objectives and potential impact.
            ]], 
            proposal.title or "N/A",
            proposal.description or "N/A",
            proposal.status or "N/A"
            )
            
            local request = {
                Target = APUS_ROUTER,
                Action = "Infer",
                ["X-Prompt"] = summarizationPrompt,
                ["X-Reference"] = individualReference,
                ["X-Options"] = json.encode({
                    max_tokens = 500,
                    temperature = 0.3
                })
            }
            
            Tasks[individualReference] = {
                prompt = summarizationPrompt,
                reference = individualReference,
                status = "processing",
                starttime = os.time(),
                proposal_id = proposal.id,
                proposal_title = proposal.title,
                task_type = "batch_summarization",
                batch_reference = batchReference
            }
            
            batchTasks[i] = individualReference
            ao.send(request)
        end
        
        -- Store batch information
        Tasks[batchReference] = {
            status = "batch_processing",
            starttime = os.time(),
            batch_tasks = batchTasks,
            total_proposals = #proposals,
            task_type = "batch_summarization"
        }
        
        Send({
            device = 'patch@1.0',
            cache = {
                tasks = Tasks
            }
        })
        
        msg.reply({
            TaskRef = batchReference,
            Data = "Batch summarization started for " .. #proposals .. " proposals",
            BatchTasks = batchTasks
        })
    end
)

Handlers.add(
    "AcceptResponse",
    Handlers.utils.hasMatchingTag("Action", "Infer-Response"),
    function(msg)
        local reference = msg.Tags["X-Reference"] or ""
        print(msg)

        if msg.Tags["Code"] then
            -- Update task status to failed
            if Tasks[reference] then
                local error_message = msg.Tags["Message"] or "Unknown error"
                Tasks[reference].status = "failed"
                Tasks[reference].error_message = error_message
                Tasks[reference].error_code = msg.Tags["Code"]
                Tasks[reference].endtime = os.time()
            end
            Send({
                device = 'patch@1.0',
                cache = {
                    tasks = {
                        [reference] = Tasks[reference] }
                }
            })
            return
        end
        
        -- Handle the AI response
        if Tasks[reference] then
            Tasks[reference].response = msg.Data or ""
            Tasks[reference].status = "success"
            Tasks[reference].endtime = os.time()
            
            -- If this is a proposal summarization, store it in a more accessible format
            if Tasks[reference].task_type == "proposal_summarization" then
                Tasks[reference].summary = msg.Data
                Tasks[reference].proposal_summary = {
                    id = Tasks[reference].proposal_id,
                    title = Tasks[reference].proposal_title,
                    summary = msg.Data,
                    generated_at = os.time(),
                    task_reference = reference
                }
            end
        end

        Send({
            device = 'patch@1.0',
            cache = {
                tasks = {
                    [reference] = Tasks[reference] }
            }
        })
    end
)

Handlers.add(
    "GetInferResponse",
    Handlers.utils.hasMatchingTag("Action", "GetInferResponse"),
    function(msg)
        local reference = msg.Tags["X-Reference"] or ""
        print(Tasks[reference])
        if Tasks[reference] then
            msg.reply({Data = json.encode(Tasks[reference])})
        else
            msg.reply({Data = "Task not found"}) -- if task not found, return error
        end
    end
)

-- New handler to get proposal summaries
Handlers.add(
    "GetProposalSummary",
    Handlers.utils.hasMatchingTag("Action", "GetProposalSummary"),
    function(msg)
        local proposalId = msg.Tags["ProposalId"] or ""
        local summaries = {}
        
        -- Find all summaries for this proposal
        for ref, task in pairs(Tasks) do
            if task.proposal_id == proposalId and task.status == "success" then
                table.insert(summaries, {
                    reference = ref,
                    summary = task.summary,
                    generated_at = task.generated_at,
                    title = task.proposal_title
                })
            end
        end
        
        if #summaries > 0 then
            msg.reply({
                Data = json.encode({
                    proposal_id = proposalId,
                    summaries = summaries,
                    count = #summaries
                })
            })
        else
            msg.reply({
                Data = json.encode({
                    proposal_id = proposalId,
                    summaries = {},
                    count = 0,
                    message = "No summaries found for this proposal"
                })
            })
        end
    end
)

-- Handler to get all proposal summaries
Handlers.add(
    "GetAllProposalSummaries",
    Handlers.utils.hasMatchingTag("Action", "GetAllProposalSummaries"),
    function(msg)
        local allSummaries = {}
        
        for ref, task in pairs(Tasks) do
            if task.task_type == "proposal_summarization" and task.status == "success" then
                table.insert(allSummaries, {
                    reference = ref,
                    proposal_id = task.proposal_id,
                    proposal_title = task.proposal_title,
                    summary = task.summary,
                    generated_at = task.generated_at
                })
            end
        end
        
        msg.reply({
            Data = json.encode({
                summaries = allSummaries,
                count = #allSummaries
            })
        })
    end
)