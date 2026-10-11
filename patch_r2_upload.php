<?php
// PHP upload endpoint for R2
if ($_SERVER['REQUEST_METHOD'] !== 'POST') exit;

// Cloudflare R2 Credentials
define('R2_ACCOUNT_ID', 'your_account_id'); // Using env in real app
define('R2_ACCESS_KEY', 'your_access_key');
define('R2_SECRET_KEY', 'your_secret_key');
define('R2_BUCKET', 'ssc-blog');
define('R2_CUSTOM_DOMAIN', 'https://media.thetakeover2025.com');

// Optimizing and uploading logic here...
