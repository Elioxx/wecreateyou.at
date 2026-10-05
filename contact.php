<?php
declare(strict_types=1);

/**
 * Kontaktformular-Handler
 * Nimmt die Formulardaten von index.html entgegen und verschickt sie per
 * E-Mail an das eigene Postfach. Läuft komplett auf dem eigenen Server -
 * keine externen Formular-/Mail-Dienstleister sind eingebunden.
 */

header('Content-Type: application/json; charset=utf-8');

const RECIPIENT = 'office@wecreateyou.at';
const MAX_LEN = 5000;
const MAX_REQUEST_BYTES = 20000;
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 900;

function fail(int $code, string $message): never {
    http_response_code($code);
    echo json_encode(['ok' => false, 'error' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    fail(405, 'Method not allowed');
}

if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > MAX_REQUEST_BYTES) {
    fail(413, 'Die Anfrage ist zu groß.');
}

// Honeypot: Bots füllen versteckte Felder meist aus
if (!empty($_POST['website'] ?? '')) {
    // Stiller Erfolg vortäuschen, ohne tatsächlich etwas zu tun
    echo json_encode(['ok' => true]);
    exit;
}

// Pro IP sind maximal fünf Versuche in 15 Minuten möglich. Gespeichert wird
// ausschließlich ein kurzlebiger Hash im temporären Serververzeichnis.
$clientIp = (string)($_SERVER['REMOTE_ADDR'] ?? 'unknown');
$rateFile = sys_get_temp_dir() . '/wcy-contact-' . hash('sha256', $clientIp) . '.json';
$rateHandle = @fopen($rateFile, 'c+');

if ($rateHandle !== false && flock($rateHandle, LOCK_EX)) {
    $raw = stream_get_contents($rateHandle);
    $attempts = json_decode($raw !== false ? $raw : '[]', true);
    $attempts = is_array($attempts) ? $attempts : [];
    $now = time();
    $attempts = array_values(array_filter(
        $attempts,
        static fn($timestamp): bool => is_int($timestamp) && $timestamp > $now - RATE_LIMIT_WINDOW
    ));

    if (count($attempts) >= RATE_LIMIT_MAX) {
        flock($rateHandle, LOCK_UN);
        fclose($rateHandle);
        header('Retry-After: ' . RATE_LIMIT_WINDOW);
        fail(429, 'Zu viele Anfragen. Bitte versuche es in einigen Minuten erneut.');
    }

    $attempts[] = $now;
    rewind($rateHandle);
    ftruncate($rateHandle, 0);
    fwrite($rateHandle, json_encode($attempts));
    fflush($rateHandle);
    flock($rateHandle, LOCK_UN);
    fclose($rateHandle);
}

function clean(string $value): string {
    $value = trim($value);
    $value = preg_replace('/[\r\n]+/', ' ', $value) ?? $value;
    return mb_substr($value, 0, MAX_LEN);
}

$name    = mb_substr(clean((string)($_POST['name'] ?? '')), 0, 200);
$email   = trim((string)($_POST['email'] ?? ''));
$company = mb_substr(clean((string)($_POST['company'] ?? '')), 0, 200);
$branch  = mb_substr(clean((string)($_POST['branch'] ?? '')), 0, 100);
$message = mb_substr(trim((string)($_POST['message'] ?? '')), 0, MAX_LEN);

if ($name === '' || $email === '') {
    fail(422, 'Name und E-Mail sind Pflichtfelder.');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fail(422, 'Ungültige E-Mail-Adresse.');
}

$branchLabels = [
    'handwerk'      => 'Handwerk',
    'steuerberater' => 'Steuerberater / Recht',
    'gesundheit'    => 'Gesundheitswesen',
    'immobilien'    => 'Immobilien',
    'sonstige-digitale-dienstleistungen' => 'Sonstige digitale Dienstleistungen',
    'andere'        => 'Andere Branche',
];
$branchLabel = $branchLabels[$branch] ?? ($branch !== '' ? $branch : '-');

$subject = 'Neue Kontaktanfrage über wecreateyou.at';

$body  = "Neue Anfrage über das Kontaktformular:\n\n";
$body .= "Name: {$name}\n";
$body .= "E-Mail: {$email}\n";
$body .= "Unternehmen: " . ($company !== '' ? $company : '-') . "\n";
$body .= "Branche: {$branchLabel}\n\n";
$body .= "Nachricht:\n" . ($message !== '' ? $message : '-') . "\n";

// Sichere Header ohne Injection-Risiko: eigene Absenderadresse, Reply-To aus Formular
$headers = [];
$headers[] = 'From: WeCreateYou Kontaktformular <no-reply@wecreateyou.at>';
$headers[] = 'Reply-To: ' . sprintf('%s <%s>', addslashes($name), $email);
$headers[] = 'Content-Type: text/plain; charset=UTF-8';

$sent = mail(RECIPIENT, $subject, $body, implode("\r\n", $headers));

if (!$sent) {
    fail(500, 'Die Nachricht konnte nicht versendet werden. Bitte versuche es später erneut oder schreibe direkt an office@wecreateyou.at.');
}

echo json_encode(['ok' => true]);
