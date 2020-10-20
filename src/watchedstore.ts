import { SafeStore } from './safestore'

function watch (state: any, handler: () => void) {
  let timer: NodeJS.Timeout
  const notify = () => {
    clearTimeout(timer)
    timer = setTimeout(handler, 0)
  }
  const proxyHandler: ProxyHandler<any> = {
    get (target: any, key: string): any {
      if (key === 'unwatched') return target
      const val = target[key]
      if (
        Array.isArray(target) &&
        typeof val === 'function' &&
        ['push', 'pop', 'unshift', 'shift', 'splice', 'reverse', 'sort'].includes(key)
      ) {
        return (...args: any[]) => {
          notify()
          // @ts-expect-error
          return Array.prototype[key].apply(target, args)
        }
      } else if (typeof target[key] === 'object' && target[key] !== null) {
        return new Proxy(target[key], proxyHandler)
      } else {
        return Reflect.get(target, key)
      }
    },
    set (target: any, key: string, value: any) {
      notify()
      // @ts-expect-error
      return Reflect.set(...arguments)
    }
  }

  return new Proxy(state, proxyHandler)
}

export class WatchedStore<StateType> extends SafeStore<StateType> {
  constructor (initialValue: StateType) {
    super(watch(initialValue, () => super.next(this.value)))
  }

  get value () {
    return super.value
  }

  set value (state: StateType) {
    this.next(state)
  }

  cloneDeep (state: StateType) {
    return super.cloneDeep((state as any).unwatched ?? state)
  }

  next (state: StateType) {
    super.next(watch(state, () => super.next(this.value)))
  }
}
