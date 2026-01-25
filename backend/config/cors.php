<?php
return [
    //FOR LOCAL HOST
    // 'paths' => ['api/*', 'sanctum/csrf-cookie'],
    // 'allowed_methods' => ['*'],
    // 'allowed_origins' => [
    //     'http://localhost:5173',
    // ],
    // 'allowed_origins_patterns' => [],
    // 'allowed_headers' => ['*'],
    // 'exposed_headers' => [],
    // 'max_age' => 0,
    // 'supports_credentials' => true,





    //FOR PRODUCTION HOST

    'paths' => [
        'api/*',
        'storage/*',
        'sanctum/csrf-cookie',
        'login',
        'logout',
    ],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        // 'http://localhost:5173',
        // 'http://localhost:5174',
        'https://demo.auralendr.com',
        'https://auralendr-customer.netlify.app',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,
];

