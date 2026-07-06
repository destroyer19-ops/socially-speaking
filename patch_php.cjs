const fs = require('fs');
let file = fs.readFileSync('public/process-ssc2026.php', 'utf8');

file = file.replace("$phone           = ssc_clean($data['phone']           ?? '');", "$phone           = ssc_clean($data['phone']           ?? '');\n$whatsapp        = ssc_clean($data['whatsapp']        ?? '');");
file = file.replace("'phone'           => $phone,", "'phone'           => $phone,\n    'whatsapp'        => $whatsapp,");
file = file.replace("    email          VARCHAR(200)  NOT NULL,\n    phone          VARCHAR(50)   NOT NULL,", "    email          VARCHAR(200)  NOT NULL,\n    phone          VARCHAR(50)   NOT NULL,\n    whatsapp       VARCHAR(50)   NOT NULL,");
file = file.replace("    (id, created_at, status, full_name, email, phone, age_range, gender,", "    (id, created_at, status, full_name, email, phone, whatsapp, age_range, gender,");
file = file.replace("    (?, NOW(), 'Pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", "    (?, NOW(), 'Pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
file = file.replace("'ssssssssssssssss',", "'sssssssssssssssss',");
file = file.replace("$full_name, $email, $phone, $age_range, $gender,", "$full_name, $email, $phone, $whatsapp, $age_range, $gender,");

fs.writeFileSync('public/process-ssc2026.php', file);
