/**
 * KRILI Chat Moderation Integration
 * Add this script to your chat application to enable real-time moderation
 */

class KRILIChatModerator {
    constructor(apiUrl = 'http://localhost:5000') {
        this.apiUrl = apiUrl;
        this.isEnabled = true;
        this.retryAttempts = 3;
        this.init();
    }

    init() {
        // Add CSS styles
        this.addStyles();
        
        // Initialize moderation
        this.setupModeration();
        
        // Health check
        this.checkHealth();
    }

    addStyles() {
        const styles = `
        <style id="krili-moderation-styles">
        .moderation-status {
            position: absolute;
            top: -60px;
            left: 0;
            right: 0;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 12px 16px;
            border-radius: 12px;
            font-size: 14px;
            z-index: 1000;
            animation: slideDown 0.3s ease-out;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .moderation-status.loading {
            background: rgba(59, 130, 246, 0.9);
            border-color: rgba(59, 130, 246, 0.3);
        }

        .moderation-status.warning {
            background: rgba(245, 158, 11, 0.9);
            border-color: rgba(245, 158, 11, 0.3);
        }

        .moderation-status.error {
            background: rgba(239, 68, 68, 0.9);
            border-color: rgba(239, 68, 68, 0.3);
        }

        .moderation-message {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .moderation-icon {
            font-size: 16px;
            animation: pulse 2s infinite;
        }

        .moderation-warning {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 20px;
            padding: 16px 20px;
            margin: 12px 0;
            animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            backdrop-filter: blur(20px);
            box-shadow: 0 4px 15px rgba(239, 68, 68, 0.1);
        }

        .warning-content {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .warning-icon {
            font-size: 20px;
            color: #dc2626;
        }

        .warning-text {
            flex: 1;
            color: #dc2626;
            font-weight: 500;
            line-height: 1.5;
        }

        .warning-close {
            background: none;
            border: none;
            color: #dc2626;
            font-size: 20px;
            cursor: pointer;
            padding: 4px;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.2s ease;
        }

        .warning-close:hover {
            background: rgba(239, 68, 68, 0.1);
            transform: scale(1.1);
        }

        .moderation-blocked {
            background: rgba(239, 68, 68, 0.15);
            border: 2px solid rgba(239, 68, 68, 0.4);
            border-radius: 20px;
            padding: 20px;
            margin: 12px 0;
            animation: shake 0.5s ease-in-out;
            backdrop-filter: blur(20px);
        }

        .blocked-content {
            text-align: center;
        }

        .blocked-icon {
            font-size: 48px;
            color: #dc2626;
            margin-bottom: 12px;
            display: block;
        }

        .blocked-title {
            font-size: 18px;
            font-weight: 600;
            color: #dc2626;
            margin-bottom: 8px;
        }

        .blocked-text {
            color: #dc2626;
            line-height: 1.5;
            margin-bottom: 16px;
        }

        .blocked-actions {
            display: flex;
            gap: 12px;
            justify-content: center;
        }

        .blocked-btn {
            padding: 8px 16px;
            border: 1px solid rgba(239, 68, 68, 0.3);
            background: rgba(239, 68, 68, 0.1);
            color: #dc2626;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s ease;
        }

        .blocked-btn:hover {
            background: rgba(239, 68, 68, 0.2);
            transform: translateY(-1px);
        }

        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(-20px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        /* Integration with KRILI chat styles */
        .chat-input-area {
            position: relative;
        }

        .message-input:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .send-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            background: #6b7280;
        }
        </style>
        `;

        // Remove existing styles
        const existingStyles = document.getElementById('krili-moderation-styles');
        if (existingStyles) {
            existingStyles.remove();
        }

        // Add new styles
        document.head.insertAdjacentHTML('beforeend', styles);
    }

