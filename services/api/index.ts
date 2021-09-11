import axios, { AxiosError } from 'axios'
import { GetServerSidePropsContext } from 'next'
import { signOut } from '../../contexts/AuthContext'
import { AuthTokenError } from '../../errors/AuthTokenError'
import { AuthToken } from './AuthToken'

export class Api {
  public axios = axios.create()

  private auth = new AuthToken(this.ctx, this.axios)

  constructor(private ctx: GetServerSidePropsContext) {
    this.setup()
  }

  private setup() {
    this.axios.defaults.baseURL = 'http://localhost:3333'
    this.axios.defaults.headers['Authorization'] = `Bearer ${this.auth.token}`

    this.axios.interceptors.response.use(
      response => response,
      (requestFailed: AxiosError) => {
        if (requestFailed.response.data?.code === 'token.expired') {
          return this.auth.refresh().then(token => {
            const originalRequest = requestFailed.config
            originalRequest.headers['Authorization'] = `Bearer ${token}`
            return this.axios(originalRequest)
          }).catch(err => {
            if (process.browser) signOut()
            return Promise.reject(err)
          })        
        } else if (requestFailed.response.status === 401) {
          if (process.browser) signOut()
          else {
            this.auth.clearCookies();
            return Promise.reject(new AuthTokenError())
          }
        }
  
        return Promise.reject(requestFailed)
      }
    )  
  }
}

export const SingletonApi = (function() {
  let instance: Api

  function createInstance(ctx: GetServerSidePropsContext) {
    instance = new Api(ctx)
  }

  return {
    getInstance(ctx: GetServerSidePropsContext) {
      if (!instance) {
        createInstance(ctx)
      }
      return instance.axios
    }
  }
})()

export default SingletonApi.getInstance(undefined)