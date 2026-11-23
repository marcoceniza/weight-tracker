<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class DeviceInfo extends Model
{
    protected $appends = ['map_url'];

    protected $hidden = [
        'installation_token_hash',
        'device_token_hash',
    ];

    protected $fillable = [
        'user_id',
        'device_name',
        'device_brand',
        'device_model',
        'device_id',
        'os_version',
        'app_version',
        'latitude',
        'longitude',
        'location_name',
        'location_captured_at',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'float',
            'longitude' => 'float',
            'location_captured_at' => 'datetime',
            'enabled' => 'boolean',
            'last_check_in_at' => 'datetime',
        ];
    }

    public function getMapUrlAttribute(): ?string
    {
        if ($this->latitude === null || $this->longitude === null) {
            return null;
        }

        return 'https://www.google.com/maps/search/?api=1&query='
            .rawurlencode($this->latitude.','.$this->longitude);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function onboardingProfile(): HasOne
    {
        return $this->hasOne(OnboardingProfile::class, 'device_id');
    }

    public function isEnabled(): bool
    {
        return (bool) $this->enabled;
    }

    public function isDisabled(): bool
    {
        return ! $this->isEnabled();
    }
}
