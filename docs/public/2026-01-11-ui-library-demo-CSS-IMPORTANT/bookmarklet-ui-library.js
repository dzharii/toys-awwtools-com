/**
 * Bookmarklet UI Library
 *
 * A lightweight, self-contained UI library for bookmarklets that provides
 * modern, styled alternatives to browser native dialogs (alert, prompt, confirm).
 * Uses Shadow DOM to prevent CSS conflicts with the host page.
 *
 * Features:
 * - Custom styled dialogs (alert, prompt, confirm)
 * - Draggable windows with title bars
 * - Non-blocking notifications
 * - Color picker component
 * - Copy-to-clipboard functionality
 * - All CSS embedded (no external stylesheets)
 * - Shadow DOM isolation
 *
 * Usage: Embed this entire library into your bookmarklet code
 */

const BookmarkletUI = (function() {
    'use strict';

    // Shared CSS styles for all UI components
    const SHARED_STYLES = `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        .bm-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.2s ease-in;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes slideIn {
            from {
                transform: translateY(-20px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }

        .bm-window {
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            min-width: 300px;
            max-width: 90vw;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
            animation: slideIn 0.3s ease-out;
            overflow: hidden;
        }

        .bm-window.draggable {
            position: fixed;
        }

        .bm-titlebar {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: move;
            user-select: none;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            font-size: 14px;
            font-weight: 600;
        }

        .bm-titlebar-title {
            flex: 1;
        }

        .bm-titlebar-close {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            line-height: 1;
            transition: background 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .bm-titlebar-close:hover {
            background: rgba(255, 255, 255, 0.3);
        }

        .bm-content {
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            font-size: 14px;
            line-height: 1.5;
            color: #333;
            overflow-y: auto;
            flex: 1;
        }

        .bm-content p {
            margin-bottom: 12px;
        }

        .bm-content p:last-child {
            margin-bottom: 0;
        }

        .bm-input {
            width: 100%;
            padding: 10px 12px;
            border: 2px solid #e0e0e0;
            border-radius: 6px;
            font-size: 14px;
            font-family: inherit;
            transition: border-color 0.2s;
            margin-top: 12px;
        }

        .bm-input:focus {
            outline: none;
            border-color: #667eea;
        }

        .bm-textarea {
            width: 100%;
            padding: 10px 12px;
            border: 2px solid #e0e0e0;
            border-radius: 6px;
            font-size: 14px;
            font-family: inherit;
            transition: border-color 0.2s;
            margin-top: 12px;
            min-height: 100px;
            resize: vertical;
        }

        .bm-textarea:focus {
            outline: none;
            border-color: #667eea;
        }

        .bm-buttons {
            display: flex;
            gap: 8px;
            margin-top: 20px;
            justify-content: flex-end;
        }

        .bm-button {
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            font-family: inherit;
        }

        .bm-button-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }

        .bm-button-primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .bm-button-secondary {
            background: #f5f5f5;
            color: #333;
        }

        .bm-button-secondary:hover {
            background: #e0e0e0;
        }

        .bm-button-success {
            background: #4caf50;
            color: white;
        }

        .bm-button-success:hover {
            background: #45a049;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
        }

        .bm-button-danger {
            background: #f44336;
            color: white;
        }

        .bm-button-danger:hover {
            background: #da190b;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(244, 67, 54, 0.4);
        }

        .bm-button:active {
            transform: translateY(0);
        }

        .bm-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
            padding: 16px 20px;
            display: flex;
            align-items: center;
            gap: 12px;
            z-index: 1000000;
            animation: slideInRight 0.3s ease-out;
            max-width: 400px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            font-size: 14px;
        }

        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        .bm-notification-icon {
            font-size: 20px;
            flex-shrink: 0;
        }

        .bm-notification-content {
            flex: 1;
            color: #333;
        }

        .bm-notification-close {
            background: none;
            border: none;
            color: #999;
            cursor: pointer;
            font-size: 18px;
            padding: 0;
            width: 20px;
            height: 20px;
            flex-shrink: 0;
        }

        .bm-notification-close:hover {
            color: #333;
        }

        .bm-notification.success {
            border-left: 4px solid #4caf50;
        }

        .bm-notification.error {
            border-left: 4px solid #f44336;
        }

        .bm-notification.info {
            border-left: 4px solid #2196f3;
        }

        .bm-notification.warning {
            border-left: 4px solid #ff9800;
        }

        .bm-color-picker {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-top: 12px;
        }

        .bm-color-input {
            width: 60px;
            height: 40px;
            border: 2px solid #e0e0e0;
            border-radius: 6px;
            cursor: pointer;
        }

        .bm-color-value {
            flex: 1;
            padding: 10px 12px;
            border: 2px solid #e0e0e0;
            border-radius: 6px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            background: #f9f9f9;
        }

        .bm-info-grid {
            display: grid;
            grid-template-columns: auto 1fr;
            gap: 8px 16px;
            margin-top: 12px;
        }

        .bm-info-label {
            font-weight: 600;
            color: #666;
        }

        .bm-info-value {
            color: #333;
        }

        .bm-copy-button {
            background: #2196f3;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
            transition: background 0.2s;
        }

        .bm-copy-button:hover {
            background: #1976d2;
        }
    `;

    // Base class for UI components
    class UIComponent {
        constructor() {
            this.container = document.createElement('div');
            this.shadow = this.container.attachShadow({ mode: 'open' });

            // Add shared styles
            const styleSheet = document.createElement('style');
            styleSheet.textContent = SHARED_STYLES;
            this.shadow.appendChild(styleSheet);
        }

        destroy() {
            if (this.container && this.container.parentNode) {
                this.container.parentNode.removeChild(this.container);
            }
        }

        appendTo(parent = document.body) {
            parent.appendChild(this.container);
        }
    }

    // Dialog class for alert/confirm/prompt
    class Dialog extends UIComponent {
        constructor(options = {}) {
            super();

            this.options = {
                title: options.title || 'Dialog',
                message: options.message || '',
                type: options.type || 'alert', // alert, confirm, prompt
                inputType: options.inputType || 'text',
                inputPlaceholder: options.inputPlaceholder || '',
                defaultValue: options.defaultValue || '',
                multiline: options.multiline || false,
                buttons: options.buttons || null,
                onClose: options.onClose || (() => {}),
                modal: options.modal !== false, // default true
                ...options
            };

            this.result = null;
            this.render();
        }

        render() {
            const wrapper = document.createElement('div');

            if (this.options.modal) {
                wrapper.className = 'bm-overlay';
                wrapper.addEventListener('click', (e) => {
                    if (e.target === wrapper) {
                        this.close(null);
                    }
                });
            }

            const window = document.createElement('div');
            window.className = 'bm-window';

            // Title bar
            const titleBar = document.createElement('div');
            titleBar.className = 'bm-titlebar';

            const title = document.createElement('div');
            title.className = 'bm-titlebar-title';
            title.textContent = this.options.title;
            titleBar.appendChild(title);

            const closeBtn = document.createElement('button');
            closeBtn.className = 'bm-titlebar-close';
            closeBtn.innerHTML = '×';
            closeBtn.addEventListener('click', () => this.close(null));
            titleBar.appendChild(closeBtn);

            window.appendChild(titleBar);

            // Content
            const content = document.createElement('div');
            content.className = 'bm-content';

            const message = document.createElement('p');
            message.textContent = this.options.message;
            content.appendChild(message);

            // Input for prompt
            if (this.options.type === 'prompt') {
                if (this.options.multiline) {
                    this.input = document.createElement('textarea');
                    this.input.className = 'bm-textarea';
                } else {
                    this.input = document.createElement('input');
                    this.input.className = 'bm-input';
                    this.input.type = this.options.inputType;
                }
                this.input.placeholder = this.options.inputPlaceholder;
                this.input.value = this.options.defaultValue;
                content.appendChild(this.input);

                // Focus and select input after render
                setTimeout(() => {
                    this.input.focus();
                    if (!this.options.multiline) {
                        this.input.select();
                    }
                }, 100);
            }

            // Buttons
            const buttons = document.createElement('div');
            buttons.className = 'bm-buttons';

            if (this.options.buttons) {
                // Custom buttons
                this.options.buttons.forEach(btn => {
                    const button = document.createElement('button');
                    button.className = `bm-button ${btn.className || 'bm-button-secondary'}`;
                    button.textContent = btn.text;
                    button.addEventListener('click', () => {
                        if (btn.onClick) {
                            btn.onClick();
                        }
                        this.close(btn.value);
                    });
                    buttons.appendChild(button);
                });
            } else {
                // Default buttons based on type
                if (this.options.type === 'confirm') {
                    const cancelBtn = document.createElement('button');
                    cancelBtn.className = 'bm-button bm-button-secondary';
                    cancelBtn.textContent = 'Cancel';
                    cancelBtn.addEventListener('click', () => this.close(false));
                    buttons.appendChild(cancelBtn);

                    const okBtn = document.createElement('button');
                    okBtn.className = 'bm-button bm-button-primary';
                    okBtn.textContent = 'OK';
                    okBtn.addEventListener('click', () => this.close(true));
                    buttons.appendChild(okBtn);
                } else if (this.options.type === 'prompt') {
                    const cancelBtn = document.createElement('button');
                    cancelBtn.className = 'bm-button bm-button-secondary';
                    cancelBtn.textContent = 'Cancel';
                    cancelBtn.addEventListener('click', () => this.close(null));
                    buttons.appendChild(cancelBtn);

                    const okBtn = document.createElement('button');
                    okBtn.className = 'bm-button bm-button-primary';
                    okBtn.textContent = 'OK';
                    okBtn.addEventListener('click', () => {
                        this.close(this.input.value);
                    });
                    buttons.appendChild(okBtn);

                    // Enter key submits
                    if (this.input) {
                        this.input.addEventListener('keydown', (e) => {
                            if (e.key === 'Enter' && !this.options.multiline) {
                                e.preventDefault();
                                this.close(this.input.value);
                            }
                        });
                    }
                } else {
                    // Alert - single OK button
                    const okBtn = document.createElement('button');
                    okBtn.className = 'bm-button bm-button-primary';
                    okBtn.textContent = 'OK';
                    okBtn.addEventListener('click', () => this.close(true));
                    buttons.appendChild(okBtn);
                }
            }

            content.appendChild(buttons);
            window.appendChild(content);
            wrapper.appendChild(window);

            this.shadow.appendChild(wrapper);
            this.window = window;
            this.wrapper = wrapper;
        }

        close(result) {
            this.result = result;
            if (this.options.onClose) {
                this.options.onClose(result);
            }
            this.destroy();
        }

        async wait() {
            return new Promise((resolve) => {
                const originalOnClose = this.options.onClose;
                this.options.onClose = (result) => {
                    if (originalOnClose) originalOnClose(result);
                    resolve(result);
                };
            });
        }
    }

    // Draggable Window class
    class Window extends UIComponent {
        constructor(options = {}) {
            super();

            this.options = {
                title: options.title || 'Window',
                content: options.content || '',
                width: options.width || 'auto',
                height: options.height || 'auto',
                x: options.x || null,
                y: options.y || null,
                draggable: options.draggable !== false,
                onClose: options.onClose || null,
                ...options
            };

            this.isDragging = false;
            this.currentX = 0;
            this.currentY = 0;
            this.initialX = 0;
            this.initialY = 0;

            this.render();
            this.setupDragging();
        }

        render() {
            const window = document.createElement('div');
            window.className = 'bm-window draggable';
            window.style.width = this.options.width;
            window.style.height = this.options.height;

            // Position
            if (this.options.x !== null && this.options.y !== null) {
                window.style.left = this.options.x + 'px';
                window.style.top = this.options.y + 'px';
            } else {
                // Center on screen
                window.style.left = '50%';
                window.style.top = '50%';
                window.style.transform = 'translate(-50%, -50%)';
            }

            // Title bar
            const titleBar = document.createElement('div');
            titleBar.className = 'bm-titlebar';

            const title = document.createElement('div');
            title.className = 'bm-titlebar-title';
            title.textContent = this.options.title;
            titleBar.appendChild(title);

            const closeBtn = document.createElement('button');
            closeBtn.className = 'bm-titlebar-close';
            closeBtn.innerHTML = '×';
            closeBtn.addEventListener('click', () => this.close());
            titleBar.appendChild(closeBtn);

            window.appendChild(titleBar);
            this.titleBar = titleBar;

            // Content
            const content = document.createElement('div');
            content.className = 'bm-content';

            if (typeof this.options.content === 'string') {
                content.innerHTML = this.options.content;
            } else if (this.options.content instanceof HTMLElement) {
                content.appendChild(this.options.content);
            }

            window.appendChild(content);

            this.shadow.appendChild(window);
            this.window = window;
            this.contentElement = content;
        }

        setupDragging() {
            if (!this.options.draggable) return;

            this.titleBar.addEventListener('mousedown', (e) => this.dragStart(e));
            document.addEventListener('mousemove', (e) => this.drag(e));
            document.addEventListener('mouseup', () => this.dragEnd());
        }

        dragStart(e) {
            if (e.target.tagName === 'BUTTON') return;

            this.isDragging = true;

            // Get current position
            const rect = this.window.getBoundingClientRect();
            this.initialX = e.clientX - rect.left;
            this.initialY = e.clientY - rect.top;

            this.window.style.transform = 'none';
        }

        drag(e) {
            if (!this.isDragging) return;

            e.preventDefault();

            this.currentX = e.clientX - this.initialX;
            this.currentY = e.clientY - this.initialY;

            this.window.style.left = this.currentX + 'px';
            this.window.style.top = this.currentY + 'px';
        }

        dragEnd() {
            this.isDragging = false;
        }

        setContent(content) {
            if (typeof content === 'string') {
                this.contentElement.innerHTML = content;
            } else if (content instanceof HTMLElement) {
                this.contentElement.innerHTML = '';
                this.contentElement.appendChild(content);
            }
        }

        close() {
            if (this.options.onClose) {
                this.options.onClose();
            }
            this.destroy();
        }
    }

    // Notification class (non-blocking, auto-dismiss)
    class Notification extends UIComponent {
        constructor(options = {}) {
            super();

            this.options = {
                message: options.message || '',
                type: options.type || 'info', // success, error, info, warning
                duration: options.duration || 3000,
                position: options.position || 'top-right',
                onClose: options.onClose || null,
                ...options
            };

            this.render();
            this.autoClose();
        }

        render() {
            const notification = document.createElement('div');
            notification.className = `bm-notification ${this.options.type}`;

            // Icon
            const icon = document.createElement('div');
            icon.className = 'bm-notification-icon';
            const icons = {
                success: '✓',
                error: '✕',
                warning: '⚠',
                info: 'ℹ'
            };
            icon.textContent = icons[this.options.type] || icons.info;
            notification.appendChild(icon);

            // Content
            const content = document.createElement('div');
            content.className = 'bm-notification-content';
            content.textContent = this.options.message;
            notification.appendChild(content);

            // Close button
            const closeBtn = document.createElement('button');
            closeBtn.className = 'bm-notification-close';
            closeBtn.innerHTML = '×';
            closeBtn.addEventListener('click', () => this.close());
            notification.appendChild(closeBtn);

            this.shadow.appendChild(notification);
            this.notification = notification;
        }

        autoClose() {
            if (this.options.duration > 0) {
                setTimeout(() => this.close(), this.options.duration);
            }
        }

        close() {
            if (this.options.onClose) {
                this.options.onClose();
            }
            this.destroy();
        }
    }

    // Color Picker Component
    class ColorPicker extends UIComponent {
        constructor(options = {}) {
            super();

            this.options = {
                title: options.title || 'Color Picker',
                defaultColor: options.defaultColor || '#667eea',
                onChange: options.onChange || null,
                onSelect: options.onSelect || null,
                onClose: options.onClose || null,
                showCopyButton: options.showCopyButton !== false,
                x: options.x || 20,
                y: options.y || 20,
                ...options
            };

            this.currentColor = this.options.defaultColor;
            this.render();
        }

        render() {
            const window = document.createElement('div');
            window.className = 'bm-window draggable';
            window.style.left = this.options.x + 'px';
            window.style.top = this.options.y + 'px';
            window.style.width = '320px';

            // Title bar
            const titleBar = document.createElement('div');
            titleBar.className = 'bm-titlebar';

            const title = document.createElement('div');
            title.className = 'bm-titlebar-title';
            title.textContent = this.options.title;
            titleBar.appendChild(title);

            const closeBtn = document.createElement('button');
            closeBtn.className = 'bm-titlebar-close';
            closeBtn.innerHTML = '×';
            closeBtn.addEventListener('click', () => this.close());
            titleBar.appendChild(closeBtn);

            window.appendChild(titleBar);

            // Content
            const content = document.createElement('div');
            content.className = 'bm-content';

            // Color picker row
            const pickerRow = document.createElement('div');
            pickerRow.className = 'bm-color-picker';

            const colorInput = document.createElement('input');
            colorInput.type = 'color';
            colorInput.className = 'bm-color-input';
            colorInput.value = this.currentColor;
            colorInput.addEventListener('input', (e) => {
                this.currentColor = e.target.value;
                colorValue.value = this.currentColor;
                if (this.options.onChange) {
                    this.options.onChange(this.currentColor);
                }
            });
            pickerRow.appendChild(colorInput);

            const colorValue = document.createElement('input');
            colorValue.type = 'text';
            colorValue.className = 'bm-color-value';
            colorValue.value = this.currentColor;
            colorValue.addEventListener('input', (e) => {
                const value = e.target.value;
                if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
                    this.currentColor = value;
                    colorInput.value = value;
                    if (this.options.onChange) {
                        this.options.onChange(this.currentColor);
                    }
                }
            });
            pickerRow.appendChild(colorValue);

            content.appendChild(pickerRow);

            // Buttons
            const buttons = document.createElement('div');
            buttons.className = 'bm-buttons';

            if (this.options.showCopyButton) {
                const copyBtn = document.createElement('button');
                copyBtn.className = 'bm-button bm-button-success';
                copyBtn.textContent = 'Copy';
                copyBtn.addEventListener('click', () => this.copyColor());
                buttons.appendChild(copyBtn);
            }

            if (this.options.onSelect) {
                const selectBtn = document.createElement('button');
                selectBtn.className = 'bm-button bm-button-primary';
                selectBtn.textContent = 'Select';
                selectBtn.addEventListener('click', () => {
                    this.options.onSelect(this.currentColor);
                    this.close();
                });
                buttons.appendChild(selectBtn);
            }

            content.appendChild(buttons);
            window.appendChild(content);

            this.shadow.appendChild(window);
            this.window = window;

            // Setup dragging
            this.setupDragging(titleBar, window);
        }

        setupDragging(titleBar, window) {
            let isDragging = false;
            let currentX = 0;
            let currentY = 0;
            let initialX = 0;
            let initialY = 0;

            const dragStart = (e) => {
                if (e.target.tagName === 'BUTTON') return;
                isDragging = true;
                const rect = window.getBoundingClientRect();
                initialX = e.clientX - rect.left;
                initialY = e.clientY - rect.top;
            };

            const drag = (e) => {
                if (!isDragging) return;
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                window.style.left = currentX + 'px';
                window.style.top = currentY + 'px';
            };

            const dragEnd = () => {
                isDragging = false;
            };

            titleBar.addEventListener('mousedown', dragStart);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);
        }

        copyColor() {
            const textarea = document.createElement('textarea');
            textarea.value = this.currentColor;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();

            try {
                document.execCommand('copy');
                new Notification({
                    message: `Color ${this.currentColor} copied to clipboard!`,
                    type: 'success',
                    duration: 2000
                }).appendTo(document.body);
            } catch (err) {
                new Notification({
                    message: 'Failed to copy color',
                    type: 'error',
                    duration: 2000
                }).appendTo(document.body);
            }

            document.body.removeChild(textarea);
        }

        close() {
            if (this.options.onClose) {
                this.options.onClose(this.currentColor);
            }
            this.destroy();
        }
    }

    // Utility functions
    const Utils = {
        // Copy text to clipboard
        copyToClipboard(text) {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();

            let success = false;
            try {
                success = document.execCommand('copy');
            } catch (err) {
                success = false;
            }

            document.body.removeChild(textarea);
            return success;
        },

        // Show a quick notification
        notify(message, type = 'info', duration = 3000) {
            const notification = new Notification({
                message,
                type,
                duration
            });
            notification.appendTo(document.body);
            return notification;
        },

        // Create an info window with key-value pairs
        showInfo(title, data, options = {}) {
            const content = document.createElement('div');

            const grid = document.createElement('div');
            grid.className = 'bm-info-grid';

            Object.entries(data).forEach(([key, value]) => {
                const label = document.createElement('div');
                label.className = 'bm-info-label';
                label.textContent = key + ':';
                grid.appendChild(label);

                const valueDiv = document.createElement('div');
                valueDiv.className = 'bm-info-value';
                valueDiv.textContent = value;
                grid.appendChild(valueDiv);
            });

            content.appendChild(grid);

            // Add copy button if requested
            if (options.showCopyButton) {
                const buttons = document.createElement('div');
                buttons.className = 'bm-buttons';

                const copyBtn = document.createElement('button');
                copyBtn.className = 'bm-button bm-button-success';
                copyBtn.textContent = 'Copy All';
                copyBtn.addEventListener('click', () => {
                    const text = Object.entries(data)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join('\n');
                    if (Utils.copyToClipboard(text)) {
                        Utils.notify('Copied to clipboard!', 'success', 2000);
                    }
                });
                buttons.appendChild(copyBtn);
                content.appendChild(buttons);
            }

            const window = new Window({
                title,
                content,
                width: '400px',
                ...options
            });
            window.appendTo(document.body);
            return window;
        }
    };

    // Public API
    return {
        // Dialog methods (promise-based)
        async alert(message, title = 'Alert') {
            const dialog = new Dialog({ type: 'alert', message, title });
            dialog.appendTo(document.body);
            return await dialog.wait();
        },

        async confirm(message, title = 'Confirm') {
            const dialog = new Dialog({ type: 'confirm', message, title });
            dialog.appendTo(document.body);
            return await dialog.wait();
        },

        async prompt(message, defaultValue = '', title = 'Input', options = {}) {
            const dialog = new Dialog({
                type: 'prompt',
                message,
                title,
                defaultValue,
                ...options
            });
            dialog.appendTo(document.body);
            return await dialog.wait();
        },

        // Component classes
        Dialog,
        Window,
        Notification,
        ColorPicker,

        // Utilities
        Utils
    };
})();

// Make it globally available (for bookmarklets)
if (typeof window !== 'undefined') {
    window.BookmarkletUI = BookmarkletUI;
}
