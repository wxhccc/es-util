import { safeJsonParse } from './optional'
import eventTargetEmitter, {
  EventPayload as OrgEventPayload,
  ConfigOptions as OrgCfgOps
} from './event-target-emitter'

export { NOMETHOD } from './event-target-emitter'

export interface PcEventPayload<T = any>
  extends Omit<OrgEventPayload, 'originEmitterName' | 'targetEmitterName'> {
  /** 从哪个页面发送 */
  from?: string
  /** 指定哪个页面接收 */
  to?: string
}

export interface PcConfigOptions {
  /** 当前页面name */
  currentPage?: string
  /** 自定义消息处理逻辑 */
  messageHanlder?: OrgCfgOps['customHanlderCreator']
}

/**
 * 创建同源页面之间通信的封装实例，默认使用BroadcastChannel实现，在不支持的浏览器环境中会使用localstorage实现
 * @param options 配置对象
 * @returns
 */
export function pageCommunicate(options?: PcConfigOptions) {
  const { messageHanlder, currentPage } = options || {}

  const { emit, on, off, createPayload, removeAllListeners } =
    eventTargetEmitter({
      name: currentPage,
      customHanlderCreator: messageHanlder
    })

  const onMessage = (event: MessageEvent) => emit(event.data)

  let bc: BroadcastChannel | undefined
  const ls = window.localStorage

  const channelName = 'PAGE_COMMUNICATE_CHANNEL'

  if (typeof BroadcastChannel !== undefined) {
    bc = new BroadcastChannel(channelName)
    bc.addEventListener('message', onMessage)
  } else {
    const onStorageMessage = () => {
      const payload = safeJsonParse<PcEventPayload>(
        ls.getItem(channelName) || ''
      )
      if (payload) {
        emit(payload)
      }
    }
    window.addEventListener('storage', onStorageMessage)
  }

  const send = (...args: Parameters<typeof createPayload>) => {
    const payload = createPayload(...args)
    if (bc) {
      bc.postMessage(payload)
    } else {
      const payloadWitchTs = JSON.stringify({ ...payload, ts: +new Date() })
      ls.setItem(channelName, payloadWitchTs)
    }
  }

  const destory = () => {
    removeAllListeners()
    if (bc) {
      bc.close()
    } else {
      ls.removeItem(channelName)
    }
  }

  return { on, off, send, destory }
}

export type BccnInstance = ReturnType<typeof pageCommunicate>

export default pageCommunicate
