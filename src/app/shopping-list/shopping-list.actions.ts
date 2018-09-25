// src/app/shopping-list/shopping-list.actions.ts
import {Action} from '@ngrx/store';
import {IngredientId} from '../shared/ingredient.model';

/*
Este archivo contiene las acciones posibles para shopping-list.
La nomenclatura para las acciones sigue la convención [parte] Acción
*/

// Constantes de tipo String que representan las acciones posibles sobre shopping-list.
export const SHOPPING_LIST_SYNC = '[Shopping List] Sync Shopping List'; // Acción que representa la recepción de todos los ingredientes de Firebase.
export const SHOPPING_LIST_START_LOADING = '[Shopping List] Start Loading from Firebase'; // Inicio de una consulta en Firebase
export const SHOPPING_LIST_STOP_LOADING = '[Shopping List] Stop Loading from Firebase'; // Recibida respuesta o error de Firebase.
export const SHOPPING_LIST_ERROR = '[Shopping List] Error'; // Posible error recibido de Firebase.
// AngularFire2 StateChanges
export const INGREDIENT_ADDED    = '[Shopping List] Ingredient added'; // Se añade un nuevo ingrediente.
export const INGREDIENT_MODIFIED = '[Shopping List] Ingredient modified'; // Se modifica un ingrediente existente.
export const INGREDIENT_REMOVED  = '[Shopping List] Ingredient removed'; // Se elimina un ingrediente.

/*
Clases que implementan Action de ngrx.
Cuando se lance una acción, se hará creando una nueva instancia de una de estas clases y pasando como argumento los datos que
modifiquen el estado.
*/
export class ShoppingListSync implements Action {
    readonly type = SHOPPING_LIST_SYNC; // Tipo de la acción.
    constructor() {}
}

export class ShoppingListStartLoading implements Action {
    readonly type = SHOPPING_LIST_START_LOADING; // Tipo de la acción.
    constructor() {}
}

export class ShoppingListStopLoading implements Action {
    readonly type = SHOPPING_LIST_STOP_LOADING; // Tipo de la acción.
    constructor() {}
}

export class ShoppingListError implements Action {
    readonly type = SHOPPING_LIST_ERROR; // Tipo de la acción.
    constructor(public payload: String) {} // Mensaje de error.
}

// AngularFire2 StateChanges
export class Added implements Action {
    readonly type = INGREDIENT_ADDED; // Tipo de la acción.
    constructor(public payload: IngredientId) {} // Ingrediente añadido en Firebase.
}

export class Modified implements Action {
    readonly type = INGREDIENT_MODIFIED;
    constructor(public payload: IngredientId) {} // Ingrediente modificado en Firebase.
}

export class Removed implements Action {
    readonly type = INGREDIENT_REMOVED; // Tipo de la acción.
    constructor(public payload: IngredientId) {} // Ingrediente borrado de Firebase.
}

// Se exportan todas las acciones juntas para poder usarlas en otras clases.
export type ShoppingListActions =
    ShoppingListSync | ShoppingListStopLoading | ShoppingListStartLoading | ShoppingListError
    | Added | Modified | Removed;
