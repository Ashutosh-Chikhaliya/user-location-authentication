<?php

use App\Http\Controllers\CheckInController;
use App\Http\Controllers\CheckInOutController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;


Route::post('/register', [UserController::class, 'register']);
Route::post('/login', [UserController::class, 'login']);
Route::post('/logout', [UserController::class, 'logout']);

Route::middleware('auth:api')->group(function () {
    Route::get('/getUserData', [UserController::class, 'getUserData']);
    Route::post('/check-in', [CheckInOutController::class, 'checkIn']);
    Route::post('/check-out', [CheckInOutController::class, 'checkOut']);
});