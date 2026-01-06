import api from "./axios";

interface LoginCredentials {
    username: string;
    password: string;
}

interface RegisterData {
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    phone: string;
    password: string;
}

export const login = async (credentials: LoginCredentials) => {
    const response = await api.post("/auth/login/", credentials);
    if (response.data.access) {
        localStorage.setItem("access", response.data.access);
        localStorage.setItem("refresh", response.data.refresh);
    }
    return response.data;
};

export const register = async (userData: RegisterData) => {
    const response = await api.post("/auth/register/", userData);
    if (response.data.access) {
        localStorage.setItem("access", response.data.access);
        localStorage.setItem("refresh", response.data.refresh);
    }
    return response.data;
};

export const logout = async () => {
    const refresh = localStorage.getItem("refresh");
    try {
        await api.post("/auth/logout/", { refresh });
    } catch (error) {
        console.error("Logout failed", error);
    } finally {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
    }
};
