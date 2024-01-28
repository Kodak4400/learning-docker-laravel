<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/welcome', function () {
    \Log::debug('Test Debug Log', ['welcome' => 'start']);
    \Log::info('Test Info Log', ['welcome' => 'start']);
    \Log::warning('Test Warning Log', ['welcome' => true]);
    \Log::error('Test Error Log', ['welcome' => false]);
    \Log::info('Test Info Log', ['welcome' => 'end']);

    return response()->json([
        'status' => true,
        'message' => "Product Created successfully!",
    ], 200);
});
