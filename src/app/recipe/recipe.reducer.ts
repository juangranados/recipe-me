// src/app/recipe/recipe-list/recipe.reducer.ts
import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createFeatureSelector, createSelector } from '@ngrx/store';

import { RecipeId } from './recipe.model'; // Modelo de receta.
import * as actions from './recipe.actions'; // Acciones posibles.

/*
Este archivo contiene la parte del estado correspondiente a recipes y
la función reducer que modificará el estado en función de la acción ejecutada.
El estado se modifica generando un nuevo estado para que ngrx guarde un histórico de los estados
por los que pasa la aplicación.
*/

// Creación del Entity Adapter que representa el estado de recipes.
export const recipeAdapter = createEntityAdapter<RecipeId>();
export interface State extends EntityState<RecipeId> {
    // Al heredar EntityState tendrá dos propiedades mas:
    // ids: array de los ids de las recetas. Los ids son los mismos que tiene en Cloud Firestore.
    // entities: variable de tipo diccionario de recetas.
    isLoading: boolean; // Indica que los datos se están recibiendo para mostrar un spinner en la pantalla.
    isSynced: boolean; // Indica que esta sincronizado el store con Firebase
    recipeSelected: RecipeId; // Indica la receta seleccionada para ver o editar.
    error?: String; // Mensaje de error.
}

// Definición de estado inicial. No es necesario especificar el Entity Adapter ya que lo genera automáticamente.
export const initialState: State = recipeAdapter.getInitialState({
    isLoading: false,
    isSynced: false,
    recipeSelected: null
});

/**
 * Función reducer que modifica el estado de la parte recipes en función de la acción recibida.
 * Los argumentos los pasa automáticamente ngrx a la función reducer al ejecutarse una acción.
 * @param state: estado actual de la aplicación, por defecto recibe el estado inicial al inicio.
 * @param action: acción realizada.
 * @return: nuevo estado modificado o estado existente en el caso de que la acción no lo modifique.
 */
export function recipeReducer(
    state = initialState,
    action: actions.RecipeActions
) {
    // En función del tipo de acción recibida se cambia el estado.
    switch (action.type) {
        case actions.RECIPE_SYNCED: // Las recetas están sincronizadas con Firebase.
            return { ...state, isSynced: true };

        case actions.RECIPE_ERROR_SYNC: // Error de sincronización.
            return {
                ...state,
                isLoading: false,
                error: action.payload,
                isSynced: false
            };

        case actions.RECIPE_STOP_SYNCING: // Se para la sincronización de las recetas con Firebase debido a la destrucción del componente.
            return initialState;

        case actions.RECIPE_START_LOADING: // Inicio de una operación asíncrona en Firebase.
            return { ...state, isLoading: true };

        case actions.RECIPE_STOP_LOADING: // Finalización de una operación asíncrona en Firebase.
            return { ...state, isLoading: false };

        case actions.RECIPE_ERROR: // Firebase devuelve un mensaje de error.
            return { ...state, isLoading: false, error: action.payload };

        case actions.RECIPE_SELECTED: // El usuario selecciona una receta para ver o editar
            return { ...state, recipeSelected: action.payload };

        case actions.NO_RECIPE_SELECTED: // El usuario no ha seleccionado todavía una receta para ver o editar
            return { ...state, recipeSelected: null };

        case actions.RECIPE_ADDED: // Se añade una receta mediante la función addOne de EntityState.
            return recipeAdapter.addOne(action.payload, {
                // Se genera un objeto representando el nuevo estado para borrar el campo error (de tenerlo).
                ids: state.ids,
                entities: state.entities,
                isLoading: state.isLoading,
                isSynced: state.isSynced,
                recipeSelected: state.recipeSelected
            });

        case actions.RECIPE_MODIFIED: // Se añade una receta mediante la función updateOne de EntityState.
            return recipeAdapter.updateOne(
                {
                    // Se genera un objeto representando el nuevo estado para borrar el campo error (de tenerlo).
                    id: action.payload.id,
                    changes: action.payload
                },
                {
                    ids: state.ids,
                    entities: state.entities,
                    isLoading: state.isLoading,
                    isSynced: state.isSynced,
                    recipeSelected: state.recipeSelected
                }
            );

        case actions.RECIPE_REMOVED: // Se borra una receta mediante la función removeOne de EntityState.
            return recipeAdapter.removeOne(action.payload.id, {
                // Se genera un objeto representando el nuevo estado para borrar el campo error (de tenerlo).
                ids: state.ids,
                entities: state.entities,
                isLoading: state.isLoading,
                isSynced: state.isSynced,
                recipeSelected: state.recipeSelected
            });
        // Para acciones que no modifican el estado se devuelve sin modificar.
        default:
            return state;
    }
}

// Se crea un Feature Selector, el cual devuelve al ser invocado la parte del estado correspondiente a recipes
export const getRecipeState = createFeatureSelector<State>('recipes');

// Se crean los selectores por defecto del entity adapter, éstos permitirán obtener un observable que devolverá los elementos
// del estado de recipe mediante suscripción.
export const {
    selectIds,
    selectEntities,
    selectAll,
    selectTotal
} = recipeAdapter.getSelectors(getRecipeState);

// Se crean los selectores para el resto de propiedades de esta parte del estado.
// Al ejecutar estos selectores se obtiene un observable que devuelve los cambios en el estado.
export const getError = createSelector(
    getRecipeState,
    (state: State) => state.error
); // Selector de error.
export const getIsLoading = createSelector(
    getRecipeState,
    (state: State) => state.isLoading
); // Selector de isLoading
export const getIsSynced = createSelector(
    getRecipeState,
    (state: State) => state.isSynced
); // Selector de isSynced
export const getStatus = createSelector(getRecipeState, (state: State) => {
    return { isSynced: state.isSynced, isLoading: state.isLoading };
}); // Selector de isSynced e isLoading
export const getRecipeSelected = createSelector(
    getRecipeState,
    (state: State) => state.recipeSelected
); // Selector de recipeSelected
export const getRecipeSelectedIngredients = createSelector(
    getRecipeState,
    (state: State) => state.recipeSelected.ingredients
); // Selector de recipeSelected
// Selector de un elemento por id.
export const getRecipeById = id =>
    createSelector(selectEntities, entities => entities[id]);
