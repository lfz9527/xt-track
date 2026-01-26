import { LibCore } from '../core/type'
import BasePlugin from './base-plugin'

export type PageActionConfig = {
  autoPv?: boolean
  autoLv?: boolean
}

export class PageAction extends BasePlugin {
  private config: PageActionConfig = {}
  constructor(config: PageActionConfig) {
    super('PageAction')
    this.config = {
      autoPv: true,
      autoLv: true,
      ...config,
    }
  }
  setup(core: LibCore) {
    this.core = core
    this.initialized = true
    this.core?.debug('页面事件配置', this.config)

    if (this.config?.autoPv) this.pageView()
    window.addEventListener('beforeunload', () => {
      if (this.config?.autoLv) {
        this.pageLeave()
      }
    })
  }
  pageView() {
    this.core?.debug('pageView')
    this.core?.flush({
      eventType: 'event',
      eventName: 'pageView',
      eventInfo: '页面出现',
    })
  }
  pageLeave() {
    this.core?.debug('pageLeave')
    this.core?.sendBeacon({
      eventType: 'event',
      eventName: 'pageLeave',
      eventInfo: '页面离开',
    })
  }
}
