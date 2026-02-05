<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = ['name', 'key', 'description'];

    public function issues()
    {
        return $this->hasMany(Issue::class);
    }
}
