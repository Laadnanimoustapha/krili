/**
 * Enhanced Payment Gateway Integration with Comprehensive Features
 * Use Case: Handle rental transactions with advanced security and logging
 * Author: Enhanced Payment System
 * Version: 2.0
 */

const crypto = require('crypto');
const fs = require('fs').promises;
const https = require('https');

class PaymentProcessor {
    constructor(apiKey, options = {}) {
        this.apiKey = apiKey;
        this.baseUrl = options.base_url || "https://api.paymentgateway.com";
        this.timeout = options.timeout || 30000;
        this.logFile = options.log_file || 'payment_logs.txt';
        this.maxRetries = options.max_retries || 3;
        this.webhookSecret = options.webhook_secret || '';
        this.environment = options.environment || 'production';
        this.encryptionKey = options.encryption_key || this.generateEncryptionKey();
        this.supportedCurrencies = ['MAD', 'USD', 'EUR', 'GBP', 'CAD', 'JPY', 'AUD', 'CHF', 'CNY'];
        
        // Initialize components
        this.rateLimiter = new RateLimiter(options.rate_limit || 100);
        this.cache = new PaymentCache(options.cache_ttl || 300);
        this.fraudDetection = new FraudDetection(options.fraud_rules || {});
        this.notifications = new NotificationManager(options.notifications || {});
        
        // Validate API key
        if (!this.apiKey) {
            throw new Error("API key is required");
        }
        
        // Environment-specific settings
        if (this.environment === 'sandbox') {
            this.baseUrl = this.baseUrl.replace('api.', 'sandbox-api.');
        }
    }

    /**
     * Process a payment with enhanced error handling and validation
     */
    async processPayment(amount, currency, token, metadata = {}) {
        try {
            // Rate limiting check
            if (!this.rateLimiter.allowRequest()) {
                throw new Error("Rate limit exceeded. Please try again later.");
            }
            
            // Validate input parameters
            this.validatePaymentData(amount, currency, token);
            
            // Fraud detection
            const fraudScore = await this.fraudDetection.analyzeTransaction(amount, currency, metadata);
            if (fraudScore > 80) {
                await this.logTransaction('FRAUD_BLOCKED', {
                    amount,
                    currency,
                    fraud_score: fraudScore,
                    metadata
                });
                throw new Error("Transaction blocked due to fraud detection");
            }
            
            // Check cache for duplicate transaction
            const cacheKey = this.generateCacheKey(amount, currency, token, metadata);
            const cachedResult = this.cache.get(cacheKey);
            if (cachedResult) {
                await this.logTransaction('CACHE_HIT', { cache_key: cacheKey });
                return cachedResult;
            }
            
            // Log payment attempt
            await this.logTransaction('ATTEMPT', {
                amount,
                currency,
                token: token.substring(0, 8) + '***', // Mask token for security
                fraud_score: fraudScore,
                timestamp: new Date().toISOString()
            });
            
            const paymentData = {
                amount,
                currency: currency.toUpperCase(),
                source: token,
                metadata,
                timestamp: Math.floor(Date.now() / 1000),
                idempotency_key: this.generateIdempotencyKey()
            };
            
            const response = await this.makeApiRequest('/charge', paymentData);
            
            if (response.success) {
                const result = {
                    success: true,
                    transaction_id: response.data?.id || null,
                    amount,
                    currency,
                    status: 'completed',
                    timestamp: new Date().toISOString(),
                    fraud_score: fraudScore,
                    data: response.data
                };
                
                // Cache successful result
                this.cache.set(cacheKey, result, 300);
                
                // Send success notification
                await this.notifications.sendPaymentSuccess(result);
                
                await this.logTransaction('SUCCESS', response.data);
                return result;
            } else {
                const result = {
                    success: false,
                    error: response.error || 'Unknown error',
                    error_code: response.error_code || 'UNKNOWN',
                    timestamp: new Date().toISOString(),
                    fraud_score: fraudScore
                };
                
                // Send failure notification
                await this.notifications.sendPaymentFailure(result);
                
                await this.logTransaction('FAILED', response);
                return result;
            }
            
        } catch (error) {
            await this.logTransaction('ERROR', { message: error.message });
            return {
                success: false,
                error: error.message,
                error_code: 'EXCEPTION',
                timestamp: new Date().toISOString()
            };
        }
    }
    
    /**
     * Refund a payment
     */
    async refundPayment(transactionId, amount = null, reason = '') {
        try {
            if (!transactionId) {
                throw new Error("Transaction ID is required for refund");
            }
            
            const refundData = {
                transaction_id: transactionId,
                reason,
                timestamp: Math.floor(Date.now() / 1000)
            };
            
            if (amount !== null) {
                refundData.amount = amount;
            }
            
            const response = await this.makeApiRequest('/refund', refundData);
            
            await this.logTransaction(response.success ? 'REFUND_SUCCESS' : 'REFUND_FAILED', {
                transaction_id: transactionId,
                amount,
                response
            });
            
            return response;
            
        } catch (error) {
            await this.logTransaction('REFUND_ERROR', { message: error.message });
            return {
                success: false,
                error: error.message,
                error_code: 'REFUND_EXCEPTION'
            };
        }
    }
    
