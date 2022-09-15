import { AUTH_USER } from "../constants"; 
import AsyncStorage from "@react-native-async-storage/async-storage";

// Connexion
export const actionLogin = (email, password) => {
  return async (dispatch) => {
    //http request
    const response = await fetch(
      "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyDCENsh0tZlNtbcNAZZHqt1RtkNIsWsNuE",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
          returnSecureToken: true,
        }),
      }
    );
   
    //response
    if (!response.ok) {
      //message d´erreur
      const responseError = await response.json();
      const errorMsg = responseError.error.message;

      let customMsg = "Oops, we have a problem during Login";

      if (errorMsg === "EMAIL_NOT_FOUND") {
        customMsg =
          "This Emai doesnt exists, please contact the technic Support ";
      } else if (errorMsg === "INVALID_PASSWORD") {
        customMsg = "Invalid password, please try again";
      }
      throw new Error(customMsg);
    }

    const dataObj = await response.json();
    //dispatch action
    dispatch(actionAuthUser(dataObj.localId, dataObj.idToken));

    //AsyncStorage
    const expiresInMilisec = parseInt(dataObj.expiresIn) * 1000;
    const expireDate = new Date().getTime() + expiresInMilisec;
    const dateTokenExpire = new Date(expireDate).toISOString();

    saveToAsyncStorage(dataObj.idToken, dataObj.localId, dateTokenExpire);
  };
};

//Enregistrer la data dans AsyncStorage
const saveToAsyncStorage = async (token, useId, dateTokenExpire) => {
  await AsyncStorage.setItem(
    "userDetails",
    JSON.stringify({
      token,
      useId,
      dateTokenExpire, 
    })
  );
};

//Auth action
const actionAuthUser = (userId, token) => {
  return {
    type: AUTH_USER,
    userId: userId,
    token: token,
  };
};
