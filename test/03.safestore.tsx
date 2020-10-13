import React, { useCallback } from 'react'
import { render, waitFor, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { SafeStore, useAndUpdateDerivedStore, useDerivedStore } from '../src'

class CounterStore extends SafeStore<{ count: number }> {
  reset () {
    this.next({ count: 0 })
  }

  incrementCount () {
    this.value.count += 1
    this.next(this.value)
  }
}
const counterStore = new CounterStore({ count: 0 })
const CounterButton: React.FC = props => {
  const count = useDerivedStore(counterStore, 'count')
  const onClick = useCallback(() => counterStore.incrementCount(), [])
  return (
    <button onClick={onClick}>{count}</button>
  )
}

let once = true
const RacyCounterButton: React.FC = props => {
  const count = useDerivedStore(counterStore, 'count')
  if (once) counterStore.incrementCount()
  once = false
  return (
    <button>{count}</button>
  )
}

const UpdateCounterButton: React.FC = props => {
  const [count, updateCount] = useAndUpdateDerivedStore(counterStore, 'count')
  const onClick = useCallback(() => updateCount(count + 1), [count, updateCount])
  return (
    <button onClick={onClick}>{count}</button>
  )
}

test('loads and displays zero', async () => {
  render(<CounterButton />)
  const button = await waitFor(() => screen.getByRole('button'))

  expect(button).toHaveTextContent('0')
})

test('increments on click', async () => {
  render(<CounterButton />)
  const button = await waitFor(() => screen.getByRole('button'))

  fireEvent.click(button)
  expect(button).toHaveTextContent('1')
})

test('buttons share state', async () => {
  counterStore.reset()
  render(<><CounterButton /><CounterButton /></>)
  const [button1, button2] = await waitFor(() => screen.getAllByRole('button'))
  expect(button1).toHaveTextContent('0')
  expect(button2).toHaveTextContent('0')
  fireEvent.click(button1)
  expect(button1).toHaveTextContent('1')
  expect(button2).toHaveTextContent('1')
  fireEvent.click(button2)
  expect(button1).toHaveTextContent('2')
  expect(button2).toHaveTextContent('2')
})

test('increments on click using AndUpdate style', async () => {
  counterStore.reset()
  render(<UpdateCounterButton />)
  const button = await waitFor(() => screen.getByRole('button'))

  fireEvent.click(button)
  expect(button).toHaveTextContent('1')
})

test('should not have a race condition when the store is updated during a render', async () => {
  counterStore.reset()
  render(<RacyCounterButton />)
  const button = await waitFor(() => screen.getByRole('button'))
  expect(button).toHaveTextContent('1')
})

test('everything is unmounted so there should be no subscribers on counterStore', async () => {
  expect(counterStore.observers.length).toEqual(0)
})