    /**
     * Get payment status
     */
    async getPaymentStatus(transactionId) {
        try {
            if (!transactionId) {
                throw new Error("Transaction ID is required");
            }
            
            const response = await this.makeApiRequest(`/status/${transactionId}`, null, 'GET');
            return response;
            
        } catch (error) {
            return {
                success: false,
                error: error.message,
                error_code: 'STATUS_CHECK_FAILED'
            };
        }
    }
    
    /**
     * Validate webhook signature for security
     */
    validateWebhook(payload, signature, secret) {
        const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
        return crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature));
    }
    
    /**
     * Make API request with retry logic
     */
    async makeApiRequest(endpoint, data = null, method = 'POST') {
        let retries = 0;
        
        while (retries < this.maxRetries) {
            try {
                const url = this.baseUrl + endpoint;
                const options = {
                    method,
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'User-Agent': 'PaymentProcessor/2.0'
                    },
                    timeout: this.timeout
                };
                
                if (method === 'POST' && data) {
                    options.body = JSON.stringify(data);
                }
                
                const response = await fetch(url, options);
                const responseData = await response.json();
                
                if (response.ok) {
                    return {
                        success: true,
                        data: responseData,
                        http_code: response.status
                    };
                } else if (response.status >= 500 && retries < this.maxRetries - 1) {
                    // Retry on server errors
                    retries++;
                    await this.sleep(Math.pow(2, retries) * 1000); // Exponential backoff
                    continue;
                } else {
                    return {
                        success: false,
                        error: responseData.error || 'HTTP Error',
                        error_code: responseData.error_code || `HTTP_${response.status}`,
                        http_code: response.status
                    };
                }
                
            } catch (error) {
                if (retries < this.maxRetries - 1) {
                    retries++;
                    await this.sleep(Math.pow(2, retries) * 1000);
                    continue;
                } else {
                    throw error;
                }
            }
        }
    }
    
    /**
     * Validate payment data
     */
    validatePaymentData(amount, currency, token) {
        if (!Number.isFinite(amount) || amount <= 0) {
            throw new Error("Amount must be a positive number");
        }
        
        if (!this.supportedCurrencies.includes(currency.toUpperCase())) {
            throw new Error(`Unsupported currency: ${currency}`);
        }
        
        if (!token) {
            throw new Error("Payment token is required");
        }
        
        // Additional validation for amount limits
        if (amount > 1000000) { // 1M limit
            throw new Error("Amount exceeds maximum limit");
        }
        
        if (amount < 1) { // Minimum 1 unit
            throw new Error("Amount below minimum limit");
        }
    }
    
    /**
     * Generate unique idempotency key
     */
    generateIdempotencyKey() {
        return `pay_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    }
    
    /**
     * Generate cache key for transactions
     */
    generateCacheKey(amount, currency, token, metadata) {
        const data = amount + currency + token.slice(-4) + JSON.stringify(metadata);
        return 'payment_' + crypto.createHash('md5').update(data).digest('hex');
    }
    
    /**
     * Generate encryption key
     */
    generateEncryptionKey() {
        return crypto.randomBytes(32).toString('hex');
    }
    
    /**
     * Get batch summary
     */
    getBatchSummary(results) {
        const successful = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);
        
        return {
            total: results.length,
            successful: successful.length,
            failed: failed.length,
            success_rate: results.length > 0 ? (successful.length / results.length) * 100 : 0
        };
    }
    
    /**
     * Process analytics data
     */
    processAnalytics(data) {
        return {
            total_transactions: data.total_count || 0,
            total_amount: data.total_amount || 0,
            average_amount: data.average_amount || 0,
            success_rate: data.success_rate || 0,
            top_currencies: data.top_currencies || [],
            fraud_rate: data.fraud_rate || 0
        };
    }
    
    /**
     * Generate CSV report
     */
    generateCSVReport(data) {
        let csv = "Transaction ID,Amount,Currency,Status,Date,Customer ID\n";
        data.forEach(transaction => {
            csv += `${transaction.id},${transaction.amount},${transaction.currency},${transaction.status},${transaction.created_at},${transaction.customer_id || 'N/A'}\n`;
        });
        return csv;
    }
    
    /**
     * Handle payment succeeded webhook
     */
    async handlePaymentSucceeded(data) {
        await this.notifications.sendPaymentSuccess(data);
        return { success: true, message: 'Payment success handled' };
    }
    
    /**
     * Handle payment failed webhook
     */
    async handlePaymentFailed(data) {
        await this.notifications.sendPaymentFailure(data);
        return { success: true, message: 'Payment failure handled' };
    }
    
    /**
     * Handle refund created webhook
     */
    async handleRefundCreated(data) {
        await this.notifications.sendRefundNotification(data);
        return { success: true, message: 'Refund notification handled' };
    }
    
    /**
     * Log transaction for audit trail
     */
    async logTransaction(type, data) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            type,
            data,
            ip: 'unknown' // In Node.js, you'd get this from the request object
        };
        
        const logLine = JSON.stringify(logEntry) + '\n';
        try {
            await fs.appendFile(this.logFile, logLine);
        } catch (error) {
            console.error('Failed to write to log file:', error);
        }
    }
    
    /**
     * Get supported currencies
     */
    getSupportedCurrencies() {
        return this.supportedCurrencies;
    }
    
    /**
     * Set custom timeout
     */
    setTimeout(timeout) {
        this.timeout = Math.max(5000, Math.min(120000, timeout)); // Between 5-120 seconds
    }
    
    /**
     * Health check for payment gateway
     */
    async healthCheck() {
        try {
            const response = await this.makeApiRequest('/health', null, 'GET');
            return response.success;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Process batch payments
     */
    async processBatchPayments(payments) {
        const results = [];
        const batchId = `batch_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
        
        await this.logTransaction('BATCH_START', {
            batch_id: batchId,
            count: payments.length
        });
        
        for (let index = 0; index < payments.length; index++) {
            const payment = payments[index];
            try {
                const result = await this.processPayment(
                    payment.amount,
                    payment.currency,
                    payment.token,
                    { ...payment.metadata || {}, batch_id: batchId }
                );
                results[index] = result;
            } catch (error) {
                results[index] = {
                    success: false,
                    error: error.message,
                    error_code: 'BATCH_PAYMENT_FAILED'
                };
            }
        }
        
        await this.logTransaction('BATCH_COMPLETE', {
            batch_id: batchId,
            results
        });
        
        return {
            batch_id: batchId,
            results,
            summary: this.getBatchSummary(results)
        };
    }
    
    /**
     * Create payment intent for delayed capture
     */
    async createPaymentIntent(amount, currency, metadata = {}) {
        try {
            const intentData = {
                amount,
                currency: currency.toUpperCase(),
                capture_method: 'manual',
                metadata,
                timestamp: Math.floor(Date.now() / 1000)
            };
            
            const response = await this.makeApiRequest('/payment_intents', intentData);
            
            if (response.success) {
                await this.logTransaction('INTENT_CREATED', response.data);
                return {
                    success: true,
                    intent_id: response.data.id,
                    client_secret: response.data.client_secret,
                    status: response.data.status
                };
            }
            
            return response;
            
        } catch (error) {
            return {
                success: false,
                error: error.message,
                error_code: 'INTENT_CREATION_FAILED'
            };
        }
    }
    
    /**
     * Capture payment intent
     */
    async capturePaymentIntent(intentId, amount = null) {
        try {
            const captureData = { intent_id: intentId };
            if (amount !== null) {
                captureData.amount = amount;
            }
            
            const response = await this.makeApiRequest(`/payment_intents/${intentId}/capture`, captureData);
            
            await this.logTransaction(response.success ? 'INTENT_CAPTURED' : 'INTENT_CAPTURE_FAILED', {
                intent_id: intentId,
                amount,
                response
            });
            
            return response;
            
        } catch (error) {
            return {
                success: false,
                error: error.message,
                error_code: 'INTENT_CAPTURE_FAILED'
            };
        }
    }
    
    /**
     * Create subscription
     */
    async createSubscription(customerId, priceId, metadata = {}) {
        try {
            const subscriptionData = {
                customer: customerId,
                price: priceId,
                metadata,
                timestamp: Math.floor(Date.now() / 1000)
            };
            
            const response = await this.makeApiRequest('/subscriptions', subscriptionData);
            
            await this.logTransaction(response.success ? 'SUBSCRIPTION_CREATED' : 'SUBSCRIPTION_FAILED', {
                customer_id: customerId,
                price_id: priceId,
                response
            });
            
            return response;
            
        } catch (error) {
            return {
                success: false,
                error: error.message,
                error_code: 'SUBSCRIPTION_CREATION_FAILED'
            };
        }
    }
    
    /**
     * Cancel subscription
     */
    async cancelSubscription(subscriptionId, reason = '') {
        try {
            const cancelData = {
                subscription_id: subscriptionId,
                reason,
                timestamp: Math.floor(Date.now() / 1000)
            };
            
            const response = await this.makeApiRequest(`/subscriptions/${subscriptionId}/cancel`, cancelData);
            
            await this.logTransaction(response.success ? 'SUBSCRIPTION_CANCELLED' : 'SUBSCRIPTION_CANCEL_FAILED', {
                subscription_id: subscriptionId,
                reason,
                response
            });
            
            return response;
            
        } catch (error) {
            return {
                success: false,
                error: error.message,
                error_code: 'SUBSCRIPTION_CANCEL_FAILED'
            };
        }
    }
    
    /**
     * Get transaction analytics
     */
    async getAnalytics(startDate, endDate, filters = {}) {
        try {
            const analyticsData = {
                start_date: startDate,
                end_date: endDate,
                filters
            };
            
            const response = await this.makeApiRequest('/analytics', analyticsData);
            
            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                    summary: this.processAnalytics(response.data)
                };
            }
            
            return response;
            
        } catch (error) {
            return {
                success: false,
                error: error.message,
                error_code: 'ANALYTICS_FAILED'
            };
        }
    }
    
    /**
     * Encrypt sensitive data
     */
    encryptData(data) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
        let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'base64');
        encrypted += cipher.final('base64');
        return Buffer.concat([iv, Buffer.from(encrypted, 'base64')]).toString('base64');
    }
    
    /**
     * Decrypt sensitive data
     */
    decryptData(encryptedData) {
        const data = Buffer.from(encryptedData, 'base64');
        const iv = data.slice(0, 16);
        const encrypted = data.slice(16);
        const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
        let decrypted = decipher.update(encrypted, null, 'utf8');
        decrypted += decipher.final('utf8');
        return JSON.parse(decrypted);
    }
    
    /**
     * Generate payment report
     */
    async generateReport(type, startDate, endDate, format = 'json') {
        try {
            const reportData = {
                type,
                start_date: startDate,
                end_date: endDate,
                format
            };
            
            const response = await this.makeApiRequest('/reports', reportData);
            
            if (response.success && format === 'csv') {
                return this.generateCSVReport(response.data);
            }
            
            return response;
            
        } catch (error) {
            return {
                success: false,
                error: error.message,
                error_code: 'REPORT_GENERATION_FAILED'
            };
        }
    }
    
    /**
     * Setup webhook endpoint
     */
    async setupWebhook(url, events = []) {
        try {
            const webhookData = {
                url,
                events: events.length ? events : ['payment.succeeded', 'payment.failed', 'refund.created'],
                secret: this.webhookSecret
            };
            
            const response = await this.makeApiRequest('/webhooks', webhookData);
            
            await this.logTransaction(response.success ? 'WEBHOOK_CREATED' : 'WEBHOOK_FAILED', {
                url,
                events,
                response
            });
            
            return response;
            
        } catch (error) {
            return {
                success: false,
                error: error.message,
                error_code: 'WEBHOOK_SETUP_FAILED'
            };
        }
    }
    
    /**
     * Process webhook payload
     */
    async processWebhook(payload, signature) {
        try {
            if (!this.validateWebhook(payload, signature, this.webhookSecret)) {
                throw new Error("Invalid webhook signature");
            }
            
            const event = JSON.parse(payload);
            
            await this.logTransaction('WEBHOOK_RECEIVED', {
                event_type: event.type || 'unknown',
                event_id: event.id || 'unknown'
            });
            
            // Process different event types
            switch (event.type) {
                case 'payment.succeeded':
                    return await this.handlePaymentSucceeded(event.data);
                case 'payment.failed':
                    return await this.handlePaymentFailed(event.data);
                case 'refund.created':
                    return await this.handleRefundCreated(event.data);
                default:
                    return { success: true, message: 'Event processed' };
            }
            
        } catch (error) {
            await this.logTransaction('WEBHOOK_ERROR', { message: error.message });
            return {
                success: false,
                error: error.message,
                error_code: 'WEBHOOK_PROCESSING_FAILED'
            };
        }
    }
    
    /**
     * Utility function to sleep
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/**
 * Rate Limiter Class
 */
