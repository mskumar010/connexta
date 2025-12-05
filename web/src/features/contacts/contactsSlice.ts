import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/types";

interface ContactsState {
  contacts: User[];
  isLoading: boolean;
}

const initialState: ContactsState = {
  contacts: [],
  isLoading: false,
};

export const contactsSlice = createSlice({
  name: "contacts",
  initialState,
  reducers: {
    setContacts: (state, action: PayloadAction<User[]>) => {
      state.contacts = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setContacts, setLoading } = contactsSlice.actions;

export default contactsSlice.reducer;
