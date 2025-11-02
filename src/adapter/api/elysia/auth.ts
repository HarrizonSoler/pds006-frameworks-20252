import { openAPI } from "better-auth/plugins";
import { betterAuth } from "better-auth";
import Database from "bun:sqlite";
import Elysia from "elysia";

export const auth = betterAuth({
  basePath: '/api',
  database: new Database('authdb.sqlite'),
  plugins: [
    openAPI()
  ],
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,  // 7 days
    updateAge: 60 * 60 * 24       // 1 day (every 1 day the session expiration is updated)
  }
})

export const authMiddleware = new Elysia()
  .mount('/auth', auth.handler)
  .macro({
    auth: {
      async resolve({ status, request: { headers }}) {
        const session = await auth.api.getSession({ headers })

        if (!session) return status(401)

        return {
          user: session.user,
          session: session.session
        }
      }
    }
  })

// better-auth boilerplate for documenting his API (OpenAPI)
let _schema: ReturnType<typeof auth.api.generateOpenAPISchema>
const getSchema = async () => (_schema ??= auth.api.generateOpenAPISchema())

export const BETTER_AUTH_OPEN_API_SCHEMA = {
  getPaths: (prefix = '/auth/api') =>
    getSchema().then(({ paths }) => {
      const reference: typeof paths = Object.create(null)

      for (const path of Object.keys(paths)) {
          const key = prefix + path
          reference[key] = paths[path]

          for (const method of Object.keys(paths[path])) {
              const operation = (reference[key] as any)[method]

              operation.tags = ['Better Auth']
          }
      }

      return reference
    }) as Promise<any>,
  components: getSchema().then(({ components }) => components) as Promise<any>
} as const

