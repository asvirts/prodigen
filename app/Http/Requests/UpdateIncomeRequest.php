<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateIncomeRequest extends FormRequest
{
    /**
     * The key to be used for the view error bag.
     *
     * @var string
     */
    protected $errorBag = 'updateIncomeBag';

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // User must be authenticated
        // Additional check: Ensure user owns the income record? (Handled in controller for now)
        return $this->user() != null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // Use 'sometimes' for optional updates
        return [
            'description' => ['sometimes', 'required', 'string', 'max:255'],
            'amount' => ['sometimes', 'required', 'numeric', 'min:0.01'],
            'date' => ['sometimes', 'required', 'date'],
            'recurrence_frequency' => ['sometimes', 'required', Rule::in(['none', 'monthly', 'yearly'])],
            // Ensure end_date is after the main date if provided
            'recurrence_end_date' => ['nullable', 'date', 'after_or_equal:' . ($this->input('date') ?? $this->income->date)], 
        ];
    }

     /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Update next_recurrence_date if frequency or date changes
        if ($this->has('recurrence_frequency') || $this->has('date')) {
            $frequency = $this->input('recurrence_frequency', $this->income->recurrence_frequency);
            $date = $this->input('date', $this->income->date);

            if ($frequency !== 'none') {
                $this->merge(['next_recurrence_date' => $date]);
            } else {
                 // If changing to 'none', clear recurrence fields
                $this->merge(['next_recurrence_date' => null, 'recurrence_end_date' => null]);
            }
        }

        // If setting frequency to none, explicitly nullify end date unless provided otherwise
        if ($this->input('recurrence_frequency') === 'none' && !$this->has('recurrence_end_date')) {
            $this->merge(['recurrence_end_date' => null]);
        }
    }
}
