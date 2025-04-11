<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\Income;
use App\Http\Requests\StoreExpenseRequest;
use App\Http\Requests\StoreIncomeRequest;
use App\Http\Requests\UpdateIncomeRequest;
use App\Http\Requests\UpdateExpenseRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\View\View;
use Carbon\Carbon;

class FinanceController extends Controller
{
    /**
     * Display the financial summary for a given month and YTD totals.
     */
    public function index(Request $request): View
    {
        $userId = Auth::id();
        $year = $request->input('year', now()->year);
        $month = $request->input('month', now()->month);

        // Ensure year and month are integers
        $year = (int) $year;
        $month = (int) $month;

        try {
            // Use startOfMonth() to avoid issues with day numbers
            $selectedDate = Carbon::create($year, $month, 1)->startOfMonth();
        } catch (\Exception $e) {
            // Handle invalid date input, default to current month
            $selectedDate = Carbon::now()->startOfMonth();
            // Update year/month based on defaulted date
            $year = $selectedDate->year;
            $month = $selectedDate->month;
        }

        // --- Calculate Data for Selected Month ---
        $monthlyIncome = Income::where('user_id', $userId)
            ->whereYear('date', $selectedDate->year)
            ->whereMonth('date', $selectedDate->month)
            ->sum('amount');

        $monthlyExpenses = Expense::where('user_id', $userId)
            ->whereYear('date', $selectedDate->year)
            ->whereMonth('date', $selectedDate->month)
            ->sum('amount');

        $monthlyNet = $monthlyIncome - $monthlyExpenses;

        // Prepare the summary data for the selected month
        $monthlySummary = [
            'year' => $selectedDate->year,
            'month' => $selectedDate->month,
            'month_name' => $selectedDate->format('F'),
            'total_income' => $monthlyIncome,
            'total_expenses' => $monthlyExpenses,
            'net_income' => $monthlyNet,
        ];

        // --- Calculate YTD Data (Year To Date up to the end of the selected month) ---
        $ytdIncome = Income::where('user_id', $userId)
            ->whereYear('date', $selectedDate->year)
            // Ensure we include all transactions within the selected month as well
            ->where('date', '<=', $selectedDate->copy()->endOfMonth())
            ->sum('amount');

        $ytdExpenses = Expense::where('user_id', $userId)
            ->whereYear('date', $selectedDate->year)
            ->where('date', '<=', $selectedDate->copy()->endOfMonth())
            ->sum('amount');

        $ytdNet = $ytdIncome - $ytdExpenses;

        $ytdSummary = [
            'income' => $ytdIncome,
            'expenses' => $ytdExpenses,
            'net' => $ytdNet,
        ];

        // --- Navigation Links ---
        $prevMonthDate = $selectedDate->copy()->subMonthNoOverflow();
        $nextMonthDate = $selectedDate->copy()->addMonthNoOverflow();
        $currentDate = Carbon::now();

        $previousMonthLink = route('finances.index', ['year' => $prevMonthDate->year, 'month' => $prevMonthDate->month]);

        // Disable next month link if it points to a future month relative to the current real-world date
        $nextMonthLink = ($nextMonthDate->isAfter($currentDate->copy()->startOfMonth()))
            ? null // No link for future months
            : route('finances.index', ['year' => $nextMonthDate->year, 'month' => $nextMonthDate->month]);

        // --- Fetch ALL Transactions for the Selected Month ---
        $monthlyIncomeRecords = Income::where('user_id', $userId)
            ->whereYear('date', $selectedDate->year)
            ->whereMonth('date', $selectedDate->month)
            ->get()
            ->map(function ($item) { $item->type = 'Income'; return $item; });

        $monthlyExpenseRecords = Expense::where('user_id', $userId)
            ->whereYear('date', $selectedDate->year)
            ->whereMonth('date', $selectedDate->month)
            ->get()
            ->map(function ($item) { $item->type = 'Expense'; return $item; });

        // Combine and sort ALL monthly transactions by date DESC (newest first), then created_at DESC for consistent order
        $allMonthlyTransactions = $monthlyIncomeRecords->merge($monthlyExpenseRecords)
            ->sortByDesc('date')
            ->sortByDesc('created_at');

        // Get the top 6 recent transactions from the full sorted list
        $recentTransactions = $allMonthlyTransactions->take(6);

        // --- Generate List of Available Months/Years (7 Years Back to Current) ---
        $endMonth = Carbon::now()->startOfMonth(); // Go up to the current month
        $startMonth = $endMonth->copy()->subYears(7)->startOfMonth(); // Go back 7 years from the current month

        $availableMonths = collect();
        $currentIterationMonth = $startMonth->copy();

        while ($currentIterationMonth->lte($endMonth)) {
            $availableMonths->push([
                'value' => $currentIterationMonth->format('Y-m'),
                'text' => $currentIterationMonth->format('F Y'),
                'year' => $currentIterationMonth->year,
                'month' => $currentIterationMonth->month,
            ]);
            $currentIterationMonth->addMonthNoOverflow();
        }

        // Sort the generated list ascending (oldest first)
        $availableMonths = $availableMonths->sortBy(function ($item) {
            return $item['year'] * 100 + $item['month'];
        })->values();

        // --- DEBUG: Check the count before passing to view ---
        // dd($allMonthlyTransactions->count()); // Removed debug line
        // --- END DEBUG ---

        return view('finances.index', [
            'selectedDate' => $selectedDate,
            'monthlySummary' => $monthlySummary,
            'ytdSummary' => $ytdSummary,
            'allMonthlyTransactions' => $allMonthlyTransactions,
            'recentTransactions' => $recentTransactions,
            'availableMonths' => $availableMonths,
            'previousMonthLink' => $previousMonthLink,
            'nextMonthLink' => $nextMonthLink,
        ]);
    }

