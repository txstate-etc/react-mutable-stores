import React, { useCallback } from 'react'
import { render, waitFor, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { Store, useDerivedStore } from '../src'

class CounterStore extends Store<{ count: number }> {
  reset () {
    this.next({ count: 0 })
  }

  incrementCount () {
    this.next({ ...this.value, count: this.value.count + 1 })
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
