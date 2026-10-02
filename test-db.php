<?php
require 'public/db-config.php';
$conn = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);
$res = $conn->query("SELECT * FROM ssc_whatsapp_groups");
if (!$res) {
    echo "Error: " . $conn->error;
} else {
    while($row = $res->fetch_assoc()) {
        print_r($row);
    }
}
