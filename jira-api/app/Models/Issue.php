<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Issue extends Model
{
    protected $fillable = [
        'project_id',
        'key',
        'summary',
        'description',
        'type',
        'status',
        'priority',
        'created_by',
        'assignee_id',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function creator() { 
        return $this->belongsTo(User::class, 'created_by'); 
    }

    public function assignee() { 
        return $this->belongsTo(User::class, 'assignee_id'); 
    }
}
