<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('issues', function (Blueprint $table) {
            $table->id();

            $table->foreignId('project_id')->constrained()->cascadeOnDelete();

            $table->string('key');          // npr TEST4-1
            $table->string('summary');      // naslov
            $table->text('description')->nullable();

            $table->string('type')->default('task');        // task/bug/story
            $table->string('status')->default('todo');      // todo/in_progress/done
            $table->string('priority')->default('medium');  // low/medium/high

            $table->timestamps();

            $table->unique(['project_id', 'key']); // unutar projekta key mora biti unique
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('issues');
    }
};
