import { 
  ReducerWithoutAction,
  ReducerStateWithoutAction, 
  DispatchWithoutAction, 
  Reducer,
  ReducerState,
  Dispatch,
} from 'react';
import { unstable_batchedUpdates as batch } from 'react-dom';
import { compose } from './utils/compose';
import { TMiddlewareWithoutAction, TMiddleware } from './type';

function useEnhancer<
  R extends ReducerWithoutAction<any>
>(
  store: ReducerStateWithoutAction<R>, 
  dispatch: DispatchWithoutAction,
  ...middlewares: TMiddlewareWithoutAction[]
): DispatchWithoutAction;
function useEnhancer<
  R extends Reducer<any, any>
>(
  store: ReducerState<R>, 
  dispatch: Dispatch<ReducerState<R>>,
  ...middlewares: TMiddleware[]
): Dispatch<ReducerState<R>>; 
function useEnhancer(store: any, dispatch: any, ...middlewares: any[]): any {
  if(middlewares.length === 0) {
    return dispatch;
  }
  let { callback } = compose(
    middlewares.map(_m => _m(store, dispatch)), 
    {
      onTarget: effect => {
        batch(() => {
          while(effect) {
            const { action, next } = effect;
            dispatch(action);
            effect = next;
          }
        })
      }
    }
  )!;
  return callback;
}

export default useEnhancer;