class RateLimiter {
    constructor(limit = 100) {
        this.limit = limit;
        this.requests = new Map();
    }
    
    allowRequest(identifier = 'default') {
        const now = Date.now();
        const windowStart = now - 3600000; // 1 hour window
        
        // Clean old requests
        const userRequests = this.requests.get(identifier) || [];
        const recentRequests = userRequests.filter(timestamp => timestamp > windowStart);
        
        // Check if under limit
        if (recentRequests.length < this.limit) {
            recentRequests.push(now);
            this.requests.set(identifier, recentRequests);
            return true;
        }
        
        return false;
    }
}

/**
 * Payment Cache Class
 */
class PaymentCache {
    constructor(ttl = 300) {
        this.cache = new Map();
        this.ttl = ttl * 1000; // Convert to milliseconds
    }
    
    get(key) {
        const item = this.cache.get(key);
        if (item && item.expires > Date.now()) {
            return item.data;
        } else if (item) {
            this.cache.delete(key);
        }
        return null;
    }
    
    set(key, data, ttl = null) {
        this.cache.set(key, {
            data,
            expires: Date.now() + (ttl ? ttl * 1000 : this.ttl)
        });
    }
    
    delete(key) {
        this.cache.delete(key);
    }
    
    clear() {
        this.cache.clear();
    }
}

