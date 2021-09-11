import { 
  GetServerSideProps, 
  GetServerSidePropsContext, 
  GetServerSidePropsResult
 } from "next"
import { parseCookies } from "nookies"
import { AuthTokenError } from "../errors/AuthTokenError"

export function withSSRAuth<T>(fn: GetServerSideProps<T>) {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<T>> => {
    const cookies = parseCookies(ctx)

    if (!cookies['nextauth.token']) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
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