// Static Dashboard Manager for GitHub Pages (No Backend Required)
class StaticDashboardManager {
    constructor() {
        console.log('🔧 Starting static dashboard initialization...');
        this.currentUser = null;
        this.currentTab = 'homepage';
        this.isStatic = true;
        
        // Google Sheets configuration
        this.googleSheetsConfig = {
            spreadsheetId: '1wCvZ1WAlHAn-B8UPP5AUEPzQ5Auf84BJFeG48Hlo9wE',
            outletSheetName: 'Outlet Login',
            hqSheetName: 'HQ Login'  // Fixed: Use correct sheet name
        };

        // Static user data for GitHub Pages (fallback)
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
        
        try {
            this.safeInitElements();
            this.safeBindEvents();
            this.safeCheckAuth();
            console.log('✅ Static dashboard initialized successfully');
        } catch (error) {
            console.error('❌ Static dashboard initialization failed:', error);
            this.showSafeError(error);
        }
    }

    safeInitElements() {
        console.log('🔧 Safely initializing elements...');
        
        // Navigation elements (safe initialization)
        this.navTabs = document.querySelectorAll('.nav-tab') || [];
        this.tabContents = document.querySelectorAll('.tab-content') || [];
        
        // User info elements (safe initialization)
        this.userName = document.getElementById('userName');
        this.userType = document.getElementById('userType');
        this.logoutBtn = document.getElementById('logoutBtn');
        
        console.log('🔧 Safe element status:', {
            navTabs: this.navTabs.length,
            userName: !!this.userName,
            userType: !!this.userType,
            logoutBtn: !!this.logoutBtn
        });
    }

    safeBindEvents() {
        console.log('🔧 Safely binding events...');
        
        // Navigation tabs with safe binding
        if (this.navTabs && this.navTabs.length > 0) {
            this.navTabs.forEach((tab, index) => {
                if (tab && typeof tab.addEventListener === 'function') {
                    tab.addEventListener('click', (e) => {
                        try {
                            e.preventDefault();
                            const tabId = tab.dataset ? tab.dataset.tab : tab.getAttribute('data-tab');
                            console.log('🔄 Tab clicked:', tabId);
                            if (tabId) this.safeTabSwitch(tabId);
                        } catch (error) {
                            console.error('🔄 Tab click error:', error);
                        }
                    });
                }
            });
        }

        // Campaign tabs with safe binding and initialization
        const campaignTabs = document.querySelectorAll('.campaign-tab');
        if (campaignTabs && campaignTabs.length > 0) {
            campaignTabs.forEach((tab, index) => {
                if (tab && typeof tab.addEventListener === 'function') {
                    tab.addEventListener('click', (e) => {
                        try {
                            e.preventDefault();
                            const campaignId = tab.dataset ? tab.dataset.campaign : tab.getAttribute('data-campaign');
                            console.log('🔄 Campaign tab clicked:', campaignId);
                            if (campaignId) this.safeCampaignSwitch(campaignId);
                        } catch (error) {
                            console.error('🔄 Campaign tab click error:', error);
                        }
                    });
                }
            });
            
            // Initialize first campaign tab as active by default
            this.initializeDefaultCampaignTab();
        }

        // Logout button with safe binding
        if (this.logoutBtn && typeof this.logoutBtn.addEventListener === 'function') {
            this.logoutBtn.addEventListener('click', (e) => {
                try {
                    e.preventDefault();
                    console.log('🚪 Logout clicked');
                    this.safeHandleLogout();
                } catch (error) {
                    console.error('🚪 Logout error:', error);
                    // Force redirect as fallback
                    this.redirectToLogin();
                }
            });
        }
    }

    safeCheckAuth() {
        try {
            console.log('🔐 Safely checking static authentication...');
            
            // Skip auth check if on login page
            if (window.location.pathname === '/login' || 
                window.location.pathname.includes('/login') || 
                window.location.pathname.endsWith('login.html')) {
                console.log('🔐 On login page, skipping auth check');
                return;
            }
            
            // Check localStorage for saved user session
            const savedUser = localStorage.getItem('apotek_alpro_user');
            if (savedUser) {
                try {
                    this.currentUser = JSON.parse(savedUser);
                    console.log('🔐 User loaded from localStorage:', this.currentUser);
                    this.safeUpdateUserInfo();
                    return;
                } catch (e) {
                    console.error('🔐 Error parsing saved user:', e);
                    localStorage.removeItem('apotek_alpro_user');
                }
            }
            
            console.log('🔐 No user found, showing login prompt');
            this.safeShowLoginPrompt();
            
        } catch (error) {
            console.error('🔐 Auth check failed:', error);
            this.safeShowLoginPrompt();
        }
    }

