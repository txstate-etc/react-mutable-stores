import { useContext, useEffect, useMemo } from 'react'
import { useAndUpdateStore } from './hooks'
import { DerivedStore } from './derivedstore'
import { SubjectStateType, UsableSubject } from './subject'

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
export function useAndUpdateDerivedStore<StoreType extends UsableSubject<any>> (store: StoreType, getter?: any, setter?: any) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const derived = useMemo(() => new DerivedStore(store, getter, setter), [store, (getter ?? '').toString(), (setter ?? '').toString()])
  useEffect(() => {
    return () => derived.complete()
  }, [derived])
  return useAndUpdateStore(derived)
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
