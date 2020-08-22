import { TMiddleware } from './type';

export const thunk: TMiddleware = () => next => async action => {
  if(typeof action === 'function') {
    action = await action();
  }
  await next(action);
}