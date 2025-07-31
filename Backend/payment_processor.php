<?php
//Purpose: Enhanced Payment gateway integration with comprehensive features
//Use Case: Handle rental transactions with advanced security and logging
//Author: Enhanced Payment System
//Version: 2.0

class PaymentProcessor {
    private $apiKey;
    private $baseUrl;
    private $timeout;
    private $logFile;
    private $supportedCurrencies;
    private $maxRetries;
    private $webhookSecret;
    private $environment;
    private $rateLimiter;
    private $cache;
    private $encryptionKey;
    private $fraudDetection;
    private $notifications;
    
    public function __construct($apiKey, $options = []) {
        $this->apiKey = $apiKey;
        $this->baseUrl = $options['base_url'] ?? "https://api.paymentgateway.com";
        $this->timeout = $options['timeout'] ?? 30;
        $this->logFile = $options['log_file'] ?? 'payment_logs.txt';
        $this->maxRetries = $options['max_retries'] ?? 3;
        $this->webhookSecret = $options['webhook_secret'] ?? '';
        $this->environment = $options['environment'] ?? 'production';
        $this->encryptionKey = $options['encryption_key'] ?? $this->generateEncryptionKey();
        $this->supportedCurrencies = ['MAD', 'USD', 'EUR', 'GBP', 'CAD', 'JPY', 'AUD', 'CHF', 'CNY'];
        
        // Initialize components
        $this->rateLimiter = new RateLimiter($options['rate_limit'] ?? 100);
        $this->cache = new PaymentCache($options['cache_ttl'] ?? 300);
        $this->fraudDetection = new FraudDetection($options['fraud_rules'] ?? []);
        $this->notifications = new NotificationManager($options['notifications'] ?? []);
        
        // Validate API key
        if (empty($this->apiKey)) {
            throw new InvalidArgumentException("API key is required");
        }
        
        // Environment-specific settings
        if ($this->environment === 'sandbox') {
            $this->baseUrl = str_replace('api.', 'sandbox-api.', $this->baseUrl);
        }
    }