    // Static authentication method
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
                this.currentUser = {
                    type: 'outlet',
                    displayName: userData.shortStoreName,
                    fullStoreName: userData.storeName,
                    am: userData.am,
                    shortStoreName: userData.shortStoreName
                };
            }
        } else if (loginType === 'hq') {
            userData = this.staticUserData.hq.find(user => 
                user.email && 
                user.email.toLowerCase() === username.toLowerCase() && 
                user.password === password
            );
            
            if (userData) {
                this.currentUser = {
                    type: 'hq',
                    displayName: userData.name,
                    email: userData.email,
                    role: userData.role,
                    fullStoreName: userData.name
                };
            }
        }
        
        if (this.currentUser) {
            // Save to localStorage for persistence
            localStorage.setItem('apotek_alpro_user', JSON.stringify(this.currentUser));
            console.log('✅ User authenticated and saved:', this.currentUser);
            return { success: true, user: this.currentUser };
        } else {
            console.error('❌ Authentication failed');
            return { success: false, message: 'Invalid credentials' };
        }
    }

    safeUpdateUserInfo() {
        if (!this.currentUser) {
            console.warn('⚠️ No current user to display');
            return;
        }
        
        try {
            // Safely update user name
            if (this.userName && typeof this.userName.textContent !== 'undefined') {
                this.userName.textContent = this.currentUser.displayName || 'User';
                console.log('✅ Updated userName');
            } else {
                console.warn('⚠️ Cannot update userName - element not available');
            }
            
            // Safely update user type
            if (this.userType && typeof this.userType.textContent !== 'undefined') {
                this.userType.textContent = `${(this.currentUser.type || 'general').toUpperCase()} User`;
                console.log('✅ Updated userType');
            } else {
                console.warn('⚠️ Cannot update userType - element not available');
            }
            
            console.log('✅ User info updated safely');
        } catch (error) {
            console.error('⚠️ Error in safeUpdateUserInfo:', error);
        }
    }

    safeShowLoginPrompt() {
        console.log('🔐 Showing safe login prompt');
        
        try {
            // Update user info to show not authenticated
            if (this.userName) this.userName.textContent = 'Please Login';
            if (this.userType) this.userType.textContent = 'Not Authenticated';
            
            // Create and show login prompt overlay
            this.createSafeLoginOverlay();
        } catch (error) {
            console.error('🔐 Error showing login prompt:', error);
            // Fallback: redirect to login
            this.redirectToLogin();
        }
    }

    createSafeLoginOverlay() {
        // Remove existing overlay
        const existing = document.querySelector('.safe-login-overlay');
        if (existing) existing.remove();
        
        // Create overlay element
        const overlay = document.createElement('div');
        overlay.className = 'safe-login-overlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); backdrop-filter: blur(10px);
            display: flex; align-items: center; justify-content: center;
            z-index: 99999; font-family: Arial, sans-serif;
        `;
        
        overlay.innerHTML = `
            <div style="background: white; padding: 40px; border-radius: 20px; text-align: center; max-width: 400px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                <div style="font-size: 64px; color: #2E5B9F; margin-bottom: 20px;">🔐</div>
                <h2 style="color: #2E5B9F; margin-bottom: 15px; font-size: 24px;">Authentication Required</h2>
                <p style="color: #666; margin-bottom: 25px; line-height: 1.6;">You need to log in to access the Apotek Alpro BPT Portal dashboard.</p>
                <button onclick="window.staticDashboard.redirectToLogin()" 
                        style="background: linear-gradient(135deg, #2E5B9F, #1E3F6F); color: white; border: none; padding: 15px 30px; border-radius: 12px; cursor: pointer; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(46, 91, 159, 0.3);">
                    🚀 Go to Login
                </button>
            </div>
        `;
        
        document.body.appendChild(overlay);
    }

    redirectToLogin() {
        // For GitHub Pages, redirect to login.html
        if (window.location.pathname.includes('.html')) {
            window.location.href = 'login.html';
        } else {
            window.location.href = '/login';
        }
    }

    safeTabSwitch(tabId) {
        if (!tabId) return;
        
        try {
            console.log('🔄 Safely switching to tab:', tabId);
            
            this.currentTab = tabId;
            
            // Safely update navigation
            if (this.navTabs && this.navTabs.length > 0) {
                this.navTabs.forEach(tab => {
                    if (tab && tab.classList) {
                        const isActive = (tab.dataset && tab.dataset.tab === tabId) || 
                                       (tab.getAttribute && tab.getAttribute('data-tab') === tabId);
                        tab.classList.toggle('active', isActive);
                    }
                });
            }
            
            // Safely update content
            if (this.tabContents && this.tabContents.length > 0) {
                this.tabContents.forEach(content => {
                    if (content && content.classList && content.id) {
                        content.classList.toggle('active', content.id === tabId);
                    }
                });
            }
            
            // Initialize campaign tabs if switching to campaign section
            if (tabId === 'campaign') {
                setTimeout(() => {
                    this.initializeDefaultCampaignTab();
                }, 100);
            }
            
            console.log('✅ Tab switched successfully to:', tabId);
        } catch (error) {
            console.error('🔄 Tab switch error:', error);
        }
    }

    safeCampaignSwitch(campaignId) {
        if (!campaignId) return;
        
        try {
            console.log('🎯 Safely switching to campaign:', campaignId);
            
            // Get all campaign tabs and content sections
            const campaignTabs = document.querySelectorAll('.campaign-tab');
            const campaignContents = document.querySelectorAll('.campaign-content, .campaign-section, .campaign-tab-content');
            
            // Update campaign tab active states
            if (campaignTabs && campaignTabs.length > 0) {
                campaignTabs.forEach(tab => {
                    if (tab && tab.classList) {
                        const isActive = (tab.dataset && tab.dataset.campaign === campaignId) || 
                                       (tab.getAttribute && tab.getAttribute('data-campaign') === campaignId);
                        tab.classList.toggle('active', isActive);
                        
                        // Update visual feedback
                        if (isActive) {
                            tab.style.background = 'linear-gradient(135deg, #2E5B9F, #1E3F6F)';
                            tab.style.color = 'white';
                            tab.style.transform = 'translateY(-2px)';
                            tab.style.boxShadow = '0 8px 25px rgba(46, 91, 159, 0.4)';
                        } else {
                            tab.style.background = '';
                            tab.style.color = '';
                            tab.style.transform = '';
                            tab.style.boxShadow = '';
                        }
                    }
                });
            }
            
            // Update campaign content visibility
            console.log(`🔍 Found ${campaignContents.length} campaign content sections to manage`);
            if (campaignContents && campaignContents.length > 0) {
                campaignContents.forEach(content => {
                    if (content && content.classList && content.id) {
                        const isActive = content.id === campaignId ||
                                       content.id === `${campaignId}Content` || 
                                       content.id === `${campaignId}-content` ||
                                       content.classList.contains(`${campaignId}-section`);
                        
                        if (isActive) {
                            content.classList.add('active');
                            content.style.display = 'flex';
                            content.style.flexDirection = 'column';
                            content.style.opacity = '1';
                            console.log(`✅ Showing content: ${content.id}`);
                        } else {
                            content.classList.remove('active');
                            content.style.display = 'none';
                            content.style.opacity = '0';
                            console.log(`❌ Hiding content: ${content.id}`);
                        }
                    }
                });
            }
            
            // Special handling for specific campaigns
            switch (campaignId) {
                case 'oct-kenali-gula':
                    this.activateOctKenaliGulaContent();
                    break;
                case 'sept-women-health':
                    this.activateSeptWomenHealthContent();
                    break;
                case 'dec-anniversary-sales':
                    this.activateDecAnniversarySalesContent();
                    break;
                case 'new-year-new-me':
                    this.activateNewYearNewMeContent();
                    break;
                case 'campaign-calendar':
                    this.activateCampaignCalendarContent();
                    break;
                default:
                    console.log('🎯 Using default campaign content display');
            }
            
            console.log('✅ Campaign switched successfully to:', campaignId);
        } catch (error) {
            console.error('🎯 Campaign switch error:', error);
        }
    }

    activateOctKenaliGulaContent() {
        try {
            // Use the correct ID from HTML: "oct-kenali-gula"
            const octContent = document.getElementById('oct-kenali-gula') || 
                              document.getElementById('octKenaliGulaContent') || 
                              document.getElementById('oct-kenali-gula-content') ||
                              document.querySelector('.oct-kenali-gula-section');
            
            if (octContent) {
                octContent.classList.add('active');
                octContent.style.display = 'flex';
                octContent.style.flexDirection = 'column';
                octContent.style.opacity = '1';
                
                // Ensure iframe is properly loaded
                const octIframe = document.getElementById('octIframe');
                if (octIframe) {
                    // Refresh iframe src to ensure proper loading
                    const currentSrc = octIframe.src;
                    octIframe.src = '';
                    setTimeout(() => {
                        octIframe.src = currentSrc || 'https://qqssaxti.gensparkspace.com';
                    }, 100);
                }
                
                console.log('✅ Oct Kenali Gula content activated');
            } else {
                console.warn('⚠️ Oct Kenali Gula content not found');
            }
        } catch (error) {
            console.error('🎯 Oct Kenali Gula activation error:', error);
        }
    }

    activateSeptWomenHealthContent() {
        try {
            // Check for the correct Sept campaign ID: "sept-women-health"
            const septContent = document.getElementById('sept-women-health') ||
                               document.getElementById('septWomenHealthContent') || 
                               document.querySelector('.sept-women-health-section');
            
            if (septContent) {
                septContent.classList.add('active');
                septContent.style.display = 'flex';
                septContent.style.flexDirection = 'column';
                septContent.style.opacity = '1';
                
                // Ensure the iframe for women health campaign is properly loaded
                const septIframe = septContent.querySelector('iframe');
                if (septIframe) {
                    // Refresh iframe src to ensure proper loading of women health URL
                    const currentSrc = septIframe.src;
                    septIframe.src = '';
                    setTimeout(() => {
                        septIframe.src = currentSrc || 'https://apotekalpro-womanhealth.pages.dev/#metrics';
                    }, 100);
                }
                
                console.log('✅ Sept Women Health content activated');
            } else {
                console.warn('⚠️ Sept Women Health content not found');
            }
        } catch (error) {
            console.error('🎯 Sept Women Health activation error:', error);
        }
    }

    activateDecAnniversarySalesContent() {
        try {
            // Check for the Dec campaign ID: "dec-anniversary-sales"
            const decContent = document.getElementById('dec-anniversary-sales') ||
                              document.getElementById('decAnniversarySalesContent') || 
                              document.querySelector('.dec-anniversary-sales-section');
            
            if (decContent) {
                decContent.classList.add('active');
                decContent.style.display = 'flex';
                decContent.style.flexDirection = 'column';
                decContent.style.opacity = '1';
                
                // Ensure the iframe for Dec anniversary campaign is properly loaded
                const decIframe = decContent.querySelector('iframe');
                if (decIframe) {
                    // Refresh iframe src to ensure proper loading
                    const currentSrc = decIframe.src;
                    decIframe.src = '';
                    setTimeout(() => {
                        decIframe.src = currentSrc || 'https://eruyktmb.gensparkspace.com/';
                    }, 100);
                }
                
                console.log('✅ Dec Anniversary Sales content activated');
            } else {
                console.warn('⚠️ Dec Anniversary Sales content not found');
            }
        } catch (error) {
            console.error('🎯 Dec Anniversary Sales activation error:', error);
        }
    }

    activateNewYearNewMeContent() {
        try {
            // Check for the New Year campaign ID: "new-year-new-me"
            const newYearContent = document.getElementById('new-year-new-me') ||
                                  document.getElementById('newYearNewMeContent') || 
                                  document.querySelector('.new-year-new-me-section');
            
            if (newYearContent) {
                newYearContent.classList.add('active');
                newYearContent.style.display = 'flex';
                newYearContent.style.flexDirection = 'column';
                newYearContent.style.opacity = '1';
                
                // Ensure the iframe for New Year campaign is properly loaded
                const newYearIframe = newYearContent.querySelector('iframe');
                if (newYearIframe) {
                    // Refresh iframe src to ensure proper loading
                    const currentSrc = newYearIframe.src;
                    newYearIframe.src = '';
                    setTimeout(() => {
                        newYearIframe.src = currentSrc || 'https://gdmmhrhz.gensparkspace.com/';
                    }, 100);
                }
                
                console.log('✅ New Year New Me content activated');
            } else {
                console.warn('⚠️ New Year New Me content not found');
            }
        } catch (error) {
            console.error('🎯 New Year New Me activation error:', error);
        }
    }

    activateCampaignCalendarContent() {
        try {
            const calendarContent = document.getElementById('campaignCalendarContent') || 
                                   document.getElementById('campaign-calendar-content') ||
                                   document.querySelector('.campaign-calendar-section');
            
            if (calendarContent) {
                calendarContent.classList.add('active');
                calendarContent.style.display = 'block';
                calendarContent.style.opacity = '1';
                
                console.log('✅ Campaign Calendar content activated');
            }
        } catch (error) {
            console.error('🎯 Campaign Calendar activation error:', error);
        }
    }

    initializeDefaultCampaignTab() {
        try {
            console.log('🎯 Initializing default campaign tab...');
            
            const campaignTabs = document.querySelectorAll('.campaign-tab');
            const campaignContents = document.querySelectorAll('.campaign-tab-content');
            
            if (campaignTabs && campaignTabs.length > 0) {
                // Find the New Year campaign tab (preferred default - latest campaign) or use first available
                let defaultTab = Array.from(campaignTabs).find(tab => 
                    tab.dataset && tab.dataset.campaign === 'new-year-new-me'
                ) || campaignTabs[0];
                
                if (defaultTab) {
                    const defaultCampaignId = defaultTab.dataset ? 
                        defaultTab.dataset.campaign : 
                        defaultTab.getAttribute('data-campaign');
                    
                    console.log('🎯 Setting default campaign tab:', defaultCampaignId);
                    this.safeCampaignSwitch(defaultCampaignId);
                }
            } else {
                console.warn('⚠️ No campaign tabs found for initialization');
            }
        } catch (error) {
            console.error('🎯 Default campaign tab initialization error:', error);
        }
    }

    safeHandleLogout() {
        try {
            console.log('🚪 Safely handling logout...');
            
            // Show loading on button if possible
            if (this.logoutBtn) {
                const originalContent = this.logoutBtn.innerHTML;
                this.logoutBtn.innerHTML = '🔄 Logging out...';
                this.logoutBtn.disabled = true;
            }
            
            // Clear localStorage
            localStorage.removeItem('apotek_alpro_user');
            this.currentUser = null;
            
            console.log('🚪 Logout completed');
            
            // Redirect to login
            setTimeout(() => {
                this.redirectToLogin();
            }, 500);
            
        } catch (error) {
            console.error('🚪 Logout error:', error);
            // Always redirect even if logout fails
            this.redirectToLogin();
        }
    }

    showSafeError(error) {
        const errorMessage = error?.message || 'Unknown error occurred';
        console.error('❌ Showing safe error:', errorMessage);
        
        document.body.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); font-family: Arial, sans-serif;">
                <div style="background: white; padding: 40px; border-radius: 20px; text-align: center; max-width: 500px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                    <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
                    <h2 style="color: #dc3545; margin-bottom: 15px;">Dashboard Error</h2>
                    <p style="color: #666; margin-bottom: 15px;">Error: ${errorMessage}</p>
                    <p style="color: #999; font-size: 14px; margin-bottom: 20px;">Please try refreshing or contact support if the problem persists.</p>
                    <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                        <button onclick="window.location.reload()" 
                                style="background: #007bff; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-size: 14px;">
                            🔄 Refresh
                        </button>
                        <button onclick="window.location.href='login.html'" 
                                style="background: #28a745; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-size: 14px;">
                            🔐 Login
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}

// Safe initialization when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🏥 Starting Static Apotek Alpro Dashboard...');
    
    try {
        // Check if we're on login page
        if (document.body && document.body.classList.contains('login-body')) {
            console.log('📝 On login page, skipping dashboard initialization');
            return;
        }
        
        // Initialize static dashboard
        window.staticDashboard = new StaticDashboardManager();
        
    } catch (error) {
        console.error('🚨 Fatal initialization error:', error);
        
        // Ultra-safe error display
        setTimeout(() => {
            try {
                document.body.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: #dc3545; color: white; font-family: Arial, sans-serif;">
                        <div style="text-align: center; padding: 40px;">
                            <h1>⚠️ Fatal Error</h1>
                            <p>Cannot initialize dashboard: ${error?.message || 'Unknown error'}</p>
                            <button onclick="window.location.reload()" 
                                    style="background: white; color: #dc3545; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; margin-top: 20px; font-size: 16px;">
                                🔄 Refresh Page
                            </button>
                        </div>
                    </div>
                `;
            } catch (e) {
                console.error('🚨 Even error display failed:', e);
            }
        }, 100);
    }
});

