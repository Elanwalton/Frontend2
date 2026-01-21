@echo off
echo ================================================
echo SUNLEAF TECHNOLOGIES - DATABASE MIGRATION
echo ================================================
echo.
echo This will:
echo 1. Clean database (preserve users)
echo 2. Add SEO fields to products and categories
echo 3. Create new SEO tables
echo 4. Populate categories with SEO data
echo 5. Add sample FAQs
echo.
echo WARNING: This will delete all products, orders, and content!
echo Users and authentication data will be preserved.
echo.
pause

echo.
echo Starting migration...
echo.

set MYSQL_PATH="C:\xampp\mysql\bin\mysql.exe"
set DB_NAME=sunleaft_sunleaftechnologies
set DB_USER=root
set DB_PASS=

echo Step 1/8: Cleaning database...
%MYSQL_PATH% -u %DB_USER% %DB_NAME% < 000_cleanup_database.sql
if errorlevel 1 goto error

echo Step 2/8: Adding SEO fields to products...
%MYSQL_PATH% -u %DB_USER% %DB_NAME% < 001_add_seo_fields_to_products.sql
if errorlevel 1 goto error

echo Step 3/8: Adding SEO fields to categories...
%MYSQL_PATH% -u %DB_USER% %DB_NAME% < 002_add_seo_fields_to_categories.sql
if errorlevel 1 goto error

echo Step 4/8: Creating SEO metadata table...
%MYSQL_PATH% -u %DB_USER% %DB_NAME% < 003_create_seo_metadata_table.sql
if errorlevel 1 goto error

echo Step 5/8: Creating FAQs table...
%MYSQL_PATH% -u %DB_USER% %DB_NAME% < 004_create_faqs_table.sql
if errorlevel 1 goto error

echo Step 6/8: Populating categories...
%MYSQL_PATH% -u %DB_USER% %DB_NAME% < 005_populate_categories.sql
if errorlevel 1 goto error

echo Step 7/8: Populating FAQs...
%MYSQL_PATH% -u %DB_USER% %DB_NAME% < 006_populate_sample_faqs.sql
if errorlevel 1 goto error

echo Step 8/8: Populating products and fixing definers...
%MYSQL_PATH% -u %DB_USER% %DB_NAME% < 007_fix_definers_and_populate_products.sql
if errorlevel 1 goto error

echo.
echo ================================================
echo MIGRATION COMPLETED SUCCESSFULLY!
echo ================================================
echo.
echo Database is ready for SEO-optimized products!
echo.
pause
goto end

:error
echo.
echo ================================================
echo ERROR: Migration failed!
echo ================================================
echo Please check the error message above.
echo.
pause

:end
