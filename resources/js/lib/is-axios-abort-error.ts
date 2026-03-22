import axios from 'axios';

/** True jika request dibatalkan (AbortController / unmount) — jangan log sebagai error. */
export function isAxiosAbortError(error: unknown): boolean {
    return axios.isAxiosError(error) && error.code === 'ERR_CANCELED';
}
