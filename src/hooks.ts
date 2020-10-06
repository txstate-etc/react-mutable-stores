import { useState, useEffect, useContext, useMemo, useCallback } from 'react'
import { DerivedStore } from './store'
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

export function useAndUpdateDerivedStore<StoreType extends UsableSubject<any>, OutputType> (
  store: StoreType,
  getter: (state: SubjectStateType<StoreType>) => OutputType,
  setter: (newvalue: OutputType, state: SubjectStateType<StoreType>) => SubjectStateType<StoreType>
): [OutputType, (value: OutputType) => void]
export function useAndUpdateDerivedStore<StoreType extends UsableSubject<any>, Selector extends keyof SubjectStateType<StoreType>> (
  store: StoreType,
  selector: Selector
): [SubjectStateType<StoreType>[Selector], (value: SubjectStateType<StoreType>[Selector]) => void]
export function useAndUpdateDerivedStore<OutputType, StoreType extends UsableSubject<any> = any> (
  store: StoreType,
  selector: string
): [OutputType, (value: OutputType) => void]
export function useAndUpdateDerivedStore<StoreType extends UsableSubject<any> = any> (
  store: StoreType
): [StoreType, (value: StoreType) => void]
export function useAndUpdateDerivedStore<StoreType extends UsableSubject<any>, OutputType> (store: StoreType, getter?: any, setter?: any) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const derived = useMemo(() => new DerivedStore(store, getter, setter), [store, (getter ?? '').toString(), (setter ?? '').toString()])
  useEffect(() => {
    return () => derived.complete()
  }, [derived])
  return useAndUpdateStore(derived as DerivedStore<OutputType, SubjectStateType<StoreType>>)
}

export function useAndUpdateDerivedStoreFromContext<StoreType extends UsableSubject<any>, OutputType> (
  context: React.Context<StoreType>,
  getter: (state: SubjectStateType<StoreType>) => OutputType,
  setter: (newvalue: OutputType, state: SubjectStateType<StoreType>) => SubjectStateType<StoreType>
): [OutputType, (value: OutputType) => void]
export function useAndUpdateDerivedStoreFromContext<StoreType extends UsableSubject<any>, Selector extends keyof SubjectStateType<StoreType>> (
  context: React.Context<StoreType>,
  selector: Selector
): [SubjectStateType<StoreType>[Selector], (value: SubjectStateType<StoreType>[Selector]) => void]
export function useAndUpdateDerivedStoreFromContext<OutputType, StoreType extends UsableSubject<any> = any> (
  context: React.Context<StoreType>,
  selector: string
): [OutputType, (value: OutputType) => void]
export function useAndUpdateDerivedStoreFromContext<StoreType extends UsableSubject<any> = any> (
  context: React.Context<StoreType>
): [StoreType, (value: StoreType) => void]
export function useAndUpdateDerivedStoreFromContext<StoreType extends UsableSubject<any>> (context: React.Context<StoreType>, getter?: any, setter?: any) {
  const store = useContext(context)
  return useAndUpdateDerivedStore(store, getter, setter)
}

export function useDerivedStore<StoreType extends UsableSubject<any>, OutputType> (
  store: StoreType,
  getter: (state: SubjectStateType<StoreType>) => OutputType
): OutputType
export function useDerivedStore<StoreType extends UsableSubject<any>, Selector extends keyof SubjectStateType<StoreType>> (
  store: StoreType,
  selector: Selector
): SubjectStateType<StoreType>[Selector]
export function useDerivedStore<OutputType, StoreType extends UsableSubject<any> = any> (
  store: StoreType,
  selector: string
): OutputType
export function useDerivedStore<StoreType extends UsableSubject<any> = any> (
  store: StoreType
): StoreType
export function useDerivedStore<StoreType extends UsableSubject<any> = any> (store: StoreType, getter?: any) {
  const [value] = useAndUpdateDerivedStore(store, getter)
  return value
}

export function useDerivedStoreFromContext<StoreType extends UsableSubject<any>, OutputType> (
  context: React.Context<StoreType>,
  getter: (state: SubjectStateType<StoreType>) => OutputType
): OutputType
export function useDerivedStoreFromContext<StoreType extends UsableSubject<any>, Selector extends keyof SubjectStateType<StoreType>> (
  context: React.Context<StoreType>,
  selector: Selector
): SubjectStateType<StoreType>[Selector]
export function useDerivedStoreFromContext<OutputType, StoreType extends UsableSubject<any> = any> (
  context: React.Context<StoreType>,
  selector: string
): OutputType
export function useDerivedStoreFromContext<StoreType extends UsableSubject<any> = any> (
  context: React.Context<StoreType>
): StoreType
export function useDerivedStoreFromContext<StoreType extends UsableSubject<any> = any> (context: React.Context<StoreType>, getter?: any) {
  const store = useContext(context)
  return useDerivedStore(store, getter)
}