    /**
     * Process a payment with enhanced error handling and validation
     */
    public function processPayment($amount, $currency, $token, $metadata = []) {
        try {
            // Rate limiting check
            if (!$this->rateLimiter->allowRequest()) {
                throw new Exception("Rate limit exceeded. Please try again later.");
            }
            
            // Validate input parameters
            $this->validatePaymentData($amount, $currency, $token);
            
            // Fraud detection
            $fraudScore = $this->fraudDetection->analyzeTransaction($amount, $currency, $metadata);
            if ($fraudScore > 80) {
                $this->logTransaction('FRAUD_BLOCKED', [
                    'amount' => $amount,
                    'currency' => $currency,
                    'fraud_score' => $fraudScore,
                    'metadata' => $metadata
                ]);
                throw new Exception("Transaction blocked due to fraud detection");
            }
            
            // Check cache for duplicate transaction
            $cacheKey = $this->generateCacheKey($amount, $currency, $token, $metadata);
            if ($cachedResult = $this->cache->get($cacheKey)) {
                $this->logTransaction('CACHE_HIT', ['cache_key' => $cacheKey]);
                return $cachedResult;
            }
            
            // Log payment attempt
            $this->logTransaction('ATTEMPT', [
                'amount' => $amount,
                'currency' => $currency,
                'token' => substr($token, 0, 8) . '***', // Mask token for security
                'fraud_score' => $fraudScore,
                'timestamp' => date('Y-m-d H:i:s')
            ]);
            
            $paymentData = [
                'amount' => $amount,
                'currency' => strtoupper($currency),
                'source' => $token,
                'metadata' => $metadata,
                'timestamp' => time(),
                'idempotency_key' => $this->generateIdempotencyKey()
            ];
            
            $response = $this->makeApiRequest('/charge', $paymentData);
            
            if ($response['success']) {
                $result = [
                    'success' => true,
                    'transaction_id' => $response['data']['id'] ?? null,
                    'amount' => $amount,
                    'currency' => $currency,
                    'status' => 'completed',
                    'timestamp' => date('Y-m-d H:i:s'),
                    'fraud_score' => $fraudScore,
                    'data' => $response['data']
                ];
                
                // Cache successful result
                $this->cache->set($cacheKey, $result, 300);
                
                // Send success notification
                $this->notifications->sendPaymentSuccess($result);
                
                $this->logTransaction('SUCCESS', $response['data']);
                return $result;
            } else {
                $result = [
                    'success' => false,
                    'error' => $response['error'] ?? 'Unknown error',
                    'error_code' => $response['error_code'] ?? 'UNKNOWN',
                    'timestamp' => date('Y-m-d H:i:s'),
                    'fraud_score' => $fraudScore
                ];
                
                // Send failure notification
                $this->notifications->sendPaymentFailure($result);
                
                $this->logTransaction('FAILED', $response);
                return $result;
            }
            
        } catch (Exception $e) {
            $this->logTransaction('ERROR', ['message' => $e->getMessage()]);
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'error_code' => 'EXCEPTION',
                'timestamp' => date('Y-m-d H:i:s')
            ];
        }
    }
    
    /**
     * Refund a payment
     */
    public function refundPayment($transactionId, $amount = null, $reason = '') {
        try {
            if (empty($transactionId)) {
                throw new InvalidArgumentException("Transaction ID is required for refund");
            }
            
            $refundData = [
                'transaction_id' => $transactionId,
                'reason' => $reason,
                'timestamp' => time()
            ];
            
            if ($amount !== null) {
                $refundData['amount'] = $amount;
            }
            
            $response = $this->makeApiRequest('/refund', $refundData);
            
            $this->logTransaction($response['success'] ? 'REFUND_SUCCESS' : 'REFUND_FAILED', [
                'transaction_id' => $transactionId,
                'amount' => $amount,
                'response' => $response
            ]);
            
            return $response;
            
        } catch (Exception $e) {
            $this->logTransaction('REFUND_ERROR', ['message' => $e->getMessage()]);
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'error_code' => 'REFUND_EXCEPTION'
            ];
        }
    }
    
    /**
     * Get payment status
     */
    public function getPaymentStatus($transactionId) {
        try {
            if (empty($transactionId)) {
                throw new InvalidArgumentException("Transaction ID is required");
            }
            
            $response = $this->makeApiRequest('/status/' . $transactionId, null, 'GET');
            return $response;
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'error_code' => 'STATUS_CHECK_FAILED'
            ];
        }
    }
    
    /**
     * Validate webhook signature for security
     */
    public function validateWebhook($payload, $signature, $secret) {
        $expectedSignature = hash_hmac('sha256', $payload, $secret);
        return hash_equals($expectedSignature, $signature);
    }
    
    /**
     * Make API request with retry logic
     */
    private function makeApiRequest($endpoint, $data = null, $method = 'POST') {
        $retries = 0;
        
        while ($retries < $this->maxRetries) {
            try {
                $ch = curl_init();
                $url = $this->baseUrl . $endpoint;
                
                curl_setopt_array($ch, [
                    CURLOPT_URL => $url,
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_TIMEOUT => $this->timeout,
                    CURLOPT_CONNECTTIMEOUT => 10,
                    CURLOPT_SSL_VERIFYPEER => true,
                    CURLOPT_SSL_VERIFYHOST => 2,
                    CURLOPT_USERAGENT => 'PaymentProcessor/2.0',
                    CURLOPT_HTTPHEADER => [
                        "Authorization: Bearer " . $this->apiKey,
                        "Content-Type: application/json",
                        "Accept: application/json"
                    ]
                ]);
                
                if ($method === 'POST' && $data) {
                    curl_setopt($ch, CURLOPT_POST, true);
                    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
                }
                
                $response = curl_exec($ch);
                $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                $curlError = curl_error($ch);
                curl_close($ch);
                
                if ($curlError) {
                    throw new Exception("CURL Error: " . $curlError);
                }
                
                $decodedResponse = json_decode($response, true);
                
                if ($httpCode >= 200 && $httpCode < 300) {
                    return [
                        'success' => true,
                        'data' => $decodedResponse,
                        'http_code' => $httpCode
                    ];
                } elseif ($httpCode >= 500 && $retries < $this->maxRetries - 1) {
                    // Retry on server errors
                    $retries++;
                    sleep(pow(2, $retries)); // Exponential backoff
                    continue;
                } else {
                    return [
                        'success' => false,
                        'error' => $decodedResponse['error'] ?? 'HTTP Error',
                        'error_code' => $decodedResponse['error_code'] ?? 'HTTP_' . $httpCode,
                        'http_code' => $httpCode
                    ];
                }
                
            } catch (Exception $e) {
                if ($retries < $this->maxRetries - 1) {
                    $retries++;
                    sleep(pow(2, $retries));
                    continue;
                } else {
                    throw $e;
                }
            }
        }
    }
    
    /**
     * Validate payment data
     */
    private function validatePaymentData($amount, $currency, $token) {
        if (!is_numeric($amount) || $amount <= 0) {
            throw new InvalidArgumentException("Amount must be a positive number");
        }
        
        if (!in_array(strtoupper($currency), $this->supportedCurrencies)) {
            throw new InvalidArgumentException("Unsupported currency: " . $currency);
        }
        
        if (empty($token)) {
            throw new InvalidArgumentException("Payment token is required");
        }
        
        // Additional validation for amount limits
        if ($amount > 1000000) { // 1M limit
            throw new InvalidArgumentException("Amount exceeds maximum limit");
        }
        
        if ($amount < 1) { // Minimum 1 unit
            throw new InvalidArgumentException("Amount below minimum limit");
        }
    }
    
    /**
     * Generate unique idempotency key
     */
    private function generateIdempotencyKey() {
        return uniqid('pay_', true) . '_' . bin2hex(random_bytes(8));
    }
    
    /**
     * Generate cache key for transactions
     */
    private function generateCacheKey($amount, $currency, $token, $metadata) {
        $data = $amount . $currency . substr($token, -4) . serialize($metadata);
        return 'payment_' . md5($data);
    }
    
    /**
     * Generate encryption key
     */
    private function generateEncryptionKey() {
        return bin2hex(random_bytes(32));
    }
    
    /**
     * Get batch summary
     */
    private function getBatchSummary($results) {
        $successful = array_filter($results, function($r) { return $r['success']; });
        $failed = array_filter($results, function($r) { return !$r['success']; });
        
        return [
            'total' => count($results),
            'successful' => count($successful),
            'failed' => count($failed),
            'success_rate' => count($results) > 0 ? (count($successful) / count($results)) * 100 : 0
        ];
    }
    
    /**
     * Process analytics data
     */
    private function processAnalytics($data) {
        return [
            'total_transactions' => $data['total_count'] ?? 0,
            'total_amount' => $data['total_amount'] ?? 0,
            'average_amount' => $data['average_amount'] ?? 0,
            'success_rate' => $data['success_rate'] ?? 0,
            'top_currencies' => $data['top_currencies'] ?? [],
            'fraud_rate' => $data['fraud_rate'] ?? 0
        ];
    }
    
    /**
     * Generate CSV report
     */
    private function generateCSVReport($data) {
        $csv = "Transaction ID,Amount,Currency,Status,Date,Customer ID\n";
        foreach ($data as $transaction) {
            $csv .= sprintf("%s,%s,%s,%s,%s,%s\n",
                $transaction['id'],
                $transaction['amount'],
                $transaction['currency'],
                $transaction['status'],
                $transaction['created_at'],
                $transaction['customer_id'] ?? 'N/A'
            );
        }
        return $csv;
    }
    
    /**
     * Handle payment succeeded webhook
     */
    private function handlePaymentSucceeded($data) {
        $this->notifications->sendPaymentSuccess($data);
        return ['success' => true, 'message' => 'Payment success handled'];
    }
    
    /**
     * Handle payment failed webhook
     */
    private function handlePaymentFailed($data) {
        $this->notifications->sendPaymentFailure($data);
        return ['success' => true, 'message' => 'Payment failure handled'];
    }
    
    /**
     * Handle refund created webhook
     */
    private function handleRefundCreated($data) {
        $this->notifications->sendRefundNotification($data);
        return ['success' => true, 'message' => 'Refund notification handled'];
    }
    
    /**
     * Log transaction for audit trail
     */
    private function logTransaction($type, $data) {
        $logEntry = [
            'timestamp' => date('Y-m-d H:i:s'),
            'type' => $type,
            'data' => $data,
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
        ];
        
        $logLine = json_encode($logEntry) . PHP_EOL;
        file_put_contents($this->logFile, $logLine, FILE_APPEND | LOCK_EX);
    }
    
    /**
     * Get supported currencies
     */
    public function getSupportedCurrencies() {
        return $this->supportedCurrencies;
    }
    
    /**
     * Set custom timeout
     */
    public function setTimeout($timeout) {
        $this->timeout = max(5, min(120, $timeout)); // Between 5-120 seconds
    }
    
    /**
     * Health check for payment gateway
     */
    public function healthCheck() {
        try {
            $response = $this->makeApiRequest('/health', null, 'GET');
            return $response['success'];
        } catch (Exception $e) {
            return false;
        }
    }
    
    /**
     * Process batch payments
     */
    public function processBatchPayments($payments) {
        $results = [];
        $batchId = uniqid('batch_', true);
        
        $this->logTransaction('BATCH_START', [
            'batch_id' => $batchId,
            'count' => count($payments)
        ]);
        
        foreach ($payments as $index => $payment) {
            try {
                $result = $this->processPayment(
                    $payment['amount'],
                    $payment['currency'],
                    $payment['token'],
                    array_merge($payment['metadata'] ?? [], ['batch_id' => $batchId])
                );
                $results[$index] = $result;
            } catch (Exception $e) {
                $results[$index] = [
                    'success' => false,
                    'error' => $e->getMessage(),
                    'error_code' => 'BATCH_PAYMENT_FAILED'
                ];
            }
        }
        
        $this->logTransaction('BATCH_COMPLETE', [
            'batch_id' => $batchId,
            'results' => $results
        ]);
        
        return [
            'batch_id' => $batchId,
            'results' => $results,
            'summary' => $this->getBatchSummary($results)
        ];
    }
    
    /**
     * Create payment intent for delayed capture
     */
    public function createPaymentIntent($amount, $currency, $metadata = []) {
        try {
            $intentData = [
                'amount' => $amount,
                'currency' => strtoupper($currency),
                'capture_method' => 'manual',
                'metadata' => $metadata,
                'timestamp' => time()
            ];
            
            $response = $this->makeApiRequest('/payment_intents', $intentData);
            
            if ($response['success']) {
                $this->logTransaction('INTENT_CREATED', $response['data']);
                return [
                    'success' => true,
                    'intent_id' => $response['data']['id'],
                    'client_secret' => $response['data']['client_secret'],
                    'status' => $response['data']['status']
                ];
            }
            
            return $response;
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'error_code' => 'INTENT_CREATION_FAILED'
            ];
        }
    }
    
    /**
     * Capture payment intent
     */
    public function capturePaymentIntent($intentId, $amount = null) {
        try {
            $captureData = ['intent_id' => $intentId];
            if ($amount !== null) {
                $captureData['amount'] = $amount;
            }
            
            $response = $this->makeApiRequest('/payment_intents/' . $intentId . '/capture', $captureData);
            
            $this->logTransaction($response['success'] ? 'INTENT_CAPTURED' : 'INTENT_CAPTURE_FAILED', [
                'intent_id' => $intentId,
                'amount' => $amount,
                'response' => $response
            ]);
            
            return $response;
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'error_code' => 'INTENT_CAPTURE_FAILED'
            ];
        }
    }
    
    /**
     * Create subscription
     */
    public function createSubscription($customerId, $priceId, $metadata = []) {
        try {
            $subscriptionData = [
                'customer' => $customerId,
                'price' => $priceId,
                'metadata' => $metadata,
                'timestamp' => time()
            ];
            
            $response = $this->makeApiRequest('/subscriptions', $subscriptionData);
            
            $this->logTransaction($response['success'] ? 'SUBSCRIPTION_CREATED' : 'SUBSCRIPTION_FAILED', [
                'customer_id' => $customerId,
                'price_id' => $priceId,
                'response' => $response
            ]);
            
            return $response;
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'error_code' => 'SUBSCRIPTION_CREATION_FAILED'
            ];
        }
    }
    
    /**
     * Cancel subscription
     */
    public function cancelSubscription($subscriptionId, $reason = '') {
        try {
            $cancelData = [
                'subscription_id' => $subscriptionId,
                'reason' => $reason,
                'timestamp' => time()
            ];
            
            $response = $this->makeApiRequest('/subscriptions/' . $subscriptionId . '/cancel', $cancelData);
            
            $this->logTransaction($response['success'] ? 'SUBSCRIPTION_CANCELLED' : 'SUBSCRIPTION_CANCEL_FAILED', [
                'subscription_id' => $subscriptionId,
                'reason' => $reason,
                'response' => $response
            ]);
            
            return $response;
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'error_code' => 'SUBSCRIPTION_CANCEL_FAILED'
            ];
        }
    }
    
    /**
     * Get transaction analytics
     */
    public function getAnalytics($startDate, $endDate, $filters = []) {
        try {
            $analyticsData = [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'filters' => $filters
            ];
            
            $response = $this->makeApiRequest('/analytics', $analyticsData);
            
            if ($response['success']) {
                return [
                    'success' => true,
                    'data' => $response['data'],
                    'summary' => $this->processAnalytics($response['data'])
                ];
            }
            
            return $response;
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'error_code' => 'ANALYTICS_FAILED'
            ];
        }
    }
    
    /**
     * Encrypt sensitive data
     */
    public function encryptData($data) {
        $iv = random_bytes(16);
        $encrypted = openssl_encrypt(json_encode($data), 'AES-256-CBC', $this->encryptionKey, 0, $iv);
        return base64_encode($iv . $encrypted);
    }
    
    /**
     * Decrypt sensitive data
     */
    public function decryptData($encryptedData) {
        $data = base64_decode($encryptedData);
        $iv = substr($data, 0, 16);
        $encrypted = substr($data, 16);
        $decrypted = openssl_decrypt($encrypted, 'AES-256-CBC', $this->encryptionKey, 0, $iv);
        return json_decode($decrypted, true);
    }
    
    /**
     * Generate payment report
     */
    public function generateReport($type, $startDate, $endDate, $format = 'json') {
        try {
            $reportData = [
                'type' => $type,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'format' => $format
            ];
            
            $response = $this->makeApiRequest('/reports', $reportData);
            
            if ($response['success'] && $format === 'csv') {
                return $this->generateCSVReport($response['data']);
            }
            
            return $response;
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'error_code' => 'REPORT_GENERATION_FAILED'
            ];
        }
    }
    
    /**
     * Setup webhook endpoint
     */
    public function setupWebhook($url, $events = []) {
        try {
            $webhookData = [
                'url' => $url,
                'events' => $events ?: ['payment.succeeded', 'payment.failed', 'refund.created'],
                'secret' => $this->webhookSecret
            ];
            
            $response = $this->makeApiRequest('/webhooks', $webhookData);
            
            $this->logTransaction($response['success'] ? 'WEBHOOK_CREATED' : 'WEBHOOK_FAILED', [
                'url' => $url,
                'events' => $events,
                'response' => $response
            ]);
            
            return $response;
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'error_code' => 'WEBHOOK_SETUP_FAILED'
            ];
        }
    }
    
    /**
     * Process webhook payload
     */
    public function processWebhook($payload, $signature) {
        try {
            if (!$this->validateWebhook($payload, $signature, $this->webhookSecret)) {
                throw new Exception("Invalid webhook signature");
            }
            
            $event = json_decode($payload, true);
            
            $this->logTransaction('WEBHOOK_RECEIVED', [
                'event_type' => $event['type'] ?? 'unknown',
                'event_id' => $event['id'] ?? 'unknown'
            ]);
            
            // Process different event types
            switch ($event['type']) {
                case 'payment.succeeded':
                    return $this->handlePaymentSucceeded($event['data']);
                case 'payment.failed':
                    return $this->handlePaymentFailed($event['data']);
                case 'refund.created':
                    return $this->handleRefundCreated($event['data']);
                default:
                    return ['success' => true, 'message' => 'Event processed'];
            }
            
        } catch (Exception $e) {
            $this->logTransaction('WEBHOOK_ERROR', ['message' => $e->getMessage()]);
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'error_code' => 'WEBHOOK_PROCESSING_FAILED'
            ];
        }
    }
}

