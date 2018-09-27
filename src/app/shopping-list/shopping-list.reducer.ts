// src/app/shopping-list/shopping-list.reducer.ts
import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createFeatureSelector, createSelector } from '@ngrx/store';

import { IngredientId } from '../shared/ingredient.model'; // Modelo de ingrediente.
import * as actions from './shopping-list.actions'; // Acciones posibles.

/*
Este archivo contiene la parte del estado correspondiente a shopping-list y
la función reducer que modificará el estado en función de la acción ejecutada.
El estado se modifica generando un nuevo estado para que ngrx guarde un histórico de los estados
por los que pasa la aplicación.
*/

// Creación del Entity adapter que representa el estado de la shopping list
export const shoppingListAdapter = createEntityAdapter<IngredientId>();
export interface State extends EntityState<IngredientId> {
    // Al heredar EntityState tendrá dos propiedades mas:
    // ids: array de los ids de los ingredientes. Los ids son los mismos que tiene en Cloud Firestore.
    // entities: variable de tipo diccionario de ingredientes.
    isLoading: boolean; // Indica que los datos se están recibiendo para mostrar un spinner en la pantalla.
    error?: String; // Código de error.
}

// Definición de estado inicial.
// Sólo es necesario especificar el campo isLoading.
export const initialState: State = shoppingListAdapter.getInitialState({
    isLoading: false
});

/**
 * Función reducer que modifica el estado de la parte shopping list en función de la acción recibida.
 * Los argumentos los pasa automáticamente ngrx a la función reducer ejecutarse una acción.
 * @param state: estado actual de la aplicación, por defecto recibe el estado inicial al inicio.
 * @param action: acción realizada.
 * @return: nuevo estado modificado o estado existente en el caso de que la acción no lo modifique.
 */
export function shoppingListReducer(
    state = initialState,
    action: actions.ShoppingListActions
) {
    // En función del tipo de acción recibida se cambia el estado.
    switch (action.type) {
        case actions.SHOPPING_LIST_START_LOADING: // Inicio de una operación asíncrona en Firebase.
            return { ...state, isLoading: true };

        case actions.SHOPPING_LIST_STOP_LOADING: // Finalización de una operación asíncrona en Firebase.
            return { ...state, isLoading: false };

        case actions.SHOPPING_LIST_ERROR: // Firebase devuelve un mensaje de error.
            return { ...state, isLoading: false, error: action.payload };

        // Estas tres acciones se lanzan mediante el efecto que se ejecuta al lanzar la acción SHOPPING_LIST_SYNC desde shopping-list.effects.ts.

        case actions.INGREDIENT_ADDED: // Se añade un ingrediente mediante la función addOne de EntityState.
            return shoppingListAdapter.addOne(action.payload, {
                // Se genera un objeto representando el nuevo estado para borrar el campo error (de tenerlo).
                ids: state.ids,
                entities: state.entities,
                isLoading: state.isLoading
            });

        case actions.INGREDIENT_MODIFIED: // Se modifica un ingrediente mediante la función updateOne de EntityState.
            return shoppingListAdapter.updateOne(
                {
                    // Se genera un objeto representando el nuevo estado para borrar el campo error (de tenerlo).
                    id: action.payload.id,
                    changes: action.payload
                },
                {
                    ids: state.ids,
                    entities: state.entities,
                    isLoading: state.isLoading
                }
            );

        case actions.INGREDIENT_REMOVED: // Se borra un ingrediente mediante la función removeOne de EntityState.
            return shoppingListAdapter.removeOne(action.payload.id, {
                // Se genera un objeto representando el nuevo estado para borrar el campo error (de tenerlo).
                ids: state.ids,
                entities: state.entities,
                isLoading: state.isLoading
            });
        // Para acciones que no modifican el estado.
        default:
            return state;
    }
}

// Se crea un Feature Selector, el cual devuelve al ser invocado la parte del estado correspondiente a shoppingList.
export const getShoppingListState = createFeatureSelector<State>(
    'shoppingList'
);

// Se crean los selectors por defecto del entity adapter, éstos permitirán obtener un observable que devolverá los elementos
// del estado de la shopping-list mediante suscripción.

export const {
    selectIds,
    selectEntities,
    selectAll,
    selectTotal
} = shoppingListAdapter.getSelectors(getShoppingListState);

// Se crean los selectores para el resto de propiedades de esta parte del estado.
// Al ejecutar estos selectores se obtiene un observable que devuelve los cambios en el estado.
export const getError = createSelector(
    getShoppingListState,
    (state: State) => state.error
); // Selector de error.
export const getIsLoading = createSelector(
    getShoppingListState,
    (state: State) => state.isLoading
); // Selector de isLoading
export const getIngredientById = id =>
    createSelector(selectEntities, entities => entities[id]);
