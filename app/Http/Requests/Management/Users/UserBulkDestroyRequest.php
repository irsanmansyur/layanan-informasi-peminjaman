<?php

namespace App\Http\Requests\Management\Users;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UserBulkDestroyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->can('bulkDestroy', User::class);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['string', 'distinct', 'exists:users,id'],
        ];
    }
}
