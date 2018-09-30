// src/app/auth/auth.reducer.ts
// Función reducer que modifica el store de la parte auth (Autenticación, si el usuario esta logueado).
// Se utilizará en las vistas para mostrar un spinner de progreso o mensajes de error/advertencia ante los cambios de estado.

import {
    AuthActions,
    SET_AUTHENTICATED,
    SET_UNAUTHENTICATED,
    LOGIN_ERROR,
    LOGOUT_ERROR,
    REGISTER_ERROR,
    REGISTER,
    LOGIN,
    GET_AUTHENTICATION,
    GET_AUTHENTICATION_ERROR
} from './auth.actions';
import { createFeatureSelector, createSelector } from '@ngrx/store'; // Se importan los tipos de acción posibles para este reducer

// Parte del central state relativo a la autenticación. Este se incluirá en el central state dentro de app.reducer.ts
export interface State {
    isAuthenticated: boolean;
    isLoading: boolean;
    uid: string;
    email: string;
    error?;
}
// Estado inicial de esta porción del store.
const initialState: State = {
    isAuthenticated: false, // Al arrancar la aplicación no está autenticado.
    isLoading: false, // Al arrancar la aplicación no está cargando.
    uid: null,
    email: null
};

/**
 * Función reducer para la parte de auth del central store que modificará esa parte del store relativa a la autenticación.
 * @param state: estado actual.
 * @param action: acción a realizar que modificará el estado.
 * @return: parte modificada del estado que se añadirá al store.
 */
export function authReducer(state = initialState, action: AuthActions) {
    // Se modifica el store en función del tipo de acción recibida.
    switch (action.type) {
        case SET_AUTHENTICATED: // El tipo de acción es '[Auth] Set Authenticated'
            return {
                isAuthenticated: true,
                isLoading: false,
                uid: action.payload.uid,
                email: action.payload.email
            }; // Se devuelve la porción del store que indica que se el usuario está logueado en Firebase.

        case SET_UNAUTHENTICATED: // El tipo de acción es '[Auth] Set Unauthenticated'
            return {
                isAuthenticated: false,
                isLoading: false,
                uid: null,
                email: null
            }; // Se devuelve la porción del store que indica el usuario no está logueado en Firebase.

        case LOGIN_ERROR:
        case REGISTER_ERROR:
        case GET_AUTHENTICATION_ERROR:
            return {
                isAuthenticated: false,
                isLoading: false,
                uid: null,
                email: null,
                error: action.payload
            }; // Se devuelve la porción del store que indica el usuario no está logueado en Firebase y el error.

        case LOGOUT_ERROR:
            return {
                ...state,
                isLoading: false,
                error: action.payload
            }; // Se devuelve el error y se indica que ha parado la carga.

        case LOGIN:
        case REGISTER:
        case GET_AUTHENTICATION:
            return {
                ...state,
                isLoading: true // Se indica que se inicia una operación asíncrona en Firebase. Estas acciones se manejan con efectos.
            };

        default:
            return state; // Para el resto de de acciones no se modifica el store.
    }
}

// Se crea un Feature Selector, el cual devuelve al ser invocado la parte del estado correspondiente a auth.
export const getAuthState = createFeatureSelector<State>('auth'); // Obtiene la porción del estado de la parte auth.

// Selector para obtener los elementos del estado.
// Al ejecutar estos selectores se obtiene un observable que devuelve los cambios en el estado.
export const getIsLoading = createSelector(
    getAuthState,
    (state: State) => state.isLoading
);
export const getEmail = createSelector(
    getAuthState,
    (state: State) => state.email
);
export const getUid = createSelector(getAuthState, (state: State) => state.uid);
export const getIsAuthenticated = createSelector(
    getAuthState,
    (state: State) => state.isAuthenticated
);
