// ==UserScript==
// @name         Image List with Clipboard Copy
// @namespace    http://tampermonkey.net/
// @version      1.1.0
// @description  Adds a button to list images and copy selected ones to clipboard
// @author       errorduplicator
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    
    // State management
    const state = {
        sidebar: null,
        copyButton: null,
        initialized: false,
        retryCount: 0,
        maxRetries: 5,
        isVisible: false,
        observer: null,
        throttleTimeout: null
    };

    // Throttle function to limit execution
    function throttle(func, limit) {
        if (state.throttleTimeout) return;
        state.throttleTimeout = setTimeout(() => {
            func();
            state.throttleTimeout = null;
        }, limit);
    }

    // Modified observer setup
    function setupObserver() {
        if (state.observer) {
            state.observer.disconnect();
        }

        state.observer = new MutationObserver((mutations) => {
            throttle(() => {
                if (!document.getElementById('image-copy-sidebar')) {
                    state.initialized = false;
                    initializeScript();
                }
            }, 1000);
        });

        // Observe only body with limited options
        state.observer.observe(document.body, {
            childList: true,
            subtree: false
        });
    }

    // Cleanup function
    function cleanup() {
        if (state.observer) {
            state.observer.disconnect();
        }
        if (state.throttleTimeout) {
            clearTimeout(state.throttleTimeout);
        }
    }

    // Add cleanup on page unload
    window.addEventListener('unload', cleanup);

    function createSidebar() {
        try {
            const sidebar = document.createElement('div');
            sidebar.id = 'image-copy-sidebar';
            sidebar.style.position = 'fixed';
            sidebar.style.right = '-200px'; // Start hidden
            sidebar.style.top = '0';
            sidebar.style.width = '200px';
            sidebar.style.height = '100%';
            sidebar.style.backgroundColor = 'white';
            sidebar.style.padding = '10px';
            sidebar.style.overflowY = 'auto';
            sidebar.style.zIndex = '10000';
            sidebar.style.transition = 'right 0.3s ease-in-out';
            document.body.appendChild(sidebar);

            // Create toggle button
            const toggleButton = document.createElement('button');
            toggleButton.textContent = '≡';
            toggleButton.style.position = 'fixed';
            toggleButton.style.right = '0';
            toggleButton.style.top = '0';
            toggleButton.style.zIndex = '10001';
            toggleButton.style.padding = '5px 10px';
            document.body.appendChild(toggleButton);

            toggleButton.addEventListener('click', () => {
                state.isVisible = !state.isVisible;
                sidebar.style.right = state.isVisible ? '0' : '-200px';
            });
            
            const copyButton = document.createElement('button');
            copyButton.textContent = 'Copy Selected';
            copyButton.style.width = '100%';
            copyButton.style.margin = '10px 0';
            sidebar.appendChild(copyButton);
            
            state.sidebar = sidebar;
            state.copyButton = copyButton;
            state.initialized = true;
            
            return sidebar;
        } catch (error) {
            console.error('Error creating sidebar:', error);
            return null;
        }
    }

    function scanImages() {
        if (!state.sidebar) return;
        
        // Clear existing image containers
        const containers = state.sidebar.querySelectorAll('div');
        containers.forEach(container => {
            if (container !== state.copyButton) {
                container.remove();
            }
        });

        // Scan for images
        const images = Array.from(document.getElementsByTagName('img'))
            .filter(img => img.src && img.width > 10 && img.height > 10);

        // Create containers for found images
        images.forEach((img, index) => {
            const container = document.createElement('div');
            container.style.display = 'flex';
            container.style.alignItems = 'center';
            container.style.margin = '10px';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `img-checkbox-${index}`;
            container.appendChild(checkbox);

            const imageClone = img.cloneNode();
            imageClone.style.maxWidth = '50px';
            imageClone.style.maxHeight = '50px';
            imageClone.style.marginLeft = '10px';
            container.appendChild(imageClone);

            state.sidebar.appendChild(container);
        });

        console.log(`Found ${images.length} images`);
    }

    function createRefreshButton() {
        const refreshButton = document.createElement('button');
        refreshButton.textContent = 'Refresh Images';
        refreshButton.style.width = '100%';
        refreshButton.style.margin = '10px 0';
        refreshButton.addEventListener('click', scanImages);
        state.sidebar.insertBefore(refreshButton, state.sidebar.firstChild);
    }

    function initializeScript() {
        if (state.initialized) return;
        
        const sidebar = createSidebar();
        if (!sidebar) return;
        
        createRefreshButton();
        
        // Delay initial scan
        setTimeout(scanImages, 1000);
        
        state.initialized = true;
    }

    // Initial setup with delay
    setTimeout(initializeScript, 500);
    setupObserver();
})();