// Enhanced Global WhatsApp Functions with Network Bypass
function openWhatsAppContactFromHomepage() {
    try {
        const phoneNumber = '+6287785731144';
        const message = 'Hello from Apotek Alpro BPT Portal! I would like to connect with the marketing team.';
        
        // Multiple WhatsApp URL strategies for better compatibility
        const strategies = [
            `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`,
            `https://api.whatsapp.com/send?phone=${phoneNumber.replace(/\D/g, '')}&text=${encodeURIComponent(message)}`,
            `whatsapp://send?phone=${phoneNumber.replace(/\D/g, '')}&text=${encodeURIComponent(message)}`
        ];
        
        // Try each strategy
        let success = false;
        for (let i = 0; i < strategies.length && !success; i++) {
            try {
                const popup = window.open(strategies[i], '_blank', 'noopener,noreferrer,width=800,height=600');
                if (popup) {
                    success = true;
                    console.log(`📱 WhatsApp contact opened from homepage using strategy ${i + 1}`);
                    break;
                }
            } catch (e) {
                console.warn(`📱 Strategy ${i + 1} failed:`, e);
            }
        }
        
        if (!success) {
            // Fallback: Show phone number for manual dialing
            alert(`WhatsApp may be blocked. Please contact us directly at: ${phoneNumber}`);
        }
        
    } catch (error) {
        console.error('📱 Error opening WhatsApp:', error);
        alert('Unable to open WhatsApp. Please contact us at +6287785731144');
    }
}

