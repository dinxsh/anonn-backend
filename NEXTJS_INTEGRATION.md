# Next.js Frontend Integration Guide

## Overview
This guide shows how to integrate the Anonn backend API with a Next.js frontend. The test script (`scripts/test-api.js`) is structured to make this integration straightforward.

## Project Structure (Recommended)

```
anonn-frontend/
├── src/
│   ├── app/                    # Next.js 13+ App Router
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (main)/
│   │   │   ├── feed/
│   │   │   ├── communities/
│   │   │   ├── posts/
│   │   │   └── profile/
│   │   └── layout.tsx
│   ├── lib/
│   │   ├── api/                # API client modules
│   │   │   ├── auth.ts
│   │   │   ├── posts.ts
│   │   │   ├── users.ts
│   │   │   ├── communities.ts
│   │   │   └── ...
│   │   ├── hooks/              # Custom React hooks
│   │   └── utils/
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── posts/
│   │   ├── communities/
│   │   └── ...
│   └── types/                  # TypeScript types
└── package.json
```

## Step 1: Setup Next.js Project

```bash
npx create-next-app@latest anonn-frontend --typescript --tailwind --app
cd anonn-frontend
```

### Install Dependencies

```bash
npm install axios swr zustand
npm install -D @types/node
```

## Step 2: Environment Configuration

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 3: Create API Client Base

### `src/lib/api/client.ts`

```typescript
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const response = await axios.post(`${API_URL}/api/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

## Step 4: Create API Service Modules

### `src/lib/api/auth.ts`

```typescript
import apiClient from './client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: any;
    accessToken: string;
    refreshToken: string;
  };
}

export const authAPI = {
  // Register new user
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/auth/register', data);
    return response.data;
  },

  // Login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/auth/login', credentials);
    return response.data;
  },

  // Get current user
  me: async () => {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await apiClient.post('/api/auth/logout');
    return response.data;
  },

  // Refresh token
  refresh: async (refreshToken: string) => {
    const response = await apiClient.post('/api/auth/refresh', { refreshToken });
    return response.data;
  },
};
```

### `src/lib/api/posts.ts`

```typescript
import apiClient from './client';

export interface CreatePostData {
  title: string;
  content: string;
  type?: 'text' | 'link' | 'image' | 'video';
  communityId?: string;
  bowlId?: string;
  companyTags?: string[];
  mediaUrl?: string;
  linkUrl?: string;
}

export const postsAPI = {
  // Get all posts
  getAll: async (params?: { page?: number; limit?: number; sort?: string }) => {
    const response = await apiClient.get('/api/posts', { params });
    return response.data;
  },

  // Search posts
  search: async (query: string) => {
    const response = await apiClient.get('/api/posts/search', {
      params: { q: query },
    });
    return response.data;
  },

  // Get single post
  getById: async (id: string) => {
    const response = await apiClient.get(`/api/posts/${id}`);
    return response.data;
  },

  // Create post
  create: async (data: CreatePostData) => {
    const response = await apiClient.post('/api/posts', data);
    return response.data;
  },

  // Update post
  update: async (id: string, data: Partial<CreatePostData>) => {
    const response = await apiClient.put(`/api/posts/${id}`, data);
    return response.data;
  },

  // Delete post
  delete: async (id: string) => {
    const response = await apiClient.delete(`/api/posts/${id}`);
    return response.data;
  },

  // Vote on post
  vote: async (id: string, voteType: 'upvote' | 'downvote') => {
    const response = await apiClient.post(`/api/posts/${id}/vote`, { voteType });
    return response.data;
  },

  // Get comments
  getComments: async (id: string) => {
    const response = await apiClient.get(`/api/posts/${id}/comments`);
    return response.data;
  },

  // Add comment
  addComment: async (id: string, content: string) => {
    const response = await apiClient.post(`/api/posts/${id}/comments`, { content });
    return response.data;
  },

  // Share post
  share: async (id: string) => {
    const response = await apiClient.post(`/api/posts/${id}/share`);
    return response.data;
  },
};
```

### `src/lib/api/communities.ts`

```typescript
import apiClient from './client';

export const communitiesAPI = {
  getAll: async () => {
    const response = await apiClient.get('/api/communities');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/api/communities/${id}`);
    return response.data;
  },

  create: async (data: { name: string; displayName: string; description: string }) => {
    const response = await apiClient.post('/api/communities', data);
    return response.data;
  },

  join: async (id: string) => {
    const response = await apiClient.post(`/api/communities/${id}/join`);
    return response.data;
  },

  leave: async (id: string) => {
    const response = await apiClient.delete(`/api/communities/${id}/leave`);
    return response.data;
  },

  getPosts: async (id: string) => {
    const response = await apiClient.get(`/api/communities/${id}/posts`);
    return response.data;
  },
};
```

## Step 5: Create Custom Hooks with SWR

### `src/lib/hooks/usePosts.ts`

```typescript
import useSWR from 'swr';
import { postsAPI } from '../api/posts';

