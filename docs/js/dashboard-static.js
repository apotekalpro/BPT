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

// Global functions for inline event handlers
window.refreshBPT = refreshBPT;