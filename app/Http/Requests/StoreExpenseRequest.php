<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreExpenseRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
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
            'category' => ['nullable', 'string', 'max:100'], // Allow null or string
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
        if ($this->input('recurrence_frequency') !== 'none') {
            $this->merge(['next_recurrence_date' => $this->input('date')]);
        } else {
            $this->merge(['next_recurrence_date' => null, 'recurrence_end_date' => null]);
        }
    }
}
