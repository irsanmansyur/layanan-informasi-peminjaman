<?php

namespace App\Http\Requests\Management\Permissions;

use App\Models\Permission;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class PermissionUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Permission|null $permission */
        $permission = $this->route('permission');

        return $permission !== null && (bool) $this->user()?->can('update', $permission);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $permission = $this->route('permission');

        return [
            'name' => ['required', 'string', 'max:255', 'unique:permissions,name,'.$permission?->id],
            'group' => ['nullable', 'string', 'max:255'],
            'guard_name' => ['sometimes', 'string', 'max:255'],
        ];
    }
}
