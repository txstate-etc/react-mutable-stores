import React, { useCallback } from 'react'
import { render, waitFor, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { WatchedStore, useAndUpdateDerivedStore, useDerivedStore } from '../src'

class CounterStore extends WatchedStore<{ count: number, numbers: number[] }> {
  reset () {
    this.value = { count: 0, numbers: [] }
  }

  incrementCount () {
    this.value.count += 1
  }

  addNumber (n: number) {
    this.value.numbers.push(n)
  }
}
const counterStore = new CounterStore({ count: 0, numbers: [] })
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

const NumberDisplay: React.FC = props => {
  const numbers = useDerivedStore(counterStore, 'numbers')
  return <main>
    {numbers.join(',')}
  </main>
}

test('loads and displays zero', async () => {
  render(<CounterButton />)
  const button = await waitFor(() => screen.getByRole('button'))

  expect(button).toHaveTextContent('0')
})

test('increments on click', async () => {
  const { getByRole } = render(<CounterButton />)
  const button = await waitFor(() => getByRole('button'))

  fireEvent.click(button)
  await waitFor(() => expect(button).toHaveTextContent('1'))
})

test('buttons share state', async () => {
  counterStore.reset()
  render(<><CounterButton /><CounterButton /></>)
  const [button1, button2] = await waitFor(() => screen.getAllByRole('button'))
  await waitFor(() => {
    expect(button1).toHaveTextContent('0')
    expect(button2).toHaveTextContent('0')
  })
  fireEvent.click(button1)
  await waitFor(() => {
    expect(button1).toHaveTextContent('1')
    expect(button2).toHaveTextContent('1')
  })
  fireEvent.click(button2)
  await waitFor(() => {
    expect(button1).toHaveTextContent('2')
    expect(button2).toHaveTextContent('2')
  })
})

test('increments on click using AndUpdate style', async () => {
  counterStore.reset()
  render(<UpdateCounterButton />)
  const button = await waitFor(() => screen.getByRole('button'))
  await waitFor(() => expect(button).toHaveTextContent('0'))

  fireEvent.click(button)
  await waitFor(() => expect(button).toHaveTextContent('1'))
})

test('should not have a race condition when the store is updated during a render', async () => {
  counterStore.reset()
  render(<RacyCounterButton />)
  const button = await waitFor(() => screen.getByRole('button'))
  await waitFor(() => expect(button).toHaveTextContent('1'))
})

test('everything is unmounted so there should be no subscribers on counterStore', async () => {
  expect(counterStore.observers.length).toEqual(0)
})

test('array manipulations trigger updates', async () => {
  counterStore.reset()
  render(<NumberDisplay/>)
  const main = await waitFor(() => screen.getByRole('main'))
  expect(main).toHaveTextContent('')
  counterStore.addNumber(2)
  await waitFor(() => expect(main).toHaveTextContent('2'))
  counterStore.value.numbers.push(4, 3)
  await waitFor(() => expect(main).toHaveTextContent('2,4,3'))
  counterStore.value.numbers.sort((a, b) => a - b)
  await waitFor(() => expect(main).toHaveTextContent('2,3,4'))
})
