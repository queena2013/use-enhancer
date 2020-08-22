import { isPlainObject } from './isplainobject';
import { TNext } from './type';

type TCompose = (callbacks: TCallback[], options?: Partial<TOptions>) => TLink;
type TCallback = (next: TNext) => TLinkCallback;
type TLinkCallback = (...args: any[]) => Promise<any>;

type TLink = {
  callback: TLinkCallback;
  prev: TLink;
  next: TLink;
} | null;

type TAction = {
  type: string;
  payload: any;
}

type TEffect = {
  action: TAction;
  next: TEffect | null;
} | null;

type TOptions = {
  onCapture: () => void;
  onTarget: (effect: TEffect) => void;
  onBubble: () => void;
}

export const compose: TCompose = (callbacks, options = {}) => {
  let head: TLink = null;
  let tail: TLink = null;
  let chain: TLink = null;
  let current: TLink = null;
  let effect: TEffect = null;
  let isExecuting: boolean = false;
  const next: TNext = async action => {
    if(isExecuting) {
      return;
    }
    if(!isPlainObject(action)) {
      throw new Error(
        'Actions must be plain objects. ' +
          'Use custom middleware for async actions.'
      );
    }
    if(action) {
      if (typeof action.type === 'undefined') {
        throw new Error(
          'Actions may not have an undefined "type" property. ' +
            'Have you misspelled a constant?'
        )
      };
      if(!effect) {
        effect = {
          action,
          next: null,
        }
      } else {
        effect = effect.next = {
          action,
          next: null,
        }
      }
    }
    if(!current) {
      current = head;
    }
    current = current!.next;
    if(current) {
      await current.callback();
      return;
    }
    try {
      isExecuting = true;
      const { onTarget } = options;
      if(onTarget) {
        onTarget(effect);
      }
    } finally {
      isExecuting = false;
    }
  }
  callbacks.forEach(_c => {
    if(!chain) {
      head = tail = chain = {
        callback: _c(next),
        prev: null,
        next: null,
      }
      return;
    }
    tail = tail!.next = {
      callback: _c(next),
      prev: tail,
      next: null,
    }
  })
  return chain;
}