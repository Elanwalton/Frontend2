<?php
// api/RateLimiter.php
class RateLimiter {
    private $conn;
    private $table = 'rate_limit_logs';
    
    public function __construct($conn) {
        $this->conn = $conn;
        $this->ensureTableExists();
    }
    
    /**
     * Check if request is within rate limit
     * @param string $identifier Unique identifier (IP, user_id, email, etc.)
     * @param int $maxAttempts Maximum attempts allowed
     * @param int $windowSeconds Time window in seconds
     * @return array ['allowed' => bool, 'remaining' => int, 'reset_at' => timestamp]
     */
    public function checkLimit($identifier, $maxAttempts = 5, $windowSeconds = 3600) {
        $now = time();
        $windowStart = $now - $windowSeconds;
        
        // Count requests in the window
        $sql = "SELECT COUNT(*) as count FROM {$this->table} 
                WHERE identifier = ? AND timestamp > ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("si", $identifier, $windowStart);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $count = $row['count'];
        $stmt->close();
        
        $allowed = $count < $maxAttempts;
        $remaining = max(0, $maxAttempts - $count);
        $resetAt = $windowStart + $windowSeconds;
        
        // Log this request
        $this->logRequest($identifier, $now);
        
        return [
            'allowed' => $allowed,
            'remaining' => $remaining,
            'reset_at' => $resetAt,
            'attempts' => $count + 1
        ];
    }
    
    /**
     * Log a request attempt
     */
    private function logRequest($identifier, $timestamp) {
        $sql = "INSERT INTO {$this->table} (identifier, timestamp) VALUES (?, ?)";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("si", $identifier, $timestamp);
        $stmt->execute();
        $stmt->close();
    }
    
    /**
     * Get client IP address
     */
    public static function getClientIp() {
        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            return $_SERVER['HTTP_CLIENT_IP'];
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            // Handle multiple IPs (take the first one)
            $ips = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
            return trim($ips[0]);
        } else {
            return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        }
    }
    
    /**
     * Create rate limit table if it doesn't exist
     */
    private function ensureTableExists() {
        $sql = "CREATE TABLE IF NOT EXISTS {$this->table} (
            id INT AUTO_INCREMENT PRIMARY KEY,
            identifier VARCHAR(255) NOT NULL,
            timestamp INT NOT NULL,
            INDEX idx_identifier_timestamp (identifier, timestamp)
        )";
        
        $this->conn->query($sql);
    }
    
    /**
     * Clean up old entries (older than 24 hours)
     */
    public function cleanup() {
        $cutoff = time() - (24 * 3600);
        $sql = "DELETE FROM {$this->table} WHERE timestamp < ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $cutoff);
        $stmt->execute();
        $stmt->close();
    }
}
?>
