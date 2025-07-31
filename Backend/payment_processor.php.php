<?php
//Purpose: Payment gateway integration
//Use Case: Handle rental transactions
class PaymentProcessor {
    private $apiKey;
    
    public function __construct($apiKey) {
        $this->apiKey = $apiKey;
    }

    public function processPayment($amount, $currency, $token) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "https://api.paymentgateway.com/charge");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
            'amount' => $amount,
            'currency' => $currency,
            'source' => $token
        ]));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Authorization: Bearer " . $this->apiKey,
            "Content-Type: application/json"
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        return $httpCode == 200 ? json_decode($response, true) : false;
    }
}

// Example usage
$processor = new PaymentProcessor('YOUR_API_KEY');
$result = $processor->processPayment(500, 'MAD', 'tok_visa');
echo $result ? "Payment successful" : "Payment failed";
?>