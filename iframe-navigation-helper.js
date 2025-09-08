/**
 * TikTok Cuan Iframe Navigation Helper
 * 
 * This script can be included in your TikTok Cuan application (https://zyqsemod.gensparkspace.com/)
 * to help manage link navigation and prevent unwanted tab openings.
 * 
 * Usage: Include this script in your TikTok Cuan application's HTML:
 * <script src="iframe-navigation-helper.js"></script>
 */

(function() {
    'use strict';

    // Check if we're running inside an iframe
    const isIframe = window !== window.top;
    
    if (!isIframe) {
        console.log('📱 TikTok Cuan: Not in iframe, navigation helper not needed');
        return;
    }

    console.log('📱 TikTok Cuan: Running inside iframe, initializing navigation helper...');

    // Function to fix all links to work properly within iframe
    function fixIframeNavigation() {
        // Get all links on the page
        const links = document.querySelectorAll('a[href]');
        
        links.forEach(link => {
            const href = link.getAttribute('href');
            const currentTarget = link.getAttribute('target');
            
            // Skip if already processed
            if (link.dataset.iframeProcessed) return;
            link.dataset.iframeProcessed = 'true';
            
            // Handle different types of links
            if (href.startsWith('http') && !href.includes(window.location.hostname)) {
                // External link - should open in parent window's new tab
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Send message to parent to handle external link
                    window.parent.postMessage({
                        type: 'navigation_event',
                        url: href,
                        shouldOpenExternally: true
                    }, '*');
                    
                    console.log('📱 External link intercepted:', href);
                });
                
            } else if (href.startsWith('#') || href.startsWith('/') || href.startsWith('./') || href.startsWith('../')) {
                // Internal link - should navigate within iframe
                // Remove target="_blank" if present to keep navigation in iframe
                if (currentTarget === '_blank') {
                    link.removeAttribute('target');
                    console.log('📱 Removed target="_blank" from internal link:', href);
                }
                
            } else if (href.includes('whatsapp') || href.includes('wa.me')) {
                // WhatsApp link - handle specially
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Send WhatsApp request to parent
                    window.parent.postMessage({
                        type: 'whatsapp_request',
                        action: 'open_whatsapp',
                        url: href
                    }, '*');
                    
                    console.log('📱 WhatsApp link intercepted:', href);
                });
            }
        });
        
        console.log(`📱 Processed ${links.length} links for iframe navigation`);
    }

    // Function to override window.open to work with parent window
    function overrideWindowOpen() {
        const originalOpen = window.open;
        
        window.open = function(url, target, features) {
            // If trying to open in new window/tab from iframe, delegate to parent
            if (target === '_blank' || !target) {
                console.log('📱 window.open intercepted, delegating to parent:', url);
                
                // Send message to parent to handle window opening
                window.parent.postMessage({
                    type: 'navigation_event',
                    url: url,
                    shouldOpenExternally: true
                }, '*');
                
                return null; // Prevent actual window.open in iframe
            }
            
            // Otherwise, use original function
            return originalOpen.call(window, url, target, features);
        };
    }

    // Function to set proper base URL for relative links
    function setBaseHref() {
        let baseTag = document.querySelector('base');
        if (!baseTag) {
            baseTag = document.createElement('base');
            document.head.insertBefore(baseTag, document.head.firstChild);
        }
        
        // Set base href to current page URL to ensure relative links work properly
        baseTag.href = window.location.origin + window.location.pathname;
        console.log('📱 Base href set to:', baseTag.href);
    }

    // Function to handle form submissions within iframe
    function fixFormSubmissions() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            // Remove target="_blank" from forms to keep submissions in iframe
            if (form.getAttribute('target') === '_blank') {
                form.removeAttribute('target');
                console.log('📱 Removed target="_blank" from form');
            }
        });
    }

    // Initialize all fixes
    function initializeIframeHelper() {
        try {
            setBaseHref();
            overrideWindowOpen();
            fixIframeNavigation();
            fixFormSubmissions();
            
            // Re-run link fixing when new content is added
            const observer = new MutationObserver(() => {
                fixIframeNavigation();
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            console.log('📱 TikTok Cuan iframe navigation helper initialized successfully');
            
        } catch (error) {
            console.error('📱 Error initializing iframe navigation helper:', error);
        }
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeIframeHelper);
    } else {
        initializeIframeHelper();
    }

    // Also run periodically to catch dynamically added content
    setInterval(fixIframeNavigation, 5000);

})();