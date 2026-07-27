<?php

namespace Config;

use CodeIgniter\Config\View as BaseView;
use CodeIgniter\View\ViewDecoratorInterface;

class View extends BaseView
{
    /**
     * @var bool
     */
    public $saveData = true;

    /**
     * @var array<string, 
     */
    public $filters = [];

    /**
    
     * @var array<string
     */
    public $plugins = [];

    /**
     * @var list<class-string<ViewDecoratorInterface>>
     */
    public array $decorators = [];


    public string $appOverridesFolder = 'overrides';
}
