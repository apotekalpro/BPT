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
        try {
            console.log('🔧 Initializing dashboard elements...');
            
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
            
            // Log missing elements for debugging
            if (!this.userName) console.warn('⚠️ userName element not found');
            if (!this.logoutBtn) console.warn('⚠️ logoutBtn element not found');
            if (!this.navTabs.length) console.warn('⚠️ No navigation tabs found');
            
            console.log('🔧 Elements initialized successfully');
            
        } catch (error) {
            console.error('🔧 Element initialization failed:', error);
        }
    }

    bindEvents() {
        // Navigation tabs with improved error handling
        this.navTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                try {
                    e.preventDefault();
                    const tabId = tab.dataset.tab;
                    console.log('🔄 Switching to tab:', tabId);
                    this.switchTab(tabId);
                } catch (error) {
                    console.error('🔄 Tab switch failed:', error);
                }
            });
        });

        // Logout button with improved handling
        if (this.logoutBtn) {
            this.logoutBtn.addEventListener('click', (e) => {
                try {
                    e.preventDefault();
                    console.log('🚪 Logout clicked');
                    this.handleLogout();
                } catch (error) {
                    console.error('🚪 Logout handler failed:', error);
                    // Force redirect as fallback
                    window.location.replace('/login');
                }
            });
        }

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

    async checkAuth() {
        try {
            console.log('🔐 Checking authentication...');
            
            // Check if we're already on login page to prevent redirect loop
            if (window.location.pathname === '/login' || window.location.pathname.includes('/login')) {
                console.log('🔐 Already on login page, skipping auth check');
                return;
            }
            
            const response = await fetch('/api/user', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include' // Include cookies for session
            });
            
            console.log('🔐 Auth response status:', response.status);
            
            if (!response.ok) {
                console.error('🔐 Auth response not OK:', response.status, response.statusText);
                this.showLoginPrompt();
                return;
            }
            
            const data = await response.json();
            console.log('🔐 Auth response data:', data);
            
            if (!data.user || data.user === null) {
                console.log('🔐 No authenticated user found, showing login prompt');
                this.showLoginPrompt();
                return;
            }
            
            console.log('🔐 User authenticated successfully:', data.user);
            this.currentUser = data.user;
            this.updateUserInfo();
            this.hideLoadingState();
            this.enableDashboardInteraction();
        } catch (error) {
            console.error('🔐 Auth check failed:', error);
            this.showLoginPrompt();
        }
    }
    
    redirectToLogin() {
        console.log('🔐 Redirecting to login page...');
        // Use replace to prevent back button issues
        window.location.replace('/login');
    }
    
    showLoginPrompt() {
        console.log('🔐 User not authenticated, showing login prompt');
        
        // Hide loading states immediately
        this.hideLoadingState();
        
        // Show login prompt overlay
        this.createLoginPromptOverlay();
    }
    
    createLoginPromptOverlay() {
        // Remove any existing overlay
        const existingOverlay = document.querySelector('.login-prompt-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        
        const overlay = document.createElement('div');
        overlay.className = 'login-prompt-overlay';
        overlay.innerHTML = `
            <div class="login-prompt-container">
                <div class="login-prompt-icon">
                    <i class="fas fa-lock"></i>
                </div>
                <h2>Authentication Required</h2>
                <p>You need to log in to access the Apotek Alpro BPT Portal dashboard.</p>
                <div class="login-prompt-actions">
                    <button class="login-prompt-btn primary" onclick="window.location.href='/login'">
                        <i class="fas fa-sign-in-alt"></i>
                        Go to Login
                    </button>
                    <button class="login-prompt-btn secondary" onclick="window.location.reload()">
                        <i class="fas fa-sync-alt"></i>
                        Retry
                    </button>
                </div>
            </div>
        `;
        
        // Add styles
        const styles = `
            .login-prompt-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(10px);
                z-index: 99999;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fadeInOverlay 0.4s ease-out;
            }
            .login-prompt-container {
                background: linear-gradient(135deg, #ffffff, #f8f9fa);
                border-radius: 20px;
                padding: 40px;
                text-align: center;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                border: 3px solid var(--alpro-blue, #2e5b9f);
                max-width: 500px;
                width: 90%;
                animation: slideUpPrompt 0.5s ease-out;
            }
            .login-prompt-icon {
                font-size: 64px;
                color: var(--alpro-blue, #2e5b9f);
                margin-bottom: 20px;
            }
            .login-prompt-container h2 {
                color: #333;
                margin-bottom: 15px;
                font-size: 28px;
                font-weight: 700;
            }
            .login-prompt-container p {
                color: #666;
                margin-bottom: 30px;
                font-size: 16px;
                line-height: 1.6;
            }
            .login-prompt-actions {
                display: flex;
                gap: 15px;
                justify-content: center;
                flex-wrap: wrap;
            }
            .login-prompt-btn {
                padding: 15px 30px;
                border: none;
                border-radius: 12px;
                cursor: pointer;
                font-weight: 600;
                font-size: 16px;
                display: flex;
                align-items: center;
                gap: 10px;
                transition: all 0.3s ease;
                min-width: 140px;
                justify-content: center;
            }
            .login-prompt-btn.primary {
                background: linear-gradient(135deg, var(--alpro-blue, #2e5b9f), var(--alpro-dark-blue, #1a365d));
                color: white;
            }
            .login-prompt-btn.primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(46, 91, 159, 0.4);
            }
            .login-prompt-btn.secondary {
                background: linear-gradient(135deg, #6c757d, #495057);
                color: white;
            }
            .login-prompt-btn.secondary:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(108, 117, 125, 0.4);
            }
            @keyframes fadeInOverlay {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideUpPrompt {
                from { opacity: 0; transform: translateY(30px) scale(0.9); }
                to { opacity: 1; transform: translateY(0) scale(1); }
            }
        `;
        
        // Add styles if not already added
        if (!document.getElementById('login-prompt-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'login-prompt-styles';
            styleSheet.textContent = styles;
            document.head.appendChild(styleSheet);
        }
        
        document.body.appendChild(overlay);
        console.log('🔐 Login prompt overlay displayed');
    }
    
    enableDashboardInteraction() {
        console.log('🔐 Enabling dashboard interaction');
        
        // Remove any login prompt overlays
        const existingOverlay = document.querySelector('.login-prompt-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        
        // Enable all interactive elements
        const interactiveElements = document.querySelectorAll('button, .nav-tab, .action-btn, .campaign-tab, .monitoring-tab');
        interactiveElements.forEach(el => {
            el.disabled = false;
            el.style.pointerEvents = 'auto';
            el.style.opacity = '1';
        });
        
        console.log('🔐 Dashboard interaction enabled, all buttons responsive');
    }
    
    hideLoadingState() {
        try {
            // Hide any loading indicators
            const loadingElements = document.querySelectorAll('.loading, [data-loading]');
            loadingElements.forEach(el => {
                el.style.display = 'none';
            });
            
            // Hide user loading states specifically
            const userNameEl = document.getElementById('userName');
            const userTypeEl = document.getElementById('userType');
            if (userNameEl && userNameEl.textContent === 'Loading...') {
                userNameEl.style.display = 'none';
            }
            if (userTypeEl && userTypeEl.textContent === 'Loading...') {
                userTypeEl.style.display = 'none';
            }
            
            // Show main content
            const mainContent = document.querySelector('.dashboard-main');
            if (mainContent) {
                mainContent.style.display = 'block';
                mainContent.style.opacity = '1';
                mainContent.style.pointerEvents = 'auto';
            }
            
            console.log('🔐 Loading state hidden, dashboard UI ready');
        } catch (error) {
            console.error('⚠️ Error hiding loading state:', error);
        }
    }

    updateUserInfo() {
        if (!this.currentUser) {
            console.warn('⚠️ Cannot update user info: no current user');
            return;
        }
        
        try {
            // Update user name with safe fallback
            if (this.userName) {
                this.userName.textContent = this.currentUser.displayName || 'User';
                this.userName.style.display = 'block';
            }
            
            // Update user type with safe fallback
            if (this.userType) {
                this.userType.textContent = `${(this.currentUser.type || 'general').toUpperCase()} User`;
                this.userType.style.display = 'block';
            }
            
            // Update store name if element exists
            if (this.storeName) {
                this.storeName.textContent = this.currentUser.fullStoreName || this.currentUser.displayName || 'Store';
            }
            
            // Update account manager if element exists
            if (this.accountManager) {
                this.accountManager.textContent = this.currentUser.am || this.currentUser.role || 'N/A';
            }
            
            console.log('✅ User info updated successfully:', {
                name: this.currentUser.displayName,
                type: this.currentUser.type,
                store: this.currentUser.fullStoreName
            });
        } catch (error) {
            console.error('⚠️ Error updating user info:', error);
        }
    }

    switchTab(tabId) {
        if (tabId === this.currentTab) return;
        
        this.currentTab = tabId;
        
        // Update navigation
        this.navTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabId);
        });
        
        // Update content
        this.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === tabId);
        });
        
        // Trigger tab-specific actions
        this.handleTabSwitch(tabId);
    }

    handleTabSwitch(tabId) {
        switch (tabId) {
            case 'homepage':
                this.refreshDashboardData();
                break;
            case 'campaign':
                this.loadCampaignData();
                break;
            case 'monitoring':
                this.loadMonitoringData();
                break;
            case 'health-news':
                this.loadHealthNews();
                break;
            case 'tiktok-cuan':
                this.loadTikTokCuan();
                break;
        }
    }

    async handleLogout() {
        try {
            console.log('🚪 Logging out...');
            
            // Show loading state on logout button
            const logoutBtn = this.logoutBtn;
            const originalText = logoutBtn.innerHTML;
            logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging out...';
            logoutBtn.disabled = true;
            
            const response = await fetch('/api/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });
            
            console.log('🚪 Logout response status:', response.status);
            
            // Redirect regardless of response status for better UX
            window.location.replace('/login');
            
        } catch (error) {
            console.error('🚪 Logout failed:', error);
            // Still redirect to login even if logout API fails
            window.location.replace('/login');
        }
    }

    handleQuickAction(button) {
        const actionText = button.querySelector('span').textContent;
        
        // Add visual feedback
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 150);
        
        // Handle different actions
        switch (actionText) {
            case 'New Order':
                this.showNotification('New Order feature coming soon!', 'info');
                break;
            case 'Check Inventory':
                this.showNotification('Inventory check initiated', 'success');
                break;
            case 'Customer Report':
                this.showNotification('Generating customer report...', 'info');
                break;
            case 'Generate Report':
                this.showNotification('Report generation started', 'success');
                break;
        }
    }

    refreshDashboardData() {
        // Animate metrics refresh
        const metricValues = document.querySelectorAll('.metric-value');
        metricValues.forEach((metric, index) => {
            setTimeout(() => {
                metric.style.transform = 'scale(1.1)';
                metric.style.color = 'var(--alpro-blue)';
                setTimeout(() => {
                    metric.style.transform = 'scale(1)';
                    metric.style.color = 'var(--alpro-dark-blue)';
                }, 200);
            }, index * 100);
        });
        
        this.showNotification('Dashboard data refreshed', 'success');
    }

    loadCampaignData() {
        // Placeholder for campaign data loading
        console.log('Loading campaign data...');
    }

    loadMonitoringData() {
        // Initialize monitoring tabs and load default tab
        this.loadTikTokAnalytics();
        console.log('Monitoring data section initialized');
    }

    loadTikTokAnalytics() {
        // Load TikTok analytics data
        console.log('Loading TikTok analytics...');
        // Add any specific TikTok analytics initialization here
        // For example: refresh analytics iframes, update metrics, etc.
    }

    loadPerformanceMetrics() {
        // Load performance metrics data
        console.log('Loading performance metrics...');
        // Add any specific performance metrics initialization here
        // For example: fetch performance data, update charts, etc.
    }

    loadHealthNews() {
        // Health news iframe is already loaded
        this.showNotification('Health News loaded successfully', 'success');
        console.log('Health News section loaded');
    }

    loadTikTokCuan() {
        // Initialize TikTok Cuan iframe monitoring with improved loading
        this.initTikTokIframeMonitoring();
        this.showNotification('TikTok Cuan dashboard loading...', 'info');
        console.log('TikTok Cuan section loaded');
        
        // Add loading timeout feedback
        setTimeout(() => {
            const tiktokLoading = document.getElementById('tiktokLoading');
            if (tiktokLoading && tiktokLoading.style.display !== 'none') {
                const loadingText = tiktokLoading.querySelector('p');
                if (loadingText) {
                    loadingText.innerHTML = 'TikTok Cuan is loading... This may take a moment.<br><small>The external service may be slow to respond.</small>';
                }
            }
        }, 10000); // Show extended message after 10 seconds
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
            console.log(`🔄 Loading TikTok Cuan iframe (attempt ${retryCount + 1}/${maxRetries + 1})`);

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
                        console.log(`⏰ TikTok iframe timeout, retrying... (${retryCount}/${maxRetries})`);
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
                        
                        this.showNotification('TikTok Cuan dashboard loaded successfully', 'success');
                        console.log('✅ TikTok Cuan iframe loaded successfully');
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
                        
                        this.showNotification('TikTok Cuan dashboard loaded', 'success');
                        console.log('✅ TikTok Cuan iframe loaded (cross-origin)');
                    }
                }
            }, 2000); // Give iframe time to fully load
        });

        // Monitor iframe loading errors
        tiktokFrame.addEventListener('error', (e) => {
            console.error('TikTok iframe error event:', e);
            hasLoaded = false;
            clearTimeout(loadTimeout);
            
            if (retryCount < maxRetries) {
                retryCount++;
                console.log(`🔄 Iframe error, retrying... (${retryCount}/${maxRetries})`);
                setTimeout(() => startIframeLoading(), 2000);
            } else {
                this.showTikTokError('Failed to load after multiple attempts');
            }
        });

        // Additional check for blocked content
        setTimeout(() => {
            if (!hasLoaded && retryCount === 0) {
                console.log('🔍 Checking for blocked content...');
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
            console.warn('Network connectivity check failed:', error);
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
                console.log('ℹ️ Iframe is cross-origin (normal behavior)');
                // Consider it loaded if it has the correct src
                if (iframe.src.includes('zyqsemod.gensparkspace.com')) {
                    iframe.style.display = 'block';
                    document.getElementById('tiktokLoading').style.display = 'none';
                    document.getElementById('tiktokError').style.display = 'none';
                    console.log('✅ Assuming iframe loaded (cross-origin content)');
                }
                return;
            }
            
            // Check if iframe is empty or blocked
            if (!iframe.src || iframe.src === 'about:blank') {
                console.warn('⚠️ Iframe has no source or is blank');
                this.showTikTokError('Iframe source not set properly');
            }
        } catch (error) {
            // This is expected for cross-origin iframes
            console.log('ℹ️ Cross-origin iframe access blocked (expected)');
        }
    }

    setupIframeNavigationHandling(iframe) {
        // Monitor iframe for navigation changes
        let lastUrl = iframe.src;
        
        // Check for URL changes periodically
        const checkUrlChanges = () => {
            try {
                if (iframe.contentWindow && iframe.contentWindow.location) {
                    const currentUrl = iframe.contentWindow.location.href;
                    if (currentUrl !== lastUrl) {
                        console.log('🔗 Iframe navigated from', lastUrl, 'to', currentUrl);
                        lastUrl = currentUrl;
                        
                        // Ensure navigation stays within the TikTok Cuan domain
                        if (!currentUrl.includes('zyqsemod.gensparkspace.com')) {
                            console.warn('⚠️ Iframe navigated outside allowed domain:', currentUrl);
                            // Optionally redirect back to base URL
                            // iframe.src = 'https://zyqsemod.gensparkspace.com/';
                        }
                    }
                }
            } catch (error) {
                // Cross-origin access blocked - this is expected
                // Can't monitor URL changes directly due to security restrictions
            }
        };

        // Monitor navigation changes
        setInterval(checkUrlChanges, 2000);

        // Listen for navigation messages from iframe
        window.addEventListener('message', (event) => {
            if (event.origin !== 'https://zyqsemod.gensparkspace.com') return;
            
            if (event.data && event.data.type === 'navigation_event') {
                console.log('🔗 Navigation event from iframe:', event.data);
                
                // Handle navigation within iframe context
                if (event.data.url && !event.data.url.includes('zyqsemod.gensparkspace.com')) {
                    console.log('🔗 External navigation detected, handling...');
                    
                    // For external links, open in new tab but keep iframe context
                    if (event.data.shouldOpenExternally) {
                        window.open(event.data.url, '_blank', 'noopener,noreferrer');
                        event.preventDefault?.();
                    }
                }
            }
        });

        console.log('🔗 Iframe navigation handling setup complete');
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

        const notificationMessage = customMessage || 'TikTok Cuan dashboard failed to load';
        this.showNotification(notificationMessage, 'warning');
        console.log('⚠️ TikTok Cuan iframe error:', customMessage || 'Failed to load');
    }

    switchCampaignTab(campaignId) {
        // Update campaign tab states
        const campaignTabs = document.querySelectorAll('.campaign-tab');
        const campaignContents = document.querySelectorAll('.campaign-tab-content');
        
        campaignTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.campaign === campaignId);
        });
        
        campaignContents.forEach(content => {
            content.classList.toggle('active', content.id === campaignId);
        });
        
        this.showNotification(`Switched to ${campaignId} campaign`, 'success');
    }

    switchMonitoringTab(monitorId) {
        // Update monitoring tab states
        const monitoringTabs = document.querySelectorAll('.monitoring-tab');
        const monitoringContents = document.querySelectorAll('.monitoring-tab-content');
        
        monitoringTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.monitor === monitorId);
        });
        
        monitoringContents.forEach(content => {
            content.classList.toggle('active', content.id === monitorId);
        });
        
        // Handle specific monitoring tab content loading
        switch (monitorId) {
            case 'tiktok-analytics':
                this.loadTikTokAnalytics();
                break;
            case 'performance-metrics':
                this.loadPerformanceMetrics();
                break;
        }
        
        this.showNotification(`Switched to ${monitorId.replace('-', ' ')} monitoring`, 'success');
    }

    initCalendar() {
        this.renderCalendar();
    }

    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Update month display
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        this.currentMonthElement.textContent = `${monthNames[month]} ${year}`;
        
        // Clear existing days
        this.calendarDays.innerHTML = '';
        
        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        
        // Add previous month's trailing days
        for (let i = firstDay - 1; i >= 0; i--) {
            const dayElement = this.createDayElement(daysInPrevMonth - i, true);
            this.calendarDays.appendChild(dayElement);
        }
        
        // Add current month's days
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = this.createDayElement(day, false);
            
            // Mark today
            const today = new Date();
            if (year === today.getFullYear() && 
                month === today.getMonth() && 
                day === today.getDate()) {
                dayElement.classList.add('today');
            }
            
            // Add events (sample data)
            if ([5, 15, 22, 30].includes(day)) {
                dayElement.classList.add('has-event');
            }
            
            this.calendarDays.appendChild(dayElement);
        }
        
        // Add next month's leading days
        const totalCells = this.calendarDays.children.length;
        const remainingCells = 42 - totalCells; // 6 rows × 7 days
        for (let day = 1; day <= remainingCells; day++) {
            const dayElement = this.createDayElement(day, true);
            this.calendarDays.appendChild(dayElement);
        }
    }

    createDayElement(day, isOtherMonth) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        if (isOtherMonth) {
            dayElement.classList.add('other-month');
        }
        
        dayElement.addEventListener('click', () => {
            this.handleDateClick(day, isOtherMonth);
        });
        
        return dayElement;
    }

    handleDateClick(day, isOtherMonth) {
        if (isOtherMonth) return;
        
        this.showNotification(`Selected date: ${this.currentDate.getFullYear()}-${(this.currentDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`, 'info');
    }

    initChart() {
        if (!this.chartCanvas) return;
        
        const ctx = this.chartCanvas.getContext('2d');
        
        // Sample data
        const data = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
            datasets: [{
                label: 'Monthly Revenue (₹)',
                data: [180000, 195000, 210000, 225000, 240000, 235000, 250000, 245000, 245680],
                borderColor: 'rgb(46, 91, 159)',
                backgroundColor: 'rgba(46, 91, 159, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        };
        
        const config = {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            callback: function(value) {
                                return '₹' + (value / 1000) + 'K';
                            }
                        }
                    }
                },
                elements: {
                    point: {
                        radius: 6,
                        hoverRadius: 8,
                        backgroundColor: 'rgb(46, 91, 159)',
                        borderColor: '#fff',
                        borderWidth: 2
                    }
                }
            }
        };
        
        this.chart = new Chart(ctx, config);
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: this.getNotificationColor(type),
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease-in-out'
        });
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            info: 'fa-info-circle',
            warning: 'fa-exclamation-triangle',
            error: 'fa-times-circle'
        };
        return icons[type] || icons.info;
    }

    getNotificationColor(type) {
        const colors = {
            success: 'var(--alpro-success)',
            info: 'var(--alpro-blue)',
            warning: 'var(--alpro-warning)',
            error: 'var(--alpro-error)'
        };
        return colors[type] || colors.info;
    }
}

