import { getCurrentUser, getCurrentUserFromDB, type AuthUser } from './config'

export async function auth(): Promise<{ userId: string | null }> {
  const user = await getCurrentUser()
  return { userId: user?.id || null }
}

export { getCurrentUser, getCurrentUserFromDB, type AuthUser }
