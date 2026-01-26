import { v4 } from 'uuid'
let levelDomain = ''

export const getUUid = () => v4()

/**
 * 获取顶级域名
 * @param url
 * @returns
 */
export function getTopLevelDomain(url: string): string {
  if (levelDomain) return levelDomain
  const hostname = new URL(url).hostname
  const parts = hostname.split('.')
  if (parts.length <= 2) {
    return hostname // 已经是顶级域名
  }
  levelDomain = parts.slice(-2).join('.')
  return levelDomain
}