// Calendar navigation functions (global scope for HTML onclick)
let dashboardManager;

function previousMonth() {
    if (dashboardManager) {
        dashboardManager.currentDate.setMonth(dashboardManager.currentDate.getMonth() - 1);
        dashboardManager.renderCalendar();
    }
}

function nextMonth() {
    if (dashboardManager) {
        dashboardManager.currentDate.setMonth(dashboardManager.currentDate.getMonth() + 1);
        dashboardManager.renderCalendar();
    }
}

function refreshBPT() {
    if (dashboardManager) {
        dashboardManager.refreshDashboardData();
    }
}

// Keyboard shortcuts for dashboard
class DashboardShortcuts {
    constructor() {
        this.bindShortcuts();
    }

    bindShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + 1, 2, 3, 4, 5 for tab navigation
            if ((e.ctrlKey || e.metaKey) && ['1', '2', '3', '4', '5'].includes(e.key)) {
                e.preventDefault();
                const tabIndex = parseInt(e.key) - 1;
                const tabs = ['homepage', 'campaign', 'monitoring', 'health-news', 'tiktok-cuan'];
                if (tabs[tabIndex] && dashboardManager) {
                    dashboardManager.switchTab(tabs[tabIndex]);
                }
            }
            
            // Ctrl/Cmd + R for refresh (prevent default and use custom)
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r') {
                e.preventDefault();
                if (dashboardManager) {
                    dashboardManager.refreshDashboardData();
                }
            }
            
            // Escape to close notifications
            if (e.key === 'Escape') {
                document.querySelectorAll('.notification').forEach(n => n.remove());
            }
        });
    }
}

