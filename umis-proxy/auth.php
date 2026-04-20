<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

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

// TODO: Replace with actual UMIS API endpoint and payload
// when Mr. Adegboola provides the API documentation
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

