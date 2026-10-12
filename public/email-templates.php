<?php
/**
 * SSC 2026 Email Design System & Templates
 *
 * Provides professionally styled, responsive, email-client-compatible HTML and plain-text
 * templates for Attendee Registration, Mobilizer Confirmation, and Event Communications.
 */

class SSCEmailTemplates {

    const ECARD_IMAGE_URL = 'https://media.thetakeovernetwork.org/email/ssc2026-ecard.jpg';
    const LOGO_IMAGE_URL  = 'https://media.thetakeovernetwork.org/email/logo.png';
    const SITE_URL        = 'https://thetakeovernetwork.org';
    const CONTACT_EMAIL   = 'ssc.outreach@gmail.com';
    const INSTAGRAM_URL   = 'https://instagram.com/sociallyspeaking.tribe';
    const TAKEOVER_IG     = 'https://instagram.com/thetakeovernetwork';

    /**
     * Render the attendee registration confirmation email
     */
    public static function attendeeConfirmation(array $params): array {
        $fullName     = htmlspecialchars($params['full_name'] ?? 'Attendee');
        $firstName    = htmlspecialchars(explode(' ', trim($params['full_name'] ?? 'Attendee'))[0]);
        $email        = htmlspecialchars($params['email'] ?? '');
        $regId        = htmlspecialchars($params['reg_id'] ?? '');
        $stateCountry = htmlspecialchars($params['state_country'] ?? 'Nigeria');
        $qrCodeUrl    = htmlspecialchars($params['qr_code_url'] ?? '');
        $referralCode = htmlspecialchars($params['referral_code'] ?? '');
        $referralUrl  = htmlspecialchars($params['referral_url'] ?? (self::SITE_URL . '/conference-register?ref=' . $referralCode));
        $whatsappLink = htmlspecialchars($params['whatsapp_link'] ?? 'https://chat.whatsapp.com/EJ1DMJwBvr8JpSzhFk1btV?s=cl&p=i&mlu=4&ilr=4');

        $whatsappShareUrl = 'https://api.whatsapp.com/send?text=' . urlencode(
            "I just registered for SSC 2026: The Takeover Generation! Saturday, Dec 5, 2026. Register for free here: " . $params['referral_url']
        );

        $html = self::wrapTemplate([
            'preheader' => "You're registered for SSC 2026: The Takeover Generation! Your QR entry pass & referral link inside.",
            'content' => "
                <!-- Personalized Greeting -->
                <p style=\"margin:0 0 16px;font-size:16px;color:#e2e8f0;line-height:1.6;\">
                    Hi <strong style=\"color:#c084fc;\">{$firstName}</strong>,
                </p>
                <p style=\"margin:0 0 20px;font-size:15px;color:#cbd5e1;line-height:1.7;\">
                    Your registration for <strong style=\"color:#ffffff;\">Socially Speaking Conference 2026: The Takeover Generation</strong> is officially confirmed! 🎉
                    We are thrilled to welcome you to Africa's defining youth empowerment gathering.
                </p>

                <!-- Event Details Card -->
                <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"margin-bottom:28px;background:#151824;border:1px solid #232738;border-radius:14px;overflow:hidden;\">
                    <tr>
                        <td style=\"padding:20px 24px;border-bottom:1px solid #232738;background:linear-gradient(90deg,rgba(124,58,237,0.15),rgba(37,99,235,0.15));\">
                            <p style=\"margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#a78bfa;\">Confirmed Event Details</p>
                            <h3 style=\"margin:0;font-size:18px;font-weight:900;color:#ffffff;\">SSC 2026 — The Takeover Generation</h3>
                            <p style=\"margin:4px 0 0;font-size:13px;color:#94a3b8;font-style:italic;\">Theme: Conquer You First</p>
                        </td>
                    </tr>
                    <tr>
                        <td style=\"padding:20px 24px;\">
                            <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\">
                                <tr>
                                    <td style=\"padding:6px 0;font-size:13px;color:#94a3b8;width:35%;font-weight:600;\">🗓 Date</td>
                                    <td style=\"padding:6px 0;font-size:13px;color:#ffffff;font-weight:700;\">Saturday, 5 December 2026</td>
                                </tr>
                                <tr>
                                    <td style=\"padding:6px 0;font-size:13px;color:#94a3b8;font-weight:600;\">⏰ Time</td>
                                    <td style=\"padding:6px 0;font-size:13px;color:#ffffff;\">9:00 AM WAT <span style=\"color:#94a3b8;\">(Doors open 8:00 AM)</span></td>
                                </tr>
                                <tr>
                                    <td style=\"padding:6px 0;font-size:13px;color:#94a3b8;font-weight:600;\">📍 Venue</td>
                                    <td style=\"padding:6px 0;font-size:13px;color:#ffffff;\">Main Auditorium, Lagos, Nigeria</td>
                                </tr>
                                <tr>
                                    <td style=\"padding:6px 0;font-size:13px;color:#94a3b8;font-weight:600;\">🎟 Admission</td>
                                    <td style=\"padding:6px 0;font-size:13px;color:#4ade80;font-weight:700;\">Free Entry (Verified QR Pass)</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                <!-- Entry Pass / Registration ID -->
                <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"margin-bottom:28px;\">
                    <tr>
                        <td style=\"background:#131622;border:1px solid #232738;border-radius:14px;padding:24px;text-align:center;\">
                            <p style=\"margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#94a3b8;\">Your Registration Pass ID</p>
                            <p style=\"margin:0 0 16px;font-size:24px;font-weight:900;color:#c084fc;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;letter-spacing:0.06em;\">
                                {$regId}
                            </p>
                            
                            <!-- QR Code -->
                            <div style=\"background:#ffffff;padding:12px;border-radius:12px;display:inline-block;margin:0 auto 14px;box-shadow:0 4px 16px rgba(0,0,0,0.5);\">
                                <img src=\"{$qrCodeUrl}\" alt=\"Entry QR Code — {$regId}\" width=\"180\" height=\"180\" style=\"display:block;margin:0 auto;\" />
                            </div>

                            <p style=\"margin:0;font-size:12px;color:#94a3b8;line-height:1.5;\">
                                📱 Save this email on your phone. Present this personal QR code at the check-in desk on event day for rapid admission.
                            </p>
                        </td>
                    </tr>
                </table>

                <!-- WhatsApp Community Button CTA -->
                <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"margin-bottom:28px;\">
                    <tr>
                        <td style=\"background:linear-gradient(135deg,rgba(37,99,235,0.1),rgba(124,58,237,0.1));border:1px solid rgba(124,58,237,0.25);border-radius:14px;padding:24px;text-align:center;\">
                            <h4 style=\"margin:0 0 8px;font-size:16px;font-weight:800;color:#ffffff;\">Join the Official SSC 2026 Attendees Community</h4>
                            <p style=\"margin:0 0 18px;font-size:13px;color:#cbd5e1;line-height:1.6;\">
                                Connect with other attendees, receive speaker reveals, program schedules, and important conference notices.
                            </p>
                            <table cellpadding=\"0\" cellspacing=\"0\" style=\"margin:0 auto;\">
                                <tr>
                                    <td align=\"center\" style=\"background:linear-gradient(135deg,#7c3aed,#2563eb);border-radius:10px;padding:1px;\">
                                        <a href=\"{$whatsappLink}\" target=\"_blank\" style=\"display:inline-block;background:linear-gradient(135deg,#7c3aed,#2563eb);color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;border-radius:9px;padding:14px 28px;text-align:center;\">
                                            Join WhatsApp Group →
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                <!-- Dedicated Referral Section -->
                <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"margin-bottom:28px;\">
                    <tr>
                        <td style=\"background:linear-gradient(135deg,rgba(124,58,237,0.15),rgba(236,72,153,0.1));border:1px solid rgba(192,132,252,0.3);border-radius:14px;padding:26px;text-align:center;\">
                            <p style=\"margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#c084fc;\">Mobilize Your Circle</p>
                            <h3 style=\"margin:0 0 10px;font-size:19px;font-weight:900;color:#ffffff;\">Bring Friends & Classmates to SSC 2026</h3>
                            <p style=\"margin:0 0 16px;font-size:14px;color:#cbd5e1;line-height:1.6;\">
                                Share your personal referral link with your classmates, friends, colleagues, and church members. Every registration through your link is tied to your circle!
                            </p>

                            <!-- Link Box -->
                            <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"margin-bottom:16px;\">
                                <tr>
                                    <td style=\"background:#0b0d14;border:1px solid #232738;border-radius:10px;padding:12px 16px;word-break:break-all;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:13px;text-align:center;\">
                                        <a href=\"{$referralUrl}\" style=\"color:#60a5fa;text-decoration:none;font-weight:bold;\">{$referralUrl}</a>
                                    </td>
                                </tr>
                            </table>

                            <!-- Quick Share Buttons -->
                            <table cellpadding=\"0\" cellspacing=\"0\" style=\"margin:0 auto;\">
                                <tr>
                                    <td align=\"center\">
                                        <a href=\"{$whatsappShareUrl}\" target=\"_blank\" style=\"display:inline-block;background:#25d366;color:#ffffff;font-size:13px;font-weight:bold;text-decoration:none;border-radius:8px;padding:11px 22px;margin:4px;\">
                                            Share Link on WhatsApp
                                        </a>
                                        <a href=\"{$referralUrl}\" target=\"_blank\" style=\"display:inline-block;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:#ffffff;font-size:13px;font-weight:600;text-decoration:none;border-radius:8px;padding:11px 22px;margin:4px;\">
                                            Open Registration Page
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style=\"margin:14px 0 0;font-size:12px;color:#94a3b8;\">
                                Referral Code: <strong style=\"color:#ffffff;font-family:monospace;\">{$referralCode}</strong>
                            </p>
                        </td>
                    </tr>
                </table>

                <!-- Summary Checklist -->
                <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#131622;border:1px solid #232738;border-radius:14px;padding:20px 24px;margin-bottom:16px;\">
                    <tr>
                        <td>
                            <p style=\"margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#94a3b8;\">Registration Profile</p>
                            <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\">
                                <tr>
                                    <td style=\"padding:5px 0;font-size:13px;color:#94a3b8;width:35%;\">Name</td>
                                    <td style=\"padding:5px 0;font-size:13px;color:#ffffff;font-weight:600;\">{$fullName}</td>
                                </tr>
                                <tr>
                                    <td style=\"padding:5px 0;font-size:13px;color:#94a3b8;\">Email</td>
                                    <td style=\"padding:5px 0;font-size:13px;color:#ffffff;\">{$email}</td>
                                </tr>
                                <tr>
                                    <td style=\"padding:5px 0;font-size:13px;color:#94a3b8;\">State / Country</td>
                                    <td style=\"padding:5px 0;font-size:13px;color:#ffffff;\">{$stateCountry}</td>
                                </tr>
                                <tr>
                                    <td style=\"padding:5px 0;font-size:13px;color:#94a3b8;\">Status</td>
                                    <td style=\"padding:5px 0;font-size:13px;color:#4ade80;font-weight:700;\">Registered ✓</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            "
        ]);

        $plain = "Hello {$params['full_name']},\n\n"
               . "Your registration for Socially Speaking Conference 2026: The Takeover Generation is confirmed!\n\n"
               . "EVENT DETAILS:\n"
               . "Theme: Conquer You First\n"
               . "Date: Saturday, 5 December 2026\n"
               . "Time: 9:00 AM WAT (Doors open 8:00 AM)\n"
               . "Venue: Main Auditorium, Lagos, Nigeria\n"
               . "Registration ID: {$params['reg_id']}\n\n"
               . "ENTRY PASS:\n"
               . "Present your personal QR code at the check-in desk on event day.\n"
               . "View your QR code: {$params['qr_code_url']}\n\n"
               . "ATTENDEE WHATSAPP GROUP:\n"
               . "Join the community: {$params['whatsapp_link']}\n\n"
               . "YOUR UNIQUE REFERRAL LINK:\n"
               . "Invite friends & classmates: {$params['referral_url']}\n"
               . "Referral Code: {$params['referral_code']}\n\n"
               . "Socially Speaking\n"
               . "https://thetakeovernetwork.org\n";

        return ['html' => $html, 'plain' => $plain];
    }