// Enhanced usage examples
try {
    // Initialize with options
    $processor = new PaymentProcessor('YOUR_API_KEY', [
        'timeout' => 30,
        'log_file' => 'payments.log',
        'max_retries' => 3
    ]);
    
    // Process payment with metadata
    $result = $processor->processPayment(500, 'MAD', 'tok_visa', [
        'customer_id' => '12345',
        'order_id' => 'ORD-2024-001',
        'description' => 'Car rental payment'
    ]);
    
    if ($result['success']) {
        echo "Payment successful! Transaction ID: " . $result['transaction_id'] . "\n";
        
        // Check payment status
        $status = $processor->getPaymentStatus($result['transaction_id']);
        echo "Payment status: " . json_encode($status) . "\n";
        
    } else {
        echo "Payment failed: " . $result['error'] . " (Code: " . $result['error_code'] . ")\n";
    }
    
    // Health check
    if ($processor->healthCheck()) {
        echo "Payment gateway is healthy\n";
    } else {
        echo "Payment gateway health check failed\n";
    }
    
    // Show supported currencies
    echo "Supported currencies: " . implode(', ', $processor->getSupportedCurrencies()) . "\n";
    
} catch (Exception $e) {
    echo "Error initializing payment processor: " . $e->getMessage() . "\n";
}

