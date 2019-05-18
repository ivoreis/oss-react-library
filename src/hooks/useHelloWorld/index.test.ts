import { act, renderHook } from 'react-hooks-testing-library';
import { useHelloWorld } from '../..';

test('useHelloWorld should react on dispatch("hello")', () => {
  let state, dispatch: any;

  renderHook(() => ([state, dispatch] = useHelloWorld()));

  expect(state).toBe('');
  act(() => dispatch('hello'));
  expect(state).toBe('world');
});
