import { useState, useEffect, useContext, useMemo, useCallback } from 'react'
import { skip } from 'rxjs/operators'
import { OperatorFunction, Observable, Subscription } from 'rxjs'
import { DerivedStore } from './store'

export interface UsableStore<StateType> {
  value: StateType
  next: (value: StateType) => void
  subscribe: (observer: (value: StateType) => void) => Subscription
  pipe: (...operations: OperatorFunction<any, any>[]) => Observable<any>
}
export type UsableStoreStateType<StoreType> = StoreType extends { value: infer StateType } ? StateType : never

export function useAndUpdateStore<StoreType extends UsableStore<any>> (store: StoreType): [UsableStoreStateType<StoreType>, (value: UsableStoreStateType<StoreType>) => void] {
  const [value, setState] = useState(store.value)
  const sub = useMemo(() => store.pipe(skip(1)).subscribe(s => setState(s)), [store])
  useEffect(() => () => sub.unsubscribe(), [sub])
  const newSetState = useCallback((state: UsableStoreStateType<StoreType>) => store.next(state), [store])
  return [value, newSetState]
}

export function useStore<StoreType extends UsableStore<any>> (store: StoreType) {
  const [value] = useAndUpdateStore(store)
  return value
}

export function useStoreFromContext<StoreType extends UsableStore<any>> (context: React.Context<StoreType>) {
  const store = useContext(context)
  return useStore(store)
}

export function useAndUpdateDerivedStore<StoreType extends UsableStore<any>, OutputType> (
  store: StoreType,
  getter: (state: UsableStoreStateType<StoreType>) => OutputType,
  setter: (newvalue: OutputType, state: UsableStoreStateType<StoreType>) => UsableStoreStateType<StoreType>
): [OutputType, (value: OutputType) => void]
export function useAndUpdateDerivedStore<StoreType extends UsableStore<any>, Selector extends keyof UsableStoreStateType<StoreType>> (
  store: StoreType,
  selector: Selector
): [UsableStoreStateType<StoreType>[Selector], (value: UsableStoreStateType<StoreType>[Selector]) => void]
export function useAndUpdateDerivedStore<OutputType, StoreType extends UsableStore<any> = any> (
  store: StoreType,
  selector: string
): [OutputType, (value: OutputType) => void]
export function useAndUpdateDerivedStore<StoreType extends UsableStore<any>, OutputType> (store: StoreType, getter: any, setter?: any) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const derived = useMemo(() => new DerivedStore(store, getter, setter), [store, getter.toString(), (setter || '').toString()])
  useEffect(() => {
    return () => derived.complete()
  }, [derived])
  return useAndUpdateStore(derived as DerivedStore<OutputType, UsableStoreStateType<StoreType>>)
}

export function useAndUpdateDerivedStoreFromContext<StoreType extends UsableStore<any>, OutputType> (
  context: React.Context<StoreType>,
  getter: (state: UsableStoreStateType<StoreType>) => OutputType,
  setter: (newvalue: OutputType, state: UsableStoreStateType<StoreType>) => UsableStoreStateType<StoreType>
): [OutputType, (value: OutputType) => void]
export function useAndUpdateDerivedStoreFromContext<StoreType extends UsableStore<any>, Selector extends keyof UsableStoreStateType<StoreType>> (
  context: React.Context<StoreType>,
  selector: Selector
): [UsableStoreStateType<StoreType>[Selector], (value: UsableStoreStateType<StoreType>[Selector]) => void]
export function useAndUpdateDerivedStoreFromContext<OutputType, StoreType extends UsableStore<any> = any> (
  context: React.Context<StoreType>,
  selector: string
): [OutputType, (value: OutputType) => void]
export function useAndUpdateDerivedStoreFromContext<StoreType extends UsableStore<any>> (context: React.Context<StoreType>, getter: any, setter?: any) {
  const store = useContext(context)
  return useAndUpdateDerivedStore(store, getter, setter)
}

export function useDerivedStore<StoreType extends UsableStore<any>, OutputType> (
  store: StoreType,
  getter: (state: UsableStoreStateType<StoreType>) => OutputType
): OutputType
export function useDerivedStore<StoreType extends UsableStore<any>, Selector extends keyof UsableStoreStateType<StoreType>> (
  store: StoreType,
  selector: Selector
): UsableStoreStateType<StoreType>[Selector]
export function useDerivedStore<OutputType, StoreType extends UsableStore<any> = any> (
  store: StoreType,
  selector: string
): OutputType
export function useDerivedStore<StoreType extends UsableStore<any> = any> (store: StoreType, getter: any) {
  const [value] = useAndUpdateDerivedStore(store, getter)
  return value
}

export function useDerivedStoreFromContext<StoreType extends UsableStore<any>, OutputType> (
  context: React.Context<StoreType>,
  getter: (state: UsableStoreStateType<StoreType>) => OutputType
): OutputType
export function useDerivedStoreFromContext<StoreType extends UsableStore<any>, Selector extends keyof UsableStoreStateType<StoreType>> (
  context: React.Context<StoreType>,
  selector: Selector
): UsableStoreStateType<StoreType>[Selector]
export function useDerivedStoreFromContext<OutputType, StoreType extends UsableStore<any> = any> (
  context: React.Context<StoreType>,
  selector: string
): OutputType
export function useDerivedStoreFromContext<StoreType extends UsableStore<any> = any> (context: React.Context<StoreType>, getter: any) {
  const store = useContext(context)
  return useDerivedStore(store, getter)
}
