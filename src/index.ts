import Core from './core'
import { CoreConfig } from './core/type'

import {
  Logger,
  PageAction,
  Transport,
  type PageActionConfig,
  type TransportConfig,
  type TransportPlugin,
} from './plugins'

type Option = CoreConfig & TransportConfig & PageActionConfig

class Track {
  private core: Core | null = null
  async init(config: Option) {
    if (config.debug) {
      Logger.Debug('初始化配置', config)
    }
    const core = new Core(config)
    // 日志
    await core.use(new Logger())
    // 数据传输
    await core.use(new Transport(config))
    // 页面事件
    await core.use(new PageAction(config))

    this.core = core
  }
  track: TransportPlugin['flush'] = (event, payload) => {
    this.core?.flush(event, payload)
  }
}

const XtTrack = new Track()
export default XtTrack
