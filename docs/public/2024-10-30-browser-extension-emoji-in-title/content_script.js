/**
 * @fileoverview Content script for the Emoji Tab Marker extension.
 * Injects a draggable button, handles emoji selection, and updates the page title.
 */

(() => {
  'use strict';

  let originalTitle = document.title;
  const pageKey = window.location.origin + window.location.pathname;

  /**
   * Initializes the extension by creating the draggable button and restoring any saved emoji.
   * @function
   */
  function initializeExtension() {
    createDraggableButton();
    restoreEmojiFromStorage();
  }

  /**
   * Creates the draggable emoji button and adds it to the page.
   * @function
   */
  function createDraggableButton() {
    const button = document.createElement('div');
    button.id = 'emojiButton';
    button.title = 'Click to select an emoji for this tab';
    document.body.appendChild(button);

    // Event listeners for dragging
    button.addEventListener('mousedown', initiateDrag);
    button.addEventListener('click', toggleEmojiDropdown);

    // Create the emoji dropdown
    createEmojiDropdown();
  }

  /**
   * Creates the emoji dropdown menu.
   * @function
   */
  function createEmojiDropdown() {
    const dropdown = document.createElement('div');
    dropdown.id = 'emojiDropdown';

    const select = document.createElement('select');
    select.addEventListener('change', handleEmojiSelection);

    // Add an empty option for resetting
    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = 'No Emoji';
    select.appendChild(emptyOption);

    // Populate options with emojis
    EMOJIS.forEach(emoji => {
      const option = document.createElement('option');
      option.value = emoji;
      option.textContent = emoji;
      select.appendChild(option);
    });

    dropdown.appendChild(select);
    document.body.appendChild(dropdown);
  }

  /**
   * Handles the dragging of the emoji button.
   * @function
   * @param {MouseEvent} event - The mousedown event.
   */
  function initiateDrag(event) {
    event.preventDefault();
    const button = event.target;
    let shiftX = event.clientX - button.getBoundingClientRect().left;
    let shiftY = event.clientY - button.getBoundingClientRect().top;

    function moveAt(pageX, pageY) {
      button.style.left = pageX - shiftX + 'px';
      button.style.top = pageY - shiftY + 'px';
    }

    function onMouseMove(e) {
      moveAt(e.clientX, e.clientY);
    }

    document.addEventListener('mousemove', onMouseMove);

    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mouseup', onMouseUp);
  }

  /**
   * Toggles the visibility of the emoji dropdown menu.
   * @function
   */
  function toggleEmojiDropdown(event) {
    event.stopPropagation();
    const dropdown = document.getElementById('emojiDropdown');
    const buttonRect = document.getElementById('emojiButton').getBoundingClientRect();
    dropdown.style.top = buttonRect.bottom + 'px';
    dropdown.style.left = buttonRect.left + 'px';
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';

    // Close dropdown when clicking outside
    if (dropdown.style.display === 'block') {
      document.addEventListener('click', closeDropdownOnClickOutside);
    } else {
      document.removeEventListener('click', closeDropdownOnClickOutside);
    }
  }

  /**
   * Closes the dropdown when clicking outside of it.
   * @function
   * @param {Event} event - The click event.
   */
  function closeDropdownOnClickOutside(event) {
    const dropdown = document.getElementById('emojiDropdown');
    if (!dropdown.contains(event.target) && event.target.id !== 'emojiButton') {
      dropdown.style.display = 'none';
      document.removeEventListener('click', closeDropdownOnClickOutside);
    }
  }

  /**
   * Handles the selection of an emoji from the dropdown.
   * @function
   * @param {Event} event - The change event from the dropdown.
   */
  function handleEmojiSelection(event) {
    const selectedEmoji = event.target.value;
    updatePageTitle(selectedEmoji);
    saveEmojiToStorage(selectedEmoji);
    toggleEmojiDropdown(event);
  }

  /**
   * Updates the page title with the selected emoji.
   * @function
   * @param {string} emoji - The selected emoji.
   */
  function updatePageTitle(emoji) {
    if (emoji) {
      document.title = `${emoji} ${originalTitle}`;
    } else {
      document.title = originalTitle;
    }
  }

  /**
   * Saves the selected emoji and original title to chrome.storage.local.
   * @function
   * @param {string} emoji - The selected emoji.
   */
  function saveEmojiToStorage(emoji) {
    if (emoji) {
      chrome.storage.local.set({ [pageKey]: { emoji: emoji, title: originalTitle } });
    } else {
      chrome.storage.local.remove(pageKey);
    }
  }

  /**
   * Restores the emoji from storage and updates the page title.
   * @function
   */
  function restoreEmojiFromStorage() {
    chrome.storage.local.get(pageKey, (result) => {
      if (result[pageKey]) {
        originalTitle = result[pageKey].title || document.title;
        updatePageTitle(result[pageKey].emoji);
      }
    });
  }

  // Initialize the extension when the page is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeExtension);
  } else {
    initializeExtension();
  }
})();

