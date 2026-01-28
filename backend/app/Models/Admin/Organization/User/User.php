<?php

namespace App\Models\Admin\Organization\User;

use App\Models\Admin\Organization\Branch\Branch;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Spatie\Permission\Traits\HasRoles;
use App\Traits\HasPushSubscriptions;
use Database\Factories\UserFactory;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles, HasUlids, HasPushSubscriptions;

    protected $guard_name = 'sanctum';

    protected static function newFactory()
    {
        return UserFactory::new();
    }

    protected $fillable = [
        'name',
        'email',
        'phone_number',
        'photo',
        'password',
        'role',
        'branch_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function media()
    {
        return $this->hasMany(\App\Models\Pledge\MediaFile::class, 'user_id');
    }

    public function getPhotoUrlAttribute()
    {
        // Prioritize media file (profile_photo or user_photo)
        $media = $this->media()->whereIn('category', ['user_photo', 'profile_photo'])->latest()->first();
        if ($media) {
            return $media->url;
        }

        return $this->photo ? url('storage/' . $this->photo) : null;
    }

    protected $appends = ['photo_url'];

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }
}
