<?php
/**
 * CacheHelper.php
 * Simple file-based caching utility for API responses
 */

class CacheHelper {
    private static $cacheDir = __DIR__ . '/../cache/api/';
    
    /**
     * Initialize cache directory
     */
    private static function init() {
        if (!file_exists(self::$cacheDir)) {
            mkdir(self::$cacheDir, 0755, true);
        }
    }
    
    /**
     * Generate cache key from components
     */
    public static function generateKey($prefix, $params = []) {
        ksort($params);
        $paramString = json_encode($params);
        return $prefix . '_' . md5($paramString);
    }
    
    /**
     * Get cached data
     * @param string $key Cache key
     * @return mixed|null Returns cached data or null if not found/expired
     */
    public static function get($key) {
        self::init();
        $filename = self::$cacheDir . $key . '.cache';
        
        if (!file_exists($filename)) {
            return null;
        }
        
        $data = file_get_contents($filename);
        $cached = json_decode($data, true);
        
        if (!$cached || !isset($cached['expires']) || !isset($cached['data'])) {
            return null;
        }
        
        // Check if expired
        if (time() > $cached['expires']) {
            unlink($filename);
            return null;
        }
        
        return $cached['data'];
    }
    
    /**
     * Set cached data
     * @param string $key Cache key
     * @param mixed $data Data to cache
     * @param int $ttl Time to live in seconds (default: 60)
     */
    public static function set($key, $data, $ttl = 60) {
        self::init();
        $filename = self::$cacheDir . $key . '.cache';
        
        $cached = [
            'expires' => time() + $ttl,
            'data' => $data
        ];
        
        file_put_contents($filename, json_encode($cached));
    }
    
    /**
     * Invalidate cache by key
     */
    public static function invalidate($key) {
        self::init();
        $filename = self::$cacheDir . $key . '.cache';
        
        if (file_exists($filename)) {
            unlink($filename);
        }
    }
    
    /**
     * Invalidate all cache entries matching a prefix
     */
    public static function invalidateByPrefix($prefix) {
        self::init();
        $files = glob(self::$cacheDir . $prefix . '_*.cache');
        
        foreach ($files as $file) {
            unlink($file);
        }
    }
    
    /**
     * Clear all cache
     */
    public static function clearAll() {
        self::init();
        $files = glob(self::$cacheDir . '*.cache');
        
        foreach ($files as $file) {
            unlink($file);
        }
    }
}
