<?php
ini_set('session.cookie_lifetime', 86400); // 1 day
ini_set('session.cookie_secure', false); // true in production
ini_set('session.cookie_httponly', true);
ini_set('session.cookie_samesite', 'Lax');
ini_set('session.gc_maxlifetime', 86400);
?>