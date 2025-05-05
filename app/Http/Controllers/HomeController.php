<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {

        return Inertia::render('Home', [
            'bookings' => Booking::all(),

        ]);
    }
}
