<?php

namespace App\Http\Requests\Management;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class PermissionStoreRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name'       => ['required', 'string', 'max:255', 'unique:permissions,name'],
            'group'      => ['nullable', 'string', 'max:255'],
            'guard_name' => ['nullable', 'string', 'max:255'],
        ];
    }
}