/**
 * Rate Limiter Class
 */
class RateLimiter {
    private $limit;
    private $requests = [];
    
    public function __construct($limit = 100) {
        $this->limit = $limit;
    }
    
    public function allowRequest($identifier = 'default') {
        $now = time();
        $windowStart = $now - 3600; // 1 hour window
        
        // Clean old requests
        $this->requests[$identifier] = array_filter(
            $this->requests[$identifier] ?? [],
            function($timestamp) use ($windowStart) {
                return $timestamp > $windowStart;
            }
        );
        
        // Check if under limit
        if (count($this->requests[$identifier] ?? []) < $this->limit) {
            $this->requests[$identifier][] = $now;
            return true;
        }
        
        return false;
    }
}

/**
 * Payment Cache Class
 */
class PaymentCache {
    private $cache = [];
    private $ttl;
    
    public function __construct($ttl = 300) {
        $this->ttl = $ttl;
    }
    
    public function get($key) {
        if (isset($this->cache[$key])) {
            $item = $this->cache[$key];
            if ($item['expires'] > time()) {
                return $item['data'];
            } else {
                unset($this->cache[$key]);
            }
        }
        return null;
    }
    
    public function set($key, $data, $ttl = null) {
        $this->cache[$key] = [
            'data' => $data,
            'expires' => time() + ($ttl ?? $this->ttl)
        ];
    }
    
