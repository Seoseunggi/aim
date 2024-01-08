// 리듀서
import { createSlice } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";

const name = "UserSlice";

const initialState = [{ user: "", userid: "" }];

export const userSlice = createSlice({
  name: name,
  initialState: initialState,
  reducers: {
    addUser: (state, action) => {
      state.push({ user: action.payload, userid: Date.now() });
    },
    removeUser: (state, action) =>
      state.filter((item) => item.userid !== action.payload),
  },
  extraReducers: (builder) => {
    builder.addCase(PURGE, () => initialState);
  },
});

export const { addUser, removeUser } = userSlice.actions;

export default userSlice.reducer;