export function usePosts(params?: { page?: number; limit?: number }) {
  const { data, error, mutate } = useSWR(
    ['/api/posts', params],
    () => postsAPI.getAll(params)
  );

  return {
    posts: data?.data?.posts || [],
    pagination: data?.data?.pagination,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export function usePost(id: string) {
  const { data, error, mutate } = useSWR(
    id ? `/api/posts/${id}` : null,
    () => postsAPI.getById(id)
  );

  return {
    post: data?.data?.post,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}
```

### `src/lib/hooks/useAuth.ts`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../api/auth';

interface AuthState {
  user: any | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: any) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const response = await authAPI.login({ email, password });
        const { user, accessToken, refreshToken } = response.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
      },

      register: async (username, email, password) => {
        const response = await authAPI.register({ username, email, password });
        const { user, accessToken, refreshToken } = response.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
      },

      logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

## Step 6: Create Components

### `src/components/posts/PostCard.tsx`

```typescript
'use client';

import { postsAPI } from '@/lib/api/posts';
import { useState } from 'react';

export function PostCard({ post }: { post: any }) {
  const [voteCount, setVoteCount] = useState(
    post.upvotes.length - post.downvotes.length
  );

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    try {
      await postsAPI.vote(post._id, voteType);
      setVoteCount((prev) => (voteType === 'upvote' ? prev + 1 : prev - 1));
    } catch (error) {
      console.error('Vote failed:', error);
    }
  };

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition">
      <h3 className="text-xl font-bold">{post.title}</h3>
      <p className="text-gray-600 mt-2">{post.content}</p>
      
      <div className="flex items-center gap-4 mt-4">
        <button onClick={() => handleVote('upvote')} className="btn">
          ↑ {voteCount}
        </button>
        <button onClick={() => handleVote('downvote')} className="btn">
          ↓
        </button>
        <span>{post.commentCount} comments</span>
      </div>
    </div>
  );
}
```

### `src/app/(main)/feed/page.tsx`

```typescript
'use client';

import { usePosts } from '@/lib/hooks/usePosts';
import { PostCard } from '@/components/posts/PostCard';

export default function FeedPage() {
  const { posts, isLoading } = usePosts();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Feed</h1>
      
      <div className="space-y-4">
        {posts.map((post: any) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
    </div>
  );
}
```

## Step 7: Authentication Pages

### `src/app/(auth)/login/page.tsx`

```typescript
'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      router.push('/feed');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md p-8 border rounded-lg">
        <h1 className="text-2xl font-bold mb-6">Login</h1>
        
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
}
```

## Step 8: API Routes (Server-Side)

### `src/app/api/posts/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '10';

  try {
    const response = await fetch(
      `${API_URL}/api/posts?page=${page}&limit=${limit}`
    );
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}
```

## Testing the Integration

### 1. Start Backend
```bash
cd backend
npm start
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

### 3. Test Credentials
- Email: `alice@example.com`
- Password: `password123`

## Key Integration Points

1. **Authentication Flow**:
   - Login → Store tokens → Auto-refresh on 401
   - Logout → Clear tokens → Redirect to login

2. **Data Fetching**:
   - Use SWR for client-side data fetching
   - Use Next.js API routes for server-side rendering
   - Implement optimistic updates for better UX

3. **Error Handling**:
   - Global error boundary
   - Toast notifications for user feedback
   - Retry logic for failed requests

4. **Real-time Updates**:
   - Consider WebSocket integration for notifications
   - Use SWR's revalidation for fresh data

## Next Steps

1. Add TypeScript types from backend models
2. Implement remaining API modules (polls, communities, etc.)
3. Add form validation with Zod
4. Implement infinite scroll for feeds
5. Add image upload functionality
6. Integrate Solana wallet (Phantom, Solflare)
7. Add push notifications
8. Implement dark mode
9. Add analytics and monitoring

## Production Deployment

### Backend (Vercel)
```bash
cd backend
vercel --prod
```

### Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

Update `.env.production`:
```env
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [SWR Documentation](https://swr.vercel.app)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Axios Documentation](https://axios-http.com)
