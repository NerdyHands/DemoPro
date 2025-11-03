<?php
$recaptcha_secret_key = '6LdhTXYpAAAAAF_Le6iai2PXjKyqs88pnHShcjqG';

// Verify reCAPTCHA response
if (isset($_POST['g-recaptcha-response'])) {
    $recaptcha_response = $_POST['g-recaptcha-response'];
    $url = 'https://www.google.com/recaptcha/api/siteverify';
    $data = [
        'secret' => $recaptcha_secret_key,
        'response' => $recaptcha_response,
    ];

    $options = [
        'http' => [
            'header' => "Content-type: application/x-www-form-urlencoded\r\n",
            'method' => 'POST',
            'content' => http_build_query($data),
        ],
    ];

    $context = stream_context_create($options);
    $result = file_get_contents($url, false, $context);
    $result_json = json_decode($result, true);

    if ($result_json['success']) {
        // reCAPTCHA verification passed, process the form
        // Your form processing code goes here
        echo 'reCAPTCHA verification passed. Form submitted successfully.';
    } else {
        // reCAPTCHA verification failed
        echo 'reCAPTCHA verification failed. Please try again.';
    }
} else {
    // Handle case where 'g-recaptcha-response' is not set
    //echo 'reCAPTCHA response not received. Please try again.';
}
?>