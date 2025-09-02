import { useState } from 'react';
import useProposals, { Proposal, GovernancePlatform, ProposalVotes } from '../hooks/useProposals';
import usePlatformAdapter, { PlatformConfig } from '../hooks/usePlatformAdapter';
import useNotificationSystem, { Subscriber } from '../hooks/useNotificationSystem';

export default function GenieTemplateIntegration() {
    // State management
    const [selectedGovernanceId, setSelectedGovernanceId] = useState('eip155:1:0x7e90e03654732abedf89Faf87f05BcD03ACEeFdc');
    const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
    const [notificationSummary, setNotificationSummary] = useState('');
    const [activeTab, setActiveTab] = useState<'proposals' | 'scraping' | 'notifications'>('proposals');

    // Hook instances
    const proposals = useProposals();
    const platformAdapter = usePlatformAdapter();
    const notificationSystem = useNotificationSystem();

    // ===== PROPOSALS INTEGRATION =====
    const handleAddProposal = async () => {
        const proposalData: Partial<Proposal> = {
            id: `proposal-${Date.now()}`,
            title: "Example Governance Proposal",
            description: "This is an example proposal created through the professional integration",
            content: "Detailed content of the proposal with governance actions and parameters",
            proposer: "0x1234567890123456789012345678901234567890",
            From: "0x1234567890123456789012345678901234567890",
            platform: "uniswap",
            governance_platform_id: selectedGovernanceId,
            status: "active",
            type: "governance",
            url: "https://example.com/proposal",
            category: "governance"
        };

        try {
            const result = await proposals.addProposal.mutateAsync(proposalData);
            console.log('Proposal added:', result);
            alert(`Proposal added: ${result.Success ? 'Success' : 'Failed'}`);
        } catch (error) {
            console.error('Failed to add proposal:', error);
            alert('Failed to add proposal');
        }
    };

    const handleSearchProposals = async () => {
        try {
            const results = await proposals.searchProposals.mutateAsync("governance");
            console.log('Search results:', results);
            alert(`Found ${results.length} proposals matching "governance"`);
        } catch (error) {
            console.error('Search failed:', error);
            alert('Search failed');
        }
    };

    const handleExecuteProposal = async (proposalId: string) => {
        try {
            const result = await proposals.executeProposal.mutateAsync(proposalId);
            console.log('Proposal executed:', result);
            alert(`Proposal executed: ${result.Success ? 'Success' : 'Failed'}`);
        } catch (error) {
            console.error('Failed to execute proposal:', error);
            alert('Failed to execute proposal');
        }
    };

    const handleUpdateVotes = async (proposalId: string) => {
        const votesData: ProposalVotes = {
            for_votes: 1000,
            against_votes: 200,
            abstain_votes: 50,
            quorum: 500
        };

        try {
            const result = await proposals.updateProposalVotes.mutateAsync({ proposalId, votesData });
            console.log('Votes updated:', result);
            alert(`Votes updated: ${result.Success ? 'Success' : 'Failed'}`);
        } catch (error) {
            console.error('Failed to update votes:', error);
            alert('Failed to update votes');
        }
    };

    // ===== PLATFORM ADAPTER INTEGRATION =====
    const handleScrapeGovernance = async () => {
        const platformConfig: PlatformConfig = {
            name: "uniswap",
            url: "https://www.tally.xyz",
            api_key: process.env.VITE_TALLY_API_KEY,
            base_url: process.env.VITE_TALLY_BASE_URL
        };

        try {
            const result = await platformAdapter.scrapeGovernanceData.mutateAsync({
                governanceId: selectedGovernanceId,
                platformConfig
            });
            console.log('Scraping result:', result);
            if (result) {
                alert(`Scraping completed: ${result.success ? 'Success' : 'Failed'}`);
            } else {
                alert('Scraping failed: No result returned');
            }
        } catch (error) {
            console.error('Scraping failed:', error);
            alert('Scraping failed');
        }
    };

    const handleGetScrapingStatus = async () => {
        try {
            const status = await platformAdapter.getScrapingStatus.mutateAsync(selectedGovernanceId);
            console.log('Scraping status:', status);
            if (status) {
                alert(`Status: ${status.success ? 'Active' : 'Error'} - ${status.proposals_count} proposals`);
            } else {
                alert('Failed to get status: No result returned');
            }
        } catch (error) {
            console.error('Failed to get status:', error);
            alert('Failed to get status');
        }
    };

    const handleClearCache = async () => {
        try {
            const result = await platformAdapter.clearCache.mutateAsync(selectedGovernanceId);
            console.log('Cache cleared:', result);
            alert('Cache cleared successfully');
        } catch (error) {
            console.error('Failed to clear cache:', error);
            alert('Failed to clear cache');
        }
    };

    const handleResetRateLimits = async () => {
        try {
            const result = await platformAdapter.resetRateLimits.mutateAsync(selectedGovernanceId);
            console.log('Rate limits reset:', result);
            alert('Rate limits reset successfully');
        } catch (error) {
            console.error('Failed to reset rate limits:', error);
            alert('Failed to reset rate limits');
        }
    };

    // ===== NOTIFICATION SYSTEM INTEGRATION =====
    const handleAddDiscordSubscriber = async () => {
        const subscriberData: Partial<Subscriber> = {
            type: "discord",
            identifier: "governance-alerts",
            webhook_url: "https://discord.com/api/webhooks/your-webhook-url",
            active: true
        };

        try {
            const result = await notificationSystem.addSubscriber.mutateAsync(subscriberData);
            console.log('Discord subscriber added:', result);
            alert(`Discord subscriber added: ${result.Success ? 'Success' : 'Failed'}`);
        } catch (error) {
            console.error('Failed to add Discord subscriber:', error);
            alert('Failed to add Discord subscriber');
        }
    };

    const handleAddTelegramSubscriber = async () => {
        const subscriberData: Partial<Subscriber> = {
            type: "telegram",
            identifier: "governance-bot",
            bot_token: "your-bot-token",
            chat_id: "your-chat-id",
            active: true
        };

        try {
            const result = await notificationSystem.addSubscriber.mutateAsync(subscriberData);
            console.log('Telegram subscriber added:', result);
            alert(`Telegram subscriber added: ${result.Success ? 'Success' : 'Failed'}`);
        } catch (error) {
            console.error('Failed to add Telegram subscriber:', error);
            alert('Failed to add Telegram subscriber');
        }
    };

    const handleBroadcastNotification = async () => {
        if (!selectedProposal || !notificationSummary) {
            alert('Please select a proposal and provide a summary');
            return;
        }

        try {
            const result = await notificationSystem.broadcastNotification.mutateAsync({
                proposal: selectedProposal,
                summary: notificationSummary
            });
            console.log('Notification broadcasted:', result);
            if (result) {
                alert(`Notification broadcasted: ${result.success ? 'Success' : 'Failed'} (${result.success_count}/${result.total_attempts} sent)`);
            } else {
                alert('Failed to broadcast notification: No result returned');
            }
            setNotificationSummary('');
        } catch (error) {
            console.error('Failed to broadcast notification:', error);
            alert('Failed to broadcast notification');
        }
    };

    const handleTestNotification = async (type: string, identifier: string) => {
        try {
            const result = await notificationSystem.testNotification.mutateAsync({
                type,
                identifier,
                testMessage: "This is a test notification from Genie Governance System"
            });
            console.log('Test notification sent:', result);
            alert(`Test notification sent: ${result.Success ? 'Success' : 'Failed'}`);
        } catch (error) {
            console.error('Failed to send test notification:', error);
            alert('Failed to send test notification');
        }
    };

    // ===== RENDER FUNCTIONS =====
    const renderProposalsTab = () => (
        <div className="tab-content">
            <h3>Proposals Management</h3>
            
            <div className="section">
                <h4>Add Proposal</h4>
                <button 
                    onClick={handleAddProposal}
                    disabled={proposals.addProposal.isPending}
                    className="btn btn-primary"
                >
                    {proposals.addProposal.isPending ? 'Adding...' : 'Add Example Proposal'}
                </button>
            </div>

            <div className="section">
                <h4>Search Proposals</h4>
                <button 
                    onClick={handleSearchProposals}
                    disabled={proposals.searchProposals.isPending}
                    className="btn btn-secondary"
                >
                    {proposals.searchProposals.isPending ? 'Searching...' : 'Search "governance"'}
                </button>
            </div>

            <div className="section">
                <h4>Proposals ({proposals.proposals?.length || 0})</h4>
                {proposals.proposalsLoading ? (
                    <p>Loading proposals...</p>
                ) : proposals.proposalsError ? (
                    <p>Error: {proposals.proposalsError.message}</p>
                ) : (
                    <div className="proposals-list">
                        {proposals.proposals?.map((proposal: Proposal) => (
                            <div key={proposal.id} className="proposal-card">
                                <h5>{proposal.title}</h5>
                                <p><strong>ID:</strong> {proposal.id}</p>
                                <p><strong>Status:</strong> {proposal.status}</p>
                                <p><strong>Platform:</strong> {proposal.platform}</p>
                                <div className="proposal-actions">
                                    <button 
                                        onClick={() => handleExecuteProposal(proposal.id)}
                                        disabled={proposals.executeProposal.isPending}
                                        className="btn btn-sm btn-success"
                                    >
                                        Execute
                                    </button>
                                    <button 
                                        onClick={() => handleUpdateVotes(proposal.id)}
                                        disabled={proposals.updateProposalVotes.isPending}
                                        className="btn btn-sm btn-info"
                                    >
                                        Update Votes
                                    </button>
                                    <button 
                                        onClick={() => setSelectedProposal(proposal)}
                                        className="btn btn-sm btn-outline"
                                    >
                                        Select for Notification
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="section">
                <h4>Governance Platforms ({proposals.platforms?.length || 0})</h4>
                {proposals.platformsLoading ? (
                    <p>Loading platforms...</p>
                ) : proposals.platformsError ? (
                    <p>Error: {proposals.platformsError.message}</p>
                ) : (
                    <div className="platforms-list">
                        {proposals.platforms?.map((platform: GovernancePlatform) => (
                            <div key={platform.id} className="platform-card">
                                <h5>{platform.name}</h5>
                                <p><strong>ID:</strong> {platform.id}</p>
                                <p><strong>Type:</strong> {platform.type}</p>
                                <p><strong>Quorum:</strong> {platform.quorum}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    const renderScrapingTab = () => (
        <div className="tab-content">
            <h3>Platform Adapter & Scraping</h3>
            
            <div className="section">
                <h4>Governance ID</h4>
                <input
                    type="text"
                    value={selectedGovernanceId}
                    onChange={(e) => setSelectedGovernanceId(e.target.value)}
                    placeholder="Enter governance ID"
                    className="input-field"
                />
            </div>

            <div className="section">
                <h4>Scraping Operations</h4>
                <div className="button-group">
                    <button 
                        onClick={handleScrapeGovernance}
                        disabled={platformAdapter.scrapeGovernanceData.isPending}
                        className="btn btn-primary"
                    >
                        {platformAdapter.scrapeGovernanceData.isPending ? 'Scraping...' : 'Scrape Governance Data'}
                    </button>
                    <button 
                        onClick={handleGetScrapingStatus}
                        disabled={platformAdapter.getScrapingStatus.isPending}
                        className="btn btn-secondary"
                    >
                        {platformAdapter.getScrapingStatus.isPending ? 'Loading...' : 'Get Status'}
                    </button>
                </div>
            </div>

            <div className="section">
                <h4>Cache & Rate Limit Management</h4>
                <div className="button-group">
                    <button 
                        onClick={handleClearCache}
                        disabled={platformAdapter.clearCache.isPending}
                        className="btn btn-warning"
                    >
                        {platformAdapter.clearCache.isPending ? 'Clearing...' : 'Clear Cache'}
                    </button>
                    <button 
                        onClick={handleResetRateLimits}
                        disabled={platformAdapter.resetRateLimits.isPending}
                        className="btn btn-warning"
                    >
                        {platformAdapter.resetRateLimits.isPending ? 'Resetting...' : 'Reset Rate Limits'}
                    </button>
                </div>
            </div>

            <div className="section">
                <h4>Scraping Statistics</h4>
                <div className="stats-grid">
                    <div className="stat-card">
                        <h5>API Rate Limits</h5>
                        <p>Active: {Object.keys(platformAdapter.apiRateLimits || {}).length}</p>
                    </div>
                    <div className="stat-card">
                        <h5>Cached Data</h5>
                        <p>Entries: {Object.keys(platformAdapter.cachedData || {}).length}</p>
                    </div>
                    <div className="stat-card">
                        <h5>API Calls</h5>
                        <p>Total: {String(Object.values(platformAdapter.apiCallCounts || {}).reduce((a: any, b: any) => (a || 0) + (b || 0), 0))}</p>
                    </div>
                    <div className="stat-card">
                        <h5>Error Logs</h5>
                        <p>Entries: {Object.keys(platformAdapter.errorLogs || {}).length}</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderNotificationsTab = () => (
        <div className="tab-content">
            <h3>Notification System</h3>
            
            <div className="section">
                <h4>Add Subscribers</h4>
                <div className="button-group">
                    <button 
                        onClick={handleAddDiscordSubscriber}
                        disabled={notificationSystem.addSubscriber.isPending}
                        className="btn btn-primary"
                    >
                        {notificationSystem.addSubscriber.isPending ? 'Adding...' : 'Add Discord Subscriber'}
                    </button>
                    <button 
                        onClick={handleAddTelegramSubscriber}
                        disabled={notificationSystem.addSubscriber.isPending}
                        className="btn btn-primary"
                    >
                        {notificationSystem.addSubscriber.isPending ? 'Adding...' : 'Add Telegram Subscriber'}
                    </button>
                </div>
            </div>

            <div className="section">
                <h4>Broadcast Notification</h4>
                <div className="notification-form">
                    <select
                        value={selectedProposal?.id || ''}
                        onChange={(e) => {
                            const proposal = proposals.proposals?.find((p: Proposal) => p.id === e.target.value);
                            setSelectedProposal(proposal || null);
                        }}
                        className="select-field"
                    >
                        <option value="">Select a proposal</option>
                        {proposals.proposals?.map((proposal: Proposal) => (
                            <option key={proposal.id} value={proposal.id}>
                                {proposal.title} ({proposal.id})
                            </option>
                        ))}
                    </select>
                    <textarea
                        placeholder="Notification summary"
                        value={notificationSummary}
                        onChange={(e) => setNotificationSummary(e.target.value)}
                        className="textarea-field"
                        rows={3}
                    />
                    <button 
                        onClick={handleBroadcastNotification}
                        disabled={notificationSystem.broadcastNotification.isPending || !selectedProposal}
                        className="btn btn-success"
                    >
                        {notificationSystem.broadcastNotification.isPending ? 'Broadcasting...' : 'Broadcast Notification'}
                    </button>
                </div>
            </div>

            <div className="section">
                <h4>Subscribers ({notificationSystem.subscribers?.length || 0})</h4>
                {notificationSystem.subscribersLoading ? (
                    <p>Loading subscribers...</p>
                ) : notificationSystem.subscribersError ? (
                    <p>Error: {notificationSystem.subscribersError.message}</p>
                ) : (
                    <div className="subscribers-list">
                        {notificationSystem.subscribers?.map((subscriber: Subscriber, index: number) => (
                            <div key={index} className="subscriber-card">
                                <h5>{subscriber.type.toUpperCase()} Subscriber</h5>
                                <p><strong>Identifier:</strong> {subscriber.identifier}</p>
                                {subscriber.webhook_url && <p><strong>Webhook:</strong> {subscriber.webhook_url}</p>}
                                {subscriber.bot_token && <p><strong>Bot Token:</strong> {subscriber.bot_token}</p>}
                                {subscriber.chat_id && <p><strong>Chat ID:</strong> {subscriber.chat_id}</p>}
                                <p><strong>Active:</strong> {subscriber.active ? 'Yes' : 'No'}</p>
                                <button 
                                    onClick={() => handleTestNotification(subscriber.type, subscriber.identifier)}
                                    disabled={notificationSystem.testNotification.isPending}
                                    className="btn btn-sm btn-outline"
                                >
                                    Test Notification
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="genie-template-integration">
            <h2>Genie Template Integration</h2>
            <p>Complete integration with all three Genie governance modules</p>

            {/* Tab Navigation */}
            <div className="tab-navigation">
                <button 
                    className={`tab-btn ${activeTab === 'proposals' ? 'active' : ''}`}
                    onClick={() => setActiveTab('proposals')}
                >
                    Proposals
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'scraping' ? 'active' : ''}`}
                    onClick={() => setActiveTab('scraping')}
                >
                    Platform Adapter
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
                    onClick={() => setActiveTab('notifications')}
                >
                    Notifications
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'proposals' && renderProposalsTab()}
            {activeTab === 'scraping' && renderScrapingTab()}
            {activeTab === 'notifications' && renderNotificationsTab()}

            {/* Global Status */}
            <div className="global-status">
                <h4>System Status</h4>
                <div className="status-grid">
                    <div className="status-item">
                        <span>Proposals:</span>
                        <span>{proposals.proposalsLoading ? 'Loading...' : proposals.proposals?.length || 0}</span>
                    </div>
                    <div className="status-item">
                        <span>Platforms:</span>
                        <span>{proposals.platformsLoading ? 'Loading...' : proposals.platforms?.length || 0}</span>
                    </div>
                    <div className="status-item">
                        <span>Subscribers:</span>
                        <span>{notificationSystem.subscribersLoading ? 'Loading...' : notificationSystem.subscribers?.length || 0}</span>
                    </div>
                    <div className="status-item">
                        <span>Cache Entries:</span>
                        <span>{Object.keys(platformAdapter.cachedData || {}).length}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
