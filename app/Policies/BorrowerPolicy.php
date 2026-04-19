<?php

namespace App\Policies;

use App\Models\Borrower;
use App\Models\User;

class BorrowerPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('borrowers.read');
    }

    public function view(User $user, Borrower $borrower): bool
    {
        return $user->can('borrowers.read');
    }

    public function create(User $user): bool
    {
        return $user->can('borrowers.create');
    }

    public function update(User $user, Borrower $borrower): bool
    {
        return $user->can('borrowers.update');
    }

    public function delete(User $user, Borrower $borrower): bool
    {
        return $user->can('borrowers.delete');
    }

    public function bulkDestroy(User $user): bool
    {
        return $user->can('borrowers.delete');
    }
}
