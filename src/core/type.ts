import { type LoggerPlugin, type TransportPlugin } from '../plugins'

export type TransportCls = TransportPlugin
export type LoggerCls = LoggerPlugin

export type CoreConfig = {
  appId: string
  appVersion?: string
  debug?: boolean
}
export type Plugin = {
  initialized: boolean
  name: string
  setup(core: LibCore): void
}

export type LibCore = {
  config: Readonly<CoreConfig>
  use(plugin: Plugin): void
  flush: TransportCls['flush']
  sendBeacon: TransportCls['sendBeacon']
  debug: LoggerCls['debug']
}
