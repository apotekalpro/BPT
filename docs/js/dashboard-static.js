// Static Dashboard Functionality for GitHub Pages
console.log('🏥 Apotek Alpro Dashboard Initialized (Static Version)');

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    if (!user) {
        // Redirect to login if not authenticated
        window.location.href = 'index.html';
        return;
    }

    // Update user info display
    updateUserInfo(user);
    
    // Initialize navigation
    initializeNavigation();
    
    // Initialize logout functionality
    initializeLogout();
    
    console.log('✅ Dashboard ready for user:', user.username);
});

function updateUserInfo(user) {
    const userNameElement = document.getElementById('userName');
    const userTypeElement = document.getElementById('userType');
    
    if (userNameElement) {
        userNameElement.textContent = user.username;
    }
    
    if (userTypeElement) {
        userTypeElement.textContent = `${user.type} User`;
    }
}

function initializeNavigation() {
    const navTabs = document.querySelectorAll('.nav-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    navTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.dataset.tab;
            
            // Remove active class from all tabs and contents
            navTabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
            
            console.log(`📱 Switched to tab: ${targetTab}`);
        });
    });
}

function initializeLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Clear user data
            localStorage.removeItem('user');
            
            // Show logout message
            console.log('👋 User logged out');
            
            // Redirect to login
            window.location.href = 'index.html';
        });
    }
}

// Additional utility functions for future enhancements
function refreshBPT() {
    console.log('🔄 Refreshing BPT data...');
    // In a real implementation, this would refresh the data
    setTimeout(() => {
        console.log('✅ BPT data refreshed');
    }, 1000);
}

// Tab switching with keyboard shortcuts
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

// Add smooth scrolling for iframe content
function smoothScrollIframes() {
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
        iframe.style.scrollBehavior = 'smooth';
    });
}

// Initialize additional features
setTimeout(() => {
    smoothScrollIframes();
}, 1000);