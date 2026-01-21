@echo off
echo Running Phase 2 SEO Migrations (Advanced Features)...

echo Step 1: Add URL Redirects Table (008)...
php api/run_generic_migration.php api/migrations/008_add_url_redirects_table.sql
if %errorlevel% neq 0 exit /b %errorlevel%

echo Step 2: Modify Reviews Table (009)...
php api/run_generic_migration.php api/migrations/009_modify_reviews_table.sql
if %errorlevel% neq 0 exit /b %errorlevel%

echo Step 3: Add Search Keywords Table (010)...
php api/run_generic_migration.php api/migrations/010_add_search_keywords_table.sql
if %errorlevel% neq 0 exit /b %errorlevel%


echo Phase 2 Migrations Complete!
pause
