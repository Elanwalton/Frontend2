<?php
class SignUpRateLimiter {
    private $conn;
    private $maxAttempts = 5; // Max 5 signup attempts per 15 minutes per IP
    private $timeWindow = 900; // 15 minutes in seconds
    
    public function __construct($conn) {
        $this->conn = $conn;
    }
    
    public function isAllowed($ip) {
        // Clean old entries first
        $this->cleanupOldEntries();
        
        // Check current attempts
        $sql = "SELECT COUNT(*) as attempts FROM signup_attempts WHERE ip = ? AND created_at > ?";
        $stmt = $this->conn->prepare($sql);
        $cutoffTime = date('Y-m-d H:i:s', time() - $this->timeWindow);
        $stmt->bind_param("ss", $ip, $cutoffTime);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        
        return $row['attempts'] < $this->maxAttempts;
    }
    
    public function recordAttempt($ip) {
        $sql = "INSERT INTO signup_attempts (ip, created_at) VALUES (?, ?)";
        $stmt = $this->conn->prepare($sql);
        $now = date('Y-m-d H:i:s');
        $stmt->bind_param("ss", $ip, $now);
        $stmt->execute();
    }
    
    public function getRemainingTime($ip) {
        $sql = "SELECT created_at FROM signup_attempts WHERE ip = ? ORDER BY created_at DESC LIMIT 1";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("s", $ip);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($row = $result->fetch_assoc()) {
            $firstAttempt = strtotime($row['created_at']);
            $resetTime = $firstAttempt + $this->timeWindow;
            $remaining = $resetTime - time();
            return max(0, $remaining);
        }
        
        return 0;
    }
    
    private function cleanupOldEntries() {
        $cutoffTime = date('Y-m-d H:i:s', time() - $this->timeWindow);
        $sql = "DELETE FROM signup_attempts WHERE created_at < ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("s", $cutoffTime);
        $stmt->execute();
    }
}
?>
