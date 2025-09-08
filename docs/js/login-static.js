class LoginManager {
    constructor() {
        this.initElements();
        this.bindEvents();
        this.currentLoginType = 'outlet';
        this.updateFormLabels();
    }

    initElements() {
        this.form = document.getElementById('loginForm');
        this.usernameInput = document.getElementById('username');
        this.passwordInput = document.getElementById('password');
        this.usernameLabel = document.getElementById('usernameLabel');
        this.passwordLabel = document.getElementById('passwordLabel');
        this.loginTypeButtons = document.querySelectorAll('.login-type-btn');
        this.loginButton = this.form.querySelector('.login-btn');
        this.btnText = this.loginButton.querySelector('.btn-text');
        this.loader = this.loginButton.querySelector('.loader');
        this.errorMessage = document.getElementById('errorMessage');
    }

    bindEvents() {
        // Login type selector
        this.loginTypeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target.closest('.login-type-btn');
                this.switchLoginType(target.dataset.type);
            });
        });

        // Form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Input focus effects
        [this.usernameInput, this.passwordInput].forEach(input => {
            input.addEventListener('focus', () => {
                this.clearError();
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.altKey) {
                if (e.code === 'KeyO') {
                    e.preventDefault();
                    this.switchLoginType('outlet');
                } else if (e.code === 'KeyH') {
                    e.preventDefault();
                    this.switchLoginType('hq');
                }
            }
        });

        // Check if already logged in
        this.checkAuthStatus();
    }

    switchLoginType(type) {
        if (type === this.currentLoginType) return;

        this.currentLoginType = type;

        // Update button states
        this.loginTypeButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.type === type) {
                btn.classList.add('active');
            }
        });

        this.updateFormLabels();
        this.clearForm();
        this.clearError();
        
        console.log(`🔄 Switched to ${type.toUpperCase()} login`);
    }

    updateFormLabels() {
        if (this.currentLoginType === 'outlet') {
            this.usernameLabel.textContent = 'Store Code';
            this.usernameInput.placeholder = 'Enter your store code';
            this.passwordLabel.textContent = 'Password';
            this.passwordInput.placeholder = 'Enter your password';
        } else {
            this.usernameLabel.textContent = 'Email';
            this.usernameInput.placeholder = 'Enter your email address';
            this.passwordLabel.textContent = 'Password';
            this.passwordInput.placeholder = 'Enter your password';
        }
    }

    async handleLogin() {
        const username = this.usernameInput.value.trim();
        const password = this.passwordInput.value.trim();

        if (!username || !password) {
            this.showError('Please fill in all fields');
            return;
        }

        this.setLoading(true);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
            // For static version, accept any credentials
            console.log(`🔐 Login attempt: ${this.currentLoginType.toUpperCase()} - ${username}`);
            
            // Create user object
            const userData = {
                username: username,
                type: this.currentLoginType.toUpperCase(),
                loginTime: new Date().toISOString(),
                storeName: this.currentLoginType === 'outlet' ? `Store ${username}` : 'Head Office',
                accountManager: 'BPT Team'
            };

            // Store in localStorage
            localStorage.setItem('user', JSON.stringify(userData));
            
            // Show success and redirect
            console.log('✅ Login successful, redirecting to dashboard...');
            
            // Brief success feedback before redirect
            this.btnText.textContent = 'Success!';
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 500);

        } catch (error) {
            console.error('Login error:', error);
            this.showError('Login failed. Please try again.');
            this.setLoading(false);
        }
    }

    checkAuthStatus() {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        if (user) {
            console.log('👤 User already authenticated, redirecting...');
            window.location.href = 'dashboard.html';
        }
    }

    setLoading(isLoading) {
        this.loginButton.disabled = isLoading;
        
        if (isLoading) {
            this.btnText.style.opacity = '0';
            this.loader.classList.remove('hidden');
        } else {
            this.btnText.style.opacity = '1';
            this.loader.classList.add('hidden');
            this.btnText.textContent = 'Sign In';
        }
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.classList.remove('hidden');
        this.setLoading(false);
        
        // Auto-hide error after 5 seconds
        setTimeout(() => {
            this.clearError();
        }, 5000);
    }

    clearError() {
        this.errorMessage.classList.add('hidden');
        this.errorMessage.textContent = '';
    }

    clearForm() {
        this.usernameInput.value = '';
        this.passwordInput.value = '';
    }
}

// Initialize login manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏥 Apotek Alpro Login System Initialized (Static Version)');
    console.log('💡 Tip: Use Alt+O for Outlet login, Alt+H for HQ login');
    
    window.loginManager = new LoginManager();
});