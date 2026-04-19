<?php

namespace App\Http\Requests\Management\Borrowers;

use App\Models\Borrower;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BorrowerUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Borrower|null $borrower */
        $borrower = $this->route('borrower');

        return $borrower !== null && (bool) $this->user()?->can('update', $borrower);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'total' => ['required', 'numeric', 'min:0'],
            'status' => ['required', 'string', Rule::in(['lunas', 'belum lunas'])],
            'borrowed_at' => ['required', 'date'],
            'paid_off_at' => ['nullable', 'date', 'after_or_equal:borrowed_at'],
        ];
    }
}
