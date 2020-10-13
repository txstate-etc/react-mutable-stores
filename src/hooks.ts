import { useState, useEffect, useContext, useMemo, useCallback } from 'react'
import { UsableSubject, SubjectStateType } from './subject'

export function useAndUpdateStore<StoreType extends UsableSubject<any>> (store: StoreType): [SubjectStateType<StoreType>, (value: SubjectStateType<StoreType>) => void] {
  const [value, setState] = useState(store.value)
  const sub = useMemo(() => {
    let skipfirst = true
    return store.subscribe(s => {
      if (skipfirst) skipfirst = false
      else setState(s)
    })
  }, [store])
  useEffect(() => () => sub.unsubscribe(), [sub])
  const newSetState = useCallback((state: SubjectStateType<StoreType>) => store.next(state), [store])
  return [value, newSetState]
}

export function useStore<StoreType extends UsableSubject<any>> (store: StoreType) {
  const [value] = useAndUpdateStore(store)
  return value
}

export function useStoreFromContext<StoreType extends UsableSubject<any>> (context: React.Context<StoreType>) {
  const store = useContext(context)
  return useStore(store)
}
