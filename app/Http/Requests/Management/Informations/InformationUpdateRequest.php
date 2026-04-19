<?php

namespace App\Http\Requests\Management\Informations;

use App\Models\Information;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class InformationUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Information|null $information */
        $information = $this->route('information');

        return $information !== null && (bool) $this->user()?->can('update', $information);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'status' => ['required', 'string', Rule::in(['aktif', 'tidak aktif'])],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
        ];
    }
}
