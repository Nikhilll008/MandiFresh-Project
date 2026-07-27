<?php

namespace Config;

/**
 * This configuration controls how CodeIgniter behaves when running
 * in worker mode (with FrankenPHP).
 */
class WorkerMode
{
    /**
        * Persistent Services
     * @var list<string>
     */
    public array $persistentServices = [
        'autoloader',
        'locator',
        'exceptions',
        'commands',
        'codeigniter',
        'superglobals',
        'routes',
        'cache',
    ];

    /**
     * Reset Event Listeners
     * @var list<string>
     */
    public array $resetEventListeners = [];

    
    public bool $forceGarbageCollection = true;
}
