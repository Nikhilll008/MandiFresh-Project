<?php

use CodeIgniter\Router\RouteCollection;

/** @var RouteCollection $routes */

$routes->setDefaultNamespace('App\Controllers');
$routes->setDefaultController('Home');
$routes->setDefaultMethod('index');
$routes->setTranslateURIDashes(false);
$routes->set404Override();
$routes->setAutoRoute(false);

$routes->get('/', static function () {
    return service('response')->setJSON([
        'status'  => 'success',
        'message' => 'MandiFresh API is running.',
        'docs'    => '/api/dashboard',
    ]);
});

$routes->group('api', ['namespace' => 'App\Controllers\Api'], static function ($routes) {

    $routes->get('dashboard', 'HomeController::dashboard');

    $routes->get('prices', 'PriceController::index');

    $routes->get('prices/crop/(:num)', 'PriceController::byCrop/$1');

    $routes->get('prices/chart/(:num)', 'PriceController::chart/$1');

    $routes->get('prices/history/(:num)', 'PriceController::history/$1');

    $routes->get('crops', 'PriceController::crops');
    $routes->get('mandis', 'PriceController::mandis');

    $routes->post('profit/calculate', 'ProfitController::calculate');

    $routes->get('profit/history', 'ProfitController::history');
});

$routes->set404Override(static function () {
    return service('response')
        ->setStatusCode(404)
        ->setJSON(['status' => 'error', 'message' => 'Endpoint not found.']);
});