// Auto-refresh functionality
class AutoRefresh {
    constructor(intervalMinutes = 5) {
        this.interval = intervalMinutes * 60 * 1000;
        this.startAutoRefresh();
    }

    startAutoRefresh() {
        setInterval(() => {
            if (dashboardManager && dashboardManager.currentTab === 'homepage') {
                dashboardManager.refreshDashboardData();
            }
        }, this.interval);
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('🏥 Starting Apotek Alpro Dashboard initialization...');
        
        // Check if we're on login page
        if (document.body.classList.contains('login-body')) {
            console.log('📝 On login page, skipping dashboard initialization');
            return;
        }
        
        // Initialize main dashboard manager with enhanced error handling
        try {
            dashboardManager = new DashboardManager();
            console.log('✅ Dashboard manager initialized successfully');
        } catch (error) {
            console.error('❌ Dashboard manager failed:', error);
            showDashboardError(error);
            return;
        }
        
        // Initialize additional features with graceful error handling
        initializeOptionalFeatures();
        
        console.log('🏥 Apotek Alpro Dashboard Fully Initialized');
        console.log('⌨️  Shortcuts: Ctrl+1/2/3 for tabs, Ctrl+R for refresh, Esc to close notifications');
        
    } catch (error) {
        console.error('🚨 Critical dashboard initialization failed:', error);
        showDashboardError(error);
    }
});