/**
 * Fraud Detection Class
 */
class FraudDetection {
    constructor(rules = {}) {
        this.rules = {
            max_amount: 10000,
            suspicious_countries: ['XX', 'YY'],
            velocity_limit: 5, // max transactions per hour
            unusual_hours: [0, 1, 2, 3, 4, 5], // 12AM-5AM
            ...rules
        };
        this.velocityCache = new Map();
    }
    
    async analyzeTransaction(amount, currency, metadata) {
        let score = 0;
        
        // Amount-based scoring
        if (amount > this.rules.max_amount) {
            score += 30;
        }
        
        // Country-based scoring
        const country = metadata.country || '';
        if (this.rules.suspicious_countries.includes(country)) {
            score += 25;
        }
        
        // Time-based scoring
        const hour = new Date().getHours();
        if (this.rules.unusual_hours.includes(hour)) {
            score += 15;
        }
        
        // Velocity scoring
        const ip = metadata.ip || 'unknown';
        if (this.checkVelocity(ip)) {
            score += 20;
        }
        
        // Email domain scoring
        const email = metadata.email || '';
        if (this.isSuspiciousEmail(email)) {
            score += 10;
        }
        
        return Math.min(score, 100);
    }
    
    checkVelocity(ip) {
        const now = Date.now();
        const hourAgo = now - 3600000;
        
        // Get or create request history for this IP
        let requests = this.velocityCache.get(ip) || [];
        
        // Filter recent requests
        requests = requests.filter(timestamp => timestamp > hourAgo);
        
        // Add current request
        requests.push(now);
        this.velocityCache.set(ip, requests);
        
        return requests.length > this.rules.velocity_limit;
    }
    
