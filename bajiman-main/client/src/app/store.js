import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import globalReducer from "../features/global/globalSlice";
import globalGameReducer from "../features/globalGame/globalGameSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    global: globalReducer,
    globalGame: globalGameReducer,
  },
});

export default store;