    /**
     * Render the mobilizer confirmation email
     */
    public static function mobilizerConfirmation(array $params): array {
        $fullName     = htmlspecialchars($params['full_name'] ?? 'Mobilizer');
        $firstName    = htmlspecialchars(explode(' ', trim($params['full_name'] ?? 'Mobilizer'))[0]);
        $organization = htmlspecialchars($params['organization'] ?? 'Community Organization');
        $refCode      = htmlspecialchars($params['referral_code'] ?? '');
        $referralUrl  = htmlspecialchars($params['referral_url'] ?? (self::SITE_URL . '/conference-register?ref=' . $refCode));
        $dashboardUrl = htmlspecialchars($params['dashboard_url'] ?? (self::SITE_URL . '/mobilizer-dashboard?token=' . ($params['token'] ?? '')));
        $isRecovery   = !empty($params['is_recovery']);

        $whatsappShareUrl = 'https://api.whatsapp.com/send?text=' . urlencode(
            "Join us at Socially Speaking Conference 2026: The Takeover Generation! Saturday, Dec 5, 2026. Free registration is now open: " . $params['referral_url']
        );

        $headline = $isRecovery ? "Your Mobilizer Link & Dashboard Access" : "Welcome to the SSC 2026 Mobilization Team! 🚀";

        $html = self::wrapTemplate([
            'preheader' => $isRecovery 
                ? "Here is your personal SSC 2026 mobilizer referral link and dashboard access." 
                : "Welcome! Your SSC 2026 mobilizer referral link and personal tracking dashboard are ready.",
            'content' => "
                <!-- Personalized Greeting -->
                <p style=\"margin:0 0 16px;font-size:16px;color:#e2e8f0;line-height:1.6;\">
                    Hi <strong style=\"color:#c084fc;\">{$firstName}</strong>,
                </p>
                <p style=\"margin:0 0 20px;font-size:15px;color:#cbd5e1;line-height:1.7;\">
                    " . ($isRecovery 
                        ? "You requested to retrieve your official credentials for <strong style=\"color:#ffffff;\">Socially Speaking Conference 2026: The Takeover Generation</strong>." 
                        : "Thank you for leading mobilization for <strong style=\"color:#ffffff;\">Socially Speaking Conference 2026: The Takeover Generation</strong>! As an official mobilizer representing <strong style=\"color:#c084fc;\">{$organization}</strong>, you are helping connect young leaders, students, and changemakers to Africa's defining youth gathering.") . "
                </p>

                <!-- Mobilizer Credentials Card -->
                <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"margin-bottom:28px;background:#151824;border:1px solid #232738;border-radius:14px;overflow:hidden;\">
                    <tr>
                        <td style=\"padding:20px 24px;border-bottom:1px solid #232738;background:linear-gradient(90deg,rgba(124,58,237,0.2),rgba(37,99,235,0.2));\">
                            <p style=\"margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#a78bfa;\">Official Mobilizer Profile</p>
                            <h3 style=\"margin:0;font-size:18px;font-weight:900;color:#ffffff;\">{$fullName}</h3>
                            <p style=\"margin:4px 0 0;font-size:13px;color:#94a3b8;\">Representing: <strong style=\"color:#e2e8f0;\">{$organization}</strong></p>
                        </td>
                    </tr>
                    <tr>
                        <td style=\"padding:24px;text-align:center;\">
                            <p style=\"margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#94a3b8;\">Your Unique Mobilizer Link</p>
                            
                            <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"margin-bottom:16px;\">
                                <tr>
                                    <td style=\"background:#0b0d14;border:1px solid #232738;border-radius:10px;padding:14px 18px;word-break:break-all;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:14px;text-align:center;\">
                                        <a href=\"{$referralUrl}\" style=\"color:#60a5fa;text-decoration:none;font-weight:bold;\">{$referralUrl}</a>
                                    </td>
                                </tr>
                            </table>

                            <p style=\"margin:0 0 20px;font-size:12px;color:#94a3b8;\">
                                Referral Code: <strong style=\"color:#ffffff;font-family:monospace;font-size:13px;\">{$refCode}</strong>
                            </p>

                            <!-- Primary Action: Open Dashboard -->
                            <table cellpadding=\"0\" cellspacing=\"0\" style=\"margin:0 auto 12px;\">
                                <tr>
                                    <td align=\"center\" style=\"background:linear-gradient(135deg,#7c3aed,#2563eb);border-radius:10px;padding:1px;\">
                                        <a href=\"{$dashboardUrl}\" target=\"_blank\" style=\"display:inline-block;background:linear-gradient(135deg,#7c3aed,#2563eb);color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;border-radius:9px;padding:14px 32px;text-align:center;\">
                                            Open My Mobilization Dashboard →
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <!-- Secondary Action: Share on WhatsApp -->
                            <table cellpadding=\"0\" cellspacing=\"0\" style=\"margin:0 auto;\">
                                <tr>
                                    <td align=\"center\">
                                        <a href=\"{$whatsappShareUrl}\" target=\"_blank\" style=\"display:inline-block;background:#25d366;color:#ffffff;font-size:13px;font-weight:bold;text-decoration:none;border-radius:8px;padding:10px 20px;\">
                                            Share Link on WhatsApp
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                <!-- Mobilization Guide -->
                <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#131622;border:1px solid #232738;border-radius:14px;padding:22px 24px;margin-bottom:24px;\">
                    <tr>
                        <td>
                            <h4 style=\"margin:0 0 12px;font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#ffffff;\">
                                How to Mobilize for Maximum Turnout:
                            </h4>
                            <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\">
                                <tr>
                                    <td style=\"padding:6px 0;font-size:13px;color:#cbd5e1;line-height:1.6;\">
                                        <strong style=\"color:#c084fc;\">1. Share Widely:</strong> Post your link to WhatsApp status updates, faculty/department group chats, fellowship networks, and youth circles.
                                    </td>
                                </tr>
                                <tr>
                                    <td style=\"padding:6px 0;font-size:13px;color:#cbd5e1;line-height:1.6;\">
                                        <strong style=\"color:#c084fc;\">2. Personal Follow-ups:</strong> Remind prospective attendees that registration is completely free, and ensure they complete the form using your link.
                                    </td>
                                </tr>
                                <tr>
                                    <td style=\"padding:6px 0;font-size:13px;color:#cbd5e1;line-height:1.6;\">
                                        <strong style=\"color:#c084fc;\">3. Track Real-Time Attendance:</strong> Your dashboard tracks both initial registrations and verified entrance check-ins on event day.
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                <p style=\"margin:0;font-size:12px;color:#94a3b8;line-height:1.6;\">
                    🔒 Keep this email safe. Your dashboard link contains a secure access token. If you ever misplace it, visit the mobilizer page at <a href=\"" . self::SITE_URL . "/mobilize\" style=\"color:#c084fc;text-decoration:none;\">thetakeovernetwork.org/mobilize</a> and submit your email to retrieve your link.
                </p>
            "
        ]);