function openWhatsAppDirectFromTikTok() {
    try {
        const whatsappGroupUrl = 'https://chat.whatsapp.com/HukQMDMTtJjFi12x1lAty3';
        const fallbackMessage = 'Join our TikTok Cuan group for updates and discussions!';
        const phoneNumber = '+6287785731144';
        
        // Multiple strategies for WhatsApp group access
        const strategies = [
            whatsappGroupUrl,
            `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(fallbackMessage)}`,
            `https://api.whatsapp.com/send?phone=${phoneNumber.replace(/\D/g, '')}&text=${encodeURIComponent(fallbackMessage)}`
        ];
        
        let success = false;
        for (let i = 0; i < strategies.length && !success; i++) {
            try {
                const popup = window.open(strategies[i], '_blank', 'noopener,noreferrer,width=800,height=600');
                if (popup) {
                    success = true;
                    console.log(`📱 WhatsApp group opened from TikTok tab using strategy ${i + 1}`);
                    break;
                }
            } catch (e) {
                console.warn(`📱 Group strategy ${i + 1} failed:`, e);
            }
        }
        
        if (!success) {
            alert(`WhatsApp may be blocked. Contact us at: ${phoneNumber} to join the TikTok Cuan group.`);
        }
        
    } catch (error) {
        console.error('📱 Error opening WhatsApp group:', error);
        alert('Unable to open WhatsApp. Please contact us at +6287785731144 for TikTok Cuan group access.');
    }
}

// Additional utility functions
function refreshBPT() {
    console.log('🔄 Refreshing BPT data...');
    // Add refresh logic here if needed
    const refreshBtn = document.querySelector('.refresh-btn i');
    if (refreshBtn) {
        refreshBtn.style.animation = 'spin 1s linear';
        setTimeout(() => {
            if (refreshBtn) refreshBtn.style.animation = '';
        }, 1000);
    }
}

// retryTikTokLoad function removed - no longer needed with direct iframe embedding

// Add CSS for spin animation
if (!document.getElementById('dynamic-animations')) {
    const style = document.createElement('style');
    style.id = 'dynamic-animations';
    style.textContent = `
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}