function initializeOptionalFeatures() {
    // Initialize shortcuts with error handling
    try {
        const dashboardShortcuts = new DashboardShortcuts();
        console.log('✅ Dashboard shortcuts initialized');
    } catch (error) {
        console.warn('⚠️ Dashboard shortcuts initialization failed:', error);
    }
    
    // Initialize auto-refresh with error handling
    try {
        const autoRefresh = new AutoRefresh(5); // Refresh every 5 minutes
        console.log('✅ Auto-refresh initialized');
    } catch (error) {
        console.warn('⚠️ Auto-refresh initialization failed:', error);
    }
    
    // Initialize WhatsApp features with error handling
    try {
        initWhatsAppHandling();
        console.log('✅ WhatsApp handling initialized');
    } catch (error) {
        console.warn('⚠️ WhatsApp handling initialization failed:', error);
    }
    
    try {
        initWhatsAppAPI();
        console.log('✅ WhatsApp API initialized');
    } catch (error) {
        console.warn('⚠️ WhatsApp API initialization failed:', error);
    }
    
    try {
        initNetworkMonitoring();
        console.log('✅ Network monitoring initialized');
    } catch (error) {
        console.warn('⚠️ Network monitoring initialization failed:', error);
    }
}

function showDashboardError(error) {
    const errorMessage = error?.message || 'Unknown error occurred';
    
    document.body.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); font-family: Arial, sans-serif;">
            <div style="background: rgba(255,255,255,0.95); padding: 40px; border-radius: 20px; text-align: center; max-width: 500px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
                <h2 style="color: #dc3545; margin-bottom: 15px;">Dashboard Error</h2>
                <p style="color: #666; margin-bottom: 20px;">Error: ${errorMessage}</p>
                <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                    <button onclick="window.location.reload()" 
                            style="background: #007bff; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-size: 14px;">
                        🔄 Refresh
                    </button>
                    <button onclick="window.location.href='/login'" 
                            style="background: #28a745; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-size: 14px;">
                        🔐 Login
                    </button>
                </div>
            </div>
        </div>
    `;
}

// WhatsApp contact functions for homepage
function openWhatsAppContactFromHomepage() {
    const phoneNumber = '+6287785731144';
    const message = 'Hello from Apotek Alpro BPT Portal! I would like to get in touch with the marketing team.';
    
    console.log('📱 Opening WhatsApp contact from homepage:', phoneNumber);
    
    // Clean and format phone number
    let cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
        cleanPhone = '62' + cleanPhone.substring(1);
    }
    if (!cleanPhone.startsWith('62')) {
        cleanPhone = '62' + cleanPhone;
    }
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappWebUrl = `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`;
    const whatsappAppUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    
    // Enhanced opening with multiple methods
    openWhatsAppWithMultipleMethods(whatsappWebUrl, whatsappAppUrl);
    
    if (dashboardManager) {
        dashboardManager.showNotification('Opening WhatsApp contact...', 'success');
    }
}

// WhatsApp functions for TikTok Cuan tab
function openWhatsAppDirectFromTikTok() {
    console.log('📱 Opening WhatsApp directly from TikTok Cuan tab');
    
    const whatsappGroupUrl = 'https://chat.whatsapp.com/HukQMDMTtJjFi12x1lAty3';
    
    openWhatsAppWithMultipleMethods(whatsappGroupUrl);
    
    if (dashboardManager) {
        dashboardManager.showNotification('Opening TikTok Cuan WhatsApp Group...', 'success');
    }
}

// Enhanced WhatsApp opening function
function openWhatsAppWithMultipleMethods(primaryUrl, fallbackUrl = null) {
    console.log('📱 Opening WhatsApp with enhanced methods:', primaryUrl);
    
    const urls = fallbackUrl ? [primaryUrl, fallbackUrl] : [primaryUrl];
    let currentIndex = 0;
    let successfullyOpened = false;
    
    function tryNextUrl() {
        if (currentIndex >= urls.length || successfullyOpened) {
            if (!successfullyOpened) {
                console.log('📱 All WhatsApp methods failed, showing fallback');
                showWhatsAppNetworkBypassFallback();
            }
            return;
        }
        
        const currentUrl = urls[currentIndex];
        console.log(`📱 Trying WhatsApp URL ${currentIndex + 1}/${urls.length}:`, currentUrl);
        
        try {
            // Method 1: Enhanced window.open
            const whatsappWindow = window.open(currentUrl, '_blank', 'noopener,noreferrer,width=800,height=600,scrollbars=yes,resizable=yes');
            
            if (whatsappWindow) {
                successfullyOpened = true;
                console.log('✅ WhatsApp window opened successfully');
                return;
            }
        } catch (error) {
            console.error('📱 Window.open failed:', error);
        }
        
        // Method 2: Link creation and click
        try {
            const link = document.createElement('a');
            link.href = currentUrl;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.style.display = 'none';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            successfullyOpened = true;
            console.log('✅ Link click method executed successfully');
            return;
        } catch (error) {
            console.error('📱 Link click method failed:', error);
        }
        
        // Try next URL after a delay
        currentIndex++;
        if (currentIndex < urls.length) {
            setTimeout(tryNextUrl, 1000);
        } else if (!successfullyOpened) {
            showWhatsAppNetworkBypassFallback();
        }
    }
    
    tryNextUrl();
}

// Cancel quick message function
function cancelQuickMessage() {
    const quickForm = document.getElementById('quickMessageForm');
    if (quickForm) {
        quickForm.style.display = 'none';
        
        // Clear form fields
        const phoneInput = document.getElementById('phoneNumber');
        const messageInput = document.getElementById('messageText');
        if (phoneInput) phoneInput.value = '';
        if (messageInput) messageInput.value = '';
    }
}

// WhatsApp iframe handling functions
function initWhatsAppHandling() {
    // Wait for iframes to load then monitor them
    setTimeout(() => {
        const iframes = document.querySelectorAll('iframe');
        
        iframes.forEach(iframe => {
            // Monitor for console errors that might indicate WhatsApp blocking
            const originalConsoleError = console.error;
            console.error = function(...args) {
                const errorMessage = args.join(' ').toLowerCase();
                if (errorMessage.includes('whatsapp') || 
                    errorMessage.includes('refused to connect') ||
                    errorMessage.includes('x-frame-options')) {
                    
                    // Find iframe that might be causing the error
                    document.querySelectorAll('iframe').forEach(frame => {
                        if (frame.contentWindow) {
                            showWhatsAppAlternative(frame);
                        }
                    });
                }
                originalConsoleError.apply(console, args);
            };
            
            // Monitor iframe load errors
            iframe.addEventListener('error', function() {
                console.log('📱 Iframe load error detected');
                showWhatsAppAlternative(iframe);
            });
            
            // Check for X-Frame-Options errors
            iframe.addEventListener('load', function() {
                // Add a small delay to catch frame-options errors
                setTimeout(() => {
                    try {
                        // This will throw an error if X-Frame-Options blocks the content
                        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                        if (!iframeDoc) {
                            // Likely blocked by X-Frame-Options
                            showWhatsAppAlternative(iframe);
                        }
                    } catch (e) {
                        if (e.name === 'SecurityError') {
                            // This is normal cross-origin restriction, not necessarily WhatsApp
                            // Only show alternative if we suspect it's WhatsApp related
                            if (iframe.src && (iframe.src.includes('whatsapp') || 
                                              iframe.contentWindow === null)) {
                                showWhatsAppAlternative(iframe);
                            }
                        }
                    }
                }, 1000);
            });
        });
        
        console.log('📱 WhatsApp iframe monitoring initialized');
    }, 2000);
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

// Enhanced TikTok retry function
function retryTikTokLoad() {
    const tiktokFrame = document.getElementById('tiktokFrame');
    const tiktokLoading = document.getElementById('tiktokLoading');
    const tiktokError = document.getElementById('tiktokError');
    
    if (!tiktokFrame || !tiktokLoading || !tiktokError) return;
    
    console.log('🔄 Manual retry of TikTok Cuan load...');
    
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
        if (dashboardManager && dashboardManager.startIframeLoading) {
            dashboardManager.startIframeLoading();
        } else {
            // Fallback if monitoring is not available
            tiktokFrame.src = 'https://zyqsemod.gensparkspace.com/';
        }
    }, 500);
}

// Network status monitoring
function initNetworkMonitoring() {
    // Monitor online/offline status
    window.addEventListener('online', () => {
        console.log('📶 Network connection restored');
        
        // Auto-retry TikTok loading if it failed due to network issues
        const tiktokError = document.getElementById('tiktokError');
        if (tiktokError && tiktokError.style.display === 'block') {
            setTimeout(() => {
                console.log('🔄 Auto-retrying TikTok load after network restoration...');
                retryTikTokLoad();
            }, 2000);
        }
    });
    
    window.addEventListener('offline', () => {
        console.log('📵 Network connection lost');
        
        if (dashboardManager) {
            dashboardManager.showNotification('Network connection lost', 'warning');
        }
    });
}

// Enhanced WhatsApp API integration for TikTok Cuan
function initWhatsAppAPI() {
    console.log('📱 Initializing WhatsApp API integration...');
    
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
                    console.log('📱 WhatsApp-related message detected:', event.data);
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
    
    console.log('📱 WhatsApp API integration initialized for TikTok Cuan');
}

function handleWhatsAppRequest(data) {
    console.log('📱 WhatsApp API request received:', data);
    
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
            
            // Show user notification and try opening WhatsApp
            if (dashboardManager) {
                dashboardManager.showNotification(`Opening WhatsApp for ${phoneNumber}...`, 'info');
            }
            
            // Try specific contact first if phone number provided
            const newWindow = window.open(whatsappWebUrl, '_blank', 'noopener,noreferrer,width=800,height=600');
            
            // Fallback: if window didn't open, try mobile method, then group
            setTimeout(() => {
                if (!newWindow || newWindow.closed) {
                    console.log('📱 Trying WhatsApp mobile fallback...');
                    const mobileWindow = window.open(whatsappAppUrl, '_blank', 'noopener,noreferrer');
                    
                    // Ultimate fallback: open group
                    setTimeout(() => {
                        if (!mobileWindow || mobileWindow.closed) {
                            console.log('📱 Opening WhatsApp Group as final fallback...');
                            window.open(whatsappGroupUrl, '_blank', 'noopener,noreferrer');
                        }
                    }, 2000);
                }
            }, 2000);
            
            // Notify iframe of success
            sendWhatsAppResponse(data.requestId, true, 'WhatsApp opened successfully');
            console.log(`📱 WhatsApp opened for ${cleanPhone}: ${message}`);
            
        } else if (data.action === 'open_whatsapp') {
            // Open specific WhatsApp group
            if (dashboardManager) {
                dashboardManager.showNotification('Opening WhatsApp Group...', 'info');
            }
            
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
            console.log('📱 WhatsApp button clicked from iframe');
            showWhatsAppPanel();
            
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
    if (dashboardManager) {
        dashboardManager.showNotification(
            `TikTok Cuan: ${data.error || 'An error occurred'}`, 
            'warning'
        );
    }
}

function showWhatsAppPanel() {
    const whatsappPanel = document.getElementById('whatsappIntegration');
    if (whatsappPanel) {
        whatsappPanel.style.display = 'block';
        console.log('📱 WhatsApp panel opened');
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
    
    console.log('📱 Attempting to open WhatsApp Group:', whatsappGroupUrl);
    
    // Use the enhanced multi-method approach
    openWhatsAppWithMultipleMethods(whatsappGroupUrl);
    
    closeWhatsAppPanel();
    
    if (dashboardManager) {
        dashboardManager.showNotification('Opening WhatsApp Group...', 'success');
    }
}

function openWhatsAppAPI() {
    // Use the same enhanced opening method
    openWhatsAppWeb();
}

// New network bypass fallback for blocked URLs
function showWhatsAppNetworkBypassFallback() {
    // Remove any existing fallback messages
    const existing = document.querySelectorAll('.whatsapp-fallback-overlay');
    existing.forEach(el => el.remove());
    
    const whatsappAlternatives = [
        {
            title: 'WhatsApp Web',
            url: 'https://web.whatsapp.com/',
            description: 'Open WhatsApp Web and search for our contact',
            icon: '🌐'
        },
        {
            title: 'Direct Phone Contact',
            url: 'tel:+6285890874888',
            description: 'Call us directly',
            icon: '📞'
        },
        {
            title: 'WhatsApp Mobile App',
            url: 'whatsapp://send?phone=6285890874888&text=Hello%20from%20Apotek%20Alpro',
            description: 'Open in WhatsApp mobile app',
            icon: '📱'
        },
        {
            title: 'Copy Phone Number',
            action: 'copy',
            data: '+62 858-9087-4888',
            description: 'Copy and paste in WhatsApp',
            icon: '📋'
        }
    ];
    
    const fallbackHtml = `
        <div class="whatsapp-fallback-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                    background: rgba(0,0,0,0.8); z-index: 99999; display: flex; align-items: center; justify-content: center;
                    animation: fallbackFadeIn 0.4s ease-out;" 
             onclick="this.remove();">
            <div style="position: relative; background: white; border: 3px solid #25D366; border-radius: 20px; 
                        padding: 30px; max-width: 600px; width: 95%; text-align: center; box-shadow: 0 15px 40px rgba(0,0,0,0.5);
                        animation: fallbackSlideUp 0.4s ease-out; max-height: 90vh; overflow-y: auto;" 
                 onclick="event.stopPropagation();">
                
                <button onclick="this.closest('.whatsapp-fallback-overlay').remove()" 
                        style="position: absolute; top: 15px; right: 15px; background: none; border: none; 
                               font-size: 28px; color: #999; cursor: pointer; width: 35px; height: 35px;
                               display: flex; align-items: center; justify-content: center; border-radius: 50%;
                               transition: background 0.2s;" 
                        onmouseover="this.style.background='#f0f0f0'" 
                        onmouseout="this.style.background='none'">&times;</button>
                
                <div style="color: #dc3545; font-size: 64px; margin-bottom: 20px; animation: warningPulse 2s infinite;">
                    ⚠️
                </div>
                
                <h3 style="color: #333; margin-bottom: 15px; font-size: 24px; font-weight: 700;">
                    Network Restriction Detected
                </h3>
                
                <p style="color: #666; margin-bottom: 25px; line-height: 1.6; font-size: 16px;">
                    The WhatsApp group link is blocked by network restrictions. Please try one of these alternative methods:
                </p>
                
                <div style="display: grid; gap: 15px; margin-bottom: 25px;">
                    ${whatsappAlternatives.map((alt, index) => `
                        <div style="background: linear-gradient(135deg, #f8f9fa, #e9ecef); border: 2px solid #dee2e6; 
                                    border-radius: 12px; padding: 20px; text-align: left; cursor: pointer; 
                                    transition: all 0.3s ease; position: relative;" 
                             onclick="${alt.action === 'copy' ? `copyToClipboard('${alt.data}'); this.style.background='linear-gradient(135deg, #d4edda, #c3e6cb)'; this.querySelector('.copy-feedback').style.display='block'; setTimeout(() => { this.style.background='linear-gradient(135deg, #f8f9fa, #e9ecef)'; this.querySelector('.copy-feedback').style.display='none'; }, 2000);` : `attemptAlternativeWhatsApp('${alt.url}')`}" 
                             onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 25px rgba(0,0,0,0.15)'" 
                             onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                            
                            <div style="display: flex; align-items: center; gap: 15px;">
                                <div style="font-size: 32px;">${alt.icon}</div>
                                <div style="flex: 1;">
                                    <h4 style="margin: 0 0 5px 0; color: #333; font-size: 16px; font-weight: 600;">
                                        ${alt.title}
                                    </h4>
                                    <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.4;">
                                        ${alt.description}
                                    </p>
                                    ${alt.action === 'copy' ? `
                                        <div class="copy-feedback" style="display: none; color: #28a745; font-size: 12px; font-weight: bold; margin-top: 5px;">
                                            ✓ Copied to clipboard!
                                        </div>
                                    ` : ''}
                                </div>
                                <div style="color: #25D366; font-size: 20px;">→</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div style="background: linear-gradient(135deg, #fff3cd, #ffeaa7); border: 2px solid #ffc107; 
                            border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                    <h4 style="margin: 0 0 10px 0; color: #856404; display: flex; align-items: center; gap: 8px;">
                        💡 <span>Alternative: Manual Contact</span>
                    </h4>
                    <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.4;">
                        Open WhatsApp manually and search for: <strong>+62 858-9087-4888</strong><br>
                        Or visit: <strong>Apotek Alpro Official</strong>
                    </p>
                </div>
                
                <button onclick="retryWhatsAppConnection()" 
                        style="background: linear-gradient(135deg, #25D366, #128C7E); color: white; border: none; 
                               padding: 15px 30px; border-radius: 12px; cursor: pointer; font-weight: 700; 
                               font-size: 16px; display: inline-flex; align-items: center; gap: 10px; 
                               box-shadow: 0 4px 15px rgba(37, 211, 102, 0.3); transition: all 0.3s ease;" 
                        onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(37, 211, 102, 0.4)'" 
                        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(37, 211, 102, 0.3)'">
                    🔄 Retry Connection
                </button>
            </div>
        </div>
        
        <style>
            @keyframes fallbackFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes fallbackSlideUp {
                from { opacity: 0; transform: translateY(30px) scale(0.95); }
                to { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes warningPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
        </style>
    `;
    
    const fallbackElement = document.createElement('div');
    fallbackElement.innerHTML = fallbackHtml;
    document.body.appendChild(fallbackElement);
    
    console.log('📱 WhatsApp network bypass fallback displayed');
}

// Alternative WhatsApp attempt function
function attemptAlternativeWhatsApp(url) {
    console.log('📱 Attempting alternative WhatsApp method:', url);
    
    // Multiple attempt strategies
    const methods = [
        () => window.open(url, '_blank', 'noopener,noreferrer'),
        () => {
            const link = document.createElement('a');
            link.href = url;
            link.click();
        },
        () => {
            window.location.href = url;
        }
    ];
    
    methods.forEach((method, index) => {
        setTimeout(() => {
            try {
                method();
                console.log(`📱 Alternative method ${index + 1} executed`);
            } catch (error) {
                console.error(`📱 Alternative method ${index + 1} failed:`, error);
            }
        }, index * 1000);
    });
}

// Retry function with fresh approach
function retryWhatsAppConnection() {
    console.log('📱 Retrying WhatsApp connection with fresh approach');
    
    // Close current fallback
    const overlay = document.querySelector('.whatsapp-fallback-overlay');
    if (overlay) overlay.remove();
    
    // Wait a moment then try again
    setTimeout(() => {
        const whatsappGroupUrl = 'https://chat.whatsapp.com/HukQMDMTtJjFi12x1lAty3';
        openWhatsAppWithMultipleMethods(whatsappGroupUrl);
    }, 500);
}

function showWhatsAppFallbackMessage(url) {
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
    
    console.log('📱 Enhanced WhatsApp fallback message displayed');
}

// Enhanced attempt function for the fallback
function attemptMultipleWhatsAppMethods(url) {
    console.log('📱 Attempting multiple WhatsApp opening methods from fallback');
    
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
                console.log(`📱 Trying method ${methodIndex + 1}/${methods.length}`);
                methods[methodIndex]();
                methodIndex++;
                
                // Try next method after delay if previous didn't work
                if (methodIndex < methods.length) {
                    setTimeout(tryNextMethod, 1500);
                }
            } catch (error) {
                console.error(`📱 Method ${methodIndex + 1} failed:`, error);
                methodIndex++;
                if (methodIndex < methods.length) {
                    setTimeout(tryNextMethod, 500);
                }
            }
        }
    }
    
    tryNextMethod();
}

