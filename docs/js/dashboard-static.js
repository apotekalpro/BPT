class DashboardManager {
    constructor() {
        this.currentUser = null;
        this.currentTab = 'homepage';
        this.chart = null;
        this.currentDate = new Date();
        
        this.initElements();
        this.bindEvents();
        this.checkAuth();
        this.initCalendar();
        this.initChart();
    }

    initElements() {
        // Navigation elements
        this.navTabs = document.querySelectorAll('.nav-tab');
        this.tabContents = document.querySelectorAll('.tab-content');
        
        // User info elements
        this.userName = document.getElementById('userName');
        this.userType = document.getElementById('userType');
        this.storeName = document.getElementById('storeName');
        this.accountManager = document.getElementById('accountManager');
        this.logoutBtn = document.getElementById('logoutBtn');
        
        // Calendar elements
        this.calendarDays = document.getElementById('calendarDays');
        this.currentMonthElement = document.getElementById('currentMonth');
        
        // Chart element
        this.chartCanvas = document.getElementById('bptChart');
    }

    bindEvents() {
        // Navigation tabs
        this.navTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabId = tab.dataset.tab;
                this.switchTab(tabId);
            });
        });

        // Logout button
        this.logoutBtn.addEventListener('click', () => {
            this.handleLogout();
        });

        // Action buttons
        const actionButtons = document.querySelectorAll('.action-btn');
        actionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleQuickAction(e.target.closest('.action-btn'));
            });
        });

        // Campaign tab navigation
        const campaignTabs = document.querySelectorAll('.campaign-tab');
        campaignTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const campaignId = tab.dataset.campaign;
                this.switchCampaignTab(campaignId);
            });
        });

        // Monitoring tab navigation
        const monitoringTabs = document.querySelectorAll('.monitoring-tab');
        monitoringTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const monitorId = tab.dataset.monitor;
                this.switchMonitoringTab(monitorId);
            });
        });
    }

    checkAuth() {
        // Static version - check localStorage for user data
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        
        if (!user) {
            window.location.href = 'index.html';
            return;
        }
        
        this.currentUser = {
            displayName: user.username,
            type: user.type.toLowerCase(),
            storeName: user.storeName || 'Demo Store',
            accountManager: 'BPT Team'
        };
        this.updateUserInfo();
    }

    updateUserInfo() {
        if (!this.currentUser) return;
        
        this.userName.textContent = this.currentUser.displayName || 'User';
        this.userType.textContent = `${this.currentUser.type.toUpperCase()} User`;
        
        if (this.storeName) {
            this.storeName.textContent = this.currentUser.storeName || 'Demo Store';
        }
        
        if (this.accountManager) {
            this.accountManager.textContent = this.currentUser.accountManager || 'BPT Team';
        }
        
        console.log('✅ User info updated:', this.currentUser);
    }

    switchTab(tabId) {
        // Update navigation
        this.navTabs.forEach(tab => tab.classList.remove('active'));
        this.tabContents.forEach(content => content.classList.remove('active'));
        
        const activeTab = document.querySelector(`[data-tab="${tabId}"]`);
        const activeContent = document.getElementById(tabId);
        
        if (activeTab && activeContent) {
            activeTab.classList.add('active');
            activeContent.classList.add('active');
            this.currentTab = tabId;
            
            console.log(`📱 Switched to tab: ${tabId}`);
            
            // Handle tab-specific initialization
            if (tabId === 'campaign') {
                this.initCampaignTab();
            } else if (tabId === 'monitoring') {
                this.initMonitoringTab();
            }
        }
    }

    switchCampaignTab(campaignId) {
        const campaignTabs = document.querySelectorAll('.campaign-tab');
        const campaignContents = document.querySelectorAll('.campaign-tab-content');
        
        campaignTabs.forEach(tab => tab.classList.remove('active'));
        campaignContents.forEach(content => content.classList.remove('active'));
        
        const activeTab = document.querySelector(`[data-campaign="${campaignId}"]`);
        const activeContent = document.getElementById(campaignId);
        
        if (activeTab && activeContent) {
            activeTab.classList.add('active');
            activeContent.classList.add('active');
            console.log(`🎯 Switched to campaign: ${campaignId}`);
        }
    }

    switchMonitoringTab(monitorId) {
        const monitoringTabs = document.querySelectorAll('.monitoring-tab');
        const monitoringContents = document.querySelectorAll('.monitoring-tab-content');
        
        monitoringTabs.forEach(tab => tab.classList.remove('active'));
        monitoringContents.forEach(content => content.classList.remove('active'));
        
        const activeTab = document.querySelector(`[data-monitor="${monitorId}"]`);
        const activeContent = document.getElementById(monitorId);
        
        if (activeTab && activeContent) {
            activeTab.classList.add('active');
            activeContent.classList.add('active');
            console.log(`📊 Switched to monitoring: ${monitorId}`);
        }
    }

    initCampaignTab() {
        console.log('🎯 Campaign tab initialized');
        // Initialize campaign-specific functionality
    }

    initMonitoringTab() {
        console.log('📊 Monitoring tab initialized');
        // Initialize monitoring-specific functionality
    }

    initCalendar() {
        // Calendar initialization - simplified for static version
        if (this.currentMonthElement) {
            const months = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];
            this.currentMonthElement.textContent = `${months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
        }
    }

    initChart() {
        // Chart initialization - simplified for static version
        if (this.chartCanvas && typeof Chart !== 'undefined') {
            const ctx = this.chartCanvas.getContext('2d');
            this.chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Campaign Performance',
                        data: [12, 19, 3, 5, 2, 3],
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }

    handleLogout() {
        localStorage.removeItem('user');
        console.log('👋 User logged out');
        window.location.href = 'index.html';
    }

    handleQuickAction(button) {
        const action = button.dataset.action;
        console.log(`🚀 Quick action: ${action}`);
        
        switch (action) {
            case 'new-campaign':
                this.switchTab('campaign');
                break;
            case 'view-analytics':
                this.switchTab('monitoring');
                break;
            case 'health-news':
                this.switchTab('health-news');
                break;
            case 'tiktok-cuan':
                this.switchTab('tiktok-cuan');
                break;
            default:
                console.log('Unknown action:', action);
        }
    }
}

// Utility functions
function refreshBPT() {
    console.log('🔄 Refreshing BPT data...');
    // Simulate refresh
    setTimeout(() => {
        console.log('✅ BPT data refreshed');
        // You could update UI elements here
    }, 1000);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.altKey) {
        const shortcuts = {
            'Digit1': 'homepage',
            'Digit2': 'campaign', 
            'Digit3': 'monitoring',
            'Digit4': 'health-news',
            'Digit5': 'tiktok-cuan'
        };
        
        if (shortcuts[e.code]) {
            e.preventDefault();
            const targetTab = document.querySelector(`[data-tab="${shortcuts[e.code]}"]`);
            if (targetTab) {
                targetTab.click();
            }
        }
    }
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏥 Apotek Alpro Dashboard Initialized (Static Version)');
    window.dashboardManager = new DashboardManager();
});

// Initialize WhatsApp iframe handling
setTimeout(() => {
    initWhatsAppHandling();
}, 2000);

// WhatsApp iframe handling functions
function initWhatsAppHandling() {
    const iframes = document.querySelectorAll('iframe');
    
    iframes.forEach(iframe => {
        // Monitor iframe load errors
        iframe.addEventListener('error', function() {
            console.log('📱 Iframe load error detected');
            showWhatsAppAlternative(iframe);
        });
        
        // Check for X-Frame-Options errors after load
        iframe.addEventListener('load', function() {
            setTimeout(() => {
                try {
                    // This will throw an error if X-Frame-Options blocks the content
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    if (!iframeDoc) {
                        showWhatsAppAlternative(iframe);
                    }
                } catch (e) {
                    if (e.name === 'SecurityError') {
                        // Check if this might be a blocking issue vs normal cross-origin
                        console.log('📱 Security error detected for iframe:', iframe.src);
                        // showWhatsAppAlternative(iframe);
                    }
                }
            }, 1000);
        });
    });
    
    console.log('📱 WhatsApp iframe monitoring initialized');
}

function showWhatsAppAlternative(iframe) {
    const container = iframe.closest('.campaign-embed-container, .monitoring-embed-container, .health-news-content, .tiktok-cuan-content');
    if (!container || container.querySelector('.whatsapp-alternative')) return;
    
    const alternative = document.createElement('div');
    alternative.className = 'whatsapp-alternative';
    alternative.innerHTML = `
        <div class="alternative-content">
            <div class="alternative-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h3>Content Blocked</h3>
            <p>This content cannot be displayed in an embedded frame due to security restrictions.</p>
            <div class="alternative-actions">
                <button onclick="openInNewTab('${iframe.src}')" class="open-external-btn">
                    <i class="fas fa-external-link-alt"></i>
                    Open in New Tab
                </button>
                <button onclick="refreshIframe(this)" class="refresh-btn">
                    <i class="fas fa-sync-alt"></i>
                    Retry
                </button>
            </div>
        </div>
    `;
    
    // Add CSS for the alternative if not already added
    if (!document.getElementById('iframe-alternative-styles')) {
        const styles = document.createElement('style');
        styles.id = 'iframe-alternative-styles';
        styles.textContent = `
            .whatsapp-alternative {
                background: linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 255, 255, 0.95));
                border-radius: 12px;
                padding: 40px;
                text-align: center;
                border: 2px dashed rgba(255, 193, 7, 0.4);
                min-height: 300px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 20px 0;
            }
            .alternative-content {
                max-width: 400px;
            }
            .alternative-icon {
                font-size: 48px;
                color: #ffc107;
                margin-bottom: 16px;
            }
            .alternative-content h3 {
                color: #333;
                margin-bottom: 12px;
                font-size: 20px;
                font-weight: 600;
            }
            .alternative-content p {
                color: #666;
                margin-bottom: 24px;
                line-height: 1.5;
            }
            .alternative-actions {
                display: flex;
                gap: 12px;
                justify-content: center;
                flex-wrap: wrap;
            }
            .open-external-btn {
                background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.3s ease;
                text-decoration: none;
            }
            .open-external-btn:hover {
                background: linear-gradient(135deg, #1d4ed8, #1e40af);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            }
            .refresh-btn {
                background: linear-gradient(135deg, #6b7280, #4b5563);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.3s ease;
            }
            .refresh-btn:hover {
                background: linear-gradient(135deg, #4b5563, #374151);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
            }
        `;
        document.head.appendChild(styles);
    }
    
    container.appendChild(alternative);
    iframe.style.display = 'none';
    
    console.log('📱 Iframe alternative displayed for blocked content');
}

function openInNewTab(url) {
    if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
        console.log('🔗 Opening blocked content in new tab:', url);
    }
}

function refreshIframe(button) {
    const alternative = button.closest('.whatsapp-alternative');
    const container = alternative.parentElement;
    const iframe = container.querySelector('iframe');
    
    if (iframe) {
        iframe.style.display = 'block';
        iframe.src = iframe.src; // Force reload
        alternative.remove();
        console.log('🔄 Iframe refreshed');
    }
}

// TikTok refresh function
function refreshTikTokData() {
    console.log('🔄 Refreshing TikTok data...');
    
    // Show loading state
    const refreshBtn = document.querySelector('.tiktok-action-btn.secondary');
    if (refreshBtn) {
        const originalText = refreshBtn.innerHTML;
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
        refreshBtn.disabled = true;
        
        // Simulate data refresh
        setTimeout(() => {
            refreshBtn.innerHTML = originalText;
            refreshBtn.disabled = false;
            console.log('✅ TikTok data refreshed');
        }, 2000);
    }
}

// Global functions for inline event handlers
window.refreshBPT = refreshBPT;
window.openInNewTab = openInNewTab;
window.refreshIframe = refreshIframe;
window.refreshTikTokData = refreshTikTokData;