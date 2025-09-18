// Static Login System for GitHub Pages
class StaticLoginManager {
    constructor() {
        console.log('🏥 Apotek Alpro Static Login System Initialized');
        this.currentLoginType = 'outlet';
        this.isStatic = true;
        
        // Static user data for authentication
        this.staticUserData = {
            outlet: [
                {
                    shortStoreName: 'JKJSTT1',
                    storeName: 'Jakarta Selatan Store',
                    am: 'Account Manager 1',
                    password: 'Alpro@123'
                },
                {
                    shortStoreName: 'BEKASI1',
                    storeName: 'Bekasi Central Store',
                    am: 'Account Manager 2',
                    password: 'Alpro@123'
                },
                {
                    shortStoreName: 'DEMO',
                    storeName: 'Demo Store',
                    am: 'Demo Manager',
                    password: 'demo123'
                }
            ],
            hq: [
                {
                    name: 'Eni Khuzaimah',
                    email: 'eni.khuzaimah@apotekalpro.id',
                    role: 'Marketing Director',
                    password: 'Alpro@123'
                },
                {
                    name: 'Demo User',
                    email: 'demo@apotekalpro.id',
                    role: 'Demo Role',
                    password: 'demo123'
                }
            ]
        };
        
        this.initializeElements();
        this.bindEvents();
        this.checkExistingSession();
        
        console.log('💡 Tip: Use Alt+O for Outlet login, Alt+H for HQ login');
    }
    
    initializeElements() {
        // Get form elements safely
        this.loginForm = document.getElementById('loginForm');
        this.usernameInput = document.getElementById('username');
        this.passwordInput = document.getElementById('password');
        this.loginButton = document.getElementById('loginButton');
        this.outletBtn = document.getElementById('outletBtn');
        this.hqBtn = document.getElementById('hqBtn');
        this.errorMessage = document.getElementById('errorMessage');
        this.successMessage = document.getElementById('successMessage');
        
        // Get labels for dynamic updates
        this.usernameLabel = document.querySelector('label[for="username"]');
        this.passwordLabel = document.querySelector('label[for="password"]');
        
        console.log('🔧 Login elements initialized');
    }
    
