<?php

namespace App\Http\Requests\Management\Informations;

use App\Models\Information;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class InformationBulkDestroyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->can('bulkDestroy', Information::class);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['string', 'distinct', 'exists:informations,id'],
        ];
    }
}
