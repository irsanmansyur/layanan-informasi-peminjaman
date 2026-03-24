# DataTable – Dokumentasi Penggunaan
Component **DataTable** dipakai untuk menampilkan data paginated dengan fitur pencarian, filter, sort, export, dan seleksi baris. Data di-fetch dari backend via URL; filter/sort/pagination dikirim sebagai query string.

---

## Daftar isi

- [DataTable – Dokumentasi Penggunaan](#datatable--dokumentasi-penggunaan)
  - [Daftar isi](#daftar-isi)
  - [1. Contoh minimal](#1-contoh-minimal)
  - [2. Props Component DataTable](#2-props-component-datatable)
  - [3. Definisi kolom (Column)](#3-definisi-kolom-column)
  - [4. Filter](#4-filter)
  - [5. Backend / API](#5-backend--api)
    - [Query params yang dikirim](#query-params-yang-dikirim)
    - [Format response](#format-response)
  - [6. Seleksi baris \& export](#6-seleksi-baris--export)
  - [7. Contoh lengkap (Users)](#7-contoh-lengkap-users)
  - [Debounce search \& pembatalan request](#debounce-search--pembatalan-request)
  - [File terkait](#file-terkait)

---

## 1. Contoh minimal

```tsx
import { DataTable } from '@/components/datatables';
import type { Column } from '@/types/datatables';

type Item = { id: string; name: string; email: string };

const columns: Column<Item>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
];

export function MyTable() {
    return <DataTable<Item> columns={columns} fetchUrl="/api/items" />;
}
```

- **`columns`**: definisi kolom (key, label, sortable, render, dll.).
- **`fetchUrl`**: URL GET yang menerima query params `search`, `sort`, `direction`, `limit`, `page`, dan key filter lainnya.
- Response backend harus berbentuk pagination Laravel (lihat [Backend / API](#5-backend--api)).

---

## 2. Props Component DataTable

| Prop                                                              | Tipe                                          | Default             | Keterangan                                                                             |
| ----------------------------------------------------------------- | --------------------------------------------- | ------------------- | -------------------------------------------------------------------------------------- |
| `columns`                                                         | `Column<T>[]`                                 | wajib               | Definisi kolom tabel.                                                                  |
| `fetchUrl`                                                        | `string`                                      | wajib               | URL untuk fetch data (GET).                                                            |
| `filters`                                                         | `Filter[]`                                    | `[]`                | Daftar filter (select, combobox, multiselect).                                         |
| `searchPlaceholder`                                               | `string`                                      | `'Search...'`       | Placeholder input pencarian.                                                           |
| `defaultSort`                                                     | `{ key: string; direction: 'asc' \| 'desc' }` | -                   | Sort awal.                                                                             |
| `defaultLimit`                                                    | `number`                                      | `10`                | Jumlah baris per halaman awal.                                                         |
| `pageSizeOptions`                                                 | `number[]`                                    | `[10, 25, 50, 100]` | Opsi “rows per page”.                                                                  |
| `dataPath`                                                        | `string`                                      | -                   | Path di response JSON tempat data pagination (mis. `'users'` → `response.data.users`). |
| `topContent`                                                      | `ReactNode`                                   | -                   | Konten di atas tabel (tombol, dll.).                                                   |
| `selectable`                                                      | `boolean`                                     | `false`             | Aktifkan checkbox seleksi per baris.                                                   |
| `selectableCondition`                                             | `(row: T) => boolean`                         | -                   | Baris yang boleh diselect (default: semua).                                            |
| `onSelectionChange`                                               | `(rows: T[]) => void`                         | -                   | Callback saat seleksi berubah.                                                         |
| `actions`                                                         | `(row: T) => ReactNode`                       | -                   | Konten kolom aksi per baris (atau gunakan `children`).                                 |
| `actionColumn`                                                    | `{ header?, className?, cellClassName? }`     | -                   | Konfigurasi kolom aksi.                                                                |
| `initialFilters`                                                  | `Record<string, any>`                         | -                   | Nilai filter awal (key = filter key).                                                  |
| `onFilterChange`                                                  | `(filters) => void`                           | -                   | Callback saat filter berubah.                                                          |
| `searchableColumns`                                               | `SearchableColumn[]`                          | -                   | Kolom yang ikut search (untuk label/UI).                                               |
| `searchFieldKey`                                                  | `string`                                      | -                   | Key query param untuk search (default backend: `search`).                              |
| `exportConfig`                                                    | `DataTableExportConfig<T>`                    | -                   | Export CSV/JSON.                                                                       |
| `loadingContent`                                                  | `ReactNode`                                   | -                   | Custom UI saat loading.                                                                |
| `emptyContent`                                                    | `ReactNode`                                   | -                   | Custom UI saat tidak ada data.                                                         |
| `className`, `tableClassName`, `headerClassName`, `bodyClassName` | `string`                                      | -                   | Kelas CSS.                                                                             |
| `rowClassName`                                                    | `(row, index) => string \| undefined`         | -                   | Kelas per baris.                                                                       |

---

## 3. Definisi kolom (Column)

```ts
interface Column<T> {
    key: keyof T | string; // Key di data row
    label: string; // Label header
    sortable?: boolean; // Bisa di-sort (kirim sort=key, direction=asc|desc)
    render?: (row: T) => ReactNode; // Custom cell (default: row[key])
    className?: string; // Class header/cell
    headerClassName?: string;
    cellClassName?: string;
    hideBelow?: 'sm' | 'md' | 'lg' | 'xl'; // Sembunyikan kolom di bawah breakpoint
    searchable?: boolean; // Untuk metadata/export
    exportable?: boolean; // Ikut export (default true)
    exportLabel?: string; // Label di file export
    exportValue?: (row: T) => string | number | null | undefined;
}
```

**Contoh:**

```tsx
const columns: Column<User>[] = [
    { key: 'name', label: 'Name', sortable: true, className: 'min-w-[200px]' },
    {
        key: 'roles',
        label: 'Roles',
        sortable: true,
        render: (user) => user.roles.join(', '),
    },
    {
        key: 'created_at',
        label: 'Created At',
        sortable: true,
        hideBelow: 'lg',
        render: (user) => new Date(user.created_at).toLocaleDateString(),
    },
];
```

---

## 4. Filter

Filter dikirim ke backend sebagai query params: key filter = nama param.

```ts
interface Filter {
    key: string; // Nama param (mis. 'role', 'status')
    label: string; // Label di UI
    options: FilterOption[]; // { label, value }[]
    variant?: 'select' | 'combobox' | 'multiselect'; // default: 'select'
    multiple?: boolean; // Untuk multiselect
    defaultValue?: string | number;
    defaultSelected?: boolean;
}
```

**Contoh filter select:**

```tsx
const filters: Filter[] = [
    {
        key: 'role',
        label: 'Role',
        options: [
            { label: 'All', value: 'all' },
            ...roleOptions.map((r) => ({ label: r.label, value: r.name })),
        ],
        defaultValue: 'all',
    },
];
```

**Contoh filter combobox (bisa dicari):**

```tsx
{
  key: 'role',
  label: 'Role',
  variant: 'combobox',
  options: roleOptions,
}
```

**Contoh filter multiselect:**

```tsx
{
  key: 'status',
  label: 'Status',
  variant: 'multiselect',
  multiple: true,
  options: [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ],
}
```

Nilai multiselect dikirim sebagai string gabungan (mis. `status=active,inactive`). Backend harus parse sendiri.

---

## 5. Backend / API

### Query params yang dikirim

| Param         | Tipe            | Contoh       | Keterangan                                             |
| ------------- | --------------- | ------------ | ------------------------------------------------------ |
| `search`      | string          | `john`       | Kata kunci pencarian.                                  |
| `sort`        | string          | `name`       | Key kolom untuk sort.                                  |
| `direction`   | `asc` \| `desc` | `asc`        | Arah sort.                                             |
| `limit`       | number          | `10`         | Per page.                                              |
| `page`        | number          | `1`          | Halaman saat ini.                                      |
| `[filterKey]` | string          | `role=admin` | Semua key dari `filters` (multiselect: value1,value2). |

### Format response

Backend harus mengembalikan objek pagination (format Laravel):

```json
{
    "data": [{ "id": "1", "name": "..." }],
    "current_page": 1,
    "last_page": 5,
    "per_page": 10,
    "total": 50
}
```

Jika data tidak di root response, gunakan **`dataPath`**:

```tsx
<DataTable fetchUrl="/api/users/data" dataPath="users" />
```

Maka yang dipakai adalah `response.data.users` (harus punya `data`, `current_page`, `last_page`, `per_page`, `total`).

---

## 6. Seleksi baris & export

**Seleksi baris:**

```tsx
const [selected, setSelected] = useState<User[]>([]);

<DataTable<User>
    columns={columns}
    fetchUrl={url}
    selectable
    onSelectionChange={setSelected}
    selectableCondition={(row) => !row.is_current_user} // opsional
    actions={(user) => <RowActions user={user} />}
    actionColumn={{ header: 'Actions', className: 'w-[140px]' }}
/>;
```

Data row harus punya field **`id`** (untuk identifikasi seleksi).

**Export:**

```tsx
<DataTable<User>
    columns={columns}
    fetchUrl={url}
    exportConfig={{
        enabled: true,
        label: 'Export',
        filename: 'users',
        formats: ['csv', 'json'],
        onExport: ({ data, format }) => {
            // custom logic; kalau tidak di-set, default CSV/JSON dari columns
        },
    }}
/>
```

Kolom dengan `exportable: false` tidak ikut export. `exportLabel` dan `exportValue` mengatur tampilan di file export.

---

## 7. Contoh lengkap (Users)

**Kolom & searchable columns:**

```tsx
// user-columns.tsx
import type { Column, SearchableColumn } from '@/types/datatables';
import type { ManagementUser } from '../types/user-types';

export const userColumns: Column<ManagementUser>[] = [
    {
        key: 'name',
        label: 'Name',
        sortable: true,
        searchable: true,
        hideBelow: 'sm',
        className: 'min-w-[200px]',
    },
    {
        key: 'email',
        label: 'Email',
        sortable: true,
        searchable: true,
        hideBelow: 'md',
        className: 'min-w-[220px]',
    },
    {
        key: 'roles',
        label: 'Roles',
        sortable: true,
        hideBelow: 'md',
        render: (user) => user.roles.join(', '),
    },
    {
        key: 'created_at',
        label: 'Created At',
        sortable: true,
        hideBelow: 'lg',
        render: (user) => new Date(user.created_at).toLocaleDateString(),
    },
];

export const userSearchableColumns: SearchableColumn[] = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'roles', label: 'Roles' },
];
```

**Filter dari API (roles):**

```tsx
// user-hooks.ts
function useRoleFilters() {
    const [options, setOptions] = useState<FilterOption[]>([]);
    // ... fetch roles ...
    const filters: Filter[] = useMemo(
        () => [{ key: 'role', label: 'Role', options, defaultValue: 'all' }],
        [options],
    );
    return { filters, loading };
}
```

**Halaman tabel:**

```tsx
// user-table.tsx
export default function UserTable() {
  const { filters, loading: rolesLoading } = useRoleFilters();
  const [selectedUsers, setSelectedUsers] = useState<ManagementUser[]>([]);

  return (
    <Card>
      <CardHeader>...</CardHeader>
      <CardContent>
        {rolesLoading && <Spinner />}
        <DataTable<ManagementUser>
          columns={userColumns}
          filters={filters}
          fetchUrl={users.fetchData().url}
          dataPath="users"
          searchPlaceholder="Search users..."
          defaultSort={{ key: 'created_at', direction: 'desc' }}
          topContent={<UserTopActions ... />}
          searchableColumns={userSearchableColumns}
          selectable
          onSelectionChange={setSelectedUsers}
          actions={(user) => <UserRowActions user={user} ... />}
          actionColumn={{ header: 'Actions', className: 'w-[140px]' }}
          tableClassName="min-w-[720px]"
        />
      </CardContent>
    </Card>
  );
}
```

---

## Debounce search & pembatalan request

- **`searchDebounceMs`** (opsional di `DataTable` / `UseDataTableProps`): jeda sebelum mengubah param `search` dan memicu fetch. Default: `DATA_TABLE_DEFAULT_SEARCH_DEBOUNCE_MS` (400 ms) dari `@/config/datatables`.
- Untuk tabel management berat, pakai **`MANAGEMENT_DATA_TABLE_SEARCH_DEBOUNCE_MS`** (500 ms); activity log: **`ACTIVITY_LOG_DATA_TABLE_SEARCH_DEBOUNCE_MS`** (650 ms).
- Fetch memakai **`AbortController`**: saat param berubah cepat, request sebelumnya dibatalkan; error `ERR_CANCELED` diabaikan (lihat `@/lib/is-axios-abort-error`).

Contoh:

```tsx
import { MANAGEMENT_DATA_TABLE_SEARCH_DEBOUNCE_MS } from '@/config/datatables';

<DataTable
  ...
  searchDebounceMs={MANAGEMENT_DATA_TABLE_SEARCH_DEBOUNCE_MS}
/>
```

---

## File terkait

- **Component:** `@/components/datatables.tsx` – component utama.
- **Hook:** `@/hooks/use-datatables.tsx` – state fetch, sort, filter, pagination, selection.
- **Sub Component:** `@/components/datatables/filters.tsx`, `@/components/datatables/pagination.tsx`.
- **Tipe:** `@/types/datatables.ts` – `DataTableRow`, `Column`, `Filter`, `FilterParams`, `PaginatedData`, `DataTableProps`, dll.
- **Konfigurasi:** `@/config/datatables.ts` – konstanta debounce.

Contoh pemakaian nyata: `resources/js/pages/management/users/table/`, `permissions/table/`, `roles/table/`, `activity-logs/table/`.
