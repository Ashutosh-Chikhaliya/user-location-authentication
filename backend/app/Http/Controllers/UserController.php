<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\CheckIn;
use App\Models\CheckOut;
use Hash;
use Illuminate\Http\Request;
use App\Models\User;
use Str;
use Tymon\JWTAuth\Contracts\JWTSubject;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Validator;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class UserController extends Controller
{
    // register
    public function register(Request $request)
    {
        //validate
        $validator = Validator::make($request->all(), [
            "name" => "required|string|max:255",
            "email" => "required|email|unique:users,email",
            "password" => "required|string|max:12|min:8",
            "office_latitude" => "required|numeric",
            "office_longitude" => "required|numeric",
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);

        }

        $verificationToken = Str::random(64);

        // create user
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'verification_token' => $verificationToken,
            'office_latitude' => $request->office_latitude,
            'office_longitude' => $request->office_longitude,
        ]);
        // $this->sendVerificationEmail($user);
        $token = JWTAuth::fromUser($user);

        return response()->json([
            'message' => 'user registered successfully !',
            'user' => $user,
            'token' => $token
        ], 201);
    }

    //login
    public function login(Request $request)
    {
        $request->validate([
            "email" => "required|email",
            "password" => "required|max:12|min:8"
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'error' => 'invalid email',
            ], 401);
        } elseif (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'error' => 'incorrect password',
            ], 401);
        }
        $token = JWTAuth::fromUser($user);

        return response()->json([
            'message' => 'Login success',
            'user' => $user->makeHidden(['password']),
            'token' => $token
        ], 201);
    }

    //logout
    public function logout(Request $request)
    {
        try {
            $token = JWTAuth::getToken();
            if (!$token) {
                return response()->json(['error' => 'token not provided'], 401);
            }
            JWTAuth::checkOrFail();
            JWTAuth::invalidate($token);
            return response()->json(['message' => 'log out success'], 200);
        } catch (\Tymon\JWTAuth\Exceptions\JWTException $e) {
            return response()->json(['error' => 'failed to logout'], 401);
        }
    }

    // get user data 
    public function getUserData(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'name' => $user->name,
            'email' => $user->email,
            'office_latitude' => $user->office_latitude,
            'office_longitude' => $user->office_longitude,
            'token' => $user->token
        ]);
    }
}
