interface AuthHeaders {
    Authorization: string;
}

export function getAuthHeader(): AuthHeaders | Record<string, never> {
    if (typeof window === 'undefined') return {}

    const tokenData = localStorage.getItem('sb-rrgrmyonjpuvdsljsrrm-auth-token')
    if (!tokenData) return {}

    try {
        const { access_token } = JSON.parse(tokenData)
        return {
            Authorization: `Bearer ${access_token}`
        }
    } catch (e) {
        console.error('Error parsing auth token:', e)
        return {}
    }
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
        ...options.headers,
        ...getAuthHeader(),
    }

    const response = await fetch(url, {
        ...options,
        headers,
    })

    if (response.status === 401) {
        // Handle unauthorized error (e.g., redirect to login)
        window.location.href = '/auth'
    }

    return response
} 