<?php
// api/LoginRateLimiter.php
class LoginRateLimiter {
    private $conn;
    private $table = 'login_attempts';
    private $maxAttempts = 10;
    private $lockoutDuration = 300; // 5 minutes in seconds
    
    public function __construct($conn) {
        $this->conn = $conn;
        $this->ensureTableExists();
    }
    
    /**
     * Check if login is allowed for this identifier
     * @param string $identifier Email or IP address
     * @return array ['allowed' => bool, 'attempts' => int, 'locked_until' => timestamp or null]
     */
    public function checkLoginAttempt($identifier) {
        $now = time();
        $windowStart = $now - $this->lockoutDuration;
        
        // Count failed attempts in the window
        $sql = "SELECT COUNT(*) as count, MAX(attempt_time) as last_attempt 
                FROM {$this->table} 
                WHERE identifier = ? AND attempt_time > ? AND success = 0";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("si", $identifier, $windowStart);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $stmt->close();
        
        $failedAttempts = $row['count'];
        $lastAttemptTime = $row['last_attempt'];
        
        // Check if account is locked
        $isLocked = $failedAttempts >= $this->maxAttempts;
        $lockedUntil = $isLocked ? ($lastAttemptTime + $this->lockoutDuration) : null;
        
        return [
            'allowed' => !$isLocked,
            'attempts' => $failedAttempts,
            'locked_until' => $lockedUntil,
            'remaining_attempts' => max(0, $this->maxAttempts - $failedAttempts)
        ];
    }
    
    /**
     * Record a login attempt
     * @param string $identifier Email or IP
     * @param bool $success Whether login was successful
     */
    public function recordAttempt($identifier, $success = false) {
        $now = time();
        $successFlag = $success ? 1 : 0;
        
        $sql = "INSERT INTO {$this->table} (identifier, attempt_time, success) VALUES (?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("sii", $identifier, $now, $successFlag);
        $stmt->execute();
        $stmt->close();
        
        // If successful, clear previous failed attempts
        if ($success) {
            $this->clearAttempts($identifier);
        }
    }
    
    /**
     * Clear all attempts for an identifier
     */
    public function clearAttempts($identifier) {
        $sql = "DELETE FROM {$this->table} WHERE identifier = ? AND success = 0";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("s", $identifier);
        $stmt->execute();
        $stmt->close();
    }
    
    /**
     * Get client identifier (email or IP)
     */
    public static function getClientIp() {
        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            return $_SERVER['HTTP_CLIENT_IP'];
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ips = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
            return trim($ips[0]);
        } else {
            return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        }
    }
    
    /**
     * Create login attempts table if it doesn't exist
     */
    private function ensureTableExists() {
        $sql = "CREATE TABLE IF NOT EXISTS {$this->table} (
            id INT AUTO_INCREMENT PRIMARY KEY,
            identifier VARCHAR(255) NOT NULL,
            attempt_time INT NOT NULL,
            success TINYINT DEFAULT 0,
            INDEX idx_identifier_time (identifier, attempt_time)
        )";
        
        $this->conn->query($sql);
    }
    
    /**
     * Clean up old entries (older than 24 hours)
     */
    public function cleanup() {
        $cutoff = time() - (24 * 3600);
        $sql = "DELETE FROM {$this->table} WHERE attempt_time < ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $cutoff);
        $stmt->execute();
        $stmt->close();
    }
}
?>
