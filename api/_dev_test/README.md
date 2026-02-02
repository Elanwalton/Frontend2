# Development & Test Files

This folder contains all test, debug, diagnostic, and backup files that are **NOT** used in production.

## ⚠️ Important
**DO NOT** deploy this folder to production servers. These files are for development and testing purposes only.

## Contents

### Test Files
- `test-*.php` - Various test scripts for testing functionality
- `*test*.php` - Additional test files
- `simple-test.php` - Simple test script
- `test.php` - General test file
- `test_api.php` - API testing
- `test_contact_curl.php` - Contact form testing
- `test_newsletter.php` - Newsletter testing
- `test_review.php` - Review system testing
- `testautoloader.php` - Autoloader testing

### Debug Files
- `debug-*.php` - Debug scripts for various components
- `*debug*.php` - Additional debug utilities
- `full_debug_dump.php` - Complete debug dump

### Diagnostic Files
- `diagnostic_users.php` - User diagnostics
- `diagnostic_users_v2.php` - User diagnostics v2
- `diagnostic_users_v3.php` - User diagnostics v3

### Backup Files
- `SignUp-backup.php` - Backup of signup
- `SignUp-test.php` - Signup test version
- `SignUp-simple.php` - Simplified signup
- `backup_products.php` - Product backup utility

### Utility Scripts
- `create-session-tokens-table.php` - Creates deprecated session_tokens table
- `cleanup_users.php` - User cleanup utility
- `verify_rebuild.php` - Verification rebuild script

### Inventory Test Files
- `inventory/stock-levels-test.php` - Stock levels testing
- `inventory/stock-levels-debug.php` - Stock levels debugging

## Usage

These files can be used during development for:
- Testing new features
- Debugging issues
- Diagnosing problems
- Database maintenance
- Email testing
- API testing

## Production Deployment

**Exclude this entire `_dev_test` folder** from production deployments by adding to `.gitignore` or deployment scripts:

```
api/_dev_test/
```

## Total Files
49 development/test files organized in this folder.
