import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('em_token');
        const savedUser = localStorage.getItem('em_user');
        if (token && savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch {
                localStorage.removeItem('em_token');
                localStorage.removeItem('em_user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const { data } = await authAPI.login({ email, password });
        localStorage.setItem('em_token', data.token);
        localStorage.setItem('em_user', JSON.stringify(data.user));
        setUser(data.user);
        return data;
    };

    const adminLogin = async (email, password) => {
        const { data } = await authAPI.adminLogin({ email, password });
        localStorage.setItem('em_token', data.token);
        localStorage.setItem('em_user', JSON.stringify(data.user));
        setUser(data.user);
        return data;
    };

    const register = async (name, email, password) => {
        const { data } = await authAPI.register({ name, email, password });
        localStorage.setItem('em_token', data.token);
        localStorage.setItem('em_user', JSON.stringify(data.user));
        setUser(data.user);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('em_token');
        localStorage.removeItem('em_user');
        setUser(null);
    };

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('em_user', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, adminLogin, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};
