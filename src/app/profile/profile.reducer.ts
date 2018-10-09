// Estado de profile
import {
    ERROR_GETTING_PROFILE_DATA,
    ERROR_SETTING_PROFILE_DATA,
    START_SYNC_PROFILE_DATA,
    ProfileActions,
    SET_PROFILE_DATA,
    STORE_PROFILE_DATA,
    SYNCED_PROFILE_DATA,
    OK_SETTING_PROFILE_DATA,
    STOP_SYNC_PROFILE_DATA
} from './profile.actions';
import { createFeatureSelector, createSelector } from '@ngrx/store';

export interface State {
    name: string;
    surname: string;
    birthDate: string;
    profileImage: string;
    isSynced: boolean;
    isLoading: boolean;
    error?;
}
// Estado inicial
export const initialState: State = {
    name: null,
    surname: null,
    birthDate: null,
    profileImage: 'default/profile/profile.png',
    isLoading: false,
    isSynced: false
};

/**
 * Función reducer para la parte de auth del central store que modificará esa parte del store relativa a la autenticación.
 * @param state: estado actual.
 * @param action: acción a realizar que modificará el estado.
 * @return: parte modificada del estado que se añadirá al store.
 */
export function profileReducer(state = initialState, action: ProfileActions) {
    // Se modifica el store en función del tipo de acción recibida.
    switch (action.type) {
        case START_SYNC_PROFILE_DATA:
            return {
                ...state,
                isLoading: true
            };

        case STOP_SYNC_PROFILE_DATA:
            return initialState;

        case SYNCED_PROFILE_DATA:
            return {
                ...state,
                isSynced: true
            };

        case SET_PROFILE_DATA:
            return {
                ...state,
                isLoading: true
            };

        case OK_SETTING_PROFILE_DATA:
            return {
                ...state,
                isLoading: false
            };

        case STORE_PROFILE_DATA:
            return {
                ...state,
                name: action.payload.name,
                surname: action.payload.surname,
                birthDate: action.payload.birthDate,
                profileImage: action.payload.profileImage,
                isLoading: false
            };

        case ERROR_SETTING_PROFILE_DATA:
        case ERROR_GETTING_PROFILE_DATA:
            return {
                ...state,
                isLoading: false,
                isSynced: false,
                error: action.payload
            };

        default:
            return state; // Para el resto de de acciones no se modifica el store.
    }
}

// Se crea un Feature Selector, el cual devuelve al ser invocado la parte del estado correspondiente a recipes
export const getProfileState = createFeatureSelector<State>('profile');

// Se crean los selectores para el resto de propiedades de esta parte del estado.
// Al ejecutar estos selectores se obtiene un observable que devuelve los cambios en el estado.
export const getIsLoading = createSelector(
    getProfileState,
    (state: State) => state.isLoading
); // Selector de isLoading

export const getIsSynced = createSelector(
    getProfileState,
    (state: State) => state.isSynced
); // Selector de isLoading

export const getStatus = createSelector(getProfileState, (state: State) => {
    return { isSynced: state.isSynced, isLoading: state.isLoading };
});
// Selector de isLoading y isSynced

export const getProfile = createSelector(getProfileState, (state: State) => {
    return {
        name: state.name,
        surname: state.surname,
        birthDate: state.birthDate,
        profileImage: state.profileImage
    };
});
