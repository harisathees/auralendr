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
    'paths' => ['api/*', 'login', 'logout', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => array_merge(
        [
            'https://demo.auralendr.com',
            'http://localhost:5173',
        ],
        explode(',', env('FRONTEND_URL', 'http://localhost:5173'))
    ),
    'allowed_origins_patterns' => ['.*netlify.app', '.*railway.app'],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
