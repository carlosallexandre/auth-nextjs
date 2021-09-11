import { AxiosError, AxiosInstance, AxiosResponse } from "axios"
import { GetServerSidePropsContext } from "next"
import { destroyCookie, parseCookies, setCookie } from "nookies"

type RefreshTokenResponse = {
  token: string;
  refreshToken: string;
}

export class AuthToken {
  private _refreshCall: Promise<string> = null

  constructor(
    private ctx: GetServerSidePropsContext,
    private api: AxiosInstance,
  ) {}

  public get token() {
    return parseCookies(this.ctx)['nextauth.token']
  }

  private set token(token: string) {
    setCookie(this.ctx, 'nextauth.token', token, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/'
    })
  }

  public get refreshToken() {
    return parseCookies(this.ctx)['nextauth.refreshToken']
  }

  private set refreshToken(refreshToken: string) {
    setCookie(this.ctx, 'nextauth.refreshToken', refreshToken, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/'
    })
  }

  public clearCookies() {
    destroyCookie(this.ctx, 'nextauth.token')
    destroyCookie(this.ctx, 'nextauth.refreshToken')
  }

  public refresh(): Promise<string> {
    if (this._refreshCall) return this._refreshCall;

    this._refreshCall = this.api
    .post<RefreshTokenResponse>('refresh', { 
      refreshToken: this.refreshToken 
    })
    .then(response => {
      this.token = response.data.token
      this.refreshToken = response.data.refreshToken

      return response.data.token
    })
    .catch((err) => Promise.reject(err))
    .finally(() => { this._refreshCall = null })

    return this._refreshCall
  }
}
