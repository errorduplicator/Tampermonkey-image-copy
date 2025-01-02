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

    // Create and style the main button
    const mainButton = document.createElement('button');
    mainButton.textContent = 'Show Images';
    mainButton.style.position = 'fixed';
    mainButton.style.top = '10px';
    mainButton.style.right = '10px';
    mainButton.style.zIndex = '1000';
    document.body.appendChild(mainButton);

    // Create and style the sidebar
    const sidebar = document.createElement('div');
    sidebar.style.position = 'fixed';
    sidebar.style.top = '0';
    sidebar.style.right = '0';
    sidebar.style.width = '300px';
    sidebar.style.height = '100%';
    sidebar.style.backgroundColor = 'white';
    sidebar.style.borderLeft = '1px solid black';
    sidebar.style.overflowY = 'scroll';
    sidebar.style.zIndex = '999';
    sidebar.style.display = 'none';
    document.body.appendChild(sidebar);

    // Create and style the copy button
    const copyButton = document.createElement('button');
    copyButton.textContent = 'Copy Selected Images';
    copyButton.style.display = 'block';
    copyButton.style.margin = '10px';
    sidebar.appendChild(copyButton);

    // Toggle sidebar visibility
    mainButton.addEventListener('click', () => {
        sidebar.style.display = sidebar.style.display === 'none' ? 'block' : 'none';
        if (sidebar.style.display === 'block') {
            listImages();
        }
    });

    // List all images on the page in the sidebar
    function listImages() {
        // Clear previous list
        while (sidebar.firstChild && sidebar.firstChild !== copyButton) {
            sidebar.removeChild(sidebar.firstChild);
        }

        const images = document.querySelectorAll('img');
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

            sidebar.insertBefore(container, copyButton);
        });
    }

    // Copy selected images to clipboard
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
})();

function cleanup() {
    // Remove existing containers
    const existingContainers = sidebar.querySelectorAll('div');
    existingContainers.forEach(container => container.remove());
}

function initializeScript() {
    cleanup();
    // Your existing initialization code here
    images.forEach((img, index) => {
        // ...existing container creation code...
    });
}

// Add reload button
const reloadButton = document.createElement('button');
reloadButton.textContent = 'Reload Script';
reloadButton.style.margin = '10px';
sidebar.appendChild(reloadButton);

reloadButton.addEventListener('click', () => {
    initializeScript();
});

// Initial setup
initializeScript();