        $plain = "Hello {$params['full_name']},\n\n"
               . "Your SSC 2026 Mobilizer credentials representing {$params['organization']}:\n\n"
               . "YOUR UNIQUE REFERRAL LINK:\n"
               . "{$params['referral_url']}\n"
               . "Referral Code: {$params['referral_code']}\n\n"
               . "YOUR PERSONAL MOBILIZATION DASHBOARD:\n"
               . "Track registrations and verified attendees in real-time:\n"
               . "{$params['dashboard_url']}\n\n"
               . "EVENT DETAILS:\n"
               . "Socially Speaking Conference 2026 — The Takeover Generation\n"
               . "Theme: Conquer You First\n"
               . "Saturday, 5 December 2026\n"
               . "Main Auditorium, Lagos, Nigeria\n\n"
               . "Socially Speaking\n"
               . "https://thetakeovernetwork.org\n";

        return ['html' => $html, 'plain' => $plain];
    }

    /**
     * Master responsive email wrapper
     */
    private static function wrapTemplate(array $options): string {
        $preheader = htmlspecialchars($options['preheader'] ?? 'SSC 2026: The Takeover Generation');
        $content   = $options['content'] ?? '';
        $ecardUrl  = self::ECARD_IMAGE_URL;
        $logoUrl   = self::LOGO_IMAGE_URL;
        $siteUrl   = self::SITE_URL;
        $contact   = self::CONTACT_EMAIL;
        $igTribe   = self::INSTAGRAM_URL;
        $igNet     = self::TAKEOVER_IG;

        return "<!DOCTYPE html>
<html lang=\"en\" xmlns=\"http://www.w3.org/1999/xhtml\" xmlns:v=\"urn:schemas-microsoft-com:vml\" xmlns:o=\"urn:schemas-microsoft-com:office:office\">
<head>
  <meta charset=\"utf-8\">
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">
  <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">
  <title>Socially Speaking Conference 2026</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type=\"text/css\">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #07090e; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .responsive-padding { padding-left: 20px !important; padding-right: 20px !important; }
      .ecard-img { width: 100% !important; height: auto !important; }
    }
  </style>
