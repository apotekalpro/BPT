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
        let retryCount = 0;
        const maxRetries = 3;
        const iframeUrl = 'https://zyqsemod.gensparkspace.com/';

        // Check network connectivity first
        this.checkNetworkConnectivity().then(isOnline => {
            if (!isOnline) {
                this.showTikTokError('No internet connection detected');
                return;
            }
            this.startIframeLoading();
        });

        const startIframeLoading = () => {
            hasLoaded = false;
            console.log(`🔄 Loading TikTok Cuan iframe (static) (attempt ${retryCount + 1}/${maxRetries + 1})`);

            // Show loading state
            tiktokLoading.style.display = 'block';
            tiktokError.style.display = 'none';
            tiktokFrame.style.display = 'none';

            // Update loading text with retry info
            const loadingText = tiktokLoading.querySelector('p');
            if (loadingText && retryCount > 0) {
                loadingText.textContent = `Loading TikTok Cuan Dashboard... (Attempt ${retryCount + 1})`;
            }

            // Set iframe source (this will trigger the load)
            if (tiktokFrame.src !== iframeUrl) {
                tiktokFrame.src = iframeUrl;
            } else {
                // Force reload if src is already set
                tiktokFrame.src = '';
                setTimeout(() => {
                    tiktokFrame.src = iframeUrl;
                }, 100);
            }

            // Set timeout with exponential backoff
            const timeoutDuration = 15000 + (retryCount * 5000); // 15s, 20s, 25s, 30s
            loadTimeout = setTimeout(() => {
                if (!hasLoaded) {
                    if (retryCount < maxRetries) {
                        retryCount++;
                        console.log(`⏰ TikTok iframe timeout (static), retrying... (${retryCount}/${maxRetries})`);
                        startIframeLoading();
                    } else {
                        this.showTikTokError('Connection timeout after multiple attempts');
                    }
                }
            }, timeoutDuration);
        };

        this.startIframeLoading = startIframeLoading;

        // Monitor iframe successful load
        tiktokFrame.addEventListener('load', () => {
            // Verify the iframe actually loaded content
            setTimeout(() => {
                try {
                    // Check if iframe has loaded by testing its window object
                    if (tiktokFrame.contentWindow && tiktokFrame.src === iframeUrl) {
                        hasLoaded = true;
                        clearTimeout(loadTimeout);
                        retryCount = 0; // Reset retry count on success
                        
                        // Hide loading and show iframe
                        tiktokLoading.style.display = 'none';
                        tiktokError.style.display = 'none';
                        tiktokFrame.style.display = 'block';
                        
                        console.log('✅ TikTok Cuan iframe loaded successfully (static)');
                    }
                } catch (e) {
                    // Cross-origin access is normal, consider it loaded if no other errors
                    if (tiktokFrame.src === iframeUrl) {
                        hasLoaded = true;
                        clearTimeout(loadTimeout);
                        retryCount = 0;
                        
                        tiktokLoading.style.display = 'none';
                        tiktokError.style.display = 'none';
                        tiktokFrame.style.display = 'block';
                        
                        console.log('✅ TikTok Cuan iframe loaded (static, cross-origin)');
                    }
                }
            }, 2000); // Give iframe time to fully load
        });

        // Monitor iframe loading errors
        tiktokFrame.addEventListener('error', (e) => {
            console.error('TikTok iframe error event (static):', e);
            hasLoaded = false;
            clearTimeout(loadTimeout);
            
            if (retryCount < maxRetries) {
                retryCount++;
                console.log(`🔄 Iframe error (static), retrying... (${retryCount}/${maxRetries})`);
                setTimeout(() => startIframeLoading(), 2000);
            } else {
                this.showTikTokError('Failed to load after multiple attempts');
            }
        });

        // Additional check for blocked content
        setTimeout(() => {
            if (!hasLoaded && retryCount === 0) {
                console.log('🔍 Checking for blocked content (static)...');
                this.checkIframeBlocking(tiktokFrame);
            }
        }, 5000);

        // Add iframe navigation handling
        this.setupIframeNavigationHandling(tiktokFrame);
    }

    async checkNetworkConnectivity() {
        try {
            // Check if navigator.onLine is available and true
            if (!navigator.onLine) {
                return false;
            }

            // Try to fetch a small resource to verify actual connectivity
            const response = await fetch('https://httpbin.org/json', {
                method: 'GET',
                mode: 'no-cors',
                cache: 'no-cache'
            });
            return true;
        } catch (error) {
            console.warn('Network connectivity check failed (static):', error);
            // Fallback to navigator.onLine
            return navigator.onLine;
        }
    }

    checkIframeBlocking(iframe) {
        try {
            // Test if iframe is accessible
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
            
            // If we can't access it but it has a src, it's likely cross-origin (normal)
            if (!iframeDoc && iframe.src) {
                console.log('ℹ️ Iframe is cross-origin (static, normal behavior)');
                // Consider it loaded if it has the correct src
                if (iframe.src.includes('zyqsemod.gensparkspace.com')) {
                    iframe.style.display = 'block';
                    document.getElementById('tiktokLoading').style.display = 'none';
                    document.getElementById('tiktokError').style.display = 'none';
                    console.log('✅ Assuming iframe loaded (static, cross-origin content)');
                }
                return;
            }
            
            // Check if iframe is empty or blocked
            if (!iframe.src || iframe.src === 'about:blank') {
                console.warn('⚠️ Iframe has no source or is blank (static)');
                this.showTikTokError('Iframe source not set properly');
            }
        } catch (error) {
            // This is expected for cross-origin iframes
            console.log('ℹ️ Cross-origin iframe access blocked (static, expected)');
        }
    }

    setupIframeNavigationHandling(iframe) {
        // Monitor iframe for navigation changes (static version)
        let lastUrl = iframe.src;
        
        // Check for URL changes periodically
        const checkUrlChanges = () => {
            try {
                if (iframe.contentWindow && iframe.contentWindow.location) {
                    const currentUrl = iframe.contentWindow.location.href;
                    if (currentUrl !== lastUrl) {
                        console.log('🔗 Iframe navigated (static) from', lastUrl, 'to', currentUrl);
                        lastUrl = currentUrl;
                        
                        // Ensure navigation stays within the TikTok Cuan domain
                        if (!currentUrl.includes('zyqsemod.gensparkspace.com')) {
                            console.warn('⚠️ Iframe navigated outside allowed domain (static):', currentUrl);
                        }
                    }
                }
            } catch (error) {
                // Cross-origin access blocked - this is expected
            }
        };

        // Monitor navigation changes
        setInterval(checkUrlChanges, 2000);

        // Listen for navigation messages from iframe
        window.addEventListener('message', (event) => {
            if (event.origin !== 'https://zyqsemod.gensparkspace.com') return;
            
            if (event.data && event.data.type === 'navigation_event') {
                console.log('🔗 Navigation event from iframe (static):', event.data);
                
                // Handle navigation within iframe context
                if (event.data.url && !event.data.url.includes('zyqsemod.gensparkspace.com')) {
                    console.log('🔗 External navigation detected (static), handling...');
                    
                    // For external links, open in new tab but keep iframe context
                    if (event.data.shouldOpenExternally) {
                        window.open(event.data.url, '_blank', 'noopener,noreferrer');
                        event.preventDefault?.();
                    }
                }
            }
        });

        console.log('🔗 Iframe navigation handling setup complete (static)');
    }

    showTikTokError(customMessage = '') {
        const tiktokLoading = document.getElementById('tiktokLoading');
        const tiktokError = document.getElementById('tiktokError');
        const tiktokFrame = document.getElementById('tiktokFrame');

        if (tiktokLoading) tiktokLoading.style.display = 'none';
        if (tiktokError) {
            tiktokError.style.display = 'block';
            
            // Update error message if custom message provided
            if (customMessage) {
                const errorTitle = tiktokError.querySelector('h3');
                const errorDesc = tiktokError.querySelector('p');
                
                if (errorTitle) errorTitle.textContent = 'Connection Issue';
                if (errorDesc) errorDesc.textContent = customMessage;
            }
        }
        if (tiktokFrame) tiktokFrame.style.display = 'none';

        console.log('⚠️ TikTok Cuan iframe error (static):', customMessage || 'Failed to load');
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
    
    // Initialize network monitoring
    initNetworkMonitoring();
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

// Enhanced TikTok retry function (static)
function retryTikTokLoad() {
    const tiktokFrame = document.getElementById('tiktokFrame');
    const tiktokLoading = document.getElementById('tiktokLoading');
    const tiktokError = document.getElementById('tiktokError');
    
    if (!tiktokFrame || !tiktokLoading || !tiktokError) return;
    
    console.log('🔄 Manual retry of TikTok Cuan load (static)...');
    
    // Reset iframe state
    tiktokError.style.display = 'none';
    tiktokLoading.style.display = 'block';
    tiktokFrame.style.display = 'none';
    
    // Reset loading text
    const loadingText = tiktokLoading.querySelector('p');
    if (loadingText) {
        loadingText.textContent = 'Loading TikTok Cuan Dashboard...';
    }
    
    // Force reload iframe with fresh initialization
    tiktokFrame.src = '';
    
    setTimeout(() => {
        // Re-initialize monitoring with fresh state
        if (window.dashboardManager && window.dashboardManager.startIframeLoading) {
            window.dashboardManager.startIframeLoading();
        } else {
            // Fallback if monitoring is not available
            tiktokFrame.src = 'https://zyqsemod.gensparkspace.com/';
        }
    }, 500);
}

// Network status monitoring (static)
function initNetworkMonitoring() {
    // Monitor online/offline status
    window.addEventListener('online', () => {
        console.log('📶 Network connection restored (static)');
        
        // Auto-retry TikTok loading if it failed due to network issues
        const tiktokError = document.getElementById('tiktokError');
        if (tiktokError && tiktokError.style.display === 'block') {
            setTimeout(() => {
                console.log('🔄 Auto-retrying TikTok load after network restoration (static)...');
                retryTikTokLoad();
            }, 2000);
        }
    });
    
    window.addEventListener('offline', () => {
        console.log('📵 Network connection lost (static)');
    });
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
                    handleWhatsAppRequest(event.data);
                } else if (event.data.type === 'iframe_error') {
                    handleIframeError(event.data);
                }
            }
            
            // Also handle simple string messages that might be WhatsApp related
            if (typeof event.data === 'string') {
                if (event.data.toLowerCase().includes('whatsapp') || 
                    event.data.toLowerCase().includes('wa.me') ||
                    event.data.toLowerCase().includes('chat.whatsapp')) {
                    console.log('📱 WhatsApp-related message detected (static):', event.data);
                    showWhatsAppPanel();
                }
            }
        } catch (error) {
            console.error('Error handling iframe message:', error);
            // Prevent crash by catching errors
        }
    });

    // Add WhatsApp trigger button
    addWhatsAppTrigger();
    
    // Add global WhatsApp URL interceptor
    addWhatsAppUrlInterceptor();
    
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
            
            // Clean and format phone number (remove non-digits, add country code if needed)
            let cleanPhone = phoneNumber.replace(/\D/g, '');
            if (cleanPhone.startsWith('0')) {
                cleanPhone = '62' + cleanPhone.substring(1); // Indonesia country code
            }
            if (!cleanPhone.startsWith('62')) {
                cleanPhone = '62' + cleanPhone; // Ensure Indonesia country code
            }
            
            // Create WhatsApp URL - try multiple methods for better compatibility
            const encodedMessage = encodeURIComponent(message);
            
            // Method 1: Try WhatsApp Web for specific contact
            const whatsappWebUrl = `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`;
            
            // Method 2: Try WhatsApp mobile app (for mobile users)
            const whatsappAppUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
            
            // Method 3: WhatsApp Group (primary for general communication)
            const whatsappGroupUrl = 'https://chat.whatsapp.com/HukQMDMTtJjFi12x1lAty3';
            
            // Try specific contact first if phone number provided
            const newWindow = window.open(whatsappWebUrl, '_blank', 'noopener,noreferrer,width=800,height=600');
            
            // Fallback: if window didn't open, try mobile method, then group
            setTimeout(() => {
                if (!newWindow || newWindow.closed) {
                    console.log('📱 Trying WhatsApp mobile fallback (static)...');
                    const mobileWindow = window.open(whatsappAppUrl, '_blank', 'noopener,noreferrer');
                    
                    // Ultimate fallback: open group
                    setTimeout(() => {
                        if (!mobileWindow || mobileWindow.closed) {
                            console.log('📱 Opening WhatsApp Group as final fallback (static)...');
                            window.open(whatsappGroupUrl, '_blank', 'noopener,noreferrer');
                        }
                    }, 2000);
                }
            }, 2000);
            
            // Notify iframe of success
            sendWhatsAppResponse(data.requestId, true, 'WhatsApp opened successfully');
            console.log(`📱 WhatsApp opened (static) for ${cleanPhone}: ${message}`);
            
        } else if (data.action === 'open_whatsapp') {
            // Open specific WhatsApp group
            const whatsappGroupUrl = 'https://chat.whatsapp.com/HukQMDMTtJjFi12x1lAty3';
            const whatsappWindow = window.open(whatsappGroupUrl, '_blank', 'noopener,noreferrer,width=800,height=600');
            
            // Fallback: if window doesn't open, try alternative method
            setTimeout(() => {
                if (!whatsappWindow || whatsappWindow.closed) {
                    // Try alternative WhatsApp group access
                    window.open(whatsappGroupUrl, '_blank', 'noopener,noreferrer');
                }
            }, 2000);
            
            sendWhatsAppResponse(data.requestId, true, 'WhatsApp Group opened');
            
        } else if (data.action === 'whatsapp_click' || data.type === 'whatsapp_click') {
            // Handle direct WhatsApp button clicks from iframe
            console.log('📱 WhatsApp button clicked from iframe (static)');
            showWhatsAppPanel();
            
        } else {
            console.warn('Unknown WhatsApp action (static):', data.action);
            sendWhatsAppResponse(data.requestId, false, 'Unknown action');
        }
    } catch (error) {
        console.error('Error handling WhatsApp request (static):', error);
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
    const whatsappGroupUrl = 'https://chat.whatsapp.com/HukQMDMTtJjFi12x1lAty3';
    
    console.log('📱 Attempting to open WhatsApp Group (static):', whatsappGroupUrl);
    
    // Use the enhanced multi-method approach
    openWhatsAppWithMultipleMethods(whatsappGroupUrl);
    
    closeWhatsAppPanel();
    
    console.log('📱 Enhanced WhatsApp Group opening initiated (static)');
}