// Copy to clipboard helper
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            console.log('📱 WhatsApp URL copied to clipboard');
        }).catch(err => {
            console.error('📱 Failed to copy to clipboard:', err);
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
        console.log('📱 WhatsApp URL copied using fallback method');
    } catch (err) {
        console.error('📱 Fallback copy failed:', err);
        prompt('Copy this WhatsApp link:', text);
    }
    document.body.removeChild(textArea);
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
        console.log('📱 Attempting to send WhatsApp message to:', phoneNumber);
        
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
            console.log('📱 WhatsApp Web window result:', contactWindow);
        } catch (error) {
            console.error('📱 WhatsApp Web window.open failed:', error);
        }
        
        // Method 2: If window.open fails, try creating a link and clicking it
        if (!contactWindow || contactWindow.closed) {
            console.log('📱 Trying fallback method: creating link element for contact');
            try {
                const link = document.createElement('a');
                link.href = whatsappWebUrl;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                console.log('📱 Contact link click method executed');
            } catch (error) {
                console.error('📱 Contact link click method failed:', error);
            }
        }
        
        // Method 3: Mobile WhatsApp fallback
        setTimeout(() => {
            if (!contactWindow || contactWindow.closed) {
                console.log('📱 Trying mobile WhatsApp URL as fallback');
                try {
                    const mobileWindow = window.open(whatsappAppUrl, '_blank', 'noopener,noreferrer');
                    
                    // Ultimate fallback: WhatsApp Group
                    setTimeout(() => {
                        if (!mobileWindow || mobileWindow.closed) {
                            console.log('📱 Opening WhatsApp Group as ultimate fallback');
                            openWhatsAppWithMultipleMethods(whatsappGroupUrl);
                        }
                    }, 2000);
                } catch (error) {
                    console.error('📱 Mobile WhatsApp failed:', error);
                    openWhatsAppWithMultipleMethods(whatsappGroupUrl);
                }
            }
        }, 2000);
        
    } else {
        // No phone number, open group directly with enhanced methods
        console.log('📱 Opening WhatsApp Group directly (no phone number provided)');
        openWhatsAppWithMultipleMethods(whatsappGroupUrl);
    }
    
    // Clear form and close panel
    phoneInput.value = '';
    messageInput.value = '';
    closeWhatsAppPanel();
    
    if (dashboardManager) {
        dashboardManager.showNotification('Opening WhatsApp...', 'success');
    }
    
    console.log('📱 Enhanced WhatsApp message/group access initiated');
}

