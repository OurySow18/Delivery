import {createStore ,combineReducers, applyMiddleware } from "redux";
import reducerUsers from "./reducers/reducerUsers";
import thunk from 'redux-thunk';


const rootReducers = combineReducers({
    user : reducerUsers  
})


const store = createStore(rootReducers, applyMiddleware(thunk));

export default store;