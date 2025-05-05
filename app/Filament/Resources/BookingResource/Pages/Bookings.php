<?php

namespace App\Filament\Resources\BookingResource\Pages;

use App\Filament\Resources\BookingResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class Bookings extends EditRecord
{
    protected static string $resource = BookingResource::class;
}
