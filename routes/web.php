<?php

use App\Http\Controllers\BookingController;
use App\Http\Controllers\HomeController;
use Illuminate\Support\Facades\Route;



Route::get('/', [HomeController::class, 'index'])
    ->name('home');




//Booking Routes
Route::post('/booking', [BookingController::class, 'store']);