    /**
     * Store a newly created income record in storage.
     */
    public function storeIncome(StoreIncomeRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $validated['user_id'] = Auth::id();

        Income::create($validated);

        return redirect()->route('finances.index')->with('success', 'Income added successfully.');
    }

    /**
     * Store a newly created expense record in storage.
     */
    public function storeExpense(StoreExpenseRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $validated['user_id'] = Auth::id();

        Expense::create($validated);

        return redirect()->route('finances.index')->with('success', 'Expense added successfully.');
    }

    /**
     * Update the specified income record in storage.
     */
    public function updateIncome(UpdateIncomeRequest $request, Income $income): RedirectResponse
    {
        // Authorization check (ensure user owns the income)
        if ($request->user()->cannot('update', $income)) {
             abort(403);
         }

        $validated = $request->validated();
        $income->update($validated);

        return redirect()->route('finances.index')->with('success', 'Income updated successfully.');
    }

    /**
     * Update the specified expense record in storage.
     */
    public function updateExpense(UpdateExpenseRequest $request, Expense $expense): RedirectResponse
    {
         // Authorization check (ensure user owns the expense)
         if ($request->user()->cannot('update', $expense)) {
             abort(403);
         }

        $validated = $request->validated();
        $expense->update($validated);

        return redirect()->route('finances.index')->with('success', 'Expense updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, int $id): RedirectResponse
    {
        $transactionType = $request->input('transaction_type'); // Get type from hidden input
        $user = Auth::user();

        if ($transactionType === 'Income') {
            $model = Income::find($id);
            $policyAction = 'delete'; // Assuming IncomePolicy exists
            $typeName = 'Income';
        } elseif ($transactionType === 'Expense') {
            $model = Expense::find($id);
            $policyAction = 'delete'; // Assuming ExpensePolicy exists
            $typeName = 'Expense';
        } else {
            return redirect()->route('finances.index')->with('error', 'Invalid transaction type.');
        }

        if (!$model) {
            return redirect()->route('finances.index')->with('error', $typeName . ' not found.');
        }

        // Authorization: Check if user can delete this specific model instance
        if ($user->cannot($policyAction, $model)) {
            abort(403, 'Unauthorized action.');
        }

        $model->delete();

        return redirect()->route('finances.index')->with('success', $typeName . ' deleted successfully.');
    }
}
