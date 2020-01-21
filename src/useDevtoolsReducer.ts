import { 
  Reducer, useReducer, ReducerState, useEffect, ReducerAction, Dispatch, useRef 
} from 'react';

/**
 * This hook integrates your reducer state with the Redux DevTools Extension 
 */
export const useDevToolsReducer = <R extends Reducer<any, any>>(
  reducer: R,
  initialState: ReducerState<R>, 
  stateName: string
): [ReducerState<R>, Dispatch<ReducerAction<R>>] => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const devToolsRef = useRef(null as any);
  const lastActionRef = useRef<ReducerAction<R>>();
  
  useEffect(() => {
    const reduxDevToolsExtension = (window as any).__REDUX_DEVTOOLS_EXTENSION__; // eslint-disable-line  
    if (reduxDevToolsExtension) {
      const devTools = reduxDevToolsExtension.connect({
        name: stateName,
        serialize: true,
      });
      devTools.init(initialState);
      devToolsRef.current = devTools;
    }
  }, [initialState, stateName]);

  useEffect(() => {
    const lastAction = lastActionRef.current;
    const devTools = devToolsRef.current;
    if (devTools) {
      devTools.send(lastAction, state);
    }
  }, [state]);

  const enhancedDispatch: Dispatch<ReducerAction<R>> = (action: ReducerAction<R>) => {
    lastActionRef.current = action;
    return dispatch(action);
  };

  return [state, enhancedDispatch];
};
