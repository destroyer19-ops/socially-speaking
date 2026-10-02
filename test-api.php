<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Mock the mysqli class to trace calls
class MockResult {
    public $num_rows = 0;
    public function fetch_assoc() { return ['cnt' => 0]; }
}
class MockStmt {
    public function bind_param() {}
    public function execute() { return true; }
    public function close() {}
}
class mysqli {
    public $connect_error = null;
    public function __construct() {}
    public function set_charset() {}
    public function query($sql) {
        if (strpos($sql, 'SELECT COUNT') !== false) return new MockResult();
        if (strpos($sql, 'SHOW COLUMNS') !== false) return new MockResult();
        if (strpos($sql, 'SELECT id, whatsapp_group_id') !== false) return new MockResult(); // 0 rows
        return true;
    }
    public function prepare() { return new MockStmt(); }
    public function real_escape_string($s) { return $s; }
    public function begin_transaction() {}
    public function commit() {}
    public function rollback() {}
    public function close() {}
}
define('DB_HOST', ''); define('DB_USER', ''); define('DB_PASSWORD', ''); define('DB_NAME', '');
define('TABLE_PREFIX', 'wp_');
define('BREVO_SENDER_NAME', ''); define('BREVO_SENDER_EMAIL', ''); define('BREVO_API_KEY', '');

$_SERVER['REQUEST_METHOD'] = 'POST';
$_POST = [];
// override file_get_contents inside the script if possible? No.