    public function delete($key) {
        unset($this->cache[$key]);
    }
    
    public function clear() {
        $this->cache = [];
    }
}

/**
 * Fraud Detection Class
 */
class FraudDetection {
    private $rules;
    
    public function __construct($rules = []) {
        $this->rules = array_merge([
            'max_amount' => 10000,
            'suspicious_countries' => ['XX', 'YY'],
            'velocity_limit' => 5, // max transactions per hour
            'unusual_hours' => [0, 1, 2, 3, 4, 5] // 12AM-5AM
        ], $rules);
    }
    
    public function analyzeTransaction($amount, $currency, $metadata) {
        $score = 0;
        
        // Amount-based scoring
        if ($amount > $this->rules['max_amount']) {
            $score += 30;
        }
        
        // Country-based scoring
        $country = $metadata['country'] ?? '';
        if (in_array($country, $this->rules['suspicious_countries'])) {
            $score += 25;
        }
        
        // Time-based scoring
        $hour = (int)date('H');
        if (in_array($hour, $this->rules['unusual_hours'])) {
            $score += 15;
        }
        
        // Velocity scoring
        $ip = $_SERVER['REMOTE_ADDR'] ?? '';
        if ($this->checkVelocity($ip)) {
            $score += 20;
        }
        
        // Email domain scoring
        $email = $metadata['email'] ?? '';
        if ($this->isSuspiciousEmail($email)) {
            $score += 10;
        }
        
        return min($score, 100);
    }
    
