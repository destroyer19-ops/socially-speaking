<?php
/**
 * SSC 2026 Email Preview Utility
 * Allows visual inspection of attendee and mobilizer email templates in browser.
 */

require_once __DIR__ . '/email-templates.php';

$type = isset($_GET['type']) ? $_GET['type'] : 'attendee';

if ($type === 'mobilizer') {
    $rendered = SSCEmailTemplates::mobilizerConfirmation([
        'full_name'     => 'Sarah Adeyemi',
        'email'         => 'sarah.adeyemi@unilag.edu.ng',
        'organization'  => 'University of Lagos Student Union',
        'referral_code' => 'MOB7X2K9Q',
        'referral_url'  => 'https://thetakeovernetwork.org/conference-register?ref=MOB7X2K9Q',
        'dashboard_url' => 'https://thetakeovernetwork.org/mobilizer-dashboard?token=demo_auth_token_preview_12345',
        'is_recovery'   => isset($_GET['recovery']),
    ]);
} else {
    $rendered = SSCEmailTemplates::attendeeConfirmation([
        'full_name'     => 'Emmanuel Okafor',
        'email'         => 'emmanuel.okafor@example.com',
        'reg_id'        => 'SSC26-88F4A21D',
        'state_country' => 'Lagos, Nigeria',
        'qr_code_url'   => 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=SSC26-88F4A21D&format=png',
        'referral_code' => 'REF3B9D1A',
        'referral_url'  => 'https://thetakeovernetwork.org/conference-register?ref=REF3B9D1A',
        'whatsapp_link' => 'https://chat.whatsapp.com/EJ1DMJwBvr8JpSzhFk1btV?s=cl&p=i&mlu=4&ilr=4',
    ]);
}

if (isset($_GET['format']) && $_GET['format'] === 'plain') {
    header('Content-Type: text/plain; charset=utf-8');
    echo $rendered['plain'];
    exit;
}

// Display HTML email with a quick switch toolbar
?>
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>SSC 2026 Email Template Preview</title>
  <style>
    .preview-bar {
      position: sticky;
      top: 0;
      z-index: 9999;
      background: #0f111a;
      border-bottom: 1px solid #232738;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #e2e8f0;
      font-size: 14px;
    }
    .preview-bar a {
      color: #a78bfa;
      text-decoration: none;
      padding: 6px 14px;
      border-radius: 6px;
      background: rgba(167, 139, 250, 0.1);
      border: 1px solid rgba(167, 139, 250, 0.2);
      font-weight: 600;
      margin-left: 8px;
    }
    .preview-bar a.active {
      background: #7c3aed;
      color: #ffffff;
      border-color: #7c3aed;
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#05070a;">
  <div class="preview-bar">
    <div>
      <strong>SSC 2026 Email Template Preview:</strong>
      <span style="color:#94a3b8;margin-left:8px;"><?php echo htmlspecialchars(ucfirst($type)); ?></span>
    </div>
    <div>
      <a href="?type=attendee" class="<?php echo $type === 'attendee' ? 'active' : ''; ?>">Attendee Confirmation</a>
      <a href="?type=mobilizer" class="<?php echo $type === 'mobilizer' && !isset($_GET['recovery']) ? 'active' : ''; ?>">Mobilizer Welcome</a>
      <a href="?type=mobilizer&recovery=1" class="<?php echo isset($_GET['recovery']) ? 'active' : ''; ?>">Mobilizer Link Recovery</a>
      <a href="?type=<?php echo urlencode($type); ?>&format=plain" target="_blank" style="background:transparent;border:1px solid #475569;color:#cbd5e1;">View Plaintext</a>
    </div>
  </div>
  <?php echo $rendered['html']; ?>
</body>
</html>
