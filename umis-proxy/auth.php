<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle CORS preflight — browser sends OPTIONS before every cross-origin POST.
// Must respond 200 (not 405) or the browser blocks the real request.
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(['error' => 'Method not allowed']));
}

$body = json_decode(file_get_contents('php://input'), true);
$matricNo = $body['matricNo'] ?? '';
$password  = $body['password'] ?? '';

if (!$matricNo || !$password) {
    http_response_code(400);
    exit(json_encode(['error' => 'Missing credentials']));
}

// ── MOCK MODE ──────────────────────────────────────────────────────────────
// Set the environment variable MOCK_MODE=true (e.g. in Railway) to bypass
// the live UMIS API and use the local mock student dataset instead.
//
// This lets you demonstrate the full login → profile flow to the UMIS team
// without a live UMIS connection.  The mock dataset and the API contract
// (exact request/response shape) live in umis-mock.php.
//
// In production, leave MOCK_MODE unset or set to false.
// ──────────────────────────────────────────────────────────────────────────
$mockMode = filter_var(getenv('MOCK_MODE'), FILTER_VALIDATE_BOOLEAN);

if ($mockMode) {
    require_once __DIR__ . '/umis-mock.php';

    // mockUmisLookup() validates the password and returns the student array,
    // or exits with a 401/404 error response if credentials are wrong.
    $umisData = mockUmisLookup($matricNo, $password);

    echo json_encode($umisData);
    exit;
}

// ── LIVE UMIS ──────────────────────────────────────────────────────────────
// TODO: Replace the payload fields below with the exact keys required by
// the UMIS API once Mr. Adegboola provides the API documentation.
// The UMIS team must return JSON matching the UmisStudentData shape:
//   { fullName, department, faculty, cgpa, level, graduationYear? }
// ──────────────────────────────────────────────────────────────────────────
$umisEndpoint = getenv('UMIS_API_URL');

$ch = curl_init($umisEndpoint);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'matric' => $matricNo,
    'password' => $password
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$response = curl_exec($ch);
$statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($statusCode !== 200) {
    http_response_code(401);
    exit(json_encode(['error' => 'Invalid UMIS credentials']));
}

// Return UMIS data to React
echo $response;

