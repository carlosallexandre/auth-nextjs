import { 
  GetServerSideProps, 
  GetServerSidePropsContext, 
  GetServerSidePropsResult
 } from "next"
import { parseCookies } from "nookies"
import decode from 'jwt-decode'
import { AuthTokenError } from "../errors/AuthTokenError"
import { validateUserPermissions } from "./validateUserPermissions"

type WithSsrAuthOptions = {
  permissions?: string[];
  roles?: string[];
}

export function withSSRAuth<T>(fn: GetServerSideProps<T>, options?: WithSsrAuthOptions) {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<T>> => {
    const cookies = parseCookies(ctx)
    const token = cookies['nextauth.token']

    if (!token) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        }
      }
    }

    if (options) {
      const user = decode<{ permissions: string[]; roles: string[] }>(token)
      const { permissions, roles } = options

      const userHasPermission = validateUserPermissions({ 
        user,
        permissions,
        roles
      })

      if (!userHasPermission) {
        return {
          redirect: {
            destination: '/dashboard',
            permanent: false
          }
        }
      }
    }

    try {
      return await fn(ctx)
    } catch(err) {
      if (err instanceof AuthTokenError) {
        return {
          redirect: {
            destination: '/',
            permanent: false
          }
        }
      }
    }
  }
}