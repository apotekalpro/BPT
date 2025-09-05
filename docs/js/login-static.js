// Static Login Functionality for GitHub Pages
console.log('🏥 Apotek Alpro Login System Initialized (Static Version)');
console.log('💡 Tip: Use Alt+O for Outlet login, Alt+H for HQ login');

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const loginTypeBtns = document.querySelectorAll('.login-type-btn');
    const usernameLabel = document.getElementById('usernameLabel');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('errorMessage');
    const loginBtn = document.querySelector('.login-btn');
    const btnText = document.querySelector('.btn-text');
    const loader = document.querySelector('.loader');
    
    let currentLoginType = 'outlet';

    // Login type switching
    loginTypeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            loginTypeBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            currentLoginType = this.dataset.type;
            
            if (currentLoginType === 'outlet') {
                usernameLabel.textContent = 'Store Code';
                usernameInput.placeholder = 'Enter your store code';
            } else {
                usernameLabel.textContent = 'Email';
                usernameInput.placeholder = 'Enter your email';
            }
            
            // Clear form
            usernameInput.value = '';
            passwordInput.value = '';
            hideError();
        });
    });

    // Form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        
        if (!username || !password) {
            showError('Please fill in all fields');
            return;
        }

        // Show loading state
        showLoading(true);
        
        // Simulate authentication delay
        setTimeout(() => {
            // For demo purposes, accept any credentials
            console.log(`🔐 Login attempt: ${currentLoginType} - ${username}`);
            
            // Store user info in localStorage
            localStorage.setItem('user', JSON.stringify({
                username: username,
                type: currentLoginType.toUpperCase(),
                loginTime: new Date().toISOString()
            }));
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        }, 1500);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.altKey) {
            if (e.code === 'KeyO') {
                e.preventDefault();
                document.querySelector('[data-type="outlet"]').click();
            } else if (e.code === 'KeyH') {
                e.preventDefault();
                document.querySelector('[data-type="hq"]').click();
            }
        }
    });

    function showLoading(show) {
        if (show) {
            loginBtn.disabled = true;
            btnText.style.opacity = '0';
            loader.classList.remove('hidden');
        } else {
            loginBtn.disabled = false;
            btnText.style.opacity = '1';
            loader.classList.add('hidden');
        }
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
        showLoading(false);
    }

    function hideError() {
        errorMessage.classList.add('hidden');
    }
});