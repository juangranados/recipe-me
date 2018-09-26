// src/app/app.reducer.ts
import {
    Action,
    ActionReducer,
    ActionReducerMap,
    MetaReducer
} from '@ngrx/store';

import * as fromShoppingList from './shopping-list/shopping-list.reducer'; // Reducer de la parte shopping-list.
import * as fromRecipe from './recipe/recipe.reducer'; // Reducer de la parte recipe.
import * as fromAuth from './auth/auth.reducer'; // Reducer de la parte auth.
import { routerReducer } from '@ngrx/router-store'; // Reducer de la parte router.

// Reducers de la aplicación. El tipo ActionReducerMap es un map de todos los reducers de la aplicación.
export const reducers: ActionReducerMap<any> = {
    shoppingList: fromShoppingList.shoppingListReducer, // Función reducer de la parte shopping-list
    recipes: fromRecipe.recipeReducer, // Función reducer de la parte recipe
    auth: fromAuth.authReducer, // Reducer de la parte auth.
    router: routerReducer // Reducer para el router.
};

// Función meta reducer que se ejecuta cada acción.
export function clearState(reducer: ActionReducer<any>): ActionReducer<any> {
    return function(state, action: Action) {
        // Cuando el usuario sale de sesión, se borra su estado.
        if (action.type === '[Auth] User Logout Successful') {
            state = {
                ...state,
                shoppingList: fromShoppingList.initialState,
                recipes: fromRecipe.initialState
            };
        }
        return reducer(state, action);
    };
}
// Se exportan los meta reducers para incluirlos en AppModule.
export const metaReducers: MetaReducer<any>[] = [clearState];
