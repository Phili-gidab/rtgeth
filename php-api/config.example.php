<?php
/*
 * RTG API configuration — COPY OUTSIDE THE DOCROOT as ~/rtg-api-config.php
 * (one level above public_html). Never commit the real file.
 */
return [
  // cPanel MySQL
  'DB_HOST' => '127.0.0.1',
  'DB_PORT' => 3306,
  'DB_NAME' => 'cpaneluser_rtgcms',
  'DB_USER' => 'cpaneluser_rtg',
  'DB_PASSWORD' => 'change-me',

  // long random string — signs admin JWTs
  'JWT_SECRET' => 'change-me',

  // where the site lives (first origin is used for donate return URLs)
  'SITE_ORIGIN' => 'https://rtgeth.org,https://www.rtgeth.org',
  'API_ORIGIN' => 'https://rtgeth.org',

  // Chapa (leave placeholders until RTG's account is verified)
  'CHAPA_SECRET_KEY' => 'CHASECK-xxxx',
  'CHAPA_WEBHOOK_SECRET' => '',

  'DONATION_MIN' => 10,
  'DONATION_MAX' => 1000000,

  // where form/donation notifications go (empty = notifications off) and the envelope sender
  'NOTIFY_EMAIL' => 'info@rtgeth.org',
  'MAIL_FROM' => 'noreply@rtgeth.org',

  // absolute path to public_html/uploads (served directly by Apache)
  'UPLOAD_DIR' => '/home1/cpaneluser/public_html/uploads',

  // rate-limiter scratch space (outside docroot)
  'RATE_DIR' => '/home1/cpaneluser/tmp/rtg-rate',

  // used only by seed.php to create the first admin
  'ADMIN_EMAIL' => 'info@rtgeth.org',
  'ADMIN_PASSWORD' => 'change-me',
];
