import axios from 'axios';
import { API_URL } from '../config';

const api = axios.create({
    baseURL: API_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('em_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 responses
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('em_token');
            localStorage.removeItem('em_user');
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    adminLogin: (data) => api.post('/auth/admin/login', data),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getUserProfile: (id) => api.get(`/auth/profile/${id}`),
};

// Articles
export const articlesAPI = {
    getAll: (params) => api.get('/articles', { params }),
    getBySlug: (slug) => api.get(`/articles/slug/${slug}`),
    getById: (id) => api.get(`/articles/${id}`),
    getByUser: (userId, params) => api.get(`/articles/user/${userId}`, { params }),
    getMyDrafts: () => api.get('/articles/my/drafts'),
    getMyArticles: () => api.get('/articles/my/articles'),
    getKeywords: () => api.get('/articles/keywords'),
    search: (q) => api.get('/articles/search', { params: { q } }),
    create: (data) => api.post('/articles', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id, data) => api.put(`/articles/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    delete: (id) => api.delete(`/articles/${id}`),
    toggleLike: (id) => api.post(`/articles/${id}/like`),
};

// Comments
export const commentsAPI = {
    getByArticle: (articleId) => api.get(`/comments/article/${articleId}`),
    create: (data) => api.post('/comments', data),
    update: (id, data) => api.put(`/comments/${id}`, data),
    delete: (id) => api.delete(`/comments/${id}`),
};

// Bookmarks
export const bookmarksAPI = {
    getAll: () => api.get('/bookmarks'),
    check: (articleId) => api.get(`/bookmarks/check/${articleId}`),
    toggle: (articleId) => api.post('/bookmarks/toggle', { articleId }),
};

// Admin
export const adminAPI = {
    getStats: () => api.get('/admin/stats'),
    getUsers: () => api.get('/admin/users'),
    blockUser: (id) => api.put(`/admin/users/${id}/block`),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),
    getArticles: () => api.get('/admin/articles'),
    deleteArticle: (id) => api.delete(`/admin/articles/${id}`),
    getComments: () => api.get('/admin/comments'),
    deleteComment: (id) => api.delete(`/admin/comments/${id}`),
};

export default api;
