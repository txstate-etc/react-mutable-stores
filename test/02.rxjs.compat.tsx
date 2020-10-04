import React, { useCallback } from 'react'
import { BehaviorSubject } from 'rxjs'
import { render, waitFor, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { useAndUpdateDerivedStore } from '../src'

const counterStore = new BehaviorSubject({ count: 0 })
const UpdateCounterButton: React.FC = props => {
  const [count, updateCount] = useAndUpdateDerivedStore(counterStore, 'count')
  const onClick = useCallback(() => updateCount(count + 1), [count, updateCount])
  return (
    <button onClick={onClick}>{count}</button>
  )
}

test('increments on click using AndUpdate style', async () => {
  render(<UpdateCounterButton />)
  const button = await waitFor(() => screen.getByRole('button'))
  expect(button).toHaveTextContent('0')
  fireEvent.click(button)
  expect(button).toHaveTextContent('1')
})

test('everything is unmounted so there should be no subscribers on counterStore', async () => {
  expect(counterStore.observers.length).toEqual(0)
})
