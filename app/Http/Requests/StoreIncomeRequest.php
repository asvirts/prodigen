<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreIncomeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Ensure the user is authenticated
        return $this->user() != null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'description' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'date' => ['required', 'date'],
            'recurrence_frequency' => ['required', Rule::in(['none', 'monthly', 'yearly'])],
            'recurrence_end_date' => ['nullable', 'date', 'after_or_equal:date'],
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Set next_recurrence_date based on date if recurring
        if ($this->input('recurrence_frequency') !== 'none') {
            $this->merge(['next_recurrence_date' => $this->input('date')]);
        } else {
            $this->merge(['next_recurrence_date' => null, 'recurrence_end_date' => null]);
        }
    }
}
