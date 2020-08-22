import { Reducer, ReducerAction } from 'react';

export type TNext = <R extends Reducer<any, any>>(action?: ReducerAction<R>) => Promise<void>;