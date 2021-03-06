export interface Subscription {
  unsubscribe: () => void
}

export type SubjectStateType<SubjectType> = SubjectType extends { value: infer StateType } ? StateType : never

export interface UsableSubject<StateType> {
  value: StateType
  next: (value: StateType) => void
  subscribe: (observer: (value: StateType) => void) => Subscription
}

export class Subject<StateType> implements UsableSubject<StateType> {
  private actualValue: StateType
  protected subscriberhash: { [keys: string]: (s: StateType) => void }

  constructor (initialValue: StateType) {
    this.actualValue = initialValue
    this.subscriberhash = {}
  }

  get value () {
    return this.actualValue
  }

  set value (newValue: StateType) {
    this.actualValue = newValue
  }

  public next (state: StateType) {
    this.actualValue = state
    for (const subscriber of this.observers) {
      subscriber(this.value)
    }
  }

  public subscribe (fn: (s: StateType) => void) {
    const id = Math.random().toString(32)
    this.subscriberhash[id] = fn
    fn(this.actualValue)
    return { unsubscribe: () => { delete this.subscriberhash[id] } }
  }

  public complete () {
    this.subscriberhash = {}
  }

  public get observers () {
    return Object.values(this.subscriberhash)
  }
}
