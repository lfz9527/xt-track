type SameSite = 'Lax' | 'Strict' | 'None'

interface CookieOptions {
  expires?: number | Date // number：天数
  maxAge?: number // 秒
  path?: string
  domain?: string
  secure?: boolean
  sameSite?: SameSite
}

class Cookie {
  /**
   * 设置 Cookie
   */
  static set(name: string, value: string, options: CookieOptions = {}): void {
    if (!name) return

    const {
      expires,
      maxAge,
      path = '/',
      domain,
      secure,
      sameSite = 'Lax',
    } = options

    let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`

    if (expires) {
      let expireDate: Date

      if (typeof expires === 'number') {
        expireDate = new Date(Date.now() + expires * 864e5)
      } else {
        expireDate = expires
      }

      cookie += `; Expires=${expireDate.toUTCString()}`
    }

    if (typeof maxAge === 'number') {
      cookie += `; Max-Age=${maxAge}`
    }

    if (path) cookie += `; Path=${path}`
    if (domain) cookie += `; Domain=${domain}`
    if (secure) cookie += `; Secure`
    if (sameSite) cookie += `; SameSite=${sameSite}`

    document.cookie = cookie
  }

  /**
   * 获取 Cookie
   */
  static get(name: string): string | null {
    if (!name) return null

    const cookies = document.cookie ? document.cookie.split('; ') : []

    for (const item of cookies) {
      const [key, ...rest] = item.split('=')
      if (decodeURIComponent(key) === name) {
        return decodeURIComponent(rest.join('='))
      }
    }

    return null
  }

  /**
   * 删除 Cookie
   */
  static remove(
    name: string,
    options: Pick<CookieOptions, 'path' | 'domain'> = {},
  ): void {
    this.set(name, '', {
      ...options,
      expires: new Date(0),
    })
  }

  /**
   * 清空 Cookie（当前 path=/、当前 domain）
   */
  static clear(): void {
    const cookies = document.cookie.split('; ')
    cookies.forEach((item) => {
      const name = decodeURIComponent(item.split('=')[0])
      this.remove(name)
    })
  }
}
export default Cookie
