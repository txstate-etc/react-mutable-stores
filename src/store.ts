import equal from 'fast-deep-equal'
import { Subject } from './subject'

export class Store<StateType> extends Subject<StateType> {
  private valueclone: StateType

  constructor (initialvalue: StateType) {
    super(initialvalue)
    this.valueclone = this.cloneDeep(initialvalue)
  }

  cloneDeep (state: StateType) {
    return state
  }

  next (value: StateType) {
    if (!equal(value, this.valueclone)) {
      this.valueclone = this.cloneDeep(value)
      super.next(value)
    }
  }
}
