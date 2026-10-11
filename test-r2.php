<?php
// Mock $_FILES and environment
$_SERVER['REQUEST_METHOD'] = 'POST';
$_FILES['image'] = [
    'name' => 'test.jpg',
    'type' => 'image/jpeg',
    'tmp_name' => __DIR__ . '/PHOTO-2026-09-28-20-38-49.jpg',
    'error' => UPLOAD_ERR_OK,
    'size' => filesize(__DIR__ . '/PHOTO-2026-09-28-20-38-49.jpg')
];
// run it
include 'public/blog-upload.php';
