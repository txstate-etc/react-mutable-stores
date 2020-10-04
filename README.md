# react-mutable-stores
Hooks that take concepts from RxJS and Svelte to make handling state in React
simple and powerful.

## Overview
This library attempts to be a comprehensive solution to shared state management in
React, similar to projects like Redux but much simpler to use and to reason about.

A store is an extension of RxJS' BehaviorSubject, but it only sends updates to
subscribers when its value actually changes. If `next()` is invoked twice with
different but identical objects, the second invocation will be ignored and
subscribers will not be notified.

Also included in this library is a set of React hooks that make interacting with a
store easy, clear, and efficient.

## Store
A store is intended to contain simple state that is easy to clone. By default, you
are expected to update the store with fresh or cloned objects:
```typescript
const initialState = { foo: 'bar', more: 'state' }
const store = new Store(initialState)
this.next({ ...initialState, foo: 'baz' })
```
If it's not convenient to clone your own objects, the store can do it for you
if you set the `immutable` option to `false` (this tells the store that you will
not be passing it immutable objects):
```typescript
const initialState = { foo: 'bar', more: 'state' }
const store = new Store(initialState, { immutable: false })
initialState.foo = 'baz'
this.next(initialState) // without immutable: false, this would not send to subscribers
```
This will work on any objects that are Cloneable according to the lodash.clone()
documentation.

### Subclassing / Mutation
The most effective way to use a store is to subclass your own and create mutation
methods. If you're familiar with redux, these methods would be similar to actions on
reducers.
```typescript
interface MyState {
  foo: string
  more: string
}
class MyStore extends Store<MyState> {
  updateFoo (newfoo: string) {
    // do some business logic here
    newfoo = newfoo.trim().toLocaleLowerCase()
    this.next({ ...this.value, foo: newfoo })
  }
}
const store = new MyStore({ foo: 'bar', more: 'state' })
store.updateFoo('baz')
```
This way your store controls all the business logic and your components can be truly
reactive.

Note that `this.value` contains the current version of the store. That is inherited
from `BehaviorSubject`.

### Asynchronous mutations
Mutation methods become even more powerful when you do asynchronous updates. All of
your asynchronous code can be encapsulated in a single method, making it much easier
to think about how you want to handle race conditions and errors.
```typescript
interface BookState {
  loading?: boolean
  book?: Book
  error?: string
}
class BookStore extends Store<BookState> {
  async getBook (id: number) {
    if (this.value.loading) return // one book at a time!
    this.next({ loading: true, book: undefined, error: undefined })
    try {
      const book = await api.getBook(id)
      this.next({ loading: false, book, error: undefined })
    } catch (e) {
      this.next({ loading: false, book: undefined, error: e.message })
    }
  }
}
```

### Creating and sharing store instances
It's up to you to determine how you'd like to create and share stores. The singleton
pattern works great for end user applications. For instance, a global error store can
help individual components communicate with the layout component when they experience
a problem that's fatal for the page. Creating a singleton store for each screen in your
application is another powerful pattern and helps all your components share the screen
state.

React Context can be very convenient as well. Since a store instance is a container for
the state, the Context doesn't change on each state change, so there are no extra
re-renders.

Similarly, a store can be created and passed down as a prop, enabling efficient two-way
communication between a component and its children. Since the store is an unchanging
container, components do not have to re-render unless their subscription indicates they
should.

