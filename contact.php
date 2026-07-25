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

function fail(int $code, string $message): never {
    http_response_code($code);
    echo json_encode(['ok' => false, 'error' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    fail(405, 'Method not allowed');
}

// Honeypot: Bots füllen versteckte Felder meist aus
if (!empty($_POST['website'] ?? '')) {
    // Stiller Erfolg vortäuschen, ohne tatsächlich etwas zu tun
    echo json_encode(['ok' => true]);
    exit;
}

function clean(string $value): string {
    $value = trim($value);
    $value = preg_replace('/[\r\n]+/', ' ', $value) ?? $value;
    return mb_substr($value, 0, MAX_LEN);
}

$name    = clean((string)($_POST['name'] ?? ''));
$email   = trim((string)($_POST['email'] ?? ''));
$company = clean((string)($_POST['company'] ?? ''));
$branch  = clean((string)($_POST['branch'] ?? ''));
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
