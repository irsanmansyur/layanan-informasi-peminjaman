<?php

namespace App\Http\Requests\Management;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class PermissionUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $permission = $this->route('permission');

        return [
            'name'       => ['required', 'string', 'max:255', 'unique:permissions,name,'.$permission?->id],
            'group'      => ['nullable', 'string', 'max:255'],
            'guard_name' => ['sometimes', 'string', 'max:255'],
        ];
    }
}

