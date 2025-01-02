// ==UserScript==
// @name         Image List with Clipboard Copy
// @namespace    http://tampermonkey.net/
// @version      0.5
// @description  Adds a button to list images and copy selected ones to clipboard
// @author       Your Name
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
        maxRetries: 5
    };

    function createSidebar() {
        try {
            const sidebar = document.createElement('div');
            sidebar.id = 'image-copy-sidebar';
            sidebar.style.position = 'fixed';
            sidebar.style.right = '0';
            sidebar.style.top = '0';
            sidebar.style.width = '200px';
            sidebar.style.height = '100%';
            sidebar.style.backgroundColor = 'white';
            sidebar.style.padding = '10px';
            sidebar.style.overflowY = 'auto';
            sidebar.style.zIndex = '10000';
            document.body.appendChild(sidebar);
            
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

    function initializeScript() {
        if (state.retryCount >= state.maxRetries) {
            console.error('Max retries reached, stopping initialization');
            return;
        }

        if (!document.getElementById('image-copy-sidebar')) {
            const sidebar = createSidebar();
            if (!sidebar) {
                state.retryCount++;
                setTimeout(initializeScript, 1000);
                return;
            }
        }
        
        const images = document.getElementsByTagName('img');
        Array.from(images).forEach((img, index) => {
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

            state.sidebar.insertBefore(container, state.copyButton);
        });

        if (state.copyButton) {
            state.copyButton.addEventListener('click', () => {
                const selectedImages = [];
                const checkboxes = state.sidebar.querySelectorAll('input[type="checkbox"]:checked');
                checkboxes.forEach(checkbox => {
                    const img = checkbox.nextElementSibling;
                    selectedImages.push(img);
                });

                if (selectedImages.length > 0) {
                    const container = document.createElement('div');
                    selectedImages.forEach(img => {
                        const imgClone = img.cloneNode();
                        container.appendChild(imgClone);
                    });

                    document.body.appendChild(container);
                    const range = document.createRange();
                    range.selectNodeContents(container);
                    const selection = window.getSelection();
                    selection.removeAllRanges();
                    selection.addRange(range);

                    try {
                        document.execCommand('copy');
                        alert('Selected images copied to clipboard!');
                    } catch (err) {
                        console.error('Failed to copy images: ', err);
                        alert('Failed to copy images.');
                    }

                    document.body.removeChild(container);
                } else {
                    alert('No images selected.');
                }
            });
        }
    }

    // Create mutation observer
    const observer = new MutationObserver((mutations) => {
        if (!document.getElementById('image-copy-sidebar')) {
            state.initialized = false;
            state.retryCount = 0;
            initializeScript();
        }
    });

    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Initial setup
    initializeScript();
})();