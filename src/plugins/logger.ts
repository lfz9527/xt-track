import { LibCore } from '../core/type'
import BasePlugin from './base-plugin'

export interface LoggerPlugin extends BasePlugin {
  debug(key: string, data?: any): void
}

export class Logger extends BasePlugin implements LoggerPlugin {
  constructor() {
    super('Logger')
  }

  setup(core: LibCore) {
    this.core = core
    this.initialized = true
  }

  debug(key: string, data?: any) {
    if (!this.core?.config.debug) return
    Console(key, data)
  }
  static Debug(key: string, data?: any) {
    Console(key, data)
  }
}

function Console(key: string, data?: any) {
  console.group(`[${__LIB_NAME__}] ${key}`)
  if (data) {
    console.log(data)
  }
  console.groupEnd()
}
