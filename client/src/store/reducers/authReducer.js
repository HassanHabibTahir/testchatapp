import { REGISTER_FAIL, REGISTER_SUCCESS, SUCCESS_MESSAGE_CLEAR, ERROR_CLEAR, USER_LOGIN_FAIL, USER_LOGIN_SUCCESS, LOGOUT_SUCCESS } from "../types/authType";
// import deCodeToken from 'jwt-decode';

const authState = {
    loading: true,
    authenticate: false,
    error: '',
    successMessage: '',
    myInfo: ''
}

export const authReducer = (state = authState, action) => {
    const { payload, type } = action;

    if (type === REGISTER_FAIL || type === USER_LOGIN_FAIL) {
        return {
            ...state,
            error: payload.error,
            authenticate: false,
            myInfo: '',
            loading: true
        }
    }

    if (type === REGISTER_SUCCESS || type === USER_LOGIN_SUCCESS) {
        return {
            ...state,
            myInfo: payload,
            successMessage: payload.successMessage,
            error: '',
            authenticate: true,
            loading: false

        }

    }


    if (type === REGISTER_FAIL || type === USER_LOGIN_FAIL) {
        return {
            ...state,
            error: payload.error,
            authenticate: false,
            myInfo: '',
            loading: true
        }
    }

    if (type === 'LOGOUT_SUCCESS') {
        return {
            ...state,
            authenticate: false,
            myInfo: '',
            successMessage: 'Logout Successfull',

        }
    }


    return state;
}
