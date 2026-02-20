export const parseNumberInput = (value: string): string => {
    // Remove all non-digit characters
    return value.replace(/\D/g, "");
};

export const parseYearInput = (value: string): string => {
    // Remove non-digit characters
    const numericValue = value.replace(/\D/g, "");

    // Limit to 4 digits and ensure it starts with a valid year (19xx or 20xx)
    if (numericValue.length > 4) {
        return numericValue.slice(0, 4);
    }

    return numericValue;
};

export const formatDecimalInput = (value: string): string => {
    // Hapus karakter selain angka dan titik
    const cleaned = value.replace(/[^\d.]/g, "");
    // Pastikan hanya ada satu titik desimal
    const parts = cleaned.split(".");
    if (parts.length > 2) return parts[0] + "." + parts.slice(1).join("");
    return cleaned;
};

export const parseDecimalInput = (value: string): number => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
};

export const formatVolInput = (value: string) => {
    // Replace comma with dot for internal value
    const formattedValue = value.replace(",", ".");
    return formattedValue;
};

export const formatUrlInput = (value: string): string => {
    // Trim leading and trailing whitespace
    value = value.trim();

    // Ensure the URL starts with a valid protocol
    if (!value.startsWith("http://") && !value.startsWith("https://")) {
        value = "http://" + value;
    }

    // Replace multiple slashes with a single slash
    value = value.replace(/([^:]\/)\/+/g, "$1");

    // Allow only valid URL characters
    value = value.replace(/[^a-zA-Z0-9-._~:/?#@!$&'()*+,;=%]/g, "");

    return value;
};

export const capitalizeWords = (str: string): string => {
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

