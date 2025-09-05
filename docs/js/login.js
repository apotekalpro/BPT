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
                this.switchLoginType(e.target.dataset.type);
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

        // Check if already logged in
        this.checkAuthStatus();
    }

    switchLoginType(type) {
        if (type === this.currentLoginType) return;

        this.currentLoginType = type;
        
        // Update button states
        this.loginTypeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === type);
        });

        // Clear form
        this.form.reset();
        this.clearError();
        
        // Update form labels and placeholders
        this.updateFormLabels();
    }

    updateFormLabels() {
        if (this.currentLoginType === 'outlet') {
            this.usernameLabel.textContent = 'Store Code';
            this.passwordLabel.textContent = 'Password';
            this.usernameInput.placeholder = 'Enter your store code (e.g., JKJSTT1)';
            this.passwordInput.placeholder = 'Enter your password';
            this.passwordInput.type = 'password';
        } else {
            this.usernameLabel.textContent = 'Email';
            this.passwordLabel.textContent = 'Password';
            this.usernameInput.placeholder = 'Enter your email (e.g., name@apotekalpro.id)';
            this.passwordInput.placeholder = 'Enter your password';
            this.passwordInput.type = 'password';
        }
    }

    async checkAuthStatus() {
        try {
            const response = await fetch('/api/user');
            const data = await response.json();
            
            if (data.user) {
                window.location.href = '/dashboard';
            }
        } catch (error) {
            console.error('Auth check failed:', error);
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
        this.clearError();

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                    loginType: this.currentLoginType
                })
            });

            const data = await response.json();

            if (data.success) {
                this.showSuccess('Login successful! Redirecting...');
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1000);
            } else {
                this.showError(data.message || 'Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError('Network error. Please try again.');
        } finally {
            this.setLoading(false);
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
        }
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.classList.remove('hidden');
        this.errorMessage.style.background = '#FEF2F2';
        this.errorMessage.style.color = '#EF4444';
    }

    showSuccess(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.classList.remove('hidden');
        this.errorMessage.style.background = '#F0FDF4';
        this.errorMessage.style.color = '#16A34A';
    }

    clearError() {
        this.errorMessage.classList.add('hidden');
    }
}

// Animation for mascot character
class MascotAnimation {
    constructor() {
        this.mascot = document.querySelector('.mascot-character');
        this.initAnimations();
    }

    initAnimations() {
        if (!this.mascot) return;

        // Subtle floating animation
        this.mascot.style.animation = 'float 3s ease-in-out infinite';
        
        // Add CSS animation if not exists
        if (!document.querySelector('#mascot-animations')) {
            const style = document.createElement('style');
            style.id = 'mascot-animations';
            style.textContent = `
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-10px) rotate(2deg); }
                }
                
                @keyframes blink {
                    0%, 90%, 100% { transform: scaleY(1); }
                    95% { transform: scaleY(0.1); }
                }
            `;
            document.head.appendChild(style);
        }

        // Add blinking animation to eyes
        const eyes = this.mascot.querySelectorAll('.eye');
        eyes.forEach((eye, index) => {
            eye.style.animation = `blink 4s ease-in-out infinite`;
            eye.style.animationDelay = `${index * 0.1}s`;
        });
    }
}

// Enhanced form interactions
class FormEnhancements {
    constructor() {
        this.initFloatingLabels();
        this.initInputAnimations();
    }

    initFloatingLabels() {
        const inputs = document.querySelectorAll('.form-group input');
        
        inputs.forEach(input => {
            // Check if input has value on load
            this.toggleFloatingLabel(input);
            
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', () => {
                input.parentElement.classList.remove('focused');
                this.toggleFloatingLabel(input);
            });
            
            input.addEventListener('input', () => {
                this.toggleFloatingLabel(input);
            });
        });
    }

    toggleFloatingLabel(input) {
        const hasValue = input.value.trim() !== '';
        input.parentElement.classList.toggle('has-value', hasValue);
    }

    initInputAnimations() {
        const inputs = document.querySelectorAll('.form-group input');
        
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.style.transform = 'scale(1.02)';
                input.style.transition = 'transform 0.2s ease';
            });
            
            input.addEventListener('blur', () => {
                input.style.transform = 'scale(1)';
            });
        });
    }
}

// Keyboard shortcuts
class KeyboardShortcuts {
    constructor() {
        this.bindShortcuts();
    }

    bindShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Alt + O for Outlet login
            if (e.altKey && e.key.toLowerCase() === 'o') {
                e.preventDefault();
                const outletBtn = document.querySelector('[data-type="outlet"]');
                if (outletBtn) outletBtn.click();
            }
            
            // Alt + H for HQ login
            if (e.altKey && e.key.toLowerCase() === 'h') {
                e.preventDefault();
                const hqBtn = document.querySelector('[data-type="hq"]');
                if (hqBtn) hqBtn.click();
            }
        });
    }
}

// Initialize all components when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const loginManager = new LoginManager();
    const mascotAnimation = new MascotAnimation();
    const formEnhancements = new FormEnhancements();
    const keyboardShortcuts = new KeyboardShortcuts();
    
    // Add some visual feedback for successful initialization
    console.log('🏥 Apotek Alpro Login System Initialized');
    console.log('💡 Tip: Use Alt+O for Outlet login, Alt+H for HQ login');
});