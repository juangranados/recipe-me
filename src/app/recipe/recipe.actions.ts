// src/app/recipe/recipe.actions.ts
import { Action } from '@ngrx/store';
import { RecipeId } from './recipe.model';

/*
Este archivo contiene las acciones posibles para recipe.
La nomenclatura para las acciones sigue la convención [parte] Acción
*/

// Constantes que representan las acciones posibles sobre recipe
export const RECIPE_START_SYNCING = '[Recipes] Start Sync Recipes'; // Acción que representa el inicio de la sincronización de todos los cambios con Firebase.
export const RECIPE_STOP_SYNCING = '[Recipes] Stop Sync Recipes'; // Acción que representa el paro de la sincronización de todos los cambios en de Firebase debido a la destrucción del componente.
export const RECIPE_SYNCED = '[Recipes] Synced Recipes'; // Acción que representa que ya se ha iniciado la sincronización con Firebase y las recetas están sincronizadas con el state.
export const RECIPE_ERROR_SYNC = '[Recipes] Error Synced Recipes'; // Acción que representa el error en la sincronización con Firebase.
export const RECIPE_START_LOADING = '[Recipes] Start Loading from Firebase'; // Inicio de una consulta en Firebase para mostrar en la vista un spinner.
export const RECIPE_STOP_LOADING = '[Recipes] Stop Loading from Firebase'; // Recibida respuesta o error de Firebase para dejar de mostrar en la vista un spinner.
export const RECIPE_ERROR = '[Recipes] Error'; // Error recibido de Firebase.
export const RECIPE_SELECTED = '[Recipes] Recipe selected'; // Se selecciona una receta para ver o editar.
export const NO_RECIPE_SELECTED = '[Recipes] No Recipe selected'; // No hay seleccionada una receta para ver o editar.

// AngularFire2 StateChanges: acciones que devuelve Firebase en función de las operaciones que se hagan sobre la colección.
export const RECIPE_ADDED = '[Recipes] Recipe added'; // Se añade una nueva receta.
export const RECIPE_MODIFIED = '[Recipes] Recipe modified'; // Se modifica una receta existente.
export const RECIPE_REMOVED = '[Recipes] Recipe removed'; // Se elimina una receta.

/*
Clases que implementan Action de ngrx.
Cuando se lance una acción, se hará creando una nueva instancia de una de estas clases y pasando como argumento los datos que
modifiquen el estado.
*/

// Inicio de la sincronización de todos los cambios en la colección de recetas con Firebase.
export class RecipeStartSyncing implements Action {
    readonly type = RECIPE_START_SYNCING; // Tipo de la acción.
    constructor() {}
}

// Parar la sincronización con Firebase.
export class RecipeStopSyncing implements Action {
    readonly type = RECIPE_STOP_SYNCING; // Tipo de la acción.
    constructor() {}
}

// Se han sincronizado las recetas del state con Firebase.
export class RecipeSynced implements Action {
    readonly type = RECIPE_SYNCED; // Tipo de la acción.
    constructor() {}
}

// Se ha producido un error en la sincronización con Firebase.
export class RecipeErrorSync implements Action {
    readonly type = RECIPE_ERROR_SYNC; // Tipo de la acción.
    constructor(public payload: String) {} // Mensaje de error.
}

// Inicio de una operación asíncrona con Firebase.
export class RecipeStartLoading implements Action {
    readonly type = RECIPE_START_LOADING; // Tipo de la acción.
    constructor() {}
}

// Se recibe la respuesta de una operación asíncrona con Firebase.
export class RecipeStopLoading implements Action {
    readonly type = RECIPE_STOP_LOADING; // Tipo de la acción.
    constructor() {}
}

// Se ha producido un error al realizar una operación en colección de recetas en Firebase.
export class RecipeError implements Action {
    readonly type = RECIPE_ERROR; // Tipo de la acción.
    constructor(public payload: String) {} // Mensaje de error.
}

// Se selecciona una receta para ver o editar.
export class RecipeSelected implements Action {
    readonly type = RECIPE_SELECTED; // Tipo de la acción.
    constructor(public payload: RecipeId) {} // Receta seleccionada.
}

// No hay seleccionada una receta para ver o editar.
export class NoRecipeSelected implements Action {
    readonly type = NO_RECIPE_SELECTED; // Tipo de la acción.
    constructor() {} // Receta seleccionada.
}

// AngularFire2 StateChanges: acciones que devuelve Firebase en función de las operaciones que se hagan sobre la colección.
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

// Se exportan todas las acciones juntas para poder usarlas en otras clases.
export type RecipeActions =
    | RecipeStartSyncing
    | RecipeStopSyncing
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