    isSuspiciousEmail(email) {
        const suspiciousDomains = ['tempmail.com', '10minutemail.com', 'guerrillamail.com'];
        const domain = email.split('@')[1];
        return suspiciousDomains.includes(domain);
    }
}

/**
 * Notification Manager Class
 */
class NotificationManager {
    constructor(config = {}) {
        this.config = {
            email_enabled: false,
            sms_enabled: false,
            webhook_enabled: false,
            slack_enabled: false,
            ...config
        };
    }
    
    async sendPaymentSuccess(data) {
        const message = `Payment successful: ${data.transaction_id || 'Unknown'}`;
        await this.sendNotification('payment_success', message, data);
    }
    
    async sendPaymentFailure(data) {
        const message = `Payment failed: ${data.error || 'Unknown error'}`;
        await this.sendNotification('payment_failure', message, data);
    }
    
    async sendRefundNotification(data) {
        const message = `Refund processed: ${data.refund_id || 'Unknown'}`;
        await this.sendNotification('refund_created', message, data);
    }
    
    async sendNotification(type, message, data) {
        if (this.config.email_enabled) {
            await this.sendEmail(type, message, data);
        }
        
        if (this.config.sms_enabled) {
            await this.sendSMS(type, message, data);
        }
        
        if (this.config.webhook_enabled) {
            await this.sendWebhook(type, message, data);
        }
        
        if (this.config.slack_enabled) {
            await this.sendSlack(type, message, data);
        }
    }
    
    async sendEmail(type, message, data) {
        // Email implementation
        console.log(`EMAIL NOTIFICATION: ${type} - ${message}`);
    }
    
    async sendSMS(type, message, data) {
        // SMS implementation
        console.log(`SMS NOTIFICATION: ${type} - ${message}`);
    }
    
    async sendWebhook(type, message, data) {
        // Webhook implementation
        console.log(`WEBHOOK NOTIFICATION: ${type} - ${message}`);
    }
    
    async sendSlack(type, message, data) {
        // Slack implementation
        console.log(`SLACK NOTIFICATION: ${type} - ${message}`);
    }
}

/**
 * Payment Method Manager Class
 */
class PaymentMethodManager {
    constructor(processor) {
        this.processor = processor;
    }
    
    async createPaymentMethod(customerId, type, details) {
        try {
            const methodData = {
                customer: customerId,
                type,
                details,
                timestamp: Math.floor(Date.now() / 1000)
            };
            
            return await this.processor.makeApiRequest('/payment_methods', methodData);
            
        } catch (error) {
            return {
                success: false,
                error: error.message,
                error_code: 'PAYMENT_METHOD_CREATION_FAILED'
            };
        }
    }
    
    async listPaymentMethods(customerId) {
        try {
            return await this.processor.makeApiRequest(`/customers/${customerId}/payment_methods`, null, 'GET');
        } catch (error) {
            return {
                success: false,
                error: error.message,
                error_code: 'PAYMENT_METHOD_LIST_FAILED'
            };
        }
    }
    
    async deletePaymentMethod(methodId) {
        try {
            return await this.processor.makeApiRequest(`/payment_methods/${methodId}`, null, 'DELETE');
        } catch (error) {
            return {
                success: false,
                error: error.message,
                error_code: 'PAYMENT_METHOD_DELETE_FAILED'
            };
        }
    }
}

/**
 * Customer Manager Class
 */
class CustomerManager {
    constructor(processor) {
        this.processor = processor;
    }
    
    async createCustomer(customerData) {
        try {
            const data = {
                name: customerData.name,
                email: customerData.email,
                phone: customerData.phone,
                address: customerData.address,
                metadata: customerData.metadata || {},
                timestamp: Math.floor(Date.now() / 1000)
            };
            
            const response = await this.processor.makeApiRequest('/customers', data);
            
            await this.processor.logTransaction(response.success ? 'CUSTOMER_CREATED' : 'CUSTOMER_CREATION_FAILED', {
                customer_data: data,
                response
            });
            
            return response;
            
        } catch (error) {
            return {
                success: false,
                error: error.message,
                error_code: 'CUSTOMER_CREATION_FAILED'
            };
        }
    }
    
    async getCustomer(customerId) {
        try {
            return await this.processor.makeApiRequest(`/customers/${customerId}`, null, 'GET');
        } catch (error) {
            return {
                success: false,
                error: error.message,
                error_code: 'CUSTOMER_RETRIEVAL_FAILED'
            };
        }
    }
    
