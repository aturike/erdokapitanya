<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Booking;
use Carbon\Carbon;
use Inertia\Inertia;

class BookingController extends Controller
{

    public function create()
    {
        return view('bookings.create');
    }

    public function store(Request $request)
    {


        $data = $request->validate([
            'email' => 'required|email',
            'selectedStart' => 'required|date',
            'selectedEnd' => 'required|date|after:selectedStart'
        ]);


        $start = Carbon::parse($data['selectedStart'])
            ->setTime(18, 0)
            ->toDateTimeString();
        $end = Carbon::parse($data['selectedEnd'])
            ->setTime(12, 0)
            ->toDateTimeString();



        // Check for overlapping bookings:
        $overlap = Booking::where(function ($query) use ($start, $end) {
            $query->where('is_confirmed', true)->where('start_date', '<', $end)
                ->where('end_date', '>', $start);
        })->exists();

        if ($overlap) {
            return to_route('home',)->withErrors([
                'date' => 'Booking dates overlap with an existing booking',
            ]);
        }

        // Create new booking record:
        Booking::create([
            'email' => $data['email'],
            'start_date' => $start,
            'end_Date' => $end,
            'is_confirmed' => false
        ]);

        return to_route('home');
    }

    public function show($id)
    {
        return view('bookings.show', compact('id'));
    }

    public function edit($id)
    {
        return view('bookings.edit', compact('id'));
    }

    public function update(Request $request, $id)
    {
        // Logic to update booking
        return redirect()->route('bookings.index')->with('success', 'Booking updated successfully.');
    }

    public function destroy($id)
    {
        // Logic to delete booking
        return redirect()->route('bookings.index')->with('success', 'Booking deleted successfully.');
    }
}
