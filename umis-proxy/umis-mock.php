<?php
/**
 * ============================================================
 *  UMIS MOCK SERVER  —  FOR DEMONSTRATION PURPOSES ONLY
 * ============================================================
 *
 * This file simulates the Babcock UMIS API so that the full
 * student login → profile flow can be demonstrated without a
 * live UMIS connection.
 *
 * ──────────────────────────────────────────────────────────
 *  WHAT THIS FILE TELLS THE UMIS TEAM
 * ──────────────────────────────────────────────────────────
 *
 *  1.  ENDPOINT
 *      The BU Reference System proxy will send a POST request
 *      to whatever endpoint the UMIS team provides.
 *      Example:  POST https://umis.babcock.edu.ng/api/student/auth
 *
 *  2.  REQUEST (what your API will receive)
 *      Content-Type: application/json
 *      {
 *          "matric":   "21/3456",   // student matric number
 *          "password": "..."        // student UMIS portal password
 *      }
 *
 *  3.  SUCCESS RESPONSE  (HTTP 200)
 *      Content-Type: application/json
 *      {
 *          "fullName":       "Adaeze Okonkwo",
 *          "department":     "Computer Science",
 *          "faculty":        "Computing & Applied Sciences",
 *          "cgpa":           4.31,
 *          "level":          "400",
 *          "graduationYear": "2025"   // or null if not yet determined
 *      }
 *
 *  4.  FAILURE RESPONSE  (HTTP 401 — wrong matric or wrong password)
 *      Content-Type: application/json
 *      { "error": "Invalid credentials" }
 *
 *  5.  NOT FOUND RESPONSE  (HTTP 404 — matric does not exist in UMIS)
 *      Content-Type: application/json
 *      { "error": "Student not found" }
 *
 * ──────────────────────────────────────────────────────────
 *  MOCK MODE BEHAVIOUR
 * ──────────────────────────────────────────────────────────
 *  • Each mock student has a fixed test password (see table
 *    below).  Wrong passwords return 401 — just like real UMIS.
 *  • The mock student list lives in the $MOCK_STUDENTS array
 *    below.  Add or remove entries as needed for the demo.
 *
 *  TEST CREDENTIALS  (use these on the Student Login page)
 *  ─────────────────────────────────────────────────────────
 *  Matric     Password        Name
 *  ─────────────────────────────────────────────────────────
 *  21/3456    Adaeze@BU1      Adaeze Okonkwo
 *  21/0892    Tolu@BU2        Tolu Adeyemi
 *  20/1147    Emeka@BU3       Emeka Nwosu
 *  21/2271    Amara@BU4       Amara Eze
 *  20/0334    Segun@BU5       Segun Olatunji
 *  21/1908    Chisom@BU6      Chisom Okeke
 *  20/2553    Blessing@BU7    Blessing Afolabi
 *  21/0451    Kelechi@BU8     Kelechi Onyeka
 *  ─────────────────────────────────────────────────────────
 * ============================================================
 */

// ─── Mock student dataset ────────────────────────────────────────────────────
//
//  Each entry maps a matric number to the fields the UMIS API
//  must return.  These are realistic Babcock University students
//  used purely for demonstration.
//
//  NOTE TO UMIS TEAM: the field names and types here are the
//  exact contract your API must honour.
//
//  The "password" key is only used by this mock — the real UMIS API must
//  perform its own credential validation before returning student data.
// ─────────────────────────────────────────────────────────────────────────────
$MOCK_STUDENTS = [
    '21/3456' => [
        'password'       => 'Adaeze@BU1',
        'fullName'       => 'Adaeze Okonkwo',
        'department'     => 'Computer Science',
        'faculty'        => 'Computing & Applied Sciences',
        'cgpa'           => 4.31,
        'level'          => '400',
        'graduationYear' => '2025',
    ],
    '21/0892' => [
        'password'       => 'Tolu@BU2',
        'fullName'       => 'Tolu Adeyemi',
        'department'     => 'Mass Communication',
        'faculty'        => 'Communication & Media Studies',
        'cgpa'           => 3.87,
        'level'          => '300',
        'graduationYear' => '2026',
    ],
    '20/1147' => [
        'password'       => 'Emeka@BU3',
        'fullName'       => 'Emeka Nwosu',
        'department'     => 'Accounting',
        'faculty'        => 'Management Sciences',
        'cgpa'           => 3.52,
        'level'          => '500',
        'graduationYear' => '2024',
    ],
    '21/2271' => [
        'password'       => 'Amara@BU4',
        'fullName'       => 'Amara Eze',
        'department'     => 'Nursing Science',
        'faculty'        => 'Health Sciences',
        'cgpa'           => 4.61,
        'level'          => '400',
        'graduationYear' => '2025',
    ],
    '20/0334' => [
        'password'       => 'Segun@BU5',
        'fullName'       => 'Segun Olatunji',
        'department'     => 'Economics',
        'faculty'        => 'Social & Management Sciences',
        'cgpa'           => 3.10,
        'level'          => '500',
        'graduationYear' => '2024',
    ],
    '21/1908' => [
        'password'       => 'Chisom@BU6',
        'fullName'       => 'Chisom Okeke',
        'department'     => 'Law',
        'faculty'        => 'Law',
        'cgpa'           => 3.75,
        'level'          => '400',
        'graduationYear' => '2025',
    ],
    '20/2553' => [
        'password'       => 'Blessing@BU7',
        'fullName'       => 'Blessing Afolabi',
        'department'     => 'Biochemistry',
        'faculty'        => 'Basic & Applied Sciences',
        'cgpa'           => 4.05,
        'level'          => '500',
        'graduationYear' => '2024',
    ],
    '21/0451' => [
        'password'       => 'Kelechi@BU8',
        'fullName'       => 'Kelechi Onyeka',
        'department'     => 'Business Administration',
        'faculty'        => 'Management Sciences',
        'cgpa'           => 2.94,
        'level'          => '300',
        'graduationYear' => '2026',
    ],
];

/**
 * Look up a mock student by matric number.
 *
 * Returns the student data array on success, or sends a JSON
 * error response and exits on failure.
 *
 * @param  string $matricNo  The matric number from the login request.
 * @param  string $password   The password from the login request.
 * @return array              The matching mock student data (password key stripped).
 */
function mockUmisLookup(string $matricNo, string $password): array
{
    global $MOCK_STUDENTS;

    if (!isset($MOCK_STUDENTS[$matricNo])) {
        http_response_code(404);
        exit(json_encode(['error' => 'Student not found']));
    }

    $student = $MOCK_STUDENTS[$matricNo];

    // Validate password — mirrors what the real UMIS API must do.
    if ($password !== $student['password']) {
        http_response_code(401);
        exit(json_encode(['error' => 'Invalid credentials']));
    }

    // Strip the internal password key before returning — the real UMIS
    // API must never include credentials in its response.
    unset($student['password']);
    return $student;
}
