// Estado de profile
import {
    ERROR_GETTING_PROFILE_DATA,
    ERROR_SETTING_PROFILE_DATA,
    GET_PROFILE_DATA,
    ProfileActions,
    SET_PROFILE_DATA,
    STORE_PROFILE_DATA
} from './profile.actions';

export interface State {
    name: string;
    surname: string;
    birthDate: string;
    profileImage: string;
    isLoading: boolean;
    error?;
}
// Estado inicial
export const initialState: State = {
    name: null,
    surname: null,
    birthDate: null,
    profileImage: '/default/profile/profile',
    isLoading: false
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
        case GET_PROFILE_DATA:
            return {
                ...state,
                isLoading: true
            };
        case SET_PROFILE_DATA:
            return {
                ...state,
                isLoading: true
            };
        case STORE_PROFILE_DATA:
            return {
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
                error: action.payload
            };
        default:
            return state; // Para el resto de de acciones no se modifica el store.
    }
}
