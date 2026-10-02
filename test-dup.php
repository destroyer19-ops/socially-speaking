<?php
require 'public/db-config.php';
$conn = new mysqli('127.0.0.1', DB_USER, DB_PASSWORD, DB_NAME);
$res = $conn->query("SELECT id, email, full_name, whatsapp_group_id FROM ssc_2026_registrations ORDER BY created_at DESC LIMIT 5");
if (!$res) {
    echo "Error: " . $conn->error;
} else {
    while($row = $res->fetch_assoc()) {
        print_r($row);
    }
}