    async updateCustomer(customerId, updateData) {
        try {
            const data = {
                ...updateData,
                timestamp: Math.floor(Date.now() / 1000)
            };
            
            const response = await this.processor.makeApiRequest(`/customers/${customerId}`, data, 'PUT');
            
            await this.processor.logTransaction(response.success ? 'CUSTOMER_UPDATED' : 'CUSTOMER_UPDATE_FAILED', {
                customer_id: customerId,
                update_data: data,
                response
            });
            
            return response;
            
        } catch (error) {
            return {
                success: false,
                error: error.message,
                error_code: 'CUSTOMER_UPDATE_FAILED'
            };
        }
    }
    
    async deleteCustomer(customerId) {
        try {
            const response = await this.processor.makeApiRequest(`/customers/${customerId}`, null, 'DELETE');
            
            await this.processor.logTransaction(response.success ? 'CUSTOMER_DELETED' : 'CUSTOMER_DELETE_FAILED', {
                customer_id: customerId,
                response
            });
            
            return response;
            
        } catch (error) {
            return {
                success: false,
                error: error.message,
                error_code: 'CUSTOMER_DELETE_FAILED'
            };
        }
    }
    
    async listCustomers(filters = {}) {
        try {
            const params = new URLSearchParams(filters).toString();
            const endpoint = `/customers${params ? '?' + params : ''}`;
            return await this.processor.makeApiRequest(endpoint, null, 'GET');
        } catch (error) {
            return {
                success: false,
                error: error.message,
                error_code: 'CUSTOMER_LIST_FAILED'
            };
        }
    }
}

/**
 * Dispute Manager Class
 */
class DisputeManager {
    constructor(processor) {
        this.processor = processor;
    }
    
    async getDisputes(filters = {}) {
        try {
            const params = new URLSearchParams(filters).toString();
            const endpoint = `/disputes${params ? '?' + params : ''}`;
            return await this.processor.makeApiRequest(endpoint, null, 'GET');
        } catch (error) {
            return {
                success: false,
                error: error.message,
                error_code: 'DISPUTE_LIST_FAILED'
            };
        }
    }
    
    async getDispute(disputeId) {
        try {
            return await this.processor.makeApiRequest(`/disputes/${disputeId}`, null, 'GET');
        } catch (error) {
            return {
                success: false,
                error: error.message,
                error_code: 'DISPUTE_RETRIEVAL_FAILED'
            };
        }
    }
    
    async respondToDispute(disputeId, evidence, message = '') {
        try {
            const data = {
                evidence,
                message,
                timestamp: Math.floor(Date.now() / 1000)
            };
            
            const response = await this.processor.makeApiRequest(`/disputes/${disputeId}/respond`, data);
            
            await this.processor.logTransaction(response.success ? 'DISPUTE_RESPONDED' : 'DISPUTE_RESPONSE_FAILED', {
                dispute_id: disputeId,
                message,
                response
            });
            
            return response;
            
        } catch (error) {
            return {
                success: false,
                error: error.message,
                error_code: 'DISPUTE_RESPONSE_FAILED'
            };
        }
    }
    
    async acceptDispute(disputeId) {
        try {
            const response = await this.processor.makeApiRequest(`/disputes/${disputeId}/accept`, {}, 'POST');
            
            await this.processor.logTransaction(response.success ? 'DISPUTE_ACCEPTED' : 'DISPUTE_ACCEPT_FAILED', {
                dispute_id: disputeId,
                response
            });
            
            return response;
            
        } catch (error) {
            return {
                success: false,
                error: error.message,
                error_code: 'DISPUTE_ACCEPT_FAILED'
            };
        }
    }
}

/**
 * Payment Link Manager Class
 */
class PaymentLinkManager {
    constructor(processor) {
        this.processor = processor;
    }
    
    async createPaymentLink(amount, currency, options = {}) {
        try {
            const data = {
                amount,
                currency: currency.toUpperCase(),
                description: options.description || '',
                expires_at: options.expires_at,
                metadata: options.metadata || {},
                success_url: options.success_url,
                cancel_url: options.cancel_url,
                collect_billing_address: options.collect_billing_address || false,
                collect_shipping_address: options.collect_shipping_address || false,
                timestamp: Math.floor(Date.now() / 1000)
            };
            
            const response = await this.processor.makeApiRequest('/payment_links', data);
            
            await this.processor.logTransaction(response.success ? 'PAYMENT_LINK_CREATED' : 'PAYMENT_LINK_FAILED', {
                amount,
                currency,
                response
            });
            
            return response;
            
        } catch (error) {
            return {
                success: false,
                error: error.message,
                error_code: 'PAYMENT_LINK_CREATION_FAILED'
            };
        }
    }
    
    async getPaymentLink(linkId) {
        try {
            return await this.processor.makeApiRequest(`/payment_links/${linkId}`, null, 'GET');
        } catch (error) {
            return {
                success: false,
                error: error.message,
                error_code: 'PAYMENT_LINK_RETRIEVAL_FAILED'
            };
        }
    }
    
    async listPaymentLinks(filters = {}) {
        try {
            const params = new URLSearchParams(filters).toString();
            const endpoint = `/payment_links${params ? '?' + params : ''}`;
            return await this.processor.makeApiRequest(endpoint, null, 'GET');
        } catch (error) {
            return {
                success: false,
                error: error.message,
                error_code: 'PAYMENT_LINK_LIST_FAILED'
            };
        }
    }
    
