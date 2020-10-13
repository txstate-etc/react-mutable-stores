import rfdc from 'rfdc'
import { Store } from './store'
const cloneDeep = rfdc()

export class SafeStore<StateType> extends Store<StateType> {
  cloneDeep (state: StateType) {
    return cloneDeep(state)
  }
}
