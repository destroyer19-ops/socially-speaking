<?php
/**
 * Admin Panel for The Takeover Table Registrations
 */

ini_set('display_errors', 0);
error_reporting(0);
session_start();

// Include config to get DB credentials and ADMIN_USERNAME / ADMIN_PASSWORD
$config_path = __DIR__ . '/config.php';
if (file_exists($config_path)) {
    require_once $config_path;
}

// Fallback if not defined in config
$admin_user = defined('ADMIN_USERNAME') ? ADMIN_USERNAME : 'admin';
$admin_pass = defined('ADMIN_PASSWORD') ? ADMIN_PASSWORD : 'change-this-password';

// Handle Login
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['login'])) {
    if ($_POST['username'] === $admin_user && $_POST['password'] === $admin_pass) {
        $_SESSION['ttb_admin_logged_in'] = true;
        header("Location: admin-takeover.php");
        exit;
    } else {
        $login_error = "Invalid credentials";
    }
}

// Handle Logout
if (isset($_GET['logout'])) {
    unset($_SESSION['ttb_admin_logged_in']);
    header("Location: admin-takeover.php");
    exit;
}

$is_logged_in = isset($_SESSION['ttb_admin_logged_in']) && $_SESSION['ttb_admin_logged_in'] === true;

if (!$is_logged_in) {
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TTB Admin Login</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-[#06091a] flex items-center justify-center min-h-screen">
        <div class="bg-[#0f1633] p-8 rounded-2xl shadow-2xl border border-white/10 w-full max-w-md">
            <h2 class="text-3xl font-black mb-2 text-center text-[#d4af37]">Takeover Table</h2>
            <p class="text-gray-400 text-center mb-8 text-sm">Secure Admin Portal</p>
            
            <?php if (isset($login_error)) echo "<p class='text-red-400 mb-4 text-center text-sm bg-red-400/10 p-2 rounded'>$login_error</p>"; ?>
            
            <form method="POST">
                <input type="text" name="username" placeholder="Username" class="w-full bg-white/5 border border-white/10 p-3 rounded-xl mb-4 text-white focus:outline-none focus:border-[#d4af37]" required>
                <input type="password" name="password" placeholder="Password" class="w-full bg-white/5 border border-white/10 p-3 rounded-xl mb-6 text-white focus:outline-none focus:border-[#d4af37]" required>
                <button type="submit" name="login" class="w-full bg-[#d4af37] text-[#06091a] p-3 rounded-xl font-bold hover:bg-white transition-colors">Login to Dashboard</button>
            </form>
        </div>
    </body>
    </html>
    <?php
    exit;
}

// Connect to DB manually
$db_name = defined('DB_NAME') ? DB_NAME : 'socidfox_sociallyspeaking_wp';
$db_user = defined('DB_USER') ? DB_USER : 'root';
$db_pass = defined('DB_PASSWORD') ? DB_PASSWORD : '';
$db_host = defined('DB_HOST') ? DB_HOST : 'localhost';
$table_prefix = defined('TABLE_PREFIX') ? TABLE_PREFIX : 'wp_';
$table_name = $table_prefix . 'ttb_registrations';

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
if ($conn->connect_error) {
    die("Database connection failed: " . $conn->connect_error);
}

// Fetch stats
$total_query = $conn->query("SELECT COUNT(*) as c FROM `$table_name`");
$total_regs = $total_query ? $total_query->fetch_assoc()['c'] : 0;

$paid_query = $conn->query("SELECT COUNT(*) as c FROM `$table_name` WHERE status = 'paid'");
$total_paid = $paid_query ? $paid_query->fetch_assoc()['c'] : 0;

// Fetch all records
$result = $conn->query("SELECT * FROM `$table_name` ORDER BY created_at DESC");
$records = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $records[] = $row;
    }
}
$conn->close();

