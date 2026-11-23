<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OnboardingProfile extends Model
{
    protected $fillable = [
        'name',
        'current_weight',
        'current_weight_date',
        'unit',
        'height_cm',
        'device_id',
    ];

    protected function casts(): array
    {
        return [
            'current_weight_date' => 'date:Y-m-d',
        ];
    }

    public function device(): BelongsTo
    {
        return $this->belongsTo(DeviceInfo::class);
    }
}
