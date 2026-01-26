import { LibCore, Plugin } from '../core/type'
import { getTopLevelDomain, getUUid } from '../utils'
import Cookie from '../utils/cookie'
import BasePlugin from './base-plugin'

const TEN_YEARS_IN_MS = 10 * 365 * 24 * 60 * 60 * 1000
const expiresDate = new Date(Date.now() + TEN_YEARS_IN_MS)
const _d_key = '_xt_track'

export type TransportConfig = {
  api?: string
  domain?: string
  cacheKey?: string
}

type Payload = {
  // 时区
  timeZone?: string
  // 当前url
  currentUrl?: string

  // 应用id
  appId?: string

  // 引用来源
  referrer?: string
  // 浏览器语言
  platformBrowserLanguage?: string
  // 设备id
  platformDeviceId?: string
  // 浏览器用户代理
  platformUserAgent?: string

  // 用户id
  userId?: string
}
type EventData = {
  // 事件类型
  eventType: string
  // 事件名称
  eventName: string
  // 事件信息
  eventInfo?: string
  // 触发事件的本地时间
  localTimeMs?: string
}
export type ReportData = {
  payload: Payload
  event: EventData
}

export interface TransportPlugin extends Plugin {
  flush(event: EventData, payload?: Payload): void
  sendBeacon(event: EventData, payload?: Payload): void
}
export class Transport extends BasePlugin implements TransportPlugin {
  private localKey?: string
  private domain?: string
  config: Readonly<TransportConfig>
  constructor(config: TransportConfig) {
    super('Transport')
    this.config = config
    this.domain = config.domain || '.' + getTopLevelDomain(window.location.href)
    this.core?.debug('传输层配置', {
      ...this.config,
      domain: this.domain,
    })
    this.localKey = this.config.cacheKey || _d_key
  }
  setup(core: LibCore) {
    this.core = core
    this.initialized = true
  }
  // 更新设备id
  updateDeviceId(deviceId: string) {
    Cookie.set(this.localKey!, deviceId, {
      domain: this.domain,
      expires: expiresDate,
    })
    localStorage.setItem(this.localKey!, deviceId)
  }
  // 获取设备id
  getDeviceId() {
    let deviceId =
      Cookie.get(this.localKey!) || localStorage.getItem(this.localKey!) || ''
    // 新设备
    if (!deviceId) {
      this.core?.debug('新设备')
      deviceId = getUUid()
    }
    this.updateDeviceId(deviceId)
    return deviceId
  }
  // 构建上报数据
  getReportData(payload: Payload, event: EventData): ReportData {
    return {
      payload: {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        currentUrl: window.location.href,
        referrer: document.referrer,
        platformBrowserLanguage: navigator.language,
        platformDeviceId: this.getDeviceId(),
        platformUserAgent: navigator.userAgent,
        appId: this.core?.config.appId,
        ...payload,
      },
      event: {
        localTimeMs: new Date().toISOString(),
        ...event,
      },
    }
  }
  // 数据推送
  flush(event: EventData, payload: Payload = {}) {
    if (!this.config.api) return
    const data = this.getReportData(payload, event)
    this.core?.debug('fetch数据推送', data)
    try {
      fetch(this.config.api, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([data]),
      })
    } catch (error) {
      this.core?.debug('fetch数据推送失败', error)
    }
  }
  // 使用 sendBeacon 进行数据推送
  sendBeacon(event: EventData, payload: Payload = {}) {
    if (!this.config.api) return
    const data = this.getReportData(payload, event)
    this.core?.debug('sendBeacon数据推送', data)
    navigator.sendBeacon?.(this.config.api, JSON.stringify([data]))
  }
}
