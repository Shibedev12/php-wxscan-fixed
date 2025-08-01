<?php
// Allow CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

// Get the URL
if (!isset($_GET['url'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing 'url' parameter"]);
    exit;
}

$url = $_GET['url'];

if (!preg_match('/^https?:\/\//', $url)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid URL"]);
    exit;
}

// Set headers for the request
$options = [
    "http" => [
        "method" => "GET",
        "header" => "User-Agent: Mozilla/5.0 (Linux; Android 10; SM-A205G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.181 Mobile Safari/537.36\r\n"
    ]
];

$context = stream_context_create($options);
$response = @file_get_contents($url, false, $context);

if ($response === false) {
    http_response_code(502);
    echo json_encode(["error" => "Failed to fetch URL"]);
    exit;
}

// Forward response headers if available
foreach ($http_response_header as $header) {
    if (stripos($header, 'Content-Type:') === 0) {
        header($header);
    }
}

echo $response;
