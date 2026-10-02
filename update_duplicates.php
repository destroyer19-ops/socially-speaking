<?php
function updateFile($file, $table_var) {
    $content = file_get_contents($file);
    
    // For ssc2026
    $old1 = <<<PHP
\$escaped_email = \$conn->real_escape_string(\$email);
\$dup = \$conn->query("SELECT id FROM `\$table` WHERE email = '\$escaped_email' LIMIT 1");
PHP;
    $new1 = <<<PHP
\$escaped_email = \$conn->real_escape_string(\$email);
\$escaped_phone = \$conn->real_escape_string(\$phone);
\$dup = \$conn->query("SELECT id FROM `\$table` WHERE email = '\$escaped_email' OR phone = '\$escaped_phone' LIMIT 1");
PHP;

    // For volunteer
    $old2 = <<<PHP
\$escaped_email = \$conn->real_escape_string(\$email);
\$dup = \$conn->query("SELECT id FROM `\$table_name` WHERE email = '\$escaped_email' LIMIT 1");
PHP;
    $new2 = <<<PHP
\$escaped_email = \$conn->real_escape_string(\$email);
\$escaped_phone = \$conn->real_escape_string(\$phone);
\$dup = \$conn->query("SELECT id FROM `\$table_name` WHERE email = '\$escaped_email' OR phone = '\$escaped_phone' LIMIT 1");
PHP;

    if (strpos($content, $old1) !== false) {
        $content = str_replace($old1, $new1, $content);
        $content = str_replace("'This email address is already registered for SSC 2026'", "'This email address or phone number is already registered for SSC 2026'", $content);
    }
    if (strpos($content, $old2) !== false) {
        $content = str_replace($old2, $new2, $content);
        $content = str_replace("'This email address has already been submitted for volunteer registration.'", "'This email address or phone number has already been submitted for volunteer registration.'", $content);
    }
    
    file_put_contents($file, $content);
}

updateFile('public/process-ssc2026.php', '\$table');
updateFile('public/process-volunteer.php', '\$table_name');
echo "Updated duplicates logic.\n";