## Hooks
Hooks are provided to help you subscribe to stores in functional components. They return
the state from the store and trigger a render every time it changes. Let's look at using
the BookStore from the example above:
```tsx
import { bookStore } from './bookstore'
const BookDetail: React.FC = props => {
  const { error, book, loading } = useStore(bookStore)
  const onClick = useCallback(() => bookStore.getBook(5), [])
  return <>
    {!!error &&
      <ErrorMessage>{error}</ErrorMessage>
    }
    {loading &&
      <LoadingIndicator/>
    }
    {!loading && !!book &&
      <h2>{book.title}</h2>
      <div>{book.summary}</div>
    }
    <button onClick={onClick}>Fetch a book</button>
  </>
}
```
### useDerivedStore
A derived store is a store that derives its state from another store. useDerivedStore
is a hook that implicitly creates a derived store for you, and then only renders your
component when the derived state changes, instead of every time the original store changes.
A common and simple example is when a component only needs one property from a state
object. useDerivedStore can accept a string property name for these cases:
```tsx
import { globalStore } from './globalStore'
const GlobalLoadIndicator: React.FC = props => {
  const loading = useDerivedStore(globalStore, 'loading')
  return loading ? <LoadIndicator/> : null
}
```
It also accepts a transformation function for extra power. Here's an example of making
a responsive component that only re-renders when the screen width crosses a boundary.
```tsx
import { globalStore } from './globalStore'
const ResponsiveComponent: React.FC = props => {
  const large = useDerivedStore(globalStore, s => s.width > 800)
  return large
    ? <table>{props.rows}</table>
    : <ul>{props.lineitems}</ul>
}
```
### useAndUpdateStore
If you have a very simple store without mutation methods, you may want something a lot
like React's `useState` hook, so you can easily update the store. Our hooks come with
`AndUpdate` variants:
```tsx
import { simpleStore } from './simplestore'
const SimpleComponent: React.FC = props => {
  const [simpleState, updateSimpleState] = useAndUpdateStore(simpleStore)
  const onClick = useCallback(() =>
    updateSimpleState(simpleState.count + 1),
    [simpleState, updateSimpleState]
  )
  return <>
    <Counter count={simpleState.count}>
    <button onClick={onClick}>Increment</button>
  </>
}
```
### useAndUpdateDerivedStore
This pattern gets a little more useful with a derived store. useAndUpdateDerivedStore
can accept a `setter` that updates the parent store when the derived store changes.
```tsx
import { simpleStore } from './simplestore'
const SimpleComponent: React.FC = props => {
  const [count, updateCount] = useAndUpdateDerivedStore(simpleStore,
    s => s.count,
    (count, s) => ({ ...s, count }) // this is the setter, returns a new state for the parent
  )
  const onClick = useCallback(() => updateCount(count + 1), [count, updateCount])
  return <>
    <Counter count={count}>
    <button onClick={onClick}>Increment</button>
  </>
}
```
If you're just updating a property, providing the property name is a little easier still.
```tsx
const simpleStore = require('./simplestore')
const SimpleComponent: React.FC = props => {
  const [count, updateCount] = useAndUpdateDerivedStore(simpleStore, 'count')
  const onClick = useCallback(() => updateCount(count + 1), [count, updateCount])
  return <>
    <Counter count={count}>
    <button onClick={onClick}>Increment</button>
  </>
}
```
## Advanced Usage / Tips
### lodash.get & set
Anything in this library that accepts a property name uses `lodash.get` and `lodash.set`
so that you can use dot-notation to go deeper into your state object.
```tsx
const name = useDerivedStore(someStore, 'items[0].name')
```
### One-liners from Context
Most of the hooks have another version for retrieving the store from a Context, just to
save you a line.
```tsx
const myStore = useContext(MyStoreContext)
const state = useStore(myStore)
```
becomes
```tsx
const state = useStoreFromContext(MyStoreContext)
```
### BehaviorSubject
The Store class extends BehaviorSubject from RxJS. So anything you can do with a
BehaviorSubject you can do with a store, including subscribing without a hook, piping, etc.
```typescript
myStore.subscribe(state => console.log('myStore state change', state))
```
### DerivedStore
You can also make a DerivedStore without a hook.
```typescript
import { DerivedStore } from 'react-mutable-stores'
const widthStore = new DerivedStore(globalStore, s => s.width)
widthStore.subscribe(width => console.log('screen width changed', width))
```
DerivedStores can be mutable if you provide a `setter` or use a property name. The
`setter` will receive the new value and the current parent state and should return a new
parent state.
```typescript
const widthStore = new DerivedStore(globalStore,
  s => s.width,
  (width, s) => ({ ...s, width })
)
widthStore.next(800)
console.log(globalStore.value) // { ..., width: 800 }
```
Providing a property name creates an appropriate setter by default.
```typescript
const widthStore = new DerivedStore(globalStore, 'width')
widthStore.next(800)
console.log(globalStore.value) // { ..., width: 800 }
```
## Typescript
This library is written in typescript, as are all the examples above. It goes to great
lengths to ensure your types are automatically inferred as much as possible. You will
typically want to specify a type for your Store state, as in the "Subclassing" example above.

Everything is exported as an es6 module, which should be helpful for any React project
since even pure javascript React projects use a precompiler like webpack.
