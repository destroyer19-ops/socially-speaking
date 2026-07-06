const fs = require('fs');
let file = fs.readFileSync('public/process_registration.php', 'utf8');

file = file.replace("$phone = sanitize_input($_POST['phone'] ?? '');", "$phone = sanitize_input($_POST['phone'] ?? '');\n$whatsapp = sanitize_input($_POST['whatsapp'] ?? '');");
file = file.replace("    email VARCHAR(200) NOT NULL,\n    phone VARCHAR(50) NOT NULL,", "    email VARCHAR(200) NOT NULL,\n    phone VARCHAR(50) NOT NULL,\n    whatsapp VARCHAR(50) NOT NULL,");
file = file.replace("id, created_at, university, full_name, email, phone, gender,", "id, created_at, university, full_name, email, phone, whatsapp, gender,");
file = file.replace("?, NOW(), ?, ?, ?, ?, ?,", "?, NOW(), ?, ?, ?, ?, ?, ?,");
file = file.replace("'ssssssssss',", "'sssssssssss',");
file = file.replace("$reg_id, $university, $full_name, $email, $phone, $gender,", "$reg_id, $university, $full_name, $email, $phone, $whatsapp, $gender,");

fs.writeFileSync('public/process_registration.php', file);
