<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CheckIn;
use App\Models\CheckOut;
use Illuminate\Support\Facades\Auth;

class CheckInOutController extends Controller
{
    // Check In APIe
    public function checkIn(Request $request)
    {
        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        $checkIn = CheckIn::create([
            'user_id' => Auth::id(), // Get logged-in user's ID
            'type' => 'check_in',
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'check_in_time' => now()->setTimezone('Asia/Kolkata')
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

        $checkOut = CheckOut::create([
            'user_id' => Auth::id(), // Get logged-in user's ID
            'type' => 'check_out',
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'check_in_time' => now()->setTimezone('Asia/Kolkata')
        ]);

        return response()->json([
            'message' => 'Check-out successful',
            'data' => $checkOut,
        ], 201);
    }
}