function openWhatsAppAPI() {
    // Open WhatsApp Group for community access
    const whatsappGroupUrl = 'https://chat.whatsapp.com/HukQMDMTtJjFi12x1lAty3';
    window.open(whatsappGroupUrl, '_blank', 'noopener,noreferrer');
    closeWhatsAppPanel();
    console.log('📱 WhatsApp Community/Group opened (static)');
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
    
    if (!message) {
        alert('Please enter a message');
        return;
    }
    
    const whatsappGroupUrl = 'https://chat.whatsapp.com/HukQMDMTtJjFi12x1lAty3';
    
    // If phone number provided, try to send to specific contact first
    if (phoneNumber.trim()) {
        console.log('📱 Attempting to send WhatsApp message to (static):', phoneNumber);
        
        // Clean and format phone number
        let cleanPhone = phoneNumber.replace(/\D/g, '');
        if (cleanPhone.startsWith('0')) {
            cleanPhone = '62' + cleanPhone.substring(1); // Indonesia country code
        }
        if (!cleanPhone.startsWith('62')) {
            cleanPhone = '62' + cleanPhone; // Ensure Indonesia country code
        }
        
        const encodedMessage = encodeURIComponent(message);
        const whatsappWebUrl = `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`;
        const whatsappAppUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
        
        // Method 1: Try WhatsApp Web with aggressive parameters
        let contactWindow = null;
        try {
            contactWindow = window.open(whatsappWebUrl, '_blank', 'noopener,noreferrer,width=800,height=600,scrollbars=yes,resizable=yes,toolbar=yes,location=yes,status=yes,menubar=yes');
            console.log('📱 WhatsApp Web window result (static):', contactWindow);
        } catch (error) {
            console.error('📱 WhatsApp Web window.open failed (static):', error);
        }
        
        // Method 2: If window.open fails, try creating a link and clicking it
        if (!contactWindow || contactWindow.closed) {
            console.log('📱 Trying fallback method: creating link element for contact (static)');
            try {
                const link = document.createElement('a');
                link.href = whatsappWebUrl;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                console.log('📱 Contact link click method executed (static)');
            } catch (error) {
                console.error('📱 Contact link click method failed (static):', error);
            }
        }
        
        // Method 3: Mobile WhatsApp fallback
        setTimeout(() => {
            if (!contactWindow || contactWindow.closed) {
                console.log('📱 Trying mobile WhatsApp URL as fallback (static)');
                try {
                    const mobileWindow = window.open(whatsappAppUrl, '_blank', 'noopener,noreferrer');
                    
                    // Ultimate fallback: WhatsApp Group
                    setTimeout(() => {
                        if (!mobileWindow || mobileWindow.closed) {
                            console.log('📱 Opening WhatsApp Group as ultimate fallback (static)');
                            openWhatsAppWithMultipleMethods(whatsappGroupUrl);
                        }
                    }, 2000);
                } catch (error) {
                    console.error('📱 Mobile WhatsApp failed (static):', error);
                    openWhatsAppWithMultipleMethods(whatsappGroupUrl);
                }
            }
        }, 2000);
        
    } else {
        // No phone number, open group directly with enhanced methods
        console.log('📱 Opening WhatsApp Group directly (no phone number provided) (static)');
        openWhatsAppWithMultipleMethods(whatsappGroupUrl);
    }
    
    // Clear form and close panel
    phoneInput.value = '';
    messageInput.value = '';
    closeWhatsAppPanel();
    
    console.log('📱 Enhanced WhatsApp message/group access initiated (static)');
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

function addWhatsAppUrlInterceptor() {
    // Intercept clicks on WhatsApp links within iframes
    document.addEventListener('click', function(event) {
        const target = event.target;
        
        // Check if clicked element or its parents have WhatsApp-related attributes
        let element = target;
        for (let i = 0; i < 5; i++) { // Check up to 5 parent levels
            if (!element) break;
            
            const href = element.href || element.getAttribute('href') || '';
            const text = element.textContent || '';
            const className = element.className || '';
            const id = element.id || '';
            
            // Check for WhatsApp-related patterns
            if (href.includes('whatsapp') || href.includes('wa.me') || 
                text.toLowerCase().includes('whatsapp') || 
                className.includes('whatsapp') || 
                id.includes('whatsapp')) {
                
                event.preventDefault();
                console.log('📱 WhatsApp link intercepted (static):', href || text);
                
                // Extract phone number and message if possible
                if (href.includes('wa.me') || href.includes('whatsapp.com')) {
                    handleWhatsAppUrl(href);
                } else {
                    showWhatsAppPanel();
                }
                return false;
            }
            
            element = element.parentElement;
        }
    }, true); // Use capture phase to intercept early
    
    console.log('📱 WhatsApp URL interceptor added (static)');
}

function handleWhatsAppUrl(url) {
    try {
        console.log('📱 Processing WhatsApp URL (static):', url);
        
        // Extract phone number and text from WhatsApp URL
        const urlObj = new URL(url);
        let phoneNumber = '';
        let message = '';
        
        if (url.includes('wa.me')) {
            // Format: https://wa.me/6281234567890?text=Hello
            const pathParts = urlObj.pathname.split('/');
            phoneNumber = pathParts[pathParts.length - 1];
            message = urlObj.searchParams.get('text') || '';
        } else if (url.includes('whatsapp.com/send')) {
            // Format: https://web.whatsapp.com/send?phone=6281234567890&text=Hello
            phoneNumber = urlObj.searchParams.get('phone') || '';
            message = urlObj.searchParams.get('text') || '';
        }
        
        if (phoneNumber) {
            // Clean phone number
            let cleanPhone = phoneNumber.replace(/\D/g, '');
            if (cleanPhone.startsWith('0')) {
                cleanPhone = '62' + cleanPhone.substring(1);
            }
            if (!cleanPhone.startsWith('62')) {
                cleanPhone = '62' + cleanPhone;
            }
            
            // Create new WhatsApp URL and open it
            const newUrl = `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
            const whatsappWindow = window.open(newUrl, '_blank', 'noopener,noreferrer,width=800,height=600');
            
            // Fallback to mobile if web doesn't work
            setTimeout(() => {
                if (!whatsappWindow || whatsappWindow.closed) {
                    const mobileUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
                    window.open(mobileUrl, '_blank', 'noopener,noreferrer');
                }
            }, 2000);
            
            console.log(`📱 WhatsApp opened (static) for ${phoneNumber}`);
        } else {
            // No phone number found, open WhatsApp Group
            const whatsappGroupUrl = 'https://chat.whatsapp.com/HukQMDMTtJjFi12x1lAty3';
            window.open(whatsappGroupUrl, '_blank', 'noopener,noreferrer');
        }
        
    } catch (error) {
        console.error('Error processing WhatsApp URL (static):', error);
        // Fallback: open WhatsApp Group
        const whatsappGroupUrl = 'https://chat.whatsapp.com/HukQMDMTtJjFi12x1lAty3';
        window.open(whatsappGroupUrl, '_blank', 'noopener,noreferrer');
    }
}

// Enhanced WhatsApp opening function with network bypass strategies (static version)
function openWhatsAppWithMultipleMethods(url) {
    console.log('📱 Opening WhatsApp with network bypass methods (static):', url);
    
    // Alternative WhatsApp URLs to bypass network blocks
    const alternativeUrls = [
        url, // Original URL
        'https://wa.me/+6285890874888', // Direct phone number
        'https://web.whatsapp.com/', // WhatsApp Web base
        'https://api.whatsapp.com/send?phone=6285890874888&text=Hello%20from%20Apotek%20Alpro', // API endpoint
        'whatsapp://send?phone=6285890874888&text=Hello%20from%20Apotek%20Alpro' // App protocol
    ];
    
    let currentUrlIndex = 0;
    let whatsappWindow = null;
    let successfullyOpened = false;
    
    function tryNextUrl() {
        if (currentUrlIndex >= alternativeUrls.length || successfullyOpened) {
            if (!successfullyOpened) {
                console.log('📱 All WhatsApp URL methods failed, showing fallback UI (static)');
                showWhatsAppNetworkBypassFallback();
            }
            return;
        }
        
        const currentUrl = alternativeUrls[currentUrlIndex];
        console.log(`📱 Trying WhatsApp URL ${currentUrlIndex + 1}/${alternativeUrls.length} (static):`, currentUrl);
        
        // Method 1: Enhanced window.open with bypass headers
        try {
            whatsappWindow = window.open('', '_blank', 'noopener,noreferrer,width=800,height=600,scrollbars=yes,resizable=yes,toolbar=yes,location=yes,status=yes,menubar=yes');
            
            if (whatsappWindow) {
                // Use document.write to bypass some restrictions
                whatsappWindow.document.write(`
                    <html><head><title>Opening WhatsApp...</title></head>
                    <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                        <div style="color: #25D366; font-size: 48px; margin-bottom: 20px;">📱</div>
                        <h2>Opening WhatsApp...</h2>
                        <p>If WhatsApp doesn't open automatically, <a href="${currentUrl}" target="_self" style="color: #25D366; text-decoration: none; font-weight: bold;">click here</a></p>
                        <script>
                            setTimeout(function() {
                                try {
                                    window.location.href = "${currentUrl}";
                                } catch(e) {
                                    document.body.innerHTML += '<p style="color: red;">Failed to redirect. Please click the link above.</p>';
                                }
                            }, 1000);
                        </script>
                    </body></html>
                `);
                whatsappWindow.document.close();
                successfullyOpened = true;
                console.log('📱 WhatsApp bypass window opened successfully (static)');
                return;
            }
        } catch (error) {
            console.error('📱 Enhanced window.open failed (static):', error);
        }
        
        // Method 2: Direct link creation with bypass techniques
        try {
            const link = document.createElement('a');
            link.href = currentUrl;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.style.display = 'none';
            
            // Add referrer policy to bypass some restrictions
            link.referrerPolicy = 'no-referrer';
            
            document.body.appendChild(link);
            
            // Simulate user interaction to bypass popup blockers
            const clickEvent = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true,
                buttons: 1
            });
            
            link.dispatchEvent(clickEvent);
            document.body.removeChild(link);
            
            console.log('📱 Enhanced link click method executed for URL (static):', currentUrl);
            successfullyOpened = true;
            return;
        } catch (error) {
            console.error('📱 Enhanced link click method failed (static):', error);
        }
        
        // Method 3: Form submission bypass
        try {
            const form = document.createElement('form');
            form.action = currentUrl;
            form.method = 'GET';
            form.target = '_blank';
            form.style.display = 'none';
            
            document.body.appendChild(form);
            form.submit();
            document.body.removeChild(form);
            
            console.log('📱 Form submission method executed for URL (static):', currentUrl);
            successfullyOpened = true;
            return;
        } catch (error) {
            console.error('📱 Form submission method failed (static):', error);
        }
        
        // Try next URL after a delay
        currentUrlIndex++;
        setTimeout(tryNextUrl, 1500);
    }
    
    // Start trying URLs
    tryNextUrl();
    
    // Fallback timeout
    setTimeout(() => {
        if (!successfullyOpened) {
            console.log('📱 All methods timed out, showing advanced fallback (static)');
            showWhatsAppNetworkBypassFallback();
        }
    }, 8000);
}

// New network bypass fallback for blocked URLs (static version)
function showWhatsAppNetworkBypassFallback() {\n    // Remove any existing fallback messages\n    const existing = document.querySelectorAll('.whatsapp-fallback-overlay');\n    existing.forEach(el => el.remove());\n    \n    const whatsappAlternatives = [\n        {\n            title: 'WhatsApp Web',\n            url: 'https://web.whatsapp.com/',\n            description: 'Open WhatsApp Web and search for our contact',\n            icon: '\ud83c\udf10'\n        },\n        {\n            title: 'Direct Phone Contact',\n            url: 'tel:+6285890874888',\n            description: 'Call us directly',\n            icon: '\ud83d\udcde'\n        },\n        {\n            title: 'WhatsApp Mobile App',\n            url: 'whatsapp://send?phone=6285890874888&text=Hello%20from%20Apotek%20Alpro',\n            description: 'Open in WhatsApp mobile app',\n            icon: '\ud83d\udcf1'\n        },\n        {\n            title: 'Copy Phone Number',\n            action: 'copy',\n            data: '+62 858-9087-4888',\n            description: 'Copy and paste in WhatsApp',\n            icon: '\ud83d\udccb'\n        }\n    ];\n    \n    const fallbackHtml = `\n        <div class=\"whatsapp-fallback-overlay\" style=\"position: fixed; top: 0; left: 0; width: 100%; height: 100%; \n                    background: rgba(0,0,0,0.8); z-index: 99999; display: flex; align-items: center; justify-content: center;\n                    animation: fallbackFadeIn 0.4s ease-out;\" \n             onclick=\"this.remove();\">\n            <div style=\"position: relative; background: white; border: 3px solid #25D366; border-radius: 20px; \n                        padding: 30px; max-width: 600px; width: 95%; text-align: center; box-shadow: 0 15px 40px rgba(0,0,0,0.5);\n                        animation: fallbackSlideUp 0.4s ease-out; max-height: 90vh; overflow-y: auto;\" \n                 onclick=\"event.stopPropagation();\">\n                \n                <button onclick=\"this.closest('.whatsapp-fallback-overlay').remove()\" \n                        style=\"position: absolute; top: 15px; right: 15px; background: none; border: none; \n                               font-size: 28px; color: #999; cursor: pointer; width: 35px; height: 35px;\n                               display: flex; align-items: center; justify-content: center; border-radius: 50%;\n                               transition: background 0.2s;\" \n                        onmouseover=\"this.style.background='#f0f0f0'\" \n                        onmouseout=\"this.style.background='none'\">&times;</button>\n                \n                <div style=\"color: #dc3545; font-size: 64px; margin-bottom: 20px; animation: warningPulse 2s infinite;\">\n                    \u26a0\ufe0f\n                </div>\n                \n                <h3 style=\"color: #333; margin-bottom: 15px; font-size: 24px; font-weight: 700;\">\n                    Network Restriction Detected\n                </h3>\n                \n                <p style=\"color: #666; margin-bottom: 25px; line-height: 1.6; font-size: 16px;\">\n                    The WhatsApp group link is blocked by network restrictions. Please try one of these alternative methods:\n                </p>\n                \n                <div style=\"display: grid; gap: 15px; margin-bottom: 25px;\">\n                    ${whatsappAlternatives.map((alt, index) => `\n                        <div style=\"background: linear-gradient(135deg, #f8f9fa, #e9ecef); border: 2px solid #dee2e6; \n                                    border-radius: 12px; padding: 20px; text-align: left; cursor: pointer; \n                                    transition: all 0.3s ease; position: relative;\" \n                             onclick=\"${alt.action === 'copy' ? `copyToClipboard('${alt.data}'); this.style.background='linear-gradient(135deg, #d4edda, #c3e6cb)'; this.querySelector('.copy-feedback').style.display='block'; setTimeout(() => { this.style.background='linear-gradient(135deg, #f8f9fa, #e9ecef)'; this.querySelector('.copy-feedback').style.display='none'; }, 2000);` : `attemptAlternativeWhatsApp('${alt.url}')`}\" \n                             onmouseover=\"this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 25px rgba(0,0,0,0.15)'\" \n                             onmouseout=\"this.style.transform='translateY(0)'; this.style.boxShadow='none'\">\n                            \n                            <div style=\"display: flex; align-items: center; gap: 15px;\">\n                                <div style=\"font-size: 32px;\">${alt.icon}</div>\n                                <div style=\"flex: 1;\">\n                                    <h4 style=\"margin: 0 0 5px 0; color: #333; font-size: 16px; font-weight: 600;\">\n                                        ${alt.title}\n                                    </h4>\n                                    <p style=\"margin: 0; color: #666; font-size: 14px; line-height: 1.4;\">\n                                        ${alt.description}\n                                    </p>\n                                    ${alt.action === 'copy' ? `\n                                        <div class=\"copy-feedback\" style=\"display: none; color: #28a745; font-size: 12px; font-weight: bold; margin-top: 5px;\">\n                                            \u2713 Copied to clipboard!\n                                        </div>\n                                    ` : ''}\n                                </div>\n                                <div style=\"color: #25D366; font-size: 20px;\">\u2192</div>\n                            </div>\n                        </div>\n                    `).join('')}\n                </div>\n                \n                <div style=\"background: linear-gradient(135deg, #fff3cd, #ffeaa7); border: 2px solid #ffc107; \n                            border-radius: 12px; padding: 20px; margin-bottom: 20px;\">\n                    <h4 style=\"margin: 0 0 10px 0; color: #856404; display: flex; align-items: center; gap: 8px;\">\n                        \ud83d\udca1 <span>Alternative: Manual Contact</span>\n                    </h4>\n                    <p style=\"margin: 0; color: #856404; font-size: 14px; line-height: 1.4;\">\n                        Open WhatsApp manually and search for: <strong>+62 858-9087-4888</strong><br>\n                        Or visit: <strong>Apotek Alpro Official</strong>\n                    </p>\n                </div>\n                \n                <button onclick=\"retryWhatsAppConnection()\" \n                        style=\"background: linear-gradient(135deg, #25D366, #128C7E); color: white; border: none; \n                               padding: 15px 30px; border-radius: 12px; cursor: pointer; font-weight: 700; \n                               font-size: 16px; display: inline-flex; align-items: center; gap: 10px; \n                               box-shadow: 0 4px 15px rgba(37, 211, 102, 0.3); transition: all 0.3s ease;\" \n                        onmouseover=\"this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(37, 211, 102, 0.4)'\" \n                        onmouseout=\"this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(37, 211, 102, 0.3)'\">\n                    \ud83d\udd04 Retry Connection\n                </button>\n            </div>\n        </div>\n        \n        <style>\n            @keyframes fallbackFadeIn {\n                from { opacity: 0; }\n                to { opacity: 1; }\n            }\n            @keyframes fallbackSlideUp {\n                from { opacity: 0; transform: translateY(30px) scale(0.95); }\n                to { opacity: 1; transform: translateY(0) scale(1); }\n            }\n            @keyframes warningPulse {\n                0%, 100% { transform: scale(1); }\n                50% { transform: scale(1.1); }\n            }\n        </style>\n    `;\n    \n    const fallbackElement = document.createElement('div');\n    fallbackElement.innerHTML = fallbackHtml;\n    document.body.appendChild(fallbackElement);\n    \n    console.log('\ud83d\udcf1 WhatsApp network bypass fallback displayed (static)');\n}\n\n// Alternative WhatsApp attempt function (static version)\nfunction attemptAlternativeWhatsApp(url) {\n    console.log('\ud83d\udcf1 Attempting alternative WhatsApp method (static):', url);\n    \n    // Multiple attempt strategies\n    const methods = [\n        () => window.open(url, '_blank', 'noopener,noreferrer'),\n        () => {\n            const link = document.createElement('a');\n            link.href = url;\n            link.click();\n        },\n        () => {\n            window.location.href = url;\n        }\n    ];\n    \n    methods.forEach((method, index) => {\n        setTimeout(() => {\n            try {\n                method();\n                console.log(`\ud83d\udcf1 Alternative method ${index + 1} executed (static)`);\n            } catch (error) {\n                console.error(`\ud83d\udcf1 Alternative method ${index + 1} failed (static):`, error);\n            }\n        }, index * 1000);\n    });\n}\n\n// Retry function with fresh approach (static version)\nfunction retryWhatsAppConnection() {\n    console.log('\ud83d\udcf1 Retrying WhatsApp connection with fresh approach (static)');\n    \n    // Close current fallback\n    const overlay = document.querySelector('.whatsapp-fallback-overlay');\n    if (overlay) overlay.remove();\n    \n    // Wait a moment then try again\n    setTimeout(() => {\n        const whatsappGroupUrl = 'https://chat.whatsapp.com/HukQMDMTtJjFi12x1lAty3';\n        openWhatsAppWithMultipleMethods(whatsappGroupUrl);\n    }, 500);\n}\n\nfunction showWhatsAppFallbackMessage(url) {"
    // Remove any existing fallback messages
    const existing = document.querySelectorAll('.whatsapp-fallback-overlay');
    existing.forEach(el => el.remove());
    
    const fallbackHtml = `
        <div class="whatsapp-fallback-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                    background: rgba(0,0,0,0.7); z-index: 99998; display: flex; align-items: center; justify-content: center;" 
             onclick="this.remove();">
            <div style="position: relative; background: white; border: 3px solid #25D366; border-radius: 20px; 
                        padding: 40px; max-width: 500px; width: 90%; text-align: center; box-shadow: 0 15px 40px rgba(0,0,0,0.4);
                        animation: fallbackFadeIn 0.3s ease-out;" onclick="event.stopPropagation();">
                <button onclick="this.closest('.whatsapp-fallback-overlay').remove()" 
                        style="position: absolute; top: 15px; right: 15px; background: none; border: none; 
                               font-size: 24px; color: #999; cursor: pointer; width: 30px; height: 30px;
                               display: flex; align-items: center; justify-content: center;">&times;</button>
                
                <div style="color: #25D366; font-size: 64px; margin-bottom: 25px; animation: whatsappBounce 0.6s ease-out;">
                    <i class="fab fa-whatsapp"></i>
                </div>
                
                <h3 style="color: #333; margin-bottom: 15px; font-size: 24px; font-weight: 700;">
                    Connect via WhatsApp
                </h3>
                
                <p style="color: #666; margin-bottom: 25px; line-height: 1.6; font-size: 16px;">
                    If the automatic redirect didn't work, please use one of the methods below to connect:
                </p>
                
                <div style="background: linear-gradient(135deg, #f8f9fa, #e9ecef); padding: 20px; border-radius: 12px; 
                            margin-bottom: 25px; border: 1px solid #dee2e6;">
                    <p style="margin: 0 0 10px 0; font-weight: 600; color: #495057;">Direct Link:</p>
                    <div style="background: white; padding: 12px; border-radius: 8px; word-break: break-all; 
                                border: 1px solid #ced4da;">
                        <a href="${url}" target="_blank" style="color: #25D366; text-decoration: none; font-weight: 600;">
                            ${url}
                        </a>
                    </div>
                </div>
                
                <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                    <button onclick="attemptMultipleWhatsAppMethods('${url}')" 
                            style="background: linear-gradient(135deg, #25D366, #128C7E); color: white; border: none; 
                                   padding: 15px 30px; border-radius: 12px; cursor: pointer; font-weight: 700; 
                                   font-size: 16px; display: flex; align-items: center; gap: 10px; 
                                   box-shadow: 0 4px 15px rgba(37, 211, 102, 0.3); transition: all 0.3s ease;
                                   min-width: 160px;" 
                            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(37, 211, 102, 0.4)'" 
                            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(37, 211, 102, 0.3)'">
                        <i class="fab fa-whatsapp"></i>
                        Try Again
                    </button>
                    
                    <button onclick="copyToClipboard('${url}'); this.textContent='Copied!'; setTimeout(() => this.innerHTML='<i class=\\"fas fa-copy\\"></i> Copy Link', 2000)" 
                            style="background: linear-gradient(135deg, #6c757d, #495057); color: white; border: none; 
                                   padding: 15px 25px; border-radius: 12px; cursor: pointer; font-weight: 600; 
                                   font-size: 16px; display: flex; align-items: center; gap: 8px;
                                   transition: all 0.3s ease;" 
                            onmouseover="this.style.transform='translateY(-2px)'" 
                            onmouseout="this.style.transform='translateY(0)'">
                        <i class="fas fa-copy"></i>
                        Copy Link
                    </button>
                </div>
                
                <p style="color: #6c757d; margin-top: 20px; font-size: 14px; line-height: 1.4;">
                    💡 <strong>Tip:</strong> If you're on mobile, try copying the link and opening it in your browser.
                </p>
            </div>
        </div>
        
        <style>
            @keyframes fallbackFadeIn {
                from { opacity: 0; transform: scale(0.9) translateY(-20px); }
                to { opacity: 1; transform: scale(1) translateY(0); }
            }
            @keyframes whatsappBounce {
                0% { transform: scale(0.3) rotate(-15deg); }
                50% { transform: scale(1.1) rotate(5deg); }
                100% { transform: scale(1) rotate(0deg); }
            }
        </style>
    `;
    
    const fallbackElement = document.createElement('div');
    fallbackElement.innerHTML = fallbackHtml;
    document.body.appendChild(fallbackElement);
    
    console.log('📱 Enhanced WhatsApp fallback message displayed (static)');
}

// Enhanced attempt function for the fallback (static version)
function attemptMultipleWhatsAppMethods(url) {
    console.log('📱 Attempting multiple WhatsApp opening methods from fallback (static)');
    
    // Try different approaches with slight delays
    const methods = [
        () => window.open(url, '_blank', 'noopener,noreferrer,width=800,height=600,resizable=yes'),
        () => {
            const link = document.createElement('a');
            link.href = url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },
        () => {
            navigator.clipboard?.writeText(url).then(() => {
                alert('WhatsApp link copied to clipboard! Please paste it in your browser.');
            }).catch(() => {
                prompt('Copy this WhatsApp link:', url);
            });
        },
        () => window.location.assign(url)
    ];
    
    let methodIndex = 0;
    
    function tryNextMethod() {
        if (methodIndex < methods.length) {
            try {
                console.log(`📱 Trying method ${methodIndex + 1}/${methods.length} (static)`);
                methods[methodIndex]();
                methodIndex++;
                
                // Try next method after delay if previous didn't work
                if (methodIndex < methods.length) {
                    setTimeout(tryNextMethod, 1500);
                }
            } catch (error) {
                console.error(`📱 Method ${methodIndex + 1} failed (static):`, error);
                methodIndex++;
                if (methodIndex < methods.length) {
                    setTimeout(tryNextMethod, 500);
                }
            }
        }
    }
    
    tryNextMethod();
}

// Copy to clipboard helper (static version)
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            console.log('📱 WhatsApp URL copied to clipboard (static)');
        }).catch(err => {
            console.error('📱 Failed to copy to clipboard (static):', err);
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        console.log('📱 WhatsApp URL copied using fallback method (static)');
    } catch (err) {
        console.error('📱 Fallback copy failed (static):', err);
        prompt('Copy this WhatsApp link:', text);
    }
    document.body.removeChild(textArea);
}

// Enhanced WhatsApp functions for homepage and TikTok Cuan (static version)
function openWhatsAppContactFromHomepage() {
    console.log('📱 Opening WhatsApp from homepage contact section (static)');
    
    const whatsappGroupUrl = 'https://chat.whatsapp.com/HukQMDMTtJjFi12x1lAty3';
    
    // Use our enhanced multi-method approach
    openWhatsAppWithMultipleMethods(whatsappGroupUrl);
    
    console.log('📱 WhatsApp contact opened from homepage (static)');
}

function openWhatsAppDirectFromTikTok() {
    console.log('📱 Opening WhatsApp from TikTok Cuan direct button (static)');
    
    const whatsappGroupUrl = 'https://chat.whatsapp.com/HukQMDMTtJjFi12x1lAty3';
    
    // Use our enhanced multi-method approach
    openWhatsAppWithMultipleMethods(whatsappGroupUrl);
    
    console.log('📱 WhatsApp TikTok Cuan group opened (static)');
}

// Global functions for inline event handlers
window.refreshBPT = refreshBPT;
window.openInNewTab = openInNewTab;
window.refreshIframe = refreshIframe;
window.refreshTikTokData = refreshTikTokData;
window.retryTikTokLoad = retryTikTokLoad;
window.initWhatsAppAPI = initWhatsAppAPI;
window.initNetworkMonitoring = initNetworkMonitoring;
window.handleWhatsAppUrl = handleWhatsAppUrl;
window.addWhatsAppUrlInterceptor = addWhatsAppUrlInterceptor;
window.showWhatsAppPanel = showWhatsAppPanel;
window.closeWhatsAppPanel = closeWhatsAppPanel;
window.openWhatsAppWeb = openWhatsAppWeb;
window.openWhatsAppAPI = openWhatsAppAPI;
window.sendQuickMessage = sendQuickMessage;
window.sendWhatsAppMessage = sendWhatsAppMessage;
window.cancelQuickMessage = cancelQuickMessage;
window.openWhatsAppWithMultipleMethods = openWhatsAppWithMultipleMethods;
window.showWhatsAppFallbackMessage = showWhatsAppFallbackMessage;
window.attemptMultipleWhatsAppMethods = attemptMultipleWhatsAppMethods;
window.copyToClipboard = copyToClipboard;
window.fallbackCopy = fallbackCopy;
window.showWhatsAppNetworkBypassFallback = showWhatsAppNetworkBypassFallback;
window.attemptAlternativeWhatsApp = attemptAlternativeWhatsApp;
window.retryWhatsAppConnection = retryWhatsAppConnection;
window.openWhatsAppContactFromHomepage = openWhatsAppContactFromHomepage;
window.openWhatsAppDirectFromTikTok = openWhatsAppDirectFromTikTok;