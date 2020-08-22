# use-enhancer

use-enhancer如其名，是一个简单且强大的hooks。它基于中间件模式（没错，它类似于redux中间件模式，但它是基于双向链表而非数组，为什么是链表？因为我想做更多我认为还不错的point）来增强useReducer的dispatch，增强后可以方便的执行异步action或者记录日志等操作。我会提供thunk（类似于redux-thunk）中间件作为一个例子（但是暂时还没写完）。

## 安装

```bash
yarn add @ivliu/use-enhancer # or npm install @ivliu/use-enhancer --save
```

## 举个例子吧

```typescript
import { React, FC useReducer } from 'react';
import useEnhancer from '@ivliu/use-enhancer';

const fakeThunk = () => next => async action => {
  if(typeof action === 'function') {
    action = await action();
  }
  await next(action);
}

const fakeLog = () => next => async () => {
  console.log('sorry, i am a fake log.');
  await next();
}

const reducer = (state, action) {
  const { type, payload } = action;
  switch(type) {
    case 'ASYNC_TYPE':
      return { ...state, ...payload };
    default: 
    return state;
  }
}

const App: FC = () => {
  const [count, rawDispatch] = useReducer(s => s, {});
  const dispatch = useEnhancer(
    count,
    rawDispatch,
    fakeThunk,
    fakeLog,
  );
  useEffect(() => {
    dispatch(async () => {
      await new Promise(r => setTimeout(() => r(), 3000));
      return ({ type: 'ASYNC_TYPE', payload: { /* some data */ }})
    })
  }, [])
  return (<p>So handsome, you actually use use-enhancer.</p>)
};
```

另外您还可以把项目clone下来，实际跑一下例子

```base
git clone 
cd use-enhancer
yarn # or npm i
npm start
cd example
yarn # or npm i
npm start
```
然后打开http://localhost:1234即可看到效果

## 最后
希望大家可以多多提意见，多多star，多多pr。