<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\FinanceController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/dashboard', function () {
    return view('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::resource('categories', CategoryController::class);

    Route::get('/finances', [FinanceController::class, 'index'])->name('finances.index');

    Route::post('/finances/income', [FinanceController::class, 'storeIncome'])->name('finances.income.store');
    Route::post('/finances/expense', [FinanceController::class, 'storeExpense'])->name('finances.expense.store');

    Route::patch('/finances/income/{income}', [FinanceController::class, 'updateIncome'])->name('finances.income.update');
    Route::patch('/finances/expense/{expense}', [FinanceController::class, 'updateExpense'])->name('finances.expense.update');

    Route::delete('/finances/{finance}', [FinanceController::class, 'destroy'])->name('finances.destroy');
});

require __DIR__.'/auth.php';