    bindEvents() {
        // Login type switchers
        if (this.outletBtn) {
            this.outletBtn.addEventListener('click', () => this.switchLoginType('outlet'));
        }
        if (this.hqBtn) {
            this.hqBtn.addEventListener('click', () => this.switchLoginType('hq'));
        }
        
        // Form submission
        if (this.loginForm) {
            this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key === 'o') {
                e.preventDefault();
                this.switchLoginType('outlet');
            } else if (e.altKey && e.key === 'h') {
                e.preventDefault();
                this.switchLoginType('hq');
            }
        });
        
        console.log('🔧 Login events bound');
    }
    
    checkExistingSession() {
        // Check if user is already logged in
        const savedUser = localStorage.getItem('apotek_alpro_user');
        if (savedUser) {
            try {
                const user = JSON.parse(savedUser);
                console.log('🔐 Existing session found, redirecting to dashboard');
                this.redirectToDashboard();
            } catch (e) {
                console.error('🔐 Invalid session data, clearing');
                localStorage.removeItem('apotek_alpro_user');
            }
        }
    }
    
    switchLoginType(type) {
        this.currentLoginType = type;
        
        // Update button states
        if (this.outletBtn && this.hqBtn) {
            this.outletBtn.classList.toggle('active', type === 'outlet');
            this.hqBtn.classList.toggle('active', type === 'hq');
        }
        
        // Update form labels and placeholders
        if (type === 'outlet') {
            if (this.usernameLabel) this.usernameLabel.textContent = 'Store Code';
            if (this.usernameInput) {
                this.usernameInput.placeholder = 'Enter store code (e.g., JKJSTT1)';
                this.usernameInput.value = '';
            }
            if (this.passwordLabel) this.passwordLabel.textContent = 'Password';
            if (this.passwordInput) {
                this.passwordInput.placeholder = 'Enter password';
                this.passwordInput.value = '';
            }
        } else {
            if (this.usernameLabel) this.usernameLabel.textContent = 'Email';
            if (this.usernameInput) {
                this.usernameInput.placeholder = 'Enter email address';
                this.usernameInput.value = '';
            }
            if (this.passwordLabel) this.passwordLabel.textContent = 'Password';
            if (this.passwordInput) {
                this.passwordInput.placeholder = 'Enter password';
                this.passwordInput.value = '';
            }
        }
        
        // Clear messages
        this.clearMessages();
        
        console.log(`🔄 Switched to ${type} login`);
    }
    
    async handleLogin(e) {
        e.preventDefault();
        
        const username = this.usernameInput?.value?.trim();
        const password = this.passwordInput?.value?.trim();
        
        if (!username || !password) {
            this.showError('Please fill in all fields');
            return;
        }
        
        // Show loading state
        if (this.loginButton) {
            this.loginButton.disabled = true;
            this.loginButton.textContent = '🔄 Logging in...';
        }
        
        try {
            // Simulate network delay for better UX
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const result = this.authenticateUser(username, password, this.currentLoginType);
            
            if (result.success) {
                this.showSuccess(`Welcome, ${result.user.displayName}!`);
                
                // Redirect after short delay
                setTimeout(() => {
                    this.redirectToDashboard();
                }, 1000);
                
            } else {
                this.showError(result.message || 'Invalid credentials');
            }
            
        } catch (error) {
            console.error('🔐 Login error:', error);
            this.showError('Login failed. Please try again.');
        } finally {
            // Reset button state
            if (this.loginButton) {
                this.loginButton.disabled = false;
                this.loginButton.textContent = '🚀 Login';
            }
        }
    }
    
    authenticateUser(username, password, loginType) {
        console.log('🔐 Static authentication attempt:', { username, loginType });
        
        let userData = null;
        
        if (loginType === 'outlet') {
            userData = this.staticUserData.outlet.find(user => 
                user.shortStoreName && 
                user.shortStoreName.toLowerCase() === username.toLowerCase() && 
                user.password === password
            );
            
            if (userData) {
                const user = {
                    type: 'outlet',
                    displayName: userData.shortStoreName,
                    fullStoreName: userData.storeName,
                    am: userData.am,
                    shortStoreName: userData.shortStoreName
                };
                
                // Save to localStorage
                localStorage.setItem('apotek_alpro_user', JSON.stringify(user));
                console.log('✅ Outlet user authenticated:', user);
                return { success: true, user };
            }
        } else if (loginType === 'hq') {
            userData = this.staticUserData.hq.find(user => 
                user.email && 
                user.email.toLowerCase() === username.toLowerCase() && 
                user.password === password
            );
            
            if (userData) {
                const user = {
                    type: 'hq',
                    displayName: userData.name,
                    email: userData.email,
                    role: userData.role,
                    fullStoreName: userData.name
                };
                
                // Save to localStorage
                localStorage.setItem('apotek_alpro_user', JSON.stringify(user));
                console.log('✅ HQ user authenticated:', user);
                return { success: true, user };
            }
        }
        
        console.error('❌ Authentication failed for:', { username, loginType });
        return { success: false, message: 'Invalid credentials' };
    }
    
    redirectToDashboard() {
        // For GitHub Pages, redirect to dashboard.html
        if (window.location.pathname.includes('.html')) {
            window.location.href = 'dashboard.html';
        } else {
            window.location.href = '/dashboard';
        }
    }
    
    showError(message) {
        this.clearMessages();
        if (this.errorMessage) {
            this.errorMessage.textContent = message;
            this.errorMessage.style.display = 'block';
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                if (this.errorMessage) this.errorMessage.style.display = 'none';
            }, 5000);
        }
        console.error('🔐 Login error:', message);
    }
    
    showSuccess(message) {
        this.clearMessages();
        if (this.successMessage) {
            this.successMessage.textContent = message;
            this.successMessage.style.display = 'block';
        }
        console.log('✅ Login success:', message);
    }
    
    clearMessages() {
        if (this.errorMessage) this.errorMessage.style.display = 'none';
        if (this.successMessage) this.successMessage.style.display = 'none';
    }
}

// Initialize login system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.staticLogin = new StaticLoginManager();
    } catch (error) {
        console.error('🚨 Login system initialization failed:', error);
    }
});

// Demo credentials helper
function showDemoCredentials() {
    const demoInfo = `
Demo Credentials for Testing:

OUTLET LOGIN:
• Store Code: DEMO
• Password: demo123

HQ LOGIN:  
• Email: demo@apotekalpro.id
• Password: demo123

PRODUCTION CREDENTIALS:
• Store Code: JKJSTT1, Password: Alpro@123
• Email: eni.khuzaimah@apotekalpro.id, Password: Alpro@123
    `;
    
    alert(demoInfo);
}

// Expose demo function globally
window.showDemoCredentials = showDemoCredentials;