// Enhanced WhatsApp opening function with network bypass strategies
function openWhatsAppWithMultipleMethods(url) {
    console.log('📱 Opening WhatsApp with network bypass methods:', url);
    
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
                console.log('📱 All WhatsApp URL methods failed, showing fallback UI');
                showWhatsAppNetworkBypassFallback();
            }
            return;
        }
        
        const currentUrl = alternativeUrls[currentUrlIndex];
        console.log(`📱 Trying WhatsApp URL ${currentUrlIndex + 1}/${alternativeUrls.length}:`, currentUrl);
        
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
                console.log('📱 WhatsApp bypass window opened successfully');
                return;
            }
        } catch (error) {
            console.error('📱 Enhanced window.open failed:', error);
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
            
            console.log('📱 Enhanced link click method executed for URL:', currentUrl);
            successfullyOpened = true;
            return;
        } catch (error) {
            console.error('📱 Enhanced link click method failed:', error);
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
            
            console.log('📱 Form submission method executed for URL:', currentUrl);
            successfullyOpened = true;
            return;
        } catch (error) {
            console.error('📱 Form submission method failed:', error);
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
            console.log('📱 All methods timed out, showing advanced fallback');
            showWhatsAppNetworkBypassFallback();
        }
    }, 8000);
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
    console.log('📱 WhatsApp trigger button added');
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
                console.log('📱 WhatsApp link intercepted:', href || text);
                
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
    
    console.log('📱 WhatsApp URL interceptor added');
}

