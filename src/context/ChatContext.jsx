import { createContext, useContext, useReducer } from "react";
import { AuthContext } from "./AuthContext";

export const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  const INITIAL_STATE = {
    chatId: "null",
    usuario: {},
  };

  let var_chatId = "";

  const chatReducer = (state, action) => {
    switch (action.type) {
      case "CHANGE_USER":
        if (currentUser.uid > action.payload.uid) {
          var_chatId = currentUser.uid + action.payload.uid;
        } else {
          var_chatId = action.payload.uid + currentUser.uid;
        }
        return {
          usuario: action.payload,
          chatId: var_chatId,
        };
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(chatReducer, INITIAL_STATE)

  return (
    <ChatContext.Provider value={{ data:state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
};
