/**
 * Abgabe Bachelorarbeit
 * Author: Amadou Oury Sow
 * Date: 15.09.2022
 * 
 * Konfiguration der Store
 */
import { combineReducers } from 'redux';
import {configureStore} from '@reduxjs/toolkit' 
import reducerUsers from './reducers/reducerUsers'; 
import persistReducer from 'redux-persist/es/persistReducer'; 
import AsyncStorage from '@react-native-async-storage/async-storage'


const persistConfig = {
    key: 'root',
    storage: AsyncStorage ,
};

 const rootReducers = combineReducers({ 
    users: reducerUsers
})

let persistedReducer = persistReducer(persistConfig, rootReducers);
/*
const store = createStore(rootReducers, applyMiddleware(thunk));
*/

const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
export default store;