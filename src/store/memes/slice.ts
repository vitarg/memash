import { createSlice } from "@reduxjs/toolkit";
import Meme from "../../data/types/meme";

interface InitialState {
  memes: Meme[];
  loading: boolean;
  error: null;
}

const initialState: InitialState = {
  memes: [],
  loading: false,
  error: null,
};

const memesSlice = createSlice({
  name: "memes",
  initialState,
  reducers: {},
});

export const {} = memesSlice.actions;

export default memesSlice.reducer;
