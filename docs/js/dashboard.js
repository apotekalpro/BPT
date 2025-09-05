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

    async checkAuth() {
        try {
            const response = await fetch('/api/user');
            const data = await response.json();
            
            if (!data.user) {
                window.location.href = '/login';
                return;
            }
            
            this.currentUser = data.user;
            this.updateUserInfo();
        } catch (error) {
            console.error('Auth check failed:', error);
            window.location.href = '/login';
        }
    }

    updateUserInfo() {
        if (!this.currentUser) return;
        
        this.userName.textContent = this.currentUser.displayName || 'User';
        this.userType.textContent = `${this.currentUser.type.toUpperCase()} User`;
        
        if (this.storeName) {
            this.storeName.textContent = this.currentUser.fullStoreName || this.currentUser.displayName;
        }
        
        if (this.accountManager) {
            this.accountManager.textContent = this.currentUser.am || 'N/A';
        }
        
        // Organizational chart updated - Area Manager section removed
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
            const response = await fetch('/api/logout', {
                method: 'POST'
            });
            
            if (response.ok) {
                window.location.href = '/login';
            }
        } catch (error) {
            console.error('Logout failed:', error);
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
        // TikTok Cuan placeholder loaded
        this.showNotification('TikTok Cuan dashboard coming soon!', 'info');
        console.log('TikTok Cuan section loaded');
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
    dashboardManager = new DashboardManager();
    const dashboardShortcuts = new DashboardShortcuts();
    const autoRefresh = new AutoRefresh(5); // Refresh every 5 minutes
    
    console.log('🏥 Apotek Alpro Dashboard Initialized');
    console.log('⌨️  Shortcuts: Ctrl+1/2/3 for tabs, Ctrl+R for refresh, Esc to close notifications');
});