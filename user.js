// ==UserScript==
// @name         Image List with Clipboard Copy
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  Adds a button to list images and copy selected ones to clipboard
// @author       Your Name
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let sidebar = null;
    let copyButton = null;

    function createSidebar() {
        sidebar = document.createElement('div');
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
        
        copyButton = document.createElement('button');
        copyButton.textContent = 'Copy Selected';
        copyButton.style.width = '100%';
        copyButton.style.margin = '10px 0';
        sidebar.appendChild(copyButton);
        
        return sidebar;
    }

    function initializeScript() {
        if (!document.getElementById('image-copy-sidebar')) {
            createSidebar();
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

            sidebar.insertBefore(container, copyButton);
        });

        // Reattach event listeners
        copyButton.addEventListener('click', () => {
            const selectedImages = [];
            const checkboxes = sidebar.querySelectorAll('input[type="checkbox"]:checked');
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

    // Create mutation observer
    const observer = new MutationObserver((mutations) => {
        if (!document.getElementById('image-copy-sidebar')) {
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