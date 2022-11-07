import { createContext, useEffect, useState } from "react";
import * as Google from 'expo-auth-session/providers/google'
import * as AuthSession from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GOOGLE_CLIENT_ID } from '@env';

import { api } from '../services/api'

WebBrowser.maybeCompleteAuthSession()

interface UserProps {
  name: string;
  avatarUrl: string;
}

export interface AuthContextDataProps {
  user: UserProps;
  isUserLoading: boolean;
  signIn: () => Promise<void>;
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthContext = createContext({} as AuthContextDataProps);

export function AuthContextProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProps>({} as UserProps);
  const [isUserLoading, setIsUserLoading] = useState(false);

  const [, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    redirectUri: AuthSession.makeRedirectUri({ useProxy: true }),
    scopes: ['profile', 'email']
  });

  async function signIn() {
    try {
      setIsUserLoading(true);
      await promptAsync();
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      setIsUserLoading(false);
    }
  }

  async function finishSignInWithGoogle(accessToken: string) {
    try {
      setIsUserLoading(true);
      const tokenResponse = await api.post('/users', { accessToken });
      api.defaults.headers.common['Authorization'] = `Bearer ${tokenResponse.data.token}`;

      const userInfoResponse = await api.get('/me');
      setUser(userInfoResponse.data.user);
      await AsyncStorage.setItem('@user', JSON.stringify({
        user: userInfoResponse.data.user,
        token: tokenResponse.data.token,
      }));
    } catch (error) {
      console.log(error);
      await AsyncStorage.removeItem('@user')
      throw error;
    } finally {
      setIsUserLoading(false);
    }
  }

  useEffect(() => {
    const retrieveUserFromStorageIfExists = async () => {
      try {
        setIsUserLoading(true);
        const userDataJson = await AsyncStorage.getItem('@user');
        if (userDataJson) {
          const userData = JSON.parse(userDataJson);
          api.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
          await api.get('/me');
          setUser(userData.user);
        }
      } catch (error) {
        console.log(error);
        await AsyncStorage.removeItem('@user')
      } finally {
        setIsUserLoading(false);
      }
    }
    retrieveUserFromStorageIfExists()
  }, [])

  useEffect(() => {
    if (response?.type === 'success' && response.authentication?.accessToken) {
      finishSignInWithGoogle(response.authentication.accessToken);
    }
  }, [response])

  return (
    <AuthContext.Provider value={{
      signIn,
      isUserLoading,
      user
    }}>
      {children}
    </AuthContext.Provider>
  )
}