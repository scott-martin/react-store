import React, { 
  createContext, useContext, Reducer, ReducerState, ReducerAction 
} from 'react';
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

  return {
    useStore,
    useDispatch,
    StoreProvider, 
    StoreContext,
    DispatchContext
  };
};
