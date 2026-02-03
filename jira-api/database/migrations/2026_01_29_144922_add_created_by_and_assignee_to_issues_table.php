<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;


return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('issues', function (Blueprint $table) {
            $table->unsignedBigInteger('created_by')->nullable()->after('project_id');
            $table->unsignedBigInteger('assignee_id')->nullable()->after('created_by');

            $table->foreign('created_by')->references('id')->on('users');
            $table->foreign('assignee_id')->references('id')->on('users');
        });

        // backfill: postojeći issue-i neka imaju created_by = prvi user (ili null)
        // Ako želiš striktno: postavi na 1 ako imaš admin usera s id=1
        DB::table('issues')->whereNull('created_by')->update(['created_by' => 1]);

        Schema::table('issues', function (Blueprint $table) {
            $table->unsignedBigInteger('created_by')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('issues', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->dropForeign(['assignee_id']);
            $table->dropColumn(['created_by', 'assignee_id']);
        });
    }
};
