<?php
$_SERVER['REQUEST_METHOD'] = 'POST';
$_GET['action'] = 'create';
$payload = json_encode([
    'title' => 'Test Blog Post with R2 Image',
    'slug' => 'test-blog-post-r2',
    'excerpt' => 'This is a test post confirming R2 integration.',
    'body' => '<p>The image should be hosted on the custom domain successfully.</p>',
    'image_url' => 'https://media.thetakeovernetwork.org/blog/featured/blog_6ac12b369f986.jpg'
]);

// Mock php://input
function file_get_contents_mock($file) {
    global $payload;
    return $file === 'php://input' ? $payload : \file_get_contents($file);
}
// since we can't redefine file_get_contents easily, let's just edit blog-api.php temporarily for the test or just use php-cgi.
