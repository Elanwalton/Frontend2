<?php
// api/PasswordValidator.php
class PasswordValidator {
    private static $MIN_LENGTH = 8;
    private static $REQUIRE_UPPERCASE = true;
    private static $REQUIRE_LOWERCASE = true;
    private static $REQUIRE_NUMBERS = true;
    private static $REQUIRE_SPECIAL = true;
    
    /**
     * Validate password strength
     * @param string $password Password to validate
     * @return array ['valid' => bool, 'errors' => array of error messages]
     */
    public static function validate($password) {
        $errors = [];
        
        // Check minimum length
        if (strlen($password) < self::$MIN_LENGTH) {
            $errors[] = "Password must be at least " . self::$MIN_LENGTH . " characters long";
        }
        
        // Check for uppercase
        if (self::$REQUIRE_UPPERCASE && !preg_match('/[A-Z]/', $password)) {
            $errors[] = "Password must contain at least one uppercase letter";
        }
        
        // Check for lowercase
        if (self::$REQUIRE_LOWERCASE && !preg_match('/[a-z]/', $password)) {
            $errors[] = "Password must contain at least one lowercase letter";
        }
        
        // Check for numbers
        if (self::$REQUIRE_NUMBERS && !preg_match('/[0-9]/', $password)) {
            $errors[] = "Password must contain at least one number";
        }
        
        // Check for special characters
        if (self::$REQUIRE_SPECIAL && !preg_match('/[!@#$%^&*()_+\-=\[\]{};:\'",.<>?\/\\|`~]/', $password)) {
            $errors[] = "Password must contain at least one special character (!@#$%^&*)";
        }
        
        return [
            'valid' => count($errors) === 0,
            'errors' => $errors
        ];
    }
    
    /**
     * Get password strength score (0-100)
     */
    public static function getStrength($password) {
        $score = 0;
        
        // Length score (0-30)
        $length = strlen($password);
        if ($length >= 8) $score += 10;
        if ($length >= 12) $score += 10;
        if ($length >= 16) $score += 10;
        
        // Character variety (0-70)
        if (preg_match('/[a-z]/', $password)) $score += 15;
        if (preg_match('/[A-Z]/', $password)) $score += 15;
        if (preg_match('/[0-9]/', $password)) $score += 15;
        if (preg_match('/[!@#$%^&*()_+\-=\[\]{};:\'",.<>?\/\\|`~]/', $password)) $score += 25;
        
        return min($score, 100);
    }
}
?>