    private function checkVelocity($ip) {
        // Simplified velocity check
        $file = 'velocity_' . md5($ip) . '.tmp';
        $requests = [];
        
        if (file_exists($file)) {
            $requests = json_decode(file_get_contents($file), true) ?? [];
        }
        
        $now = time();
        $hourAgo = $now - 3600;
        
        // Filter recent requests
        $requests = array_filter($requests, function($timestamp) use ($hourAgo) {
            return $timestamp > $hourAgo;
        });
        
        $requests[] = $now;
        file_put_contents($file, json_encode($requests));
        
        return count($requests) > $this->rules['velocity_limit'];
    }
    
    private function isSuspiciousEmail($email) {
        $suspiciousDomains = ['tempmail.com', '10minutemail.com', 'guerrillamail.com'];
        $domain = substr(strrchr($email, "@"), 1);
        return in_array($domain, $suspiciousDomains);
    }
}

/**
 * Notification Manager Class
 */
class NotificationManager {
    private $config;
    
    public function __construct($config = []) {
        $this->config = array_merge([
            'email_enabled' => false,
            'sms_enabled' => false,
            'webhook_enabled' => false,
            'slack_enabled' => false
        ], $config);
    }
    
    public function sendPaymentSuccess($data) {
        $message = "Payment successful: " . $data['transaction_id'] ?? 'Unknown';
        $this->sendNotification('payment_success', $message, $data);
    }
    
