// src/app/recipe/recipe.actions.ts
import { Action } from '@ngrx/store';
import { RecipeId } from './recipe.model';

/*
Este archivo contiene las acciones posibles para recipe.
La nomenclatura para las acciones sigue la convención [parte] Acción
*/

// Constantes que representan las acciones posibles sobre recipe
export const RECIPE_START_SYNCING = '[Recipes] Start Sync Recipes'; // Acción que representa el inicio de la sincronización con de todos los cambios en de Firebase.
export const RECIPE_SYNCED = '[Recipes] Synced Recipes'; // Acción que representa la sincronización con de todos los cambios en de Firebase.
export const RECIPE_ERROR_SYNC = '[Recipes] Error Synced Recipes'; // Acción que representa el error en la sincronización con de todos los cambios en de Firebase.
export const RECIPE_START_LOADING = '[Recipes] Start Loading from Firebase'; // Inicio de una consulta en Firebase
export const RECIPE_STOP_LOADING = '[Recipes] Stop Loading from Firebase'; // Recibida respuesta o error de Firebase.
export const RECIPE_ERROR = '[Recipes] Error'; // Posible error recibido de Firebase.
// AngularFire2 StateChanges
export const RECIPE_ADDED = '[Recipes] Recipe added'; // Se añade una nueva receta.
export const RECIPE_MODIFIED = '[Recipes] Recipe modified'; // Se modifica una receta existente.
export const RECIPE_REMOVED = '[Recipes] Recipe removed'; // Se elimina una receta.
export const RECIPE_SELECTED = '[Recipes] Recipe selected'; // Se selecciona una receta para ver o editar.
export const NO_RECIPE_SELECTED = '[Recipes] No Recipe selected'; // Se selecciona una receta para ver o editar.

/*
Clases que implementan Action de ngrx.
Cuando se lance una acción, se hará creando una nueva instancia de una de estas clases y pasando como argumento los datos que
modifiquen el estado.
*/

// Recibir todos las recetas de Firebase.
export class RecipeStartSyncing implements Action {
    readonly type = RECIPE_START_SYNCING; // Tipo de la acción.
    constructor() {}
}

// Recibir todos las recetas de Firebase.
export class RecipeSynced implements Action {
    readonly type = RECIPE_SYNCED; // Tipo de la acción.
    constructor() {}
}

// Recibir todos las recetas de Firebase.
export class RecipeErrorSync implements Action {
    readonly type = RECIPE_ERROR_SYNC; // Tipo de la acción.
    constructor(public payload: String) {} // Mensaje de error.
}

export class RecipeStartLoading implements Action {
    readonly type = RECIPE_START_LOADING; // Tipo de la acción.
    constructor() {}
}

export class RecipeStopLoading implements Action {
    readonly type = RECIPE_STOP_LOADING; // Tipo de la acción.
    constructor() {}
}

export class RecipeError implements Action {
    readonly type = RECIPE_ERROR; // Tipo de la acción.
    constructor(public payload: String) {} // Mensaje de error.
}

// AngularFire2 StateChanges
export class Added implements Action {
    readonly type = RECIPE_ADDED; // Tipo de la acción.
    constructor(public payload: RecipeId) {} // Receta añadida en Firebase.
}

export class Modified implements Action {
    readonly type = RECIPE_MODIFIED; // Tipo de la acción.
    constructor(public payload: RecipeId) {} // Receta modificada en Firebase.
}

export class Removed implements Action {
    readonly type = RECIPE_REMOVED; // Tipo de la acción.
    constructor(public payload: RecipeId) {} // Receta borrada en Firebase.
}

export class RecipeSelected implements Action {
    readonly type = RECIPE_SELECTED; // Tipo de la acción.
    constructor(public payload: RecipeId) {} // Receta seleccionada.
}

export class NoRecipeSelected implements Action {
    readonly type = NO_RECIPE_SELECTED; // Tipo de la acción.
    constructor() {} // Receta seleccionada.
}

// Se exportan todas las acciones juntas para poder usarlas en otras clases.
export type RecipeActions =
    | RecipeStartSyncing
    | RecipeSynced
    | RecipeErrorSync
    | RecipeStartLoading
    | RecipeStopLoading
    | RecipeError
    | RecipeSelected
    | NoRecipeSelected
    | Added
    | Modified
    | Removed;
