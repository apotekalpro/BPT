// Static Login System for GitHub Pages
class StaticLoginManager {
    constructor() {
        console.log('🏥 Apotek Alpro Static Login System Initialized');
        this.currentLoginType = 'outlet';
        this.isStatic = true;
        
        // Google Sheets configuration for dynamic authentication
        this.googleSheetsConfig = {
            spreadsheetId: '1wCvZ1WAlHAn-B8UPP5AUEPzQ5Auf84BJFeG48Hlo9wE',
            outletSheetName: 'Outlet Login',
            hqSheetName: 'HQ Login'  // Fixed: Changed from 'HQ Login Access' to 'HQ Login'
        };
        
        // Cache for Google Sheets data
        this.sheetsUserData = {
            outlet: [],
            hq: [],
            lastFetched: null,
            cacheExpiry: 5 * 60 * 1000 // 5 minutes cache
        };
        
        // Fallback static user data for authentication (in case Google Sheets is unavailable)
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
        
        // Initialize Google Sheets data fetching
        this.initializeGoogleSheetsAuth();
        
        // Keyboard shortcut tip removed as requested
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
            
            const result = await this.authenticateUserWithSheets(username, password, this.currentLoginType);
            
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

    // Google Sheets Authentication Methods
    async initializeGoogleSheetsAuth() {
        try {
            console.log('📊 Initializing Google Sheets authentication...');
            await this.fetchGoogleSheetsData();
        } catch (error) {
            console.warn('⚠️ Google Sheets initialization failed, using static data:', error);
        }
    }

    async fetchGoogleSheetsData() {
        try {
            // Check cache first
            if (this.isDataCacheValid()) {
                console.log('📊 Using cached Google Sheets data');
                return;
            }

            console.log('📊 Fetching fresh data from Google Sheets...');
            
            // Fetch both sheets concurrently
            const [outletData, hqData] = await Promise.allSettled([
                this.fetchSheetData('Outlet Login'),
                this.fetchSheetData('HQ Login')  // Fixed: Use correct sheet name
            ]);

            // Process outlet data
            if (outletData.status === 'fulfilled' && outletData.value) {
                this.sheetsUserData.outlet = this.parseOutletData(outletData.value);
                console.log('✅ Outlet login data loaded:', this.sheetsUserData.outlet.length, 'users');
            }

            // Process HQ data
            if (hqData.status === 'fulfilled' && hqData.value) {
                this.sheetsUserData.hq = this.parseHQData(hqData.value);
                console.log('✅ HQ login data loaded:', this.sheetsUserData.hq.length, 'users');
            }

            this.sheetsUserData.lastFetched = Date.now();
            console.log('📊 Google Sheets data refresh completed');

        } catch (error) {
            console.error('📊 Google Sheets fetch error:', error);
            throw error;
        }
    }

    async fetchSheetData(sheetName) {
        try {
            // Use Google Sheets CSV export API
            const csvUrl = `https://docs.google.com/spreadsheets/d/${this.googleSheetsConfig.spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
            
            console.log('📊 Fetching sheet:', sheetName);
            const response = await fetch(csvUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const csvText = await response.text();
            return this.parseCSV(csvText);
            
        } catch (error) {
            console.error(`📊 Error fetching ${sheetName}:`, error);
            return null;
        }
    }

    parseCSV(csvText) {
        const lines = csvText.split('\n').filter(line => line.trim());
        if (lines.length < 2) return [];

        const data = [];
        for (let i = 1; i < lines.length; i++) { // Skip header row
            const row = this.parseCSVLine(lines[i]);
            if (row && row.length > 0) {
                data.push(row);
            }
        }
        return data;
    }

    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];
            
            if (char === '"' && inQuotes && nextChar === '"') {
                current += '"';
                i++; // Skip next quote
            } else if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    }

    parseOutletData(csvData) {
        // Outlet Login: User = column A (0), Password = column D (3)
        // Also get: Store Name = column B (1), AM = column C (2)
        return csvData.map(row => {
            if (row.length >= 4 && row[0] && row[3]) {
                return {
                    shortStoreName: row[0].replace(/"/g, ''), // Remove quotes
                    storeName: row[1] ? row[1].replace(/"/g, '') : row[0],
                    am: row[2] ? row[2].replace(/"/g, '') : 'Account Manager',
                    password: row[3].replace(/"/g, '')
                };
            }
            return null;
        }).filter(user => user !== null);
    }

    parseHQData(csvData) {
        // HQ Login: User = column B (1), Password = column H (7)
        // Column structure: A=Name, B=Email, C=Status, D=Role, E=Date, F=Area, G=?, H=Password
        return csvData.map(row => {
            console.log('🔍 HQ Row data:', row); // Debug logging
            
            if (row.length >= 8 && row[1] && row[7]) {
                const name = row[0] ? row[0].replace(/"/g, '') : 'HQ User';
                const email = row[1].replace(/"/g, '');
                const status = row[2] ? row[2].replace(/"/g, '') : '';
                const role = row[3] ? row[3].replace(/"/g, '') : 'HQ User';
                const password = row[7].replace(/"/g, '');
                
                // Only include active users
                if (status.toLowerCase() === 'active' && email && password) {
                    return {
                        name: name,
                        email: email,
                        role: role,
                        status: status,
                        password: password
                    };
                }
            }
            return null;
        }).filter(user => user !== null);
    }

    extractNameFromEmail(email) {
        if (!email || !email.includes('@')) return 'HQ User';
        
        const localPart = email.split('@')[0];
        const name = localPart.replace(/[._]/g, ' ');
        return name.split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    }

    isDataCacheValid() {
        if (!this.sheetsUserData.lastFetched) return false;
        const age = Date.now() - this.sheetsUserData.lastFetched;
        return age < this.sheetsUserData.cacheExpiry;
    }

    // Enhanced authentication method that uses Google Sheets data first, then falls back to static
    async authenticateUserWithSheets(username, password, loginType) {
        try {
            // Ensure we have fresh data
            await this.fetchGoogleSheetsData();
            
            let userData = null;
            
            if (loginType === 'outlet') {
                // Try Google Sheets data first
                if (this.sheetsUserData.outlet.length > 0) {
                    userData = this.sheetsUserData.outlet.find(user => 
                        user.shortStoreName && 
                        user.shortStoreName.toLowerCase() === username.toLowerCase() && 
                        user.password === password
                    );
                }
                
                // Fallback to static data
                if (!userData) {
                    userData = this.staticUserData.outlet.find(user => 
                        user.shortStoreName && 
                        user.shortStoreName.toLowerCase() === username.toLowerCase() && 
                        user.password === password
                    );
                }
                
                if (userData) {
                    const user = {
                        type: 'outlet',
                        displayName: userData.shortStoreName,
                        fullStoreName: userData.storeName,
                        am: userData.am,
                        shortStoreName: userData.shortStoreName,
                        source: this.sheetsUserData.outlet.length > 0 ? 'sheets' : 'static'
                    };
                    
                    localStorage.setItem('apotek_alpro_user', JSON.stringify(user));
                    console.log(`✅ Outlet user authenticated (${user.source}):`, user);
                    return { success: true, user };
                }
                
            } else if (loginType === 'hq') {
                // Try Google Sheets data first
                if (this.sheetsUserData.hq.length > 0) {
                    userData = this.sheetsUserData.hq.find(user => 
                        user.email && 
                        user.email.toLowerCase() === username.toLowerCase() && 
                        user.password === password
                    );
                }
                
                // Fallback to static data
                if (!userData) {
                    userData = this.staticUserData.hq.find(user => 
                        user.email && 
                        user.email.toLowerCase() === username.toLowerCase() && 
                        user.password === password
                    );
                }
                
                if (userData) {
                    const user = {
                        type: 'hq',
                        displayName: userData.name,
                        email: userData.email,
                        role: userData.role,
                        fullStoreName: userData.name,
                        source: this.sheetsUserData.hq.length > 0 ? 'sheets' : 'static'
                    };
                    
                    localStorage.setItem('apotek_alpro_user', JSON.stringify(user));
                    console.log(`✅ HQ user authenticated (${user.source}):`, user);
                    return { success: true, user };
                }
            }
            
            console.error('❌ Authentication failed for:', { username, loginType });
            return { success: false, message: 'Invalid credentials' };
            
        } catch (error) {
            console.error('📊 Google Sheets auth error, falling back to static:', error);
            // Fallback to original static authentication
            return this.authenticateUser(username, password, loginType);
        }
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