function handleWhatsAppUrl(url) {
    try {
        console.log('📱 Processing WhatsApp URL:', url);
        
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
            
            if (dashboardManager) {
                dashboardManager.showNotification(`WhatsApp opened for ${phoneNumber}`, 'success');
            }
        } else {
            // No phone number found, open WhatsApp Group
            const whatsappGroupUrl = 'https://chat.whatsapp.com/HukQMDMTtJjFi12x1lAty3';
            window.open(whatsappGroupUrl, '_blank', 'noopener,noreferrer');
        }
        
    } catch (error) {
        console.error('Error processing WhatsApp URL:', error);
        // Fallback: open WhatsApp Group
        const whatsappGroupUrl = 'https://chat.whatsapp.com/HukQMDMTtJjFi12x1lAty3';
        window.open(whatsappGroupUrl, '_blank', 'noopener,noreferrer');
    }
}

// Enhanced WhatsApp functions for homepage and TikTok Cuan
function openWhatsAppContactFromHomepage() {
    console.log('📱 Opening WhatsApp from homepage contact section');
    
    const phoneNumber = '+6287785731144';
    const whatsappUrl = `https://wa.me/6287785731144`;
    
    // Simple direct opening
    try {
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        console.log('📱 WhatsApp direct contact opened:', whatsappUrl);
    } catch (error) {
        console.error('📱 Failed to open WhatsApp:', error);
        // Fallback: direct navigation
        window.location.href = whatsappUrl;
    }
    
    // Show user feedback
    if (dashboardManager) {
        dashboardManager.showNotification(`Opening WhatsApp for ${phoneNumber}...`, 'success');
    }
}

function openWhatsAppDirectFromTikTok() {
    console.log('📱 Opening WhatsApp from TikTok Cuan direct button');
    
    const whatsappGroupUrl = 'https://chat.whatsapp.com/HukQMDMTtJjFi12x1lAty3';
    
    // Simple direct opening for group
    try {
        window.open(whatsappGroupUrl, '_blank', 'noopener,noreferrer');
        console.log('📱 WhatsApp TikTok Cuan group opened:', whatsappGroupUrl);
    } catch (error) {
        console.error('📱 Failed to open WhatsApp group:', error);
        // Fallback: direct navigation
        window.location.href = whatsappGroupUrl;
    }
    
    // Show user feedback
    if (dashboardManager) {
        dashboardManager.showNotification('Opening TikTok Cuan WhatsApp Group...', 'success');
    }
}

// Make functions globally available
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