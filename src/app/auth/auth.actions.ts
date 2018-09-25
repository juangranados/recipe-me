// src/app/auth/auth.actions.ts
// Archivo que contiene las acciones posibles para el reducer que modifica la parte auth (autenticación) del store.
import { Action } from '@ngrx/store';
import { UserLoginModel, UserModel, UserRegisterModel } from './auth.model';

// 1.- Se definen las constantes que representan las acciones. Se sigue nomenclatura const NOMBRE_ACCIÓN = '[REDUCER] Nombre Acción'
export const SET_AUTHENTICATED = '[Auth] Set Authenticated'; // Usuario autenticado correctamente.
export const SET_UNAUTHENTICATED = '[Auth] Set Unauthenticated'; // Usuario unautenticado correctamente.
export const LOGIN = '[Auth] User Try Login'; // Intento de login.
export const LOGOUT = '[Auth] User Try Logout'; // Intento de logout.
export const REGISTER = '[Auth] User Try Register'; // Intento de registro.
export const LOGIN_SUCESSFUL = '[Auth] User Login Successful'; // Login correcto.
export const LOGOUT_SUCESSFUL = '[Auth] User Logout Successful'; // Logout correcto.
export const REGISTER_SUCESSFUL = '[Auth] User Register Successful'; // Registro correcto.
export const LOGIN_ERROR = '[Auth] User Login Error'; // Error al intentar el login.
export const LOGOUT_ERROR = '[Auth] User Logout Error'; // Error al intentar el logout.
export const REGISTER_ERROR = '[Auth] User Register Error'; // Error al intentar el registro.
export const GET_AUTHENTICATION = '[Auth] Get Authentication'; // Obtener el estado de la autenticación.
export const GET_AUTHENTICATION_ERROR = '[Auth] Get Authentication Error'; // Error al obtener el estado de la autenticación.

// 2.-  Se exportan las acciones como clases para poder lanzar acciones invocándolas.
export class SetAuthenticated implements Action {
    readonly type = SET_AUTHENTICATED;
    constructor(public payload: UserModel) {} // Datos del usuario autenticado en Firebase.
}
export class SetUnauthenticated implements Action {
    readonly type = SET_UNAUTHENTICATED;
}

export class Login implements Action {
    readonly type = LOGIN;
    constructor(public payload: UserLoginModel) {} // Datos de acceso.
}

export class Logout implements Action {
    readonly type = LOGOUT;
}

export class Register implements Action {
    readonly type = REGISTER;
    constructor(public payload: UserRegisterModel) {} // Datos de registro.
}

export class LoginSuccessful implements Action {
    readonly type = LOGIN_SUCESSFUL;
}

export class LogoutSuccessful implements Action {
    readonly type = LOGOUT_SUCESSFUL;
}

export class RegisterSuccessful implements Action {
    readonly type = REGISTER_SUCESSFUL;
}

export class LoginError implements Action {
    readonly type = LOGIN_ERROR;
    constructor(public payload: string) {} // Mensaje de error.
}

export class LogoutError implements Action {
    readonly type = LOGOUT_ERROR;
    constructor(public payload: string) {} // Mensaje de error.
}

export class RegisterError implements Action {
    readonly type = REGISTER_ERROR;
    constructor(public payload: string) {} // Mensaje de error.
}

export class GetAuthentication implements Action {
    readonly type = GET_AUTHENTICATION;
}

export class GetAuthenticationError implements Action {
    readonly type = GET_AUTHENTICATION_ERROR;
    constructor(public payload: string) {} // Mensaje de error.
}

// 3.- Se exporta un tipo que puede ser de una de las clases definidas anteriormente.
export type AuthActions =
    | SetAuthenticated
    | SetUnauthenticated
    | GetAuthentication
    | GetAuthenticationError
    | Login
    | Logout
    | Register
    | LoginSuccessful
    | LogoutSuccessful
    | RegisterSuccessful
    | LoginError
    | LogoutError
    | RegisterError;