    async deactivatePaymentLink(linkId) {
        try {
            const response = await this.processor.makeApiRequest(`/payment_links/${linkId}/deactivate`, {}, 'POST');
            
            await this.processor.logTransaction(response.success ? 'PAYMENT_LINK_DEACTIVATED' : 'PAYMENT_LINK_DEACTIVATE_FAILED', {
                link_id: linkId,
                response
            });
            
            return response;
            
        } catch (error) {
            return {
                success: false,
                error: error.message,
                error_code: 'PAYMENT_LINK_DEACTIVATE_FAILED'
            };
        }
    }
}

/**
 * Payout Manager Class
 */
class PayoutManager {
    constructor(processor) {
        this.processor = processor;
    }
    
    async createPayout(amount, currency, destination, metadata = {}) {
        try {
            const data = {
                amount,
                currency: currency.toUpperCase(),
                destination,
                metadata,
                timestamp: Math.floor(Date.now() / 1000)
            };
            
            const response = await this.processor.makeApiRequest('/payouts', data);
            
            await this.processor.logTransaction(response.success ? 'PAYOUT_CREATED' : 'PAYOUT_FAILED', {
                amount,
                currency,
                destination: destination.substring(0, 8) + '***',
                response
            });
            
            return response;
            
        } catch (error) {
            return {
                success: false,
                error: error.message,
                error_code: 'PAYOUT_CREATION_FAILED'
            };
        }
    }
    
    async getPayout(payoutId) {
        try {
            return await this.processor.makeApiRequest(`/payouts/${payoutId}`, null, 'GET');
        } catch (error) {
            return {
                success: false,
                error: error.message,
                error_code: 'PAYOUT_RETRIEVAL_FAILED'
            };
        }
    }
    
    async listPayouts(filters = {}) {
        try {
            const params = new URLSearchParams(filters).toString();
            const endpoint = `/payouts${params ? '?' + params : ''}`;
            return await this.processor.makeApiRequest(endpoint, null, 'GET');
        } catch (error) {
            return {
                success: false,
                error: error.message,
                error_code: 'PAYOUT_LIST_FAILED'
            };
        }
    }
    
    async cancelPayout(payoutId) {
        try {
            const response = await this.processor.makeApiRequest(`/payouts/${payoutId}/cancel`, {}, 'POST');
            
            await this.processor.logTransaction(response.success ? 'PAYOUT_CANCELLED' : 'PAYOUT_CANCEL_FAILED', {
                payout_id: payoutId,
                response
            });
            
            return response;
            
        } catch (error) {
            return {
                success: false,
                error: error.message,
                error_code: 'PAYOUT_CANCEL_FAILED'
            };
        }
    }
}

/**
 * Balance Manager Class
 */
class BalanceManager {
    constructor(processor) {
        this.processor = processor;
    }
    
    async getBalance() {
        try {
            return await this.processor.makeApiRequest('/balance', null, 'GET');
        } catch (error) {
            return {
                success: false,
                error: error.message,
                error_code: 'BALANCE_RETRIEVAL_FAILED'
            };
        }
    }
    
    async getBalanceTransactions(filters = {}) {
        try {
            const params = new URLSearchParams(filters).toString();
            const endpoint = `/balance/history${params ? '?' + params : ''}`;
            return await this.processor.makeApiRequest(endpoint, null, 'GET');
        } catch (error) {
            return {
                success: false,
                error: error.message,
                error_code: 'BALANCE_HISTORY_FAILED'
            };
        }
    }
    
    async getBalanceTransaction(transactionId) {
        try {
            return await this.processor.makeApiRequest(`/balance/history/${transactionId}`, null, 'GET');
        } catch (error) {
            return {
                success: false,
                error: error.message,
                error_code: 'BALANCE_TRANSACTION_FAILED'
            };
        }
    }
}

/**
 * Tax Manager Class
 */
class TaxManager {
    constructor(processor) {
        this.processor = processor;
        this.taxRates = new Map();
    }
    
    async calculateTax(amount, currency, country, state = null) {
        try {
            const data = {
                amount,
                currency: currency.toUpperCase(),
                country,
                state,
                timestamp: Math.floor(Date.now() / 1000)
            };
            
            const response = await this.processor.makeApiRequest('/tax/calculate', data);
            
            if (response.success) {
                // Cache tax rate for future use
                const cacheKey = `${country}_${state || 'default'}`;
                this.taxRates.set(cacheKey, {
                    rate: response.data.rate,
                    expires: Date.now() + 3600000 // 1 hour cache
                });
            }
            
            return response;
            
        } catch (error) {
            return {
                success: false,
                error: error.message,
                error_code: 'TAX_CALCULATION_FAILED'
            };
        }
    }
    
    getCachedTaxRate(country, state = null) {
        const cacheKey = `${country}_${state || 'default'}`;
        const cached = this.taxRates.get(cacheKey);
        
        if (cached && cached.expires > Date.now()) {
            return cached.rate;
        }
        
        return null;
    }
    