</head>
<body style=\"margin:0;padding:0;background-color:#07090e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;\">

  <!-- Hidden Preview Text -->
  <div style=\"display:none;font-size:1px;color:#07090e;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;\">
    {$preheader} &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>

  <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"background-color:#07090e;padding:32px 12px;\">
    <tr>
      <td align=\"center\" valign=\"top\">
        <!-- Main Card Container -->
        <table class=\"email-container\" width=\"600\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"max-width:600px;width:100%;background-color:#10131d;border:1px solid #232738;border-radius:18px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,0.6);\">
          
          <!-- Official SSC2026 E-Card Hero Banner -->
          <tr>
            <td align=\"center\" valign=\"top\" style=\"background-color:#0b0d14;line-height:0;\">
              <a href=\"{$siteUrl}\" target=\"_blank\" style=\"display:block;text-decoration:none;\">
                <img class=\"ecard-img\"
                     src=\"{$ecardUrl}\"
                     alt=\"Socially Speaking Conference 2026 — The Takeover Generation\"
                     width=\"600\"
                     style=\"display:block;width:100%;max-width:600px;height:auto;border:0;outline:none;background:#7c3aed;color:#ffffff;font-size:16px;text-align:center;font-weight:bold;\" />
              </a>
            </td>
          </tr>

          <!-- Main Content Area -->
          <tr>
            <td class=\"responsive-padding\" style=\"padding:36px 36px 32px;\">
              {$content}
            </td>
          </tr>

          <!-- Subtle Divider -->
          <tr>
            <td style=\"padding:0 36px;\">
              <div style=\"height:1px;background-color:#232738;\"></div>
            </td>
          </tr>

          <!-- Official NGO Footer Branding -->
          <tr>
            <td class=\"responsive-padding\" style=\"padding:32px 36px;text-align:center;background-color:#0b0d14;\">
              <!-- Official NGO Logo -->
              <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"margin:0 auto 16px;\">
                <tr>
                  <td align=\"center\">
                    <a href=\"{$siteUrl}\" target=\"_blank\" style=\"display:inline-block;text-decoration:none;\">
                      <img src=\"{$logoUrl}\"
                           alt=\"Socially Speaking Logo\"
                           width=\"68\"
                           height=\"68\"
                           style=\"display:block;width:68px;height:68px;object-fit:contain;border:0;outline:none;\" />
                    </a>
                  </td>
                </tr>
              </table>

              <p style=\"margin:0 0 6px;font-size:14px;font-weight:800;color:#ffffff;letter-spacing:0.02em;\">
                Socially Speaking
              </p>
              <p style=\"margin:0 0 16px;font-size:12px;color:#94a3b8;line-height:1.6;max-width:440px;margin-left:auto;margin-right:auto;\">
                Building Africa's next generation of thinkers, leaders and changemakers. We build. We equip. We develop.
              </p>

              <!-- Official Links -->
              <p style=\"margin:0 0 18px;font-size:12px;color:#64748b;\">
                <a href=\"{$siteUrl}\" target=\"_blank\" style=\"color:#c084fc;text-decoration:none;margin:0 8px;font-weight:600;\">Official Website</a> &bull;
                <a href=\"{$igTribe}\" target=\"_blank\" style=\"color:#c084fc;text-decoration:none;margin:0 8px;\">@sociallyspeaking.tribe</a> &bull;
                <a href=\"{$igNet}\" target=\"_blank\" style=\"color:#c084fc;text-decoration:none;margin:0 8px;\">@thetakeovernetwork</a>
              </p>

              <p style=\"margin:0;font-size:11px;color:#475569;\">
                &copy; 2026 Socially Speaking &bull; The Takeover Generation &bull; All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>";
    }
}
