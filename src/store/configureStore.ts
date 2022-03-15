import { configureStore } from "@reduxjs/toolkit";
import memesReducer from "./memes/slice";

export const store = configureStore({
  reducer: { memesReducer },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
