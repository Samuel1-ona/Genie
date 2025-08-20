import { useState } from 'react';
import useGenieGovernance, {
    Proposal,
    Subscriber
} from '../hooks/useGenieGovernance';

export default function GenieGovernance() {
    const [governanceId, setGovernanceId] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [proposalData, setProposalData] = useState<Partial<Proposal>>({
        id: '',
        title: '',
        description: '',
        content: '',
        platform: '',
        governance_platform_id: '',
        status: 'active',
        type: 'proposal',
        url: '',
        category: 'general'
    });
    const [subscriberData, setSubscriberData] = useState<Partial<Subscriber>>({
        type: 'discord',
        identifier: '',
        webhook_url: ''
    });
    const [notificationSummary, setNotificationSummary] = useState('');
    const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
    const [userId, setUserId] = useState('');
    const [balanceAmount, setBalanceAmount] = useState(0);

    const {
        // Queries
        systemInfo,
        systemInfoError,
        systemInfoLoading,
        proposals,
        proposalsError,
        proposalsLoading,
        platforms,
        platformsError,
        platformsLoading,
        subscribers,
        subscribersError,
        subscribersLoading,

        // Mutations
        scrapeGovernance,
        addProposal,
        searchProposals,
        addSubscriber,
        broadcastNotification,
        executeProposal,
        getScrapingStatus,
        getBalance,
        setBalance,
    } = useGenieGovernance();

    // Handle scraping governance data
    const handleScrapeGovernance = async () => {
        if (!governanceId) {
            alert('Please enter a governance ID');
            return;
        }
        try {
            const result = await scrapeGovernance.mutateAsync(governanceId);
            console.log('Scraping result:', result);
            alert(`Scraping completed: ${result.Success ? 'Success' : 'Failed'}`);
        } catch (error) {
            console.error('Scraping error:', error);
            alert('Scraping failed');
        }
    };

    // Handle adding proposal
    const handleAddProposal = async () => {
        if (!proposalData.id || !proposalData.title) {
            alert('Please provide proposal ID and title');
            return;
        }
        try {
            const result = await addProposal.mutateAsync(proposalData);
            console.log('Add proposal result:', result);
            alert(`Proposal added: ${result.Success ? 'Success' : 'Failed'}`);
            // Reset form
            setProposalData({
                id: '',
                title: '',
                description: '',
                content: '',
                platform: '',
                governance_platform_id: '',
                status: 'active',
                type: 'proposal',
                url: '',
                category: 'general'
            });
        } catch (error) {
            console.error('Add proposal error:', error);
            alert('Failed to add proposal');
        }
    };

    // Handle searching proposals
    const handleSearchProposals = async () => {
        if (!searchQuery) {
            alert('Please enter a search query');
            return;
        }
        try {
            const results = await searchProposals.mutateAsync(searchQuery);
            console.log('Search results:', results);
            alert(`Found ${results.length} proposals`);
        } catch (error) {
            console.error('Search error:', error);
            alert('Search failed');
        }
    };

    // Handle adding subscriber
    const handleAddSubscriber = async () => {
        if (!subscriberData.type || !subscriberData.identifier) {
            alert('Please provide subscriber type and identifier');
            return;
        }
        try {
            const result = await addSubscriber.mutateAsync(subscriberData);
            console.log('Add subscriber result:', result);
            alert(`Subscriber added: ${result.Success ? 'Success' : 'Failed'}`);
            // Reset form
            setSubscriberData({
                type: 'discord',
                identifier: '',
                webhook_url: ''
            });
        } catch (error) {
            console.error('Add subscriber error:', error);
            alert('Failed to add subscriber');
        }
    };

    // Handle broadcasting notification
    const handleBroadcastNotification = async () => {
        if (!selectedProposal || !notificationSummary) {
            alert('Please select a proposal and provide a summary');
            return;
        }
        try {
            const result = await broadcastNotification.mutateAsync({
                proposal: selectedProposal,
                summary: notificationSummary
            });
            console.log('Broadcast result:', result);
            alert(`Notification broadcasted: ${result.Success ? 'Success' : 'Failed'}`);
            setNotificationSummary('');
        } catch (error) {
            console.error('Broadcast error:', error);
            alert('Failed to broadcast notification');
        }
    };

    // Handle executing proposal
    const handleExecuteProposal = async (proposalId: string) => {
        try {
            const result = await executeProposal.mutateAsync(proposalId);
            console.log('Execute proposal result:', result);
            alert(`Proposal executed: ${result.Success ? 'Success' : 'Failed'}`);
        } catch (error) {
            console.error('Execute proposal error:', error);
            alert('Failed to execute proposal');
        }
    };

    // Handle getting balance
    const handleGetBalance = async () => {
        if (!userId) {
            alert('Please enter a user ID');
            return;
        }
        try {
            const result = await getBalance.mutateAsync(userId);
            console.log('Get balance result:', result);
            alert(`Balance: ${result.Balance}`);
        } catch (error) {
            console.error('Get balance error:', error);
            alert('Failed to get balance');
        }
    };

    // Handle setting balance
    const handleSetBalance = async () => {
        if (!userId) {
            alert('Please enter a user ID');
            return;
        }
        try {
            const result = await setBalance.mutateAsync({
                userId,
                amount: balanceAmount
            });
            console.log('Set balance result:', result);
            alert(`Balance set: ${result.Success ? 'Success' : 'Failed'}`);
        } catch (error) {
            console.error('Set balance error:', error);
            alert('Failed to set balance');
        }
    };

    // Handle getting scraping status
    const handleGetScrapingStatus = async () => {
        if (!governanceId) {
            alert('Please enter a governance ID');
            return;
        }
        try {
            const result = await getScrapingStatus.mutateAsync(governanceId);
            console.log('Scraping status result:', result);
            alert(`Status: ${JSON.stringify(result.Status)}`);
        } catch (error) {
            console.error('Get scraping status error:', error);
            alert('Failed to get scraping status');
        }
    };

    if (systemInfoLoading) {
        return <div>Loading system info...</div>;
    }

    if (systemInfoError) {
        return <div>Error loading system info: {systemInfoError.message}</div>;
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1>Genie Governance System</h1>
            
            {/* System Info */}
            <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
                <h2>System Information</h2>
                {systemInfo && (
                    <div>
                        <p><strong>Version:</strong> {systemInfo.Version}</p>
                        <p><strong>Agent Name:</strong> {systemInfo.AgentName}</p>
                        <p><strong>Status:</strong> {systemInfo.Status}</p>
                        <p><strong>Features:</strong> {systemInfo.Features?.join(', ')}</p>
                    </div>
                )}
            </div>

            {/* Governance Scraping */}
            <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
                <h2>Governance Scraping</h2>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <input
                        type="text"
                        placeholder="Enter Governance ID"
                        value={governanceId}
                        onChange={(e) => setGovernanceId(e.target.value)}
                        style={{ flex: 1, padding: '8px' }}
                    />
                    <button
                        onClick={handleScrapeGovernance}
                        disabled={scrapeGovernance.isPending}
                        style={{ padding: '8px 16px' }}
                    >
                        {scrapeGovernance.isPending ? 'Scraping...' : 'Scrape Data'}
                    </button>
                    <button
                        onClick={handleGetScrapingStatus}
                        disabled={getScrapingStatus.isPending}
                        style={{ padding: '8px 16px' }}
                    >
                        {getScrapingStatus.isPending ? 'Loading...' : 'Get Status'}
                    </button>
                </div>
            </div>

            {/* Add Proposal */}
            <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
                <h2>Add Proposal</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <input
                        type="text"
                        placeholder="Proposal ID"
                        value={proposalData.id}
                        onChange={(e) => setProposalData({...proposalData, id: e.target.value})}
                        style={{ padding: '8px' }}
                    />
                    <input
                        type="text"
                        placeholder="Title"
                        value={proposalData.title}
                        onChange={(e) => setProposalData({...proposalData, title: e.target.value})}
                        style={{ padding: '8px' }}
                    />
                    <input
                        type="text"
                        placeholder="Platform"
                        value={proposalData.platform}
                        onChange={(e) => setProposalData({...proposalData, platform: e.target.value})}
                        style={{ padding: '8px' }}
                    />
                    <input
                        type="text"
                        placeholder="Governance Platform ID"
                        value={proposalData.governance_platform_id}
                        onChange={(e) => setProposalData({...proposalData, governance_platform_id: e.target.value})}
                        style={{ padding: '8px' }}
                    />
                    <textarea
                        placeholder="Description"
                        value={proposalData.description}
                        onChange={(e) => setProposalData({...proposalData, description: e.target.value})}
                        style={{ padding: '8px', gridColumn: '1 / -1' }}
                        rows={3}
                    />
                    <textarea
                        placeholder="Content"
                        value={proposalData.content}
                        onChange={(e) => setProposalData({...proposalData, content: e.target.value})}
                        style={{ padding: '8px', gridColumn: '1 / -1' }}
                        rows={3}
                    />
                </div>
                <button
                    onClick={handleAddProposal}
                    disabled={addProposal.isPending}
                    style={{ padding: '8px 16px' }}
                >
                    {addProposal.isPending ? 'Adding...' : 'Add Proposal'}
                </button>
            </div>

            {/* Search Proposals */}
            <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
                <h2>Search Proposals</h2>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <input
                        type="text"
                        placeholder="Enter search query"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ flex: 1, padding: '8px' }}
                    />
                    <button
                        onClick={handleSearchProposals}
                        disabled={searchProposals.isPending}
                        style={{ padding: '8px 16px' }}
                    >
                        {searchProposals.isPending ? 'Searching...' : 'Search'}
                    </button>
                </div>
            </div>

            {/* Add Subscriber */}
            <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
                <h2>Add Notification Subscriber</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <select
                        value={subscriberData.type}
                        onChange={(e) => setSubscriberData({...subscriberData, type: e.target.value})}
                        style={{ padding: '8px' }}
                    >
                        <option value="discord">Discord</option>
                        <option value="telegram">Telegram</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Identifier"
                        value={subscriberData.identifier}
                        onChange={(e) => setSubscriberData({...subscriberData, identifier: e.target.value})}
                        style={{ padding: '8px' }}
                    />
                    <input
                        type="text"
                        placeholder="Webhook URL (for Discord) or Bot Token (for Telegram)"
                        value={subscriberData.webhook_url || ''}
                        onChange={(e) => setSubscriberData({...subscriberData, webhook_url: e.target.value})}
                        style={{ padding: '8px', gridColumn: '1 / -1' }}
                    />
                </div>
                <button
                    onClick={handleAddSubscriber}
                    disabled={addSubscriber.isPending}
                    style={{ padding: '8px 16px' }}
                >
                    {addSubscriber.isPending ? 'Adding...' : 'Add Subscriber'}
                </button>
            </div>

            {/* Broadcast Notification */}
            <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
                <h2>Broadcast Notification</h2>
                <div style={{ marginBottom: '10px' }}>
                    <select
                        value={selectedProposal?.id || ''}
                        onChange={(e) => {
                            const proposal = proposals?.find((p: Proposal) => p.id === e.target.value);
                            setSelectedProposal(proposal || null);
                        }}
                        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                    >
                        <option value="">Select a proposal</option>
                        {proposals?.map((proposal: Proposal) => (
                            <option key={proposal.id} value={proposal.id}>
                                {proposal.title} ({proposal.id})
                            </option>
                        ))}
                    </select>
                    <textarea
                        placeholder="Notification summary"
                        value={notificationSummary}
                        onChange={(e) => setNotificationSummary(e.target.value)}
                        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                        rows={3}
                    />
                    <button
                        onClick={handleBroadcastNotification}
                        disabled={broadcastNotification.isPending || !selectedProposal}
                        style={{ padding: '8px 16px' }}
                    >
                        {broadcastNotification.isPending ? 'Broadcasting...' : 'Broadcast'}
                    </button>
                </div>
            </div>

            {/* Balance Management */}
            <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
                <h2>Balance Management</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <input
                        type="text"
                        placeholder="User ID"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        style={{ padding: '8px' }}
                    />
                    <input
                        type="number"
                        placeholder="Balance amount"
                        value={balanceAmount}
                        onChange={(e) => setBalanceAmount(Number(e.target.value))}
                        style={{ padding: '8px' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={handleGetBalance}
                        disabled={getBalance.isPending}
                        style={{ padding: '8px 16px' }}
                    >
                        {getBalance.isPending ? 'Loading...' : 'Get Balance'}
                    </button>
                    <button
                        onClick={handleSetBalance}
                        disabled={setBalance.isPending}
                        style={{ padding: '8px 16px' }}
                    >
                        {setBalance.isPending ? 'Setting...' : 'Set Balance'}
                    </button>
                </div>
            </div>

            {/* Display Data */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Proposals */}
                <div style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
                    <h3>Proposals ({proposals?.length || 0})</h3>
                    {proposalsLoading ? (
                        <p>Loading proposals...</p>
                    ) : proposalsError ? (
                        <p>Error: {proposalsError.message}</p>
                    ) : (
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {proposals?.map((proposal: Proposal) => (
                                <div key={proposal.id} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #eee', borderRadius: '3px' }}>
                                    <h4>{proposal.title}</h4>
                                    <p><strong>ID:</strong> {proposal.id}</p>
                                    <p><strong>Status:</strong> {proposal.status}</p>
                                    <p><strong>Platform:</strong> {proposal.platform}</p>
                                    <button
                                        onClick={() => handleExecuteProposal(proposal.id)}
                                        disabled={executeProposal.isPending}
                                        style={{ padding: '4px 8px', fontSize: '12px' }}
                                    >
                                        Execute
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Platforms */}
                <div style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
                    <h3>Governance Platforms ({platforms?.length || 0})</h3>
                    {platformsLoading ? (
                        <p>Loading platforms...</p>
                    ) : platformsError ? (
                        <p>Error: {platformsError.message}</p>
                    ) : (
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {platforms?.map((platform: any) => (
                                <div key={platform.id} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #eee', borderRadius: '3px' }}>
                                    <h4>{platform.name}</h4>
                                    <p><strong>ID:</strong> {platform.id}</p>
                                    <p><strong>Type:</strong> {platform.type}</p>
                                    <p><strong>Quorum:</strong> {platform.quorum}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Subscribers */}
            <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
                <h3>Notification Subscribers ({subscribers?.length || 0})</h3>
                {subscribersLoading ? (
                    <p>Loading subscribers...</p>
                ) : subscribersError ? (
                    <p>Error: {subscribersError.message}</p>
                ) : (
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {subscribers?.map((subscriber: Subscriber, index: number) => (
                            <div key={index} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #eee', borderRadius: '3px' }}>
                                <p><strong>Type:</strong> {subscriber.type}</p>
                                <p><strong>Identifier:</strong> {subscriber.identifier}</p>
                                {subscriber.webhook_url && <p><strong>Webhook:</strong> {subscriber.webhook_url}</p>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
