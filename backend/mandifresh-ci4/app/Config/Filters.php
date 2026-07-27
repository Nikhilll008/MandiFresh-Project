<?php

namespace Config;

use CodeIgniter\Config\BaseConfig;
use CodeIgniter\Filters\Cors;
use CodeIgniter\Filters\CSRF;
use CodeIgniter\Filters\DebugToolbar;
use CodeIgniter\Filters\Honeypot;
use CodeIgniter\Filters\InvalidChars;
use CodeIgniter\Filters\SecureHeaders;

class Filters extends BaseConfig
{
    public array $aliases = [
        'csrf'        => CSRF::class,
        'toolbar'     => DebugToolbar::class,
        'honeypot'    => Honeypot::class,
        'invalidchars'=> InvalidChars::class,
        'secureheaders'=> SecureHeaders::class,
        'cors'        => \App\Filters\CorsFilter::class,
    ];

    public array $globals = [
        'before' => [
            'cors',
        ],
        'after' => [
            'toolbar',
        ],
    ];

    public array $methods = [];

    public array $filters = [
        'csrf' => [
            'before' => ['*'],
            'except'   => ['api/*'],
        ],
    ];
}

