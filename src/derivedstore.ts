import { Store } from './store'
import { Subject, Subscription, UsableSubject } from './subject'
import { get, set } from './util'

export interface DerivedStore<OutputType, InputType> extends Store<OutputType> {
  new (): (store: Subject<OutputType>) => DerivedStore<OutputType, InputType>
  new (): (store: Subject<OutputType>, getter: (state: InputType) => OutputType, setter?: (newvalue: OutputType, state: InputType) => InputType) => DerivedStore<OutputType, InputType>
  new (): <Selector extends keyof InputType>(store: Subject<InputType[Selector]>, selector: Selector) => DerivedStore<InputType[Selector], InputType>
  new (): (store: Subject<OutputType>, selector: string) => DerivedStore<OutputType, InputType>
}
let pStore: UsableSubject<any>
export class DerivedStore<OutputType, InputType> extends Store<OutputType> {
  protected parentStore: UsableSubject<InputType>
  protected setter: (value: OutputType, parentValue: InputType) => InputType
  protected subscription: Subscription

  constructor (store: UsableSubject<InputType>, getter: any, setter: any) {
    if (typeof getter === 'undefined') {
      getter = (parentValue: any) => parentValue
      setter = (value: any, parentValue: any) => value
    } else if (typeof getter === 'string') {
      const accessor = getter
      getter = (parentValue: any) => get(parentValue, accessor)
      setter = (value: any, parentValue: any) => set(parentValue, accessor, value)
    }
    // can't set this.parentStore until after super() but super() will call
    // this.cloneDeep which needs a parent store, so storing in a temporary
    // global - it's safe because constructors must be synchronous
    pStore = store
    super(getter(store.value))
    this.parentStore = store
    this.setter = setter
    let skipfirst = true
    this.subscription = store.subscribe(newval => {
      if (skipfirst) skipfirst = false
      else super.next(getter(newval))
    })
  }

  cloneDeep (state: OutputType) {
    // parent store could be a SafeStore - if so we should use its clone function
    // so that the derived store is also safe against mutations
    // pStore gets used during the initial run - see comment in constructor above
    return (
      this.parentStore as Store<any>)?.cloneDeep?.(state) ??
      (pStore as Store<any>)?.cloneDeep?.(state) ??
      state
  }

  next (value: OutputType) {
    if (this.setter) this.parentStore.next(this.setter(value, this.parentStore.value))
  }

  complete () {
    this.subscription.unsubscribe()
    super.complete()
  }
}
