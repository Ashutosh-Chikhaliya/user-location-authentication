<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Attendance;
use Illuminate\Support\Facades\Auth;

class CheckInOutController extends Controller
{
    // Check In API
    public function checkIn(Request $request)
    {
        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        $checkIn = Attendance::create([
            'user_id' => Auth::id(), // Get logged-in user's ID
            'type' => 'check-in',
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'datetime' => now()->setTimezone('Asia/Kolkata')
        ]);

        return response()->json([
            'message' => 'Check-in successful',
            'data' => $checkIn,
        ], 201);
    }

    // Check Out API
    public function checkOut(Request $request)
    {
        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        $checkOut = Attendance::create([
            'user_id' => Auth::id(), // Get logged-in user's ID
            'type' => 'check-out',
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'datetime' => now()->setTimezone('Asia/Kolkata')
        ]);

        return response()->json([
            'message' => 'Check-out successful',
            'data' => $checkOut,
        ], 201);
    }
}