    public function sendPaymentFailure($data) {
        $message = "Payment failed: " . ($data['error'] ?? 'Unknown error');
        $this->sendNotification('payment_failure', $message, $data);
    }
    
    public function sendRefundNotification($data) {
        $message = "Refund processed: " . $data['refund_id'] ?? 'Unknown';
        $this->sendNotification('refund_created', $message, $data);
    }
    
    private function sendNotification($type, $message, $data) {
        if ($this->config['email_enabled']) {
            $this->sendEmail($type, $message, $data);
        }
        
        if ($this->config['sms_enabled']) {
            $this->sendSMS($type, $message, $data);
        }
        
        if ($this->config['webhook_enabled']) {
            $this->sendWebhook($type, $message, $data);
        }
        
        if ($this->config['slack_enabled']) {
            $this->sendSlack($type, $message, $data);
        }
    }
    
    private function sendEmail($type, $message, $data) {
        // Email implementation
        error_log("EMAIL NOTIFICATION: $type - $message");
    }
    
    private function sendSMS($type, $message, $data) {
        // SMS implementation
        error_log("SMS NOTIFICATION: $type - $message");
    }
    
    private function sendWebhook($type, $message, $data) {
        // Webhook implementation
        error_log("WEBHOOK NOTIFICATION: $type - $message");
    }
    
    private function sendSlack($type, $message, $data) {
        // Slack implementation
        error_log("SLACK NOTIFICATION: $type - $message");
    }
}

/**
 * Payment Method Manager Class
 */
class PaymentMethodManager {
    private $processor;
    
    public function __construct($processor) {
        $this->processor = $processor;
    }
    
    public function createPaymentMethod($customerId, $type, $details) {
        try {
            $methodData = [
                'customer' => $customerId,
                'type' => $type,
                'details' => $details,
                'timestamp' => time()
            ];
            
            return $this->processor->makeApiRequest('/payment_methods', $methodData);
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'error_code' => 'PAYMENT_METHOD_CREATION_FAILED'
            ];
        }
    }
    
    public function listPaymentMethods($customerId) {
        try {
            return $this->processor->makeApiRequest('/customers/' . $customerId . '/payment_methods', null, 'GET');
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'error_code' => 'PAYMENT_METHOD_LIST_FAILED'
            ];
        }
    }
    
    public function deletePaymentMethod($methodId) {
        try {
            return $this->processor->makeApiRequest('/payment_methods/' . $methodId, null, 'DELETE');
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'error_code' => 'PAYMENT_METHOD_DELETE_FAILED'
            ];
        }
    }
}

/**
 * Customer Manager Class
 */
class CustomerManager {
    private $processor;
    
    public function __construct($processor) {
        $this->processor = $processor;
    }
    
    public function createCustomer($email, $name, $metadata = []) {
        try {
            $customerData = [
                'email' => $email,
                'name' => $name,
                'metadata' => $metadata,
                'timestamp' => time()
            ];
            
            return $this->processor->makeApiRequest('/customers', $customerData);
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'error_code' => 'CUSTOMER_CREATION_FAILED'
            ];
        }
    }
    
    public function getCustomer($customerId) {
        try {
            return $this->processor->makeApiRequest('/customers/' . $customerId, null, 'GET');
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'error_code' => 'CUSTOMER_RETRIEVAL_FAILED'
            ];
        }
    }
    
    public function updateCustomer($customerId, $data) {
        try {
            return $this->processor->makeApiRequest('/customers/' . $customerId, $data, 'PUT');
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'error_code' => 'CUSTOMER_UPDATE_FAILED'
            ];
        }
    }
}

?>