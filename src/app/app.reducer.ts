// src/app/app.reducer.ts
import { ActionReducerMap } from '@ngrx/store';

import * as fromShoppingList from './shopping-list/shopping-list.reducer'; // Reducer de la parte shopping-list.
import * as fromRecipe from './recipe/recipe.reducer'; // Reducer de la parte recipe.
import * as fromAuth from './auth/auth.reducer'; // Reducer de la parte auth.
import {routerReducer} from '@ngrx/router-store'; // Reducer de la parte router.

// Reducers de la aplicación. El tipo ActionReducerMap es un map de todos los reducers de la aplicación.
export const reducers: ActionReducerMap<any> = {
    shoppingList: fromShoppingList.shoppingListReducer, // Función reducer de la parte shopping-list
    recipes: fromRecipe.recipeReducer, // Función reducer de la parte recipe
    auth: fromAuth.authReducer, // Reducer de la parte auth.
    router: routerReducer // Reducer para el router.
};
