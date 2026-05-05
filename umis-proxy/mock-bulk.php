<?php
/**
 * ============================================================
 *  UMIS MOCK BULK EXPORT  —  FOR DEMONSTRATION PURPOSES ONLY
 * ============================================================
 *
 *  NOTE TO UMIS TEAM
 *  ─────────────────
 *  The BU Reference System will call a bulk export endpoint
 *  (admin-triggered "Sync Now") to pre-populate all student
 *  records.  Your API must support a GET endpoint that returns
 *  all students in the following shape:
 *
 *  REQUEST
 *      GET  https://umis.babcock.edu.ng/api/students/export
 *      Authorization: Bearer <API_KEY>    (optional but recommended)
 *
 *  RESPONSE  (HTTP 200)
 *      Content-Type: application/json
 *      [
 *          {
 *              "matricNo":       "21/3456",
 *              "fullName":       "Adaeze Okonkwo",
 *              "department":     "Computer Science",
 *              "faculty":        "Computing & Applied Sciences",
 *              "cgpa":           4.31,
 *              "level":          "400",
 *              "graduationYear": "2025"
 *          },
 *          ...
 *      ]
 *
 *  This endpoint is only called by the admin-side "Sync Now"
 *  button — never by individual student login.
 * ============================================================
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    exit(json_encode(['error' => 'Method not allowed']));
}

$mockMode = filter_var(getenv('MOCK_MODE'), FILTER_VALIDATE_BOOLEAN);
if (!$mockMode) {
    http_response_code(404);
    exit(json_encode(['error' => 'Not found']));
}

// All 8 mock students — same dataset as umis-mock.php but without passwords,
// formatted exactly as the real UMIS bulk export must return them.
$students = [
    [
        'matricNo'       => '21/3456',
        'fullName'       => 'Adaeze Okonkwo',
        'department'     => 'Computer Science',
        'faculty'        => 'Computing & Applied Sciences',
        'cgpa'           => 4.31,
        'level'          => '400',
        'graduationYear' => '2025',
    ],
    [
        'matricNo'       => '21/0892',
        'fullName'       => 'Tolu Adeyemi',
        'department'     => 'Mass Communication',
        'faculty'        => 'Communication & Media Studies',
        'cgpa'           => 3.87,
        'level'          => '300',
        'graduationYear' => '2026',
    ],
    [
        'matricNo'       => '20/1147',
        'fullName'       => 'Emeka Nwosu',
        'department'     => 'Accounting',
        'faculty'        => 'Management Sciences',
        'cgpa'           => 3.52,
        'level'          => '500',
        'graduationYear' => '2024',
    ],
    [
        'matricNo'       => '21/2271',
        'fullName'       => 'Amara Eze',
        'department'     => 'Nursing Science',
        'faculty'        => 'Health Sciences',
        'cgpa'           => 4.61,
        'level'          => '400',
        'graduationYear' => '2025',
    ],
    [
        'matricNo'       => '20/0334',
        'fullName'       => 'Segun Olatunji',
        'department'     => 'Economics',
        'faculty'        => 'Social & Management Sciences',
        'cgpa'           => 3.10,
        'level'          => '500',
        'graduationYear' => '2024',
    ],
    [
        'matricNo'       => '21/1908',
        'fullName'       => 'Chisom Okeke',
        'department'     => 'Law',
        'faculty'        => 'Law',
        'cgpa'           => 3.75,
        'level'          => '400',
        'graduationYear' => '2025',
    ],
    [
        'matricNo'       => '20/2553',
        'fullName'       => 'Blessing Afolabi',
        'department'     => 'Biochemistry',
        'faculty'        => 'Basic & Applied Sciences',
        'cgpa'           => 4.05,
        'level'          => '500',
        'graduationYear' => '2024',
    ],
    [
        'matricNo'       => '21/0451',
        'fullName'       => 'Kelechi Onyeka',
        'department'     => 'Business Administration',
        'faculty'        => 'Management Sciences',
        'cgpa'           => 2.94,
        'level'          => '300',
        'graduationYear' => '2026',
    ],
];

echo json_encode($students);
