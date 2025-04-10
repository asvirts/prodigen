<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateExpenseRequest extends FormRequest
{
    /**
     * The key to be used for the view error bag.
     *
     * @var string
     */
    protected $errorBag = 'updateExpenseBag';

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
            'description' => ['sometimes', 'required', 'string', 'max:255'],
            'amount' => ['sometimes', 'required', 'numeric', 'min:0.01'],
            'category' => ['nullable', 'string', 'max:100'],
            'date' => ['sometimes', 'required', 'date'],
            'recurrence_frequency' => ['sometimes', 'required', Rule::in(['none', 'monthly', 'yearly'])],
            'recurrence_end_date' => ['nullable', 'date', 'after_or_equal:' . ($this->input('date') ?? $this->expense->date)],
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('recurrence_frequency') || $this->has('date')) {
            $frequency = $this->input('recurrence_frequency', $this->expense->recurrence_frequency);
            $date = $this->input('date', $this->expense->date);

            if ($frequency !== 'none') {
                $this->merge(['next_recurrence_date' => $date]);
            } else {
                $this->merge(['next_recurrence_date' => null, 'recurrence_end_date' => null]);
            }
        }

        if ($this->input('recurrence_frequency') === 'none' && !$this->has('recurrence_end_date')) {
             $this->merge(['recurrence_end_date' => null]);
        }
    }
}
