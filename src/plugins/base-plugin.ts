import { LibCore, Plugin } from '../core/type'

export default abstract class BasePlugin implements Plugin {
  initialized: boolean
  name: string
  core?: LibCore

  constructor(name: string) {
    if (!name) {
      throw new Error('插件必须指定唯一名称（pluginName）')
    }
    this.name = name // 插件唯一标识
    this.initialized = false // 插件初始化状态
  }
  abstract setup(core: LibCore): void
}
