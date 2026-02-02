<?php
echo "Before include\n";
require_once __DIR__ . '/ApiHelper.php';
echo "After include\n";
echo "Functions defined: " . implode(', ', get_defined_functions()['user']) . "\n";
?>
