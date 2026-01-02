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
        'sanctum/csrf-cookie',
        'login',
        'logout'
    ],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:5173',
        'https://demo.auralendr.com',
        'http://localhost:5174',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,
];

