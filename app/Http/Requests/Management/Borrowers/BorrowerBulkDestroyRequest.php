<?php

namespace App\Http\Requests\Management\Borrowers;

use App\Models\Borrower;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class BorrowerBulkDestroyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->can('bulkDestroy', Borrower::class);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['string', 'distinct', 'exists:borrowers,id'],
        ];
    }
}
