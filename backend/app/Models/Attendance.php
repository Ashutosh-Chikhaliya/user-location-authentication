<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasFactory;

    protected $table = 'attendance'; // Ensure this matches the actual table name in migration

    protected $fillable = [
        'user_id',
        'type',
        'latitude',
        'longitude',
        'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
