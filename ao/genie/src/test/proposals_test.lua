---@diagnostic disable: duplicate-set-field
require("test.setup")()

_G.IsInUnitTest    = true
_G.VerboseTests    = 2

_G.printVerb       = function(level)
    level = level or 2
    return function(...)
        if _G.VerboseTests >= level then print(table.unpack({ ... })) end
    end
end

local proposals = require "lib.proposals"

-- Define initial state
_G.Proposals = {}
_G.GovernancePlatforms = {}
_G.Organizations = {}
_G.Tokens = {}
_G.Balance = {}

local resetGlobals = function()
    _G.Proposals = {}
    _G.GovernancePlatforms = {}
    _G.Organizations = {}
    _G.Tokens = {}
    _G.Balance = {}
end

describe("proposals", function()
    setup(function()
        resetGlobals()
    end)

    after_each(function()
        resetGlobals()
    end)

    describe("exists", function()
        it("should return false for non-existent proposal", function()
            local result = proposals.exists("non-existent-id")
            assert.is_false(result)
        end)

        it("should return true for existing proposal", function()
            -- Add a proposal first
            local proposal_data = {
                id = "test-proposal-1",
                title = "Test Proposal",
                description = "Test Description"
            }
            proposals.add_proposal(proposal_data)
            
            local result = proposals.exists("test-proposal-1")
            assert.is_true(result)
        end)

        it("should handle empty proposal id", function()
            local result = proposals.exists("")
            assert.is_false(result)
        end)

        it("should handle nil proposal id", function()
            local result = proposals.exists(nil)
            assert.is_false(result)
        end)
    end)

    describe("add_proposal", function()
        it("should add a new proposal successfully", function()
            local proposal_data = {
                id = "test-proposal-1",
                title = "Test Proposal",
                description = "Test Description",
                proposer = "0x1234...5678",
                status = "active"
            }
            
            local result = proposals.add_proposal(proposal_data)
            assert.is_true(result)
            
            local added_proposal = proposals.get("test-proposal-1")
            assert.is_not_nil(added_proposal)
            assert.are.equal("test-proposal-1", added_proposal.id)
            assert.are.equal("Test Proposal", added_proposal.title)
        end)

        it("should fail to add proposal without id", function()
            local proposal_data = {
                title = "Test Proposal",
                description = "Test Description"
            }
            
            local result = proposals.add_proposal(proposal_data)
            assert.is_false(result)
        end)

        it("should fail to add duplicate proposal", function()
            local proposal_data = {
                id = "test-proposal-1",
                title = "Test Proposal",
                description = "Test Description"
            }
            
            -- Add first time
            local result1 = proposals.add_proposal(proposal_data)
            assert.is_true(result1)
            
            -- Try to add again
            local result2 = proposals.add_proposal(proposal_data)
            assert.is_false(result2)
        end)
    end)

    describe("get", function()
        it("should return nil for non-existent proposal", function()
            local result = proposals.get("non-existent-id")
            assert.is_nil(result)
        end)

        it("should return proposal for existing id", function()
            local proposal_data = {
                id = "test-proposal-1",
                title = "Test Proposal",
                description = "Test Description"
            }
            proposals.add_proposal(proposal_data)
            
            local result = proposals.get("test-proposal-1")
            assert.is_not_nil(result)
            assert.are.equal("test-proposal-1", result.id)
        end)
    end)

    describe("update", function()
        it("should update existing proposal", function()
            local proposal_data = {
                id = "test-proposal-1",
                title = "Original Title",
                description = "Original Description",
                From = "0x1234...5678"
            }
            proposals.add_proposal(proposal_data)
            
            -- Set balance for creator
            _G.Balance["0x1234...5678"] = 10
            
            local update_data = {
                title = "Updated Title",
                description = "Updated Description",
                From = "0x1234...5678"
            }
            
            local result = proposals.update("test-proposal-1", update_data)
            assert.is_true(result)
            
            local updated_proposal = proposals.get("test-proposal-1")
            assert.are.equal("Updated Title", updated_proposal.title)
            assert.are.equal("Updated Description", updated_proposal.description)
        end)

        it("should fail to update non-existent proposal", function()
            local update_data = {
                title = "Updated Title",
                From = "0x1234...5678"
            }
            
            local result = proposals.update("non-existent-id", update_data)
            assert.is_false(result)
        end)
    end)

    describe("delete", function()
        it("should delete existing proposal", function()
            local proposal_data = {
                id = "test-proposal-1",
                title = "Test Proposal",
                description = "Test Description",
                From = "0x1234...5678"
            }
            proposals.add_proposal(proposal_data)
            
            -- Set balance for creator
            _G.Balance["0x1234...5678"] = 10
            
            local result = proposals.delete("test-proposal-1", "0x1234...5678")
            assert.is_true(result)
            
            local deleted_proposal = proposals.get("test-proposal-1")
            assert.is_nil(deleted_proposal)
        end)

        it("should fail to delete non-existent proposal", function()
            local result = proposals.delete("non-existent-id", "0x1234...5678")
            assert.is_false(result)
        end)
    end)

    describe("search", function()
        it("should find proposals by title", function()
            local proposal1 = {
                id = "test-proposal-1",
                title = "Feature Proposal",
                description = "Add new feature"
            }
            local proposal2 = {
                id = "test-proposal-2",
                title = "Bug Fix",
                description = "Fix critical bug"
            }
            
            proposals.add_proposal(proposal1)
            proposals.add_proposal(proposal2)
            
            local results = proposals.search("Feature")
            assert.are.equal(1, #results)
            assert.are.equal("test-proposal-1", results[1].id)
        end)

        it("should find proposals by description", function()
            local proposal1 = {
                id = "test-proposal-1",
                title = "Proposal 1",
                description = "Add new feature"
            }
            local proposal2 = {
                id = "test-proposal-2",
                title = "Proposal 2",
                description = "Fix critical bug"
            }
            
            proposals.add_proposal(proposal1)
            proposals.add_proposal(proposal2)
            
            local results = proposals.search("bug")
            assert.are.equal(1, #results)
            assert.are.equal("test-proposal-2", results[1].id)
        end)

        it("should return all proposals for empty query", function()
            local proposal1 = {
                id = "test-proposal-1",
                title = "Proposal 1",
                description = "Description 1"
            }
            local proposal2 = {
                id = "test-proposal-2",
                title = "Proposal 2",
                description = "Description 2"
            }
            
            proposals.add_proposal(proposal1)
            proposals.add_proposal(proposal2)
            
            local results = proposals.search("")
            assert.are.equal(2, #results)
        end)
    end)

    describe("sort", function()
        it("should sort proposals by title ascending", function()
            local proposal1 = {
                id = "test-proposal-1",
                title = "Zebra Proposal",
                description = "Description 1"
            }
            local proposal2 = {
                id = "test-proposal-2",
                title = "Alpha Proposal",
                description = "Description 2"
            }
            
            proposals.add_proposal(proposal1)
            proposals.add_proposal(proposal2)
            
            local results = proposals.sort("title", "asc")
            assert.are.equal(2, #results)
            assert.are.equal("Alpha Proposal", results[1].title)
            assert.are.equal("Zebra Proposal", results[2].title)
        end)

        it("should sort proposals by title descending", function()
            local proposal1 = {
                id = "test-proposal-1",
                title = "Alpha Proposal",
                description = "Description 1"
            }
            local proposal2 = {
                id = "test-proposal-2",
                title = "Zebra Proposal",
                description = "Description 2"
            }
            
            proposals.add_proposal(proposal1)
            proposals.add_proposal(proposal2)
            
            local results = proposals.sort("title", "desc")
            assert.are.equal(2, #results)
            assert.are.equal("Zebra Proposal", results[1].title)
            assert.are.equal("Alpha Proposal", results[2].title)
        end)
    end)

    describe("get_all_by_creator", function()
        it("should return proposals by creator", function()
            local proposal1 = {
                id = "test-proposal-1",
                title = "Proposal 1",
                description = "Description 1",
                From = "0x1234...5678"
            }
            local proposal2 = {
                id = "test-proposal-2",
                title = "Proposal 2",
                description = "Description 2",
                From = "0x1234...5678"
            }
            local proposal3 = {
                id = "test-proposal-3",
                title = "Proposal 3",
                description = "Description 3",
                From = "0x9999...9999"
            }
            
            proposals.add_proposal(proposal1)
            proposals.add_proposal(proposal2)
            proposals.add_proposal(proposal3)
            
            local results = proposals.get_all_by_creator("0x1234...5678")
            assert.are.equal(2, #results)
        end)
    end)

    describe("get_all_by_status", function()
        it("should return proposals by status", function()
            local proposal1 = {
                id = "test-proposal-1",
                title = "Proposal 1",
                description = "Description 1",
                status = "active"
            }
            local proposal2 = {
                id = "test-proposal-2",
                title = "Proposal 2",
                description = "Description 2",
                status = "active"
            }
            local proposal3 = {
                id = "test-proposal-3",
                title = "Proposal 3",
                description = "Description 3",
                status = "passed"
            }
            
            proposals.add_proposal(proposal1)
            proposals.add_proposal(proposal2)
            proposals.add_proposal(proposal3)
            
            local results = proposals.get_all_by_status("active")
            assert.are.equal(2, #results)
        end)
    end)

    describe("mark_as_expired", function()
        it("should mark proposal as expired", function()
            local proposal_data = {
                id = "test-proposal-1",
                title = "Test Proposal",
                description = "Test Description",
                status = "active"
            }
            proposals.add_proposal(proposal_data)
            
            local result = proposals.mark_as_expired("test-proposal-1")
            assert.is_true(result)
            
            local expired_proposal = proposals.get("test-proposal-1")
            assert.are.equal("expired", expired_proposal.status)
        end)

        it("should fail to mark non-existent proposal as expired", function()
            local result = proposals.mark_as_expired("non-existent-id")
            assert.is_false(result)
        end)
    end)

    describe("execute_proposal", function()
        it("should execute passed proposal", function()
            local proposal_data = {
                id = "test-proposal-1",
                title = "Test Proposal",
                description = "Test Description",
                status = "passed"
            }
            proposals.add_proposal(proposal_data)
            
            local result = proposals.execute_proposal("test-proposal-1")
            assert.is_true(result)
            
            local executed_proposal = proposals.get("test-proposal-1")
            assert.are.equal("executed", executed_proposal.status)
            assert.is_not_nil(executed_proposal.executed_at)
        end)

        it("should fail to execute non-passed proposal", function()
            local proposal_data = {
                id = "test-proposal-1",
                title = "Test Proposal",
                description = "Test Description",
                status = "active"
            }
            proposals.add_proposal(proposal_data)
            
            local result = proposals.execute_proposal("test-proposal-1")
            assert.is_false(result)
        end)
    end)

    describe("cancel_proposal", function()
        it("should cancel active proposal", function()
            local proposal_data = {
                id = "test-proposal-1",
                title = "Test Proposal",
                description = "Test Description",
                status = "active"
            }
            proposals.add_proposal(proposal_data)
            
            local result = proposals.cancel_proposal("test-proposal-1")
            assert.is_true(result)
            
            local canceled_proposal = proposals.get("test-proposal-1")
            assert.are.equal("canceled", canceled_proposal.status)
            assert.is_not_nil(canceled_proposal.canceled_at)
        end)

        it("should fail to cancel executed proposal", function()
            local proposal_data = {
                id = "test-proposal-1",
                title = "Test Proposal",
                description = "Test Description",
                status = "executed"
            }
            proposals.add_proposal(proposal_data)
            
            local result = proposals.cancel_proposal("test-proposal-1")
            assert.is_false(result)
        end)
    end)

    describe("update_proposal_votes", function()
        it("should update proposal votes", function()
            local proposal_data = {
                id = "test-proposal-1",
                title = "Test Proposal",
                description = "Test Description",
                for_votes = 100,
                against_votes = 50
            }
            proposals.add_proposal(proposal_data)
            
            local votes_data = {
                for_votes = 150,
                against_votes = 75,
                quorum = 1000
            }
            
            local result = proposals.update_proposal_votes("test-proposal-1", votes_data)
            assert.is_true(result)
            
            local updated_proposal = proposals.get("test-proposal-1")
            assert.are.equal(150, updated_proposal.for_votes)
            assert.are.equal(75, updated_proposal.against_votes)
            assert.are.equal(1000, updated_proposal.quorum)
            assert.are.equal(225, updated_proposal.total_votes)
        end)
    end)

    describe("governance platform management", function()
        it("should add governance platform", function()
            local platform_data = {
                id = "test-platform-1",
                name = "Test Platform",
                chainId = "eip155:1",
                type = "governoralpha"
            }
            
            local result = proposals.add_governance_platform(platform_data)
            assert.is_true(result)
            
            local platform = proposals.get_governance_platform("test-platform-1")
            assert.is_not_nil(platform)
            assert.are.equal("Test Platform", platform.name)
        end)

        it("should get all governance platforms", function()
            local platform1 = {
                id = "test-platform-1",
                name = "Platform 1"
            }
            local platform2 = {
                id = "test-platform-2",
                name = "Platform 2"
            }
            
            proposals.add_governance_platform(platform1)
            proposals.add_governance_platform(platform2)
            
            local platforms = proposals.get_all_governance_platforms()
            assert.are.equal(2, #platforms)
        end)
    end)

    describe("organization management", function()
        it("should add organization", function()
            local org_data = {
                id = "test-org-1",
                name = "Test Organization",
                description = "Test Description"
            }
            
            local result = proposals.add_organization(org_data)
            assert.is_true(result)
            
            local org = proposals.get_organization("test-org-1")
            assert.is_not_nil(org)
            assert.are.equal("Test Organization", org.name)
        end)
    end)

    describe("token management", function()
        it("should add token", function()
            local token_data = {
                id = "test-token-1",
                name = "Test Token",
                symbol = "TEST",
                decimals = 18
            }
            
            local result = proposals.add_token(token_data)
            assert.is_true(result)
            
            local token = proposals.get_token("test-token-1")
            assert.is_not_nil(token)
            assert.are.equal("Test Token", token.name)
            assert.are.equal("TEST", token.symbol)
        end)
    end)
end)
