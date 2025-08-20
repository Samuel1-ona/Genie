import { useEffect } from 'react';
import useGenieGovernance from '../hooks/useGenieGovernance';

/**
 * Example component showing how to use the useGenieGovernance hook programmatically
 * This demonstrates the contract integration without UI components
 */
export default function GovernanceUsage() {
    const {
        // Queries
        systemInfo,
        proposals,
        platforms,
        subscribers,
        
        // Mutations
        scrapeGovernance,
        addProposal,
        searchProposals,
        addSubscriber,
        broadcastNotification,
        executeProposal,
        getBalance,
        setBalance,
    } = useGenieGovernance();

    // Example: Automatically scrape governance data on component mount
    useEffect(() => {
        const initializeGovernance = async () => {
            try {
                // Example governance ID (Uniswap)
                const governanceId = "eip155:1:0x7e90e03654732abedf89Faf87f05BcD03ACEeFdc";
                
                console.log("Starting governance scraping...");
                const result = await scrapeGovernance.mutateAsync(governanceId);
                console.log("Scraping result:", result);
                
                if (result.Success) {
                    console.log("Governance data scraped successfully!");
                }
            } catch (error) {
                console.error("Failed to scrape governance data:", error);
            }
        };

        initializeGovernance();
    }, [scrapeGovernance]);

    // Example: Add a proposal programmatically
    const handleAddExampleProposal = async () => {
        try {
            const proposalData = {
                id: "proposal-" + Date.now(),
                title: "Example Proposal",
                description: "This is an example proposal created programmatically",
                content: "Detailed content of the proposal...",
                platform: "uniswap",
                governance_platform_id: "eip155:1:0x7e90e03654732abedf89Faf87f05BcD03ACEeFdc",
                status: "active",
                type: "proposal",
                url: "https://example.com/proposal",
                category: "governance"
            };

            const result = await addProposal.mutateAsync(proposalData);
            console.log("Proposal added:", result);
        } catch (error) {
            console.error("Failed to add proposal:", error);
        }
    };

    // Example: Search proposals programmatically
    const handleSearchExample = async () => {
        try {
            const results = await searchProposals.mutateAsync("governance");
            console.log("Search results:", results);
        } catch (error) {
            console.error("Failed to search proposals:", error);
        }
    };

    // Example: Add a Discord subscriber programmatically
    const handleAddDiscordSubscriber = async () => {
        try {
            const subscriberData = {
                type: "discord",
                identifier: "governance-alerts",
                webhook_url: "https://discord.com/api/webhooks/your-webhook-url"
            };

            const result = await addSubscriber.mutateAsync(subscriberData);
            console.log("Discord subscriber added:", result);
        } catch (error) {
            console.error("Failed to add Discord subscriber:", error);
        }
    };

    // Example: Broadcast notification programmatically
    const handleBroadcastExample = async () => {
        try {
            if (proposals && proposals.length > 0) {
                const proposal = proposals[0];
                const summary = "New governance proposal has been created!";
                
                const result = await broadcastNotification.mutateAsync({
                    proposal,
                    summary
                });
                console.log("Notification broadcasted:", result);
            }
        } catch (error) {
            console.error("Failed to broadcast notification:", error);
        }
    };

    // Example: Execute a proposal programmatically
    const handleExecuteExample = async () => {
        try {
            if (proposals && proposals.length > 0) {
                const proposalId = proposals[0].id;
                const result = await executeProposal.mutateAsync(proposalId);
                console.log("Proposal executed:", result);
            }
        } catch (error) {
            console.error("Failed to execute proposal:", error);
        }
    };

    // Example: Manage user balance programmatically
    const handleBalanceExample = async () => {
        try {
            const userId = "user-" + Date.now();
            const amount = 1000;

            // Set balance
            const setResult = await setBalance.mutateAsync({ userId, amount });
            console.log("Balance set:", setResult);

            // Get balance
            const getResult = await getBalance.mutateAsync(userId);
            console.log("Balance retrieved:", getResult);
        } catch (error) {
            console.error("Failed to manage balance:", error);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Governance Hook Usage Examples</h2>
            <p>This component demonstrates programmatic usage of the governance hook.</p>
            
            <div style={{ marginBottom: '20px' }}>
                <h3>System Information</h3>
                {systemInfo && (
                    <pre>{JSON.stringify(systemInfo, null, 2)}</pre>
                )}
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h3>Available Data</h3>
                <p>Proposals: {proposals?.length || 0}</p>
                <p>Platforms: {platforms?.length || 0}</p>
                <p>Subscribers: {subscribers?.length || 0}</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h3>Programmatic Actions</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    <button onClick={handleAddExampleProposal} disabled={addProposal.isPending}>
                        {addProposal.isPending ? 'Adding...' : 'Add Example Proposal'}
                    </button>
                    <button onClick={handleSearchExample} disabled={searchProposals.isPending}>
                        {searchProposals.isPending ? 'Searching...' : 'Search Proposals'}
                    </button>
                    <button onClick={handleAddDiscordSubscriber} disabled={addSubscriber.isPending}>
                        {addSubscriber.isPending ? 'Adding...' : 'Add Discord Subscriber'}
                    </button>
                    <button onClick={handleBroadcastExample} disabled={broadcastNotification.isPending}>
                        {broadcastNotification.isPending ? 'Broadcasting...' : 'Broadcast Notification'}
                    </button>
                    <button onClick={handleExecuteExample} disabled={executeProposal.isPending}>
                        {executeProposal.isPending ? 'Executing...' : 'Execute Proposal'}
                    </button>
                    <button onClick={handleBalanceExample} disabled={setBalance.isPending || getBalance.isPending}>
                        {setBalance.isPending || getBalance.isPending ? 'Processing...' : 'Manage Balance'}
                    </button>
                </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h3>Hook Usage Pattern</h3>
                <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
{`// 1. Import the hook
import useGenieGovernance from '../hooks/useGenieGovernance';

// 2. Use in component
const {
    proposals,
    addProposal,
    searchProposals,
    // ... other functions
} = useGenieGovernance();

// 3. Call functions programmatically
const handleAddProposal = async () => {
    const result = await addProposal.mutateAsync({
        id: "proposal-123",
        title: "My Proposal",
        // ... other fields
    });
    console.log(result);
};`}
                </pre>
            </div>
        </div>
    );
}
