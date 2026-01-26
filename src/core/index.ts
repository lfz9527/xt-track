import {
  type CoreConfig,
  type LibCore,
  type LoggerCls,
  type Plugin,
  type TransportCls,
} from './type'

export default class Core implements LibCore {
  config: Readonly<CoreConfig>
  plugins = new Map<string, Plugin>()

  constructor(config: CoreConfig) {
    this.config = Object.freeze({ ...config })
  }
  async use(plugin: Plugin) {
    if (this.plugins.has(plugin.name)) return
    plugin.setup(this)
    this.plugins.set(plugin.name, plugin)
  }
  debug: LoggerCls['debug'] = (key: string, data?: any) => {
    const Logger = this.plugins?.get('Logger') as LoggerCls
    Logger?.debug?.(key, data)
  }
  flush: TransportCls['flush'] = (event, payload) => {
    const Transport = this.plugins?.get('Transport') as TransportCls
    Transport?.flush?.(event, payload)
  }
  sendBeacon: TransportCls['sendBeacon'] = (event, payload) => {
    const Transport = this.plugins?.get('Transport') as TransportCls
    Transport?.sendBeacon?.(event, payload)
  }
}
