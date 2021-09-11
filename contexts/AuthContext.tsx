import Router from "next/router";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { setCookie, parseCookies, destroyCookie } from 'nookies'
import api from "../services/api";

type User = {
  email: string;
  permissions: string[];
  roles: string[];
}

type SignInCredentials = {
  email: string;
  password: string;
}

type AuthContextData = {
  user: User;
  signOut(): void;
  isAuthenticated: boolean;
  signIn(credentials: SignInCredentials): Promise<void>;
}

const AuthContext = createContext({} as AuthContextData)

type AuthProviderProps = {
  children: ReactNode;
}

let authChannel: BroadcastChannel

export function signOut() {
  destroyCookie(undefined, 'nextauth.token')
  destroyCookie(undefined, 'nextauth.refreshToken')

  Router.push('/')
  
  authChannel.postMessage('signOut')
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>(null)
  const isAuthenticated = !!user

  useEffect(() => {
    authChannel = new BroadcastChannel('auth')

    authChannel.onmessage = (message) => {
      switch (message.data) {
        case 'signOut':
          signOut()
          break
        default:
          break
      }
    }
  }, [])

  useEffect(() => {
    const { 'nextauth.token': token } = parseCookies()

    if (token)
      api.get('/me')
        .then(response => {
          const { email, permissions, roles } = response.data
          setUser({ email, permissions, roles })
        })
        .catch((error) => {
          signOut()
        })
  }, [])

  async function signIn({ email, password }: SignInCredentials) {
    try {
      const response = await api.post('sessions', { email, password })
      
      const { permissions, roles, token, refreshToken } = response.data

      setCookie(undefined, 'nextauth.token', token, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      })
      
      setCookie(undefined, 'nextauth.refreshToken', refreshToken, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      })
      
      setUser({
        email,
        permissions,
        roles
      })

      api.defaults.headers['Authorization'] = `Bearer ${token}`


      Router.push('/dashboard')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <AuthContext.Provider value={{ signOut, signIn, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}