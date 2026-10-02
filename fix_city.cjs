const fs = require('fs');
let file = fs.readFileSync('public/process-ssc2026.php', 'utf8');

file = file.replace('city_state', 'state_country');
file = file.replace('city_state', 'state_country');
file = file.replace('city_state', 'state_country');
file = file.replace('city_state', 'state_country');
file = file.replace('city_state', 'state_country');
file = file.replace('city_state', 'state_country');
file = file.replace('city_state', 'state_country');
file = file.replace('city_state', 'state_country');
file = file.replace('city_state', 'state_country');
file = file.replace('city_state', 'state_country');
file = file.replace('city_state', 'state_country');
file = file.replace('city_state', 'state_country');
file = file.replace('city_state', 'state_country');
file = file.replace('>City<', '>State / Country<');
file = file.replace('$state_country = ssc_clean($data[\'state_country\'] ?? $data[\'state_country\'] ?? \'\');', '$state_country = ssc_clean($data[\'state_country\'] ?? \'\');');

fs.writeFileSync('public/process-ssc2026.php', file);

// check admin-api.php for city_state
if (fs.existsSync('public/admin-api.php')) {
  let admin = fs.readFileSync('public/admin-api.php', 'utf8');
  admin = admin.replace(/city_state/g, 'state_country');
  fs.writeFileSync('public/admin-api.php', admin);
}