    setupModeration() {
        // Find chat elements
        const sendButton = document.querySelector('.send-btn');
        const messageInput = document.querySelector('.message-input');

        if (!sendButton || !messageInput) {
            console.warn('⚠️ KRILI chat elements not found. Retrying in 2 seconds...');
            setTimeout(() => this.setupModeration(), 2000);
            return;
        }

        // Store original handlers
        this.originalSendHandler = sendButton.onclick;
        this.originalKeyHandler = messageInput.onkeydown;

        // Replace send button handler
        sendButton.onclick = (event) => this.handleSendClick(event);

        // Replace enter key handler
        messageInput.onkeydown = (event) => this.handleKeyDown(event);

        console.log('✅ KRILI chat moderation integration complete');
    }

    async handleSendClick(event) {
        event.preventDefault();
        await this.processChatMessage();
    }

    async handleKeyDown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            await this.processChatMessage();
        } else if (this.originalKeyHandler) {
            this.originalKeyHandler.call(event.target, event);
        }
    }

    async processChatMessage() {
        const messageInput = document.querySelector('.message-input');
        const message = messageInput.value.trim();

        if (!message) return;

        // Get user ID (implement based on your auth system)
        const userId = this.getCurrentUserId();

        // Show loading status
        this.showModerationStatus('Checking message...', 'loading');

        try {
            // Moderate the message
            const result = await this.moderateMessage(message, userId);

            // Hide loading status
            this.hideModerationStatus();

            if (result.is_flagged) {
                if (result.action === 'block') {
                    // Block the message
                    this.showBlockedMessage(result.warning_message || 'Message blocked');
                    this.clearMessageInput();
                    return;
                } else if (result.action === 'warn') {
                    // Show warning but allow message
                    this.showWarningMessage(result.warning_message || 'Please be careful with your messages');
                }
            }

            // Allow message - call original send logic
            this.sendMessage(message, userId);
            this.clearMessageInput();

        } catch (error) {
            console.error('Moderation error:', error);
            this.hideModerationStatus();
            
            // Fail open - allow message
            this.sendMessage(message, userId);
            this.clearMessageInput();
        }
    }

    async moderateMessage(message, userId) {
        const response = await fetch(`${this.apiUrl}/moderate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                user_id: userId,
                context: {
                    timestamp: new Date().toISOString(),
                    channel: 'chat',
                    platform: 'KRILI'
                }
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    showModerationStatus(message, type = 'info') {
        this.hideModerationStatus();

        const statusDiv = document.createElement('div');
        statusDiv.id = 'moderation-status';
        statusDiv.className = `moderation-status ${type}`;
        
        const icon = {
            loading: '⏳',
            warning: '⚠️',
            error: '❌',
            info: 'ℹ️'
        }[type] || 'ℹ️';

        statusDiv.innerHTML = `
            <div class="moderation-message">
                <span class="moderation-icon">${icon}</span>
                <span class="moderation-text">${message}</span>
            </div>
        `;

        const chatInputArea = document.querySelector('.chat-input-area');
        if (chatInputArea) {
            chatInputArea.appendChild(statusDiv);
        }
    }

    hideModerationStatus() {
        const statusDiv = document.getElementById('moderation-status');
        if (statusDiv) {
            statusDiv.remove();
        }
    }

    showWarningMessage(message) {
        const warningDiv = document.createElement('div');
        warningDiv.className = 'moderation-warning';
        warningDiv.innerHTML = `
            <div class="warning-content">
                <span class="warning-icon">⚠️</span>
                <span class="warning-text">${message}</span>
                <button class="warning-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        const chatMessages = document.querySelector('.chat-messages');
        if (chatMessages) {
            chatMessages.appendChild(warningDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        // Auto-remove after 8 seconds
        setTimeout(() => {
            if (warningDiv.parentNode) {
                warningDiv.remove();
            }
        }, 8000);
    }

    showBlockedMessage(message) {
        const blockedDiv = document.createElement('div');
        blockedDiv.className = 'moderation-blocked';
        blockedDiv.innerHTML = `
            <div class="blocked-content">
                <span class="blocked-icon">🚫</span>
                <div class="blocked-title">Message Blocked</div>
                <div class="blocked-text">${message}</div>
                <div class="blocked-actions">
                    <button class="blocked-btn" onclick="this.parentElement.parentElement.parentElement.remove()">
                        Understood
                    </button>
                </div>
            </div>
        `;

        const chatMessages = document.querySelector('.chat-messages');
        if (chatMessages) {
            chatMessages.appendChild(blockedDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        // Auto-remove after 15 seconds
        setTimeout(() => {
            if (blockedDiv.parentNode) {
                blockedDiv.remove();
            }
        }, 15000);
    }

    sendMessage(message, userId) {
        // Implement your actual message sending logic here
        console.log('Sending message:', message, 'from user:', userId);
        
        // Example: Add message to chat UI
        this.addMessageToChat(message, userId, 'sent');
        
        // Example: Send to server (implement based on your backend)
        // this.sendToServer(message, userId);
    }

    addMessageToChat(message, userId, type = 'sent') {
        const chatMessages = document.querySelector('.chat-messages');
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        const currentTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        messageDiv.innerHTML = `
            <div class="message-content">${message}</div>
            <div class="message-time">${currentTime}</div>
        `;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    clearMessageInput() {
        const messageInput = document.querySelector('.message-input');
        if (messageInput) {
            messageInput.value = '';
            messageInput.style.height = 'auto';
        }
    }

    getCurrentUserId() {
        // Implement based on your authentication system
        // This is a placeholder - replace with your actual user ID retrieval
        return localStorage.getItem('userId') || 
               sessionStorage.getItem('userId') || 
               document.querySelector('[data-user-id]')?.getAttribute('data-user-id') ||
               'anonymous_user_' + Math.random().toString(36).substr(2, 9);
    }

    async checkHealth() {
        try {
            const response = await fetch(`${this.apiUrl}/health`);
            const health = await response.json();
            
            if (health.status === 'healthy') {
                console.log('✅ Chat moderation system is healthy');
            } else {
                console.warn('⚠️ Chat moderation system health issues:', health);
                this.showModerationStatus('Moderation system degraded', 'warning');
                setTimeout(() => this.hideModerationStatus(), 3000);
            }
        } catch (error) {
            console.error('❌ Chat moderation system unavailable:', error);
            this.showModerationStatus('Moderation system offline', 'error');
            setTimeout(() => this.hideModerationStatus(), 3000);
        }
    }

    setEnabled(enabled) {
        this.isEnabled = enabled;
        console.log(`Chat moderation ${enabled ? 'enabled' : 'disabled'}`);
        
        if (!enabled) {
            this.hideModerationStatus();
        }
    }

    async getStats() {
        try {
            const response = await fetch(`${this.apiUrl}/stats`);
            return await response.json();
        } catch (error) {
            console.error('Error getting stats:', error);
            return null;
        }
    }
}

// Auto-initialize when DOM is ready
function initializeKRILIModeration() {
    // Check if we're on the chat page
    if (document.querySelector('.chat-container') || document.querySelector('.chat-messages')) {
        window.kriliModerator = new KRILIChatModerator();
        console.log('🛡️ KRILI Chat Moderation initialized');
    } else {
        console.log('ℹ️ Not on chat page, skipping moderation initialization');
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeKRILIModeration);
} else {
    initializeKRILIModeration();
}

// Export for global access
window.KRILIChatModerator = KRILIChatModerator;

// Add some utility functions for manual control
window.moderationUtils = {
    enable: () => window.kriliModerator?.setEnabled(true),
    disable: () => window.kriliModerator?.setEnabled(false),
    stats: () => window.kriliModerator?.getStats(),
    health: () => window.kriliModerator?.checkHealth()
};