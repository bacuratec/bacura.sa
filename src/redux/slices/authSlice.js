import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: null,
  refreshToken: null,
  role: null,
  userId: null,
};

// نستخدم localStorage عشان نخزن التوكن بين جلسات لو مطلوب:
// عند البداية، نحاول نقرأ من localStorage:
const stored = localStorage.getItem("auth");
if (stored) {
  try {
    const parsed = JSON.parse(stored);
    if (parsed.token && parsed.role && parsed.userId && parsed.refreshToken) {
      initialState.token = parsed.token;
      initialState.refreshToken = parsed.refreshToken;

      initialState.role = parsed.role;
      initialState.userId = parsed.userId;
    }
  } catch (err) {
    console.log(err);
  }
}
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;

      state.role = action.payload.role;
      state.userId = action.payload.userId;
      localStorage.setItem(
        "auth",
        JSON.stringify({
          token: state.token,
          refreshToken: state.refreshToken,

          role: state.role,
          userId: state.userId,
        })
      );
    },
    logout: (state) => {
      state.token = null;
      state.refreshToken = null;

      state.role = null;
      state.userId = null;

      localStorage.removeItem("auth");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
