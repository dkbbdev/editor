import { PROFILES } from './generated/profiles'

export function profileById(id: string) {
  return PROFILES.find((p) => p.id === id)
}

export { PROFILES }