// Handle CSV Export
if (isset($_GET['export']) && $_GET['export'] === 'csv') {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename=takeover_registrations_' . date('Y-m-d') . '.csv');
    $output = fopen('php://output', 'w');
    fputcsv($output, ['ID', 'Date', 'Status', 'Paystack Reference', 'Full Name', 'Email', 'Phone', 'Country/City', 'Profession', 'Building', 'Why Attend', 'Ticket Option']);
    foreach ($records as $row) {
        fputcsv($output, [
            'TTB-' . $row['id'],
            $row['created_at'],
            $row['status'],
            $row['paystack_reference'],
            $row['full_name'],
            $row['email'],
            $row['phone'],
            $row['country_city'],
            $row['profession'],
            $row['building'],
            $row['why_attend'],
            $row['payment_method']
        ]);
    }
    fclose($output);
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TTB Registrations Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        function showDetails(id) {
            document.getElementById('modal-' + id).classList.remove('hidden');
        }
        function hideDetails(id) {
            document.getElementById('modal-' + id).classList.add('hidden');
        }
    </script>
</head>
<body class="bg-gray-50 text-gray-900 font-sans">
    
    <header class="bg-[#06091a] text-white py-6 px-8 flex justify-between items-center shadow-lg">
        <div>
            <h1 class="text-2xl font-black text-[#d4af37] tracking-tight">The Takeover Table</h1>
            <p class="text-xs text-gray-400 uppercase tracking-widest mt-1">Registrations Dashboard</p>
        </div>
        <div class="flex gap-4">
            <a href="?export=csv" class="text-sm font-semibold bg-[#d4af37] text-[#06091a] hover:bg-white transition-colors px-4 py-2 rounded-lg">Export CSV</a>
            <a href="?logout=1" class="text-sm font-semibold hover:text-[#d4af37] transition-colors border border-white/20 px-4 py-2 rounded-lg hover:border-[#d4af37]">Logout</a>
        </div>
    </header>

    <main class="max-w-7xl mx-auto p-8">
        
        <!-- Stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <p class="text-sm text-gray-500 font-semibold mb-1">Total Registrations</p>
                    <p class="text-3xl font-black"><?php echo $total_regs; ?></p>
                </div>
                <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold">📋</div>
            </div>
            
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <p class="text-sm text-gray-500 font-semibold mb-1">Confirmed Paid Tickets</p>
                    <p class="text-3xl font-black text-green-600"><?php echo $total_paid; ?></p>
                </div>
                <div class="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center text-xl font-bold">✓</div>
            </div>

            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <p class="text-sm text-gray-500 font-semibold mb-1">Pending Payment</p>
                    <p class="text-3xl font-black text-orange-500"><?php echo $total_regs - $total_paid; ?></p>
                </div>
                <div class="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center text-xl font-bold">⏳</div>
            </div>
        </div>

        <!-- Table -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm border-collapse">
                    <thead>
                        <tr class="bg-gray-50 border-b border-gray-100">
                            <th class="p-4 font-semibold text-gray-600">ID</th>
                            <th class="p-4 font-semibold text-gray-600">Date</th>
                            <th class="p-4 font-semibold text-gray-600">Name</th>
                            <th class="p-4 font-semibold text-gray-600">Email</th>
                            <th class="p-4 font-semibold text-gray-600">Ticket Type</th>
                            <th class="p-4 font-semibold text-gray-600">Status</th>
                            <th class="p-4 font-semibold text-gray-600">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        <?php if (count($records) === 0): ?>
                            <tr><td colspan="7" class="p-8 text-center text-gray-500">No registrations found.</td></tr>
                        <?php endif; ?>
                        
                        <?php foreach ($records as $row): ?>
                        <tr class="hover:bg-gray-50 transition-colors">
                            <td class="p-4 text-gray-500">TTB-<?php echo $row['id']; ?></td>
                            <td class="p-4 text-gray-500"><?php echo date('M j, Y g:i A', strtotime($row['created_at'])); ?></td>
                            <td class="p-4 font-semibold text-gray-900"><?php echo htmlspecialchars($row['full_name']); ?></td>
                            <td class="p-4 text-gray-600"><?php echo htmlspecialchars($row['email']); ?><br><span class="text-xs text-gray-400"><?php echo htmlspecialchars($row['phone']); ?></span></td>
                            <td class="p-4 text-gray-600"><?php echo htmlspecialchars(explode('(', $row['payment_method'])[0]); ?></td>
                            <td class="p-4">
                                <?php if ($row['status'] === 'paid'): ?>
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Paid</span>
                                <?php else: ?>
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">Pending</span>
                                <?php endif; ?>
                            </td>
                            <td class="p-4">
                                <button onclick="showDetails(<?php echo $row['id']; ?>)" class="text-sm font-semibold text-blue-600 hover:text-blue-800">View Details</button>
                            </td>
                        </tr>

                        <!-- Modal for this row -->
                        <div id="modal-<?php echo $row['id']; ?>" class="fixed inset-0 z-50 hidden bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
                            <div class="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
                                <div class="flex justify-between items-center p-6 border-b border-gray-100">
                                    <h3 class="text-xl font-bold">Applicant Details (TTB-<?php echo $row['id']; ?>)</h3>
                                    <button onclick="hideDetails(<?php echo $row['id']; ?>)" class="text-gray-400 hover:text-gray-900 text-2xl font-bold">&times;</button>
                                </div>
                                <div class="p-6 overflow-y-auto space-y-4 text-sm">
                                    <div class="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                                        <div>
                                            <p class="text-gray-500 font-semibold text-xs mb-1">Status</p>
                                            <p class="font-medium <?php echo $row['status'] === 'paid' ? 'text-green-600' : 'text-orange-500'; ?> uppercase tracking-wider"><?php echo $row['status']; ?></p>
                                        </div>
                                        <div>
                                            <p class="text-gray-500 font-semibold text-xs mb-1">Paystack Ref</p>
                                            <p class="font-mono text-xs"><?php echo $row['paystack_reference'] ? htmlspecialchars($row['paystack_reference']) : 'N/A'; ?></p>
                                        </div>
                                    </div>
                                    
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <p class="text-gray-500 font-semibold text-xs mb-1">Country & City</p>
                                            <p><?php echo htmlspecialchars($row['country_city']); ?></p>
                                        </div>
                                        <div>
                                            <p class="text-gray-500 font-semibold text-xs mb-1">Profession/Industry</p>
                                            <p><?php echo htmlspecialchars($row['profession']); ?></p>
                                        </div>
                                    </div>

                                    <div>
                                        <p class="text-gray-500 font-semibold text-xs mb-1">What are they building?</p>
                                        <div class="bg-gray-50 p-3 rounded-lg border border-gray-100 text-gray-700 leading-relaxed"><?php echo nl2br(htmlspecialchars($row['building'])); ?></div>
                                    </div>
                                    
                                    <div>
                                        <p class="text-gray-500 font-semibold text-xs mb-1">Why do they want to attend?</p>
                                        <div class="bg-gray-50 p-3 rounded-lg border border-gray-100 text-gray-700 leading-relaxed"><?php echo nl2br(htmlspecialchars($row['why_attend'])); ?></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </main>
</body>
</html>
