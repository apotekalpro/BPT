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
            } else if (tabId === 'tiktok-cuan') {
                this.loadTikTokCuan();
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

    loadTikTokCuan() {
        // Initialize TikTok Cuan iframe monitoring for static version
        this.initTikTokIframeMonitoring();
        console.log('TikTok Cuan section loaded (static version)');
    }

    initTikTokIframeMonitoring() {
        const tiktokFrame = document.getElementById('tiktokFrame');
        const tiktokLoading = document.getElementById('tiktokLoading');
        const tiktokError = document.getElementById('tiktokError');

        if (!tiktokFrame || !tiktokLoading || !tiktokError) return;

        let loadTimeout;
        let hasLoaded = false;

        // Show loading initially
        tiktokLoading.style.display = 'block';
        tiktokError.style.display = 'none';
        tiktokFrame.style.display = 'none';

        // Set a timeout to show error if iframe doesn't load
        loadTimeout = setTimeout(() => {
            if (!hasLoaded) {
                this.showTikTokError();
            }
        }, 10000); // 10 seconds timeout

        // Monitor iframe load
        tiktokFrame.addEventListener('load', () => {
            hasLoaded = true;
            clearTimeout(loadTimeout);
            
            // Hide loading and show iframe
            tiktokLoading.style.display = 'none';
            tiktokError.style.display = 'none';
            tiktokFrame.style.display = 'block';
            
            console.log('✅ TikTok Cuan iframe loaded (static)');
        });

        // Monitor iframe errors
        tiktokFrame.addEventListener('error', () => {
            hasLoaded = false;
            clearTimeout(loadTimeout);
            this.showTikTokError();
        });

        // Check for X-Frame-Options blocking
        setTimeout(() => {
            try {
                if (!hasLoaded && tiktokFrame.contentWindow) {
                    // Try to access iframe content to detect X-Frame-Options
                    const iframeDoc = tiktokFrame.contentDocument || tiktokFrame.contentWindow.document;
                    if (!iframeDoc && !hasLoaded) {
                        this.showTikTokError();
                    }
                }
            } catch (e) {
                // Cross-origin access denied - this is normal for external sites
                console.log('Cross-origin iframe detected (normal behavior)');
            }
        }, 3000);
    }

    showTikTokError() {
        const tiktokLoading = document.getElementById('tiktokLoading');
        const tiktokError = document.getElementById('tiktokError');
        const tiktokFrame = document.getElementById('tiktokFrame');

        if (tiktokLoading) tiktokLoading.style.display = 'none';
        if (tiktokError) tiktokError.style.display = 'block';
        if (tiktokFrame) tiktokFrame.style.display = 'none';

        console.log('⚠️ TikTok Cuan iframe failed to load (static)');
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
    
    // Initialize WhatsApp API for TikTok Cuan
    initWhatsAppAPI();
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

// TikTok retry function
function retryTikTokLoad() {
    const tiktokFrame = document.getElementById('tiktokFrame');
    const tiktokLoading = document.getElementById('tiktokLoading');
    const tiktokError = document.getElementById('tiktokError');
    
    if (!tiktokFrame || !tiktokLoading || !tiktokError) return;
    
    console.log('🔄 Retrying TikTok Cuan load...');
    
    // Reset iframe state
    tiktokError.style.display = 'none';
    tiktokLoading.style.display = 'block';
    tiktokFrame.style.display = 'none';
    
    // Force reload iframe
    const currentSrc = tiktokFrame.src;
    tiktokFrame.src = '';
    setTimeout(() => {
        tiktokFrame.src = currentSrc;
    }, 500);
}

// Enhanced WhatsApp API integration for TikTok Cuan (static version)
function initWhatsAppAPI() {
    console.log('📱 Initializing WhatsApp API integration (static version)...');
    
    // Check if the iframe contains WhatsApp functionality
    const tiktokFrame = document.getElementById('tiktokFrame');
    if (!tiktokFrame) {
        console.warn('TikTok iframe not found, WhatsApp integration may not work properly');
        return;
    }

    // Add enhanced error handling for iframe messages
    window.addEventListener('message', function(event) {
        try {
            // Verify origin for security (allow multiple origins for testing)
            const allowedOrigins = [
                'https://zyqsemod.gensparkspace.com',
                'http://localhost',
                'https://localhost'
            ];
            
            const isOriginAllowed = allowedOrigins.some(origin => 
                event.origin.startsWith(origin)
            );
            
            if (!isOriginAllowed) {
                console.log('Message from unauthorized origin:', event.origin);
                return;
            }

            // Handle WhatsApp API requests from iframe
            if (event.data && typeof event.data === 'object') {
                if (event.data.type === 'whatsapp_request') {
                    handleWhatsAppRequest(event.data);
                } else if (event.data.type === 'whatsapp_click') {
                    showWhatsAppPanel();
                } else if (event.data.type === 'iframe_error') {
                    handleIframeError(event.data);
                }
            }
        } catch (error) {
            console.error('Error handling iframe message:', error);
            // Prevent crash by catching errors
        }
    });

    // Add WhatsApp trigger button
    addWhatsAppTrigger();
    
    console.log('📱 WhatsApp API integration initialized for TikTok Cuan (static)');
}

function handleWhatsAppRequest(data) {
    console.log('📱 WhatsApp API request received (static):', data);
    
    try {
        if (data.action === 'send_message') {
            // Handle sending WhatsApp message
            const { phoneNumber, message } = data.payload || {};
            
            if (!phoneNumber || !message) {
                console.error('Missing phone number or message in WhatsApp request');
                sendWhatsAppResponse(data.requestId, false, 'Missing phone number or message');
                return;
            }
            
            // Open WhatsApp Web with pre-filled message
            const whatsappUrl = `https://web.whatsapp.com/send?phone=${encodeURIComponent(phoneNumber.replace(/\D/g, ''))}&text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
            
            // Notify iframe of success
            sendWhatsAppResponse(data.requestId, true, 'WhatsApp opened successfully');
            
        } else if (data.action === 'open_whatsapp') {
            // Open WhatsApp Web
            window.open('https://web.whatsapp.com/', '_blank', 'noopener,noreferrer');
            sendWhatsAppResponse(data.requestId, true, 'WhatsApp Web opened');
            
        } else {
            console.warn('Unknown WhatsApp action:', data.action);
            sendWhatsAppResponse(data.requestId, false, 'Unknown action');
        }
    } catch (error) {
        console.error('Error handling WhatsApp request:', error);
        sendWhatsAppResponse(data.requestId, false, 'Internal error occurred');
    }
}

function sendWhatsAppResponse(requestId, success, message = '') {
    try {
        const tiktokFrame = document.getElementById('tiktokFrame');
        if (tiktokFrame && tiktokFrame.contentWindow) {
            tiktokFrame.contentWindow.postMessage({
                type: 'whatsapp_response',
                success: success,
                message: message,
                requestId: requestId
            }, '*'); // Use '*' for broader compatibility, but verify origin on receive
        }
    } catch (error) {
        console.error('Error sending WhatsApp response:', error);
    }
}

function handleIframeError(data) {
    console.error('Iframe error reported:', data);
    
    // Show user-friendly error message
    console.log(`TikTok Cuan: ${data.error || 'An error occurred'}`);
}

function showWhatsAppPanel() {
    const whatsappPanel = document.getElementById('whatsappIntegration');
    if (whatsappPanel) {
        whatsappPanel.style.display = 'block';
        console.log('📱 WhatsApp panel opened (static)');
    }
}

function closeWhatsAppPanel() {
    const whatsappPanel = document.getElementById('whatsappIntegration');
    if (whatsappPanel) {
        whatsappPanel.style.display = 'none';
    }
    
    // Hide quick message form
    const quickForm = document.getElementById('quickMessageForm');
    if (quickForm) {
        quickForm.style.display = 'none';
    }
}

function openWhatsAppWeb() {
    window.open('https://web.whatsapp.com/', '_blank', 'noopener,noreferrer');
    closeWhatsAppPanel();
    console.log('📱 Opened WhatsApp Web (static)');
}

function openWhatsAppAPI() {
    // Placeholder for WhatsApp Business API integration
    alert('WhatsApp Business API integration coming soon!\n\nFor now, please use WhatsApp Web or Quick Message.');
    console.log('📱 WhatsApp Business API requested (static)');
}

function sendQuickMessage() {
    const quickForm = document.getElementById('quickMessageForm');
    if (quickForm) {
        quickForm.style.display = quickForm.style.display === 'none' ? 'block' : 'none';
    }
}

function sendWhatsAppMessage() {
    const phoneInput = document.getElementById('phoneNumber');
    const messageInput = document.getElementById('messageText');
    
    if (!phoneInput || !messageInput) {
        console.error('WhatsApp form inputs not found');
        return;
    }
    
    const phoneNumber = phoneInput.value.trim();
    const message = messageInput.value.trim();
    
    if (!phoneNumber || !message) {
        alert('Please enter both phone number and message');
        return;
    }
    
    // Open WhatsApp with pre-filled message
    const whatsappUrl = `https://web.whatsapp.com/send?phone=${encodeURIComponent(phoneNumber.replace(/\D/g, ''))}&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    
    // Clear form and close panel
    phoneInput.value = '';
    messageInput.value = '';
    closeWhatsAppPanel();
    
    console.log('📱 Quick WhatsApp message sent (static)');
}

function cancelQuickMessage() {
    const phoneInput = document.getElementById('phoneNumber');
    const messageInput = document.getElementById('messageText');
    
    if (phoneInput) phoneInput.value = '';
    if (messageInput) messageInput.value = '';
    
    const quickForm = document.getElementById('quickMessageForm');
    if (quickForm) {
        quickForm.style.display = 'none';
    }
}

function addWhatsAppTrigger() {
    // Check if trigger already exists
    if (document.getElementById('whatsappTrigger')) return;
    
    const trigger = document.createElement('div');
    trigger.id = 'whatsappTrigger';
    trigger.className = 'whatsapp-trigger';
    trigger.innerHTML = '<i class="fab fa-whatsapp"></i>';
    trigger.onclick = showWhatsAppPanel;
    trigger.title = 'WhatsApp Integration';
    
    document.body.appendChild(trigger);
    console.log('📱 WhatsApp trigger button added (static)');
}

// Global functions for inline event handlers
window.refreshBPT = refreshBPT;
window.openInNewTab = openInNewTab;
window.refreshIframe = refreshIframe;
window.refreshTikTokData = refreshTikTokData;
window.retryTikTokLoad = retryTikTokLoad;
window.initWhatsAppAPI = initWhatsAppAPI;
window.showWhatsAppPanel = showWhatsAppPanel;
window.closeWhatsAppPanel = closeWhatsAppPanel;
window.openWhatsAppWeb = openWhatsAppWeb;
window.openWhatsAppAPI = openWhatsAppAPI;
window.sendQuickMessage = sendQuickMessage;
window.sendWhatsAppMessage = sendWhatsAppMessage;
window.cancelQuickMessage = cancelQuickMessage;