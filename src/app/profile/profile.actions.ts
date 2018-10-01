// 1.- Se definen las constantes que representan las acciones. Se sigue nomenclatura const NOMBRE_ACCIÓN = '[REDUCER] Nombre Acción'
import { Action } from '@ngrx/store';
import { ProfileModel } from './profile.model';

export const SYNC_PROFILE_DATA = '[Profile] Sync Profile Data'; // Obtener datos del usuario de Firebase.
export const SYNCED_PROFILE_DATA = '[Profile] Synced Profile Data'; // Los datos del usuario de Firebase están sincronizados con el store.
export const SET_PROFILE_DATA = '[Profile] Set Profile Data'; // Guardar datos del usuario en Firebase.
export const STORE_PROFILE_DATA = '[Profile] Store Profile Data'; // Guardar datos del usuario en el state.
export const ERROR_GETTING_PROFILE_DATA =
    '[Profile] Error Getting Profile Data'; // Error al obtener datos del usuario
export const ERROR_SETTING_PROFILE_DATA =
    '[Profile] Error Setting Profile Data'; // Error al guardar datos del usuario

// 2.-  Se exportan las acciones como clases para poder lanzar acciones invocándolas.
export class SyncProfileData implements Action {
    readonly type = SYNC_PROFILE_DATA;
    constructor() {}
}
export class SyncedProfileData implements Action {
    readonly type = SYNCED_PROFILE_DATA;
    constructor() {}
}
export class SetProfileData implements Action {
    readonly type = SET_PROFILE_DATA;
    constructor(public payload: ProfileModel) {}
}
export class StoreProfileData implements Action {
    readonly type = STORE_PROFILE_DATA;
    constructor(public payload: ProfileModel) {}
}
export class ErrorGettingProfileData {
    readonly type = ERROR_GETTING_PROFILE_DATA;
    constructor(public payload: string) {}
}
export class ErrorSettingProfileData {
    readonly type = ERROR_SETTING_PROFILE_DATA;
    constructor(public payload: string) {}
}
// 3.- Se exporta un tipo que puede ser de una de las clases definidas anteriormente.
export type ProfileActions =
    | SyncProfileData
    | SyncedProfileData
    | SetProfileData
    | StoreProfileData
    | ErrorGettingProfileData
    | ErrorSettingProfileData;
