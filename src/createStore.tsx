import React, { 
  createContext, useContext, Reducer, ReducerState, ReducerAction, useRef, useEffect 
} from 'react';
import shallowEqual from 'shallowequal';
import { useDevToolsReducer } from './useDevtoolsReducer';

/**
 * Creates a redux-like store for use in a more global capacity, typically
 * on a page or area basis. The store will be connected to the Redux DevTools 
 * Extension for useful help debugging state.
 */
export const createStore = <R extends Reducer<any, any>>(
  reducer: R,
  initialState: ReducerState<R>,
  storeName: string
) => {
  const StoreContext = createContext<ReducerState<R>>(initialState);
  const DispatchContext = createContext<React.Dispatch<ReducerAction<R>>>(() => {});
  const useDispatch = () => useContext(DispatchContext);
  const useStore = () => useContext(StoreContext);
    
  const StoreProvider: React.FC<any> = (props) => {  
    const [state, dispatch] = useDevToolsReducer(reducer, initialState, storeName);

    return (
      <DispatchContext.Provider value={dispatch}>
        <StoreContext.Provider value={state}>{props.children}</StoreContext.Provider>
      </DispatchContext.Provider>
    );
  };

  type Selector<T> = (state: ReducerState<R>) => T;
  type UseSelector = <T>(selector: Selector<T>) => T;

  /**
   * Allows you to select slices of your state in your component
   * It is best to keep this in a container function, because any
   * updates to the global state will cause a rerender of your
   * component.
   */
  const useSelector: UseSelector = (selector) => {
    type T = ReturnType<typeof selector>;
    const store = useStore();
    const lastValueRef = useRef<T>();
    const lastSelectorRef = useRef<typeof selector>();
    let value: T;

    if (selector !== lastSelectorRef.current) {
      const newValue = selector(store);
      const lastValue = lastValueRef.current;
      if (lastValue) {
        value = shallowEqual(lastValue, newValue) ? lastValue : newValue;
      } else {
        value = newValue;
      }
    } else {
      value = lastValueRef.current as T;
    }

    useEffect(() => {
      lastValueRef.current = value;
      lastSelectorRef.current = selector;
    });

    return value;
  };

  return {
    useSelector,
    useDispatch,
    useStore,
    StoreProvider, 
    StoreContext,
    DispatchContext
  };
};
