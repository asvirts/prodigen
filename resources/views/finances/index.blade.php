<x-app-layout>
    <x-slot name="header">
        <div class="flex justify-between items-center">
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">
                {{ __('Finances') }}
            </h2>
            {{-- Add Buttons --}}
            <div class="space-x-2">
                {{-- We'll use Alpine.js later to toggle these forms/modals --}}
                <x-primary-button x-data=""
                    x-on:click.prevent="$dispatch('open-modal', 'add-income-modal')">{{ __('Add Income') }}</x-primary-button>
                <x-primary-button x-data=""
                    x-on:click.prevent="$dispatch('open-modal', 'add-expense-modal')">{{ __('Add Expense') }}</x-primary-button>
            </div>
        </div>
    </x-slot>

    {{-- Add Income Modal --}}
    <x-modal name="add-income-modal" :show="$errors->isNotEmpty() && old('form_type') === 'income'" focusable>
        <form method="post" action="{{ route('finances.income.store') }}" class="p-6">
            @csrf
            <input type="hidden" name="form_type" value="income"> {{-- Identifier for error handling --}}
            <h2 class="text-lg font-medium text-gray-900">
                {{ __('Add New Income') }}
            </h2>
            {{-- Form fields for Income --}}
            <div class="mt-6">
                <x-input-label for="income_description" value="{{ __('Description') }}" />
                <x-text-input id="income_description" name="description" type="text" class="mt-1 block w-full"
                    :value="old('description')" required autofocus />
                <x-input-error class="mt-2" :messages="$errors->get('description')" />
            </div>
            <div class="mt-4">
                <x-input-label for="income_amount" value="{{ __('Amount') }}" />
                <x-text-input id="income_amount" name="amount" type="number" step="0.01" min="0.01"
                    class="mt-1 block w-full" :value="old('amount')" required />
                <x-input-error class="mt-2" :messages="$errors->get('amount')" />
            </div>
            <div class="mt-4">
                <x-input-label for="income_date" value="{{ __('Date') }}" />
                <x-text-input id="income_date" name="date" type="date" class="mt-1 block w-full" :value="old('date', now()->format('Y-m-d'))"
                    required />
                <x-input-error class="mt-2" :messages="$errors->get('date')" />
            </div>
            <div class="mt-4">
                <x-input-label for="income_recurrence_frequency" value="{{ __('Recurrence') }}" />
                <select name="recurrence_frequency" id="income_recurrence_frequency"
                    class="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm">
                    <option value="none" {{ old('recurrence_frequency') == 'none' ? 'selected' : '' }}>None</option>
                    <option value="monthly" {{ old('recurrence_frequency') == 'monthly' ? 'selected' : '' }}>Monthly
                    </option>
                    <option value="yearly" {{ old('recurrence_frequency') == 'yearly' ? 'selected' : '' }}>Yearly
                    </option>
                </select>
                <x-input-error class="mt-2" :messages="$errors->get('recurrence_frequency')" />
            </div>
            <div class="mt-4">
                <x-input-label for="income_recurrence_end_date" value="{{ __('Recurrence End Date (Optional)') }}" />
                <x-text-input id="income_recurrence_end_date" name="recurrence_end_date" type="date"
                    class="mt-1 block w-full" :value="old('recurrence_end_date')" />
                <x-input-error class="mt-2" :messages="$errors->get('recurrence_end_date')" />
            </div>

            <div class="mt-6 flex justify-end">
                <x-secondary-button x-on:click="$dispatch('close')">
                    {{ __('Cancel') }}
                </x-secondary-button>
                <x-primary-button class="ms-3">
                    {{ __('Save Income') }}
                </x-primary-button>
            </div>
        </form>
    </x-modal>

    {{-- Add Expense Modal --}}
    <x-modal name="add-expense-modal" :show="$errors->isNotEmpty() && old('form_type') === 'expense'" focusable>
        <form method="post" action="{{ route('finances.expense.store') }}" class="p-6">
            @csrf
            <input type="hidden" name="form_type" value="expense"> {{-- Identifier for error handling --}}
            <h2 class="text-lg font-medium text-gray-900">
                {{ __('Add New Expense') }}
            </h2>
            {{-- Form fields for Expense --}}
            <div class="mt-6">
                <x-input-label for="expense_description" value="{{ __('Description') }}" />
                <x-text-input id="expense_description" name="description" type="text" class="mt-1 block w-full"
                    :value="old('description')" required autofocus />
                <x-input-error class="mt-2" :messages="$errors->get('description')" />
            </div>
            <div class="mt-4">
                <x-input-label for="expense_amount" value="{{ __('Amount') }}" />
                <x-text-input id="expense_amount" name="amount" type="number" step="0.01" min="0.01"
                    class="mt-1 block w-full" :value="old('amount')" required />
                <x-input-error class="mt-2" :messages="$errors->get('amount')" />
            </div>
            <div class="mt-4">
                <x-input-label for="expense_category" value="{{ __('Category (Optional)') }}" />
                <x-text-input id="expense_category" name="category" type="text" class="mt-1 block w-full"
                    :value="old('category')" />
                <x-input-error class="mt-2" :messages="$errors->get('category')" />
            </div>
            <div class="mt-4">
                <x-input-label for="expense_date" value="{{ __('Date') }}" />
                <x-text-input id="expense_date" name="date" type="date" class="mt-1 block w-full"
                    :value="old('date', now()->format('Y-m-d'))" required />
                <x-input-error class="mt-2" :messages="$errors->get('date')" />
            </div>
            <div class="mt-4">
                <x-input-label for="expense_recurrence_frequency" value="{{ __('Recurrence') }}" />
                <select name="recurrence_frequency" id="expense_recurrence_frequency"
                    class="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm">
                    <option value="none" {{ old('recurrence_frequency') == 'none' ? 'selected' : '' }}>None</option>
                    <option value="monthly" {{ old('recurrence_frequency') == 'monthly' ? 'selected' : '' }}>Monthly
                    </option>
                    <option value="yearly" {{ old('recurrence_frequency') == 'yearly' ? 'selected' : '' }}>Yearly
                    </option>
                </select>
                <x-input-error class="mt-2" :messages="$errors->get('recurrence_frequency')" />
            </div>
            <div class="mt-4">
                <x-input-label for="expense_recurrence_end_date"
                    value="{{ __('Recurrence End Date (Optional)') }}" />
                <x-text-input id="expense_recurrence_end_date" name="recurrence_end_date" type="date"
                    class="mt-1 block w-full" :value="old('recurrence_end_date')" />
                <x-input-error class="mt-2" :messages="$errors->get('recurrence_end_date')" />
            </div>

            <div class="mt-6 flex justify-end">
                <x-secondary-button x-on:click="$dispatch('close')">
                    {{ __('Cancel') }}
                </x-secondary-button>
                <x-primary-button class="ms-3">
                    {{ __('Save Expense') }}
                </x-primary-button>
            </div>
        </form>
    </x-modal>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

            {{-- Top Section: Two Columns (Summary Left, Recent Right) --}}
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {{-- Left Column: Combined Summary --}}
                <div class="lg:col-span-2 p-4 sm:p-8 bg-white shadow sm:rounded-lg" x-data="{
                    selectedMonth: '{{ $selectedDate->format('Y-m') }}',
                    availableMonths: {{ json_encode($availableMonths) }},
                    navigate() {
                        if (this.selectedMonth) {
                            const [year, month] = this.selectedMonth.split('-');
                            window.location.href = '{{ route('finances.index') }}?year=' + year + '&month=' + month;
                        }
                    }
                }">
                    {{-- Month Navigation and Title --}}
                    <div class="flex justify-between items-center mb-6">
                        {{-- Previous Month Link --}}
                        <a href="{{ $previousMonthLink }}"
                            class="text-indigo-600 hover:text-indigo-900 text-sm font-medium">&lt; Prev</a>

                        {{-- Month/Year Selection Dropdown --}}
                        <select x-model="selectedMonth" @change="navigate()"
                            class="text-xl font-semibold text-gray-900 text-center border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mx-4">
                            <template x-for="monthOption in availableMonths" :key="monthOption.value">
                                <option :value="monthOption.value" :selected="monthOption.value === selectedMonth"
                                    x-text="monthOption.text">
                                </option>
                            </template>
                        </select>

                        {{-- Next Month Link/Span --}}
                        @if ($nextMonthLink)
                            <a href="{{ $nextMonthLink }}"
                                class="text-indigo-600 hover:text-indigo-900 text-sm font-medium">Next &gt;</a>
                        @else
                            <span class="text-gray-400 text-sm font-medium cursor-not-allowed">Next &gt;</span>
                        @endif
                    </div>
                    {{-- Summary Table --}}
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th scope="col"
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Summary Type</th>
                                    <th scope="col"
                                        class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Income</th>
                                    <th scope="col"
                                        class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Expenses</th>
                                    <th scope="col"
                                        class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Net</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                {{-- Monthly Row --}}
                                <tr>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Monthly
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">
                                        ${{ number_format($monthlySummary['total_income'], 2) }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600">
                                        ${{ number_format($monthlySummary['total_expenses'], 2) }}
                                    </td>
                                    <td @class([
                                        'px-6 py-4 whitespace-nowrap text-sm text-right font-semibold',
                                        'text-green-600' => $monthlySummary['net_income'] >= 0,
                                        'text-red-600' => $monthlySummary['net_income'] < 0,
                                    ])>
                                        ${{ number_format($monthlySummary['net_income'], 2) }}
                                    </td>
                                </tr>
                                {{-- YTD Row --}}
                                <tr>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        Year-to-Date ({{ $selectedDate->year }})</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">
                                        ${{ number_format($ytdSummary['income'], 2) }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600">
                                        ${{ number_format($ytdSummary['expenses'], 2) }}
                                    </td>
                                    <td @class([
                                        'px-6 py-4 whitespace-nowrap text-sm text-right font-semibold',
                                        'text-green-600' => $ytdSummary['net'] >= 0,
                                        'text-red-600' => $ytdSummary['net'] < 0,
                                    ])>
                                        ${{ number_format($ytdSummary['net'], 2) }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    @if (
                        $monthlySummary['total_income'] == 0 &&
                            $monthlySummary['total_expenses'] == 0 &&
                            $ytdSummary['income'] == 0 &&
                            $ytdSummary['expenses'] == 0)
                        <p class="mt-4 text-sm text-gray-600 text-center">
                            {{ __('No financial data available for this period.') }}</p>
                    @endif
                </div>

                {{-- Right Column: Recent Transactions --}}
                <div class="lg:col-span-1 p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">{{ __('Recent Activity This Month') }}</h3>
                    @if ($monthlyTransactions->isEmpty())
                        <p class="text-sm text-gray-600">{{ __('No transactions this month.') }}</p>
                    @else
                        <ul class="divide-y divide-gray-200">
                            @foreach ($monthlyTransactions->take(6) as $transaction)
                                <li class="py-3 flex justify-between items-center">
                                    <div>
                                        <p class="text-sm font-medium text-gray-900">{{ $transaction->description }}
                                        </p>
                                        <p class="text-xs text-gray-500">{{ $transaction->date->format('M d') }} -
                                            {{ $transaction->type }}</p>
                                    </div>
                                    <span @class([
                                        'text-sm font-semibold',
                                        'text-green-600' => $transaction->type === 'Income',
                                        'text-red-600' => $transaction->type === 'Expense',
                                    ])>
                                        {{ $transaction->type === 'Income' ? '+' : '-' }}${{ number_format($transaction->amount, 2) }}
                                    </span>
                                </li>
                            @endforeach
                        </ul>
                    @endif
                </div>
            </div>

            {{-- Bottom Section: Full Monthly Transactions List --}}
            <div class="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                <div class="max-w-full">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">
                        {{ __('Transactions for :month', ['month' => $selectedDate->format('F Y')]) }}</h3>
                    @if ($monthlyTransactions->isEmpty())
                        <p class="mt-1 text-sm text-gray-600">
                            {{ __('No transactions recorded for this month.') }}
                        </p>
                    @else
                        <div class="mt-6 overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th scope="col"
                                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date</th>
                                        <th scope="col"
                                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type</th>
                                        <th scope="col"
                                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Description</th>
                                        <th scope="col"
                                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category</th>
                                        <th scope="col"
                                            class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount</th>
                                        <th scope="col" class="relative px-6 py-3">
                                            <span class="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    @foreach ($monthlyTransactions as $transaction)
                                        <tr>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {{ $transaction->date->format('Y-m-d') }}
                                            </td>
                                            <td @class([
                                                'px-6 py-4 whitespace-nowrap text-sm font-medium',
                                                'text-green-600' => $transaction->type === 'Income',
                                                'text-red-600' => $transaction->type === 'Expense',
                                            ])>
                                                {{ $transaction->type }}
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {{ $transaction->description }}
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {{-- Expense specific category --}}
                                                {{ $transaction->type === 'Expense' ? $transaction->category : 'N/A' }}
                                            </td>
                                            <td @class([
                                                'px-6 py-4 whitespace-nowrap text-sm text-right',
                                                'text-green-600' => $transaction->type === 'Income',
                                                'text-red-600' => $transaction->type === 'Expense',
                                            ])>
                                                ${{ number_format($transaction->amount, 2) }}
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                @php
                                                    // Data for the store
                                                    $txData = json_encode([
                                                        'id' => $transaction->id,
                                                        'type' => $transaction->type, // Keep original casing for logic
                                                        'description' => $transaction->description,
                                                        'amount' => $transaction->amount,
                                                        'category' =>
                                                            $transaction->type === 'Expense'
                                                                ? $transaction->category ?? ''
                                                                : null,
                                                        'date' => $transaction->date->format('Y-m-d'),
                                                        'recurrence_frequency' => $transaction->recurrence_frequency,
                                                        'recurrence_end_date' => $transaction->recurrence_end_date?->format(
                                                            'Y-m-d',
                                                        ),
                                                    ]);
                                                @endphp
                                                <form method="POST"
                                                    action="{{ route('finances.destroy', $transaction->id) }}"
                                                    onsubmit="return confirm('Are you sure you want to delete this transaction?');"
                                                    class="inline">
                                                    @csrf
                                                    @method('DELETE')
                                                    {{-- Send type to know which model to delete --}}
                                                    <input type="hidden" name="transaction_type"
                                                        value="{{ $transaction->type }}">
                                                    <button type="submit"
                                                        class="text-red-600 hover:text-red-900 ml-4 underline">
                                                        Delete
                                                    </button>
                                                </form>
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