    async getTaxRates(filters = {}) {
        try {
            const params = new URLSearchParams(filters).toString();
            const endpoint = `/tax/rates${params ? '?' + params : ''}`;
            return await this.processor.makeApiRequest(endpoint, null, 'GET');
        } catch (error) {
            return {
                success: false,
                error: error.message,
                error_code: 'TAX_RATES_FAILED'
            };
        }
    }
}

/**
 * Compliance Manager Class
 */
class ComplianceManager {
    constructor(processor) {
        this.processor = processor;
    }
    
    async performKYC(customerId, documents) {
        try {
            const data = {
                customer_id: customerId,
                documents,
                timestamp: Math.floor(Date.now() / 1000)
            };
            
            const response = await this.processor.makeApiRequest('/compliance/kyc', data);
            
            await this.processor.logTransaction(response.success ? 'KYC_SUBMITTED' : 'KYC_FAILED', {
                customer_id: customerId,
                documents: documents.map(doc => ({ type: doc.type, status: 'submitted' })),
                response
            });
            
            return response;
            
        } catch (error) {
            return {
                success: false,
                error: error.message,
                error_code: 'KYC_SUBMISSION_FAILED'
            };
        }
    }
    
    async getKYCStatus(customerId) {
        try {
            return await this.processor.makeApiRequest(`/compliance/kyc/${customerId}`, null, 'GET');
        } catch (error) {
            return {
                success: false,
                error: error.message,
                error_code: 'KYC_STATUS_FAILED'
            };
        }
    }
    
    async performAMLCheck(customerId, transactionData) {
        try {
            const data = {
                customer_id: customerId,
                transaction: transactionData,
                timestamp: Math.floor(Date.now() / 1000)
            };
            
            const response = await this.processor.makeApiRequest('/compliance/aml', data);
            
            await this.processor.logTransaction(response.success ? 'AML_CHECKED' : 'AML_CHECK_FAILED', {
                customer_id: customerId,
                risk_score: response.data?.risk_score || 'unknown',
                response
            });
            
            return response;
            
        } catch (error) {
            return {
                success: false,
                error: error.message,
                error_code: 'AML_CHECK_FAILED'
            };
        }
    }
    
    async reportSuspiciousActivity(customerId, reason, details) {
        try {
            const data = {
                customer_id: customerId,
                reason,
                details,
                timestamp: Math.floor(Date.now() / 1000),
                reporter: 'system'
            };
            
            const response = await this.processor.makeApiRequest('/compliance/suspicious-activity', data);
            
            await this.processor.logTransaction('SUSPICIOUS_ACTIVITY_REPORTED', {
                customer_id: customerId,
                reason,
                response
            });
            
            return response;
            
        } catch (error) {
            return {
                success: false,
                error: error.message,
                error_code: 'SAR_SUBMISSION_FAILED'
            };
        }
    }
}

/**
 * Main Export and Factory Functions
 */

// Factory function to create a fully configured payment processor
function createPaymentProcessor(apiKey, options = {}) {
    const processor = new PaymentProcessor(apiKey, options);
    
    // Add manager instances
    processor.customers = new CustomerManager(processor);
    processor.paymentMethods = new PaymentMethodManager(processor);
    processor.disputes = new DisputeManager(processor);
    processor.paymentLinks = new PaymentLinkManager(processor);
    processor.payouts = new PayoutManager(processor);
    processor.balance = new BalanceManager(processor);
    processor.tax = new TaxManager(processor);
    processor.compliance = new ComplianceManager(processor);
    
    return processor;
}

// Utility functions
const PaymentUtils = {
    validateCreditCard: (cardNumber) => {
        // Luhn algorithm implementation
        cardNumber = cardNumber.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        
        let sum = 0;
        let isEven = false;
        
        for (let i = cardNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(cardNumber[i]);
            
            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }
            
            sum += digit;
            isEven = !isEven;
        }
        
        return sum % 10 === 0;
    },
    
    formatCurrency: (amount, currency) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase()
        }).format(amount / 100); // Assuming amounts are in cents
    },
    
    generateTransactionId: () => {
        return 'txn_' + Date.now() + '_' + crypto.randomBytes(8).toString('hex');
    },
    
    validateEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    validatePhoneNumber: (phone) => {
        const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
        return phoneRegex.test(phone);
    },
    
    maskCardNumber: (cardNumber) => {
        if (cardNumber.length < 8) return cardNumber;
        return cardNumber.slice(0, 4) + '*'.repeat(cardNumber.length - 8) + cardNumber.slice(-4);
    },
    
    calculateFee: (amount, feePercentage, fixedFee = 0) => {
        return Math.round((amount * feePercentage / 100) + fixedFee);
    },
    
    isValidCurrency: (currency) => {
        const validCurrencies = ['MAD', 'USD', 'EUR', 'GBP', 'CAD', 'JPY', 'AUD', 'CHF', 'CNY'];
        return validCurrencies.includes(currency.toUpperCase());
    }
};

// Export all classes and utilities
module.exports = {
    PaymentProcessor,
    createPaymentProcessor,
    PaymentUtils,
    RateLimiter,
    PaymentCache,
    FraudDetection,
    NotificationManager,
    CustomerManager,
    PaymentMethodManager,
    DisputeManager,
    PaymentLinkManager,
    PayoutManager,
    BalanceManager,
    TaxManager,
    ComplianceManager
};