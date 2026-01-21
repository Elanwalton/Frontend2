INSERT INTO url_redirects (old_url, new_url, redirect_type) 
VALUES ('/test-redirect', '/category/inverters', '301')
ON DUPLICATE KEY UPDATE new_url = '/category/inverters';
