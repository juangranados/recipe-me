// recipe.model.ts
import { Ingredient } from '../shared/ingredient.model';

/**
 * Interface que representa una receta.
 */
export interface Recipe {
  recipeName: string;
  recipeDescription: string;
  recipeInstructions: string;
  recipeImagePath: string;
  ingredients: Ingredient[];
}
export interface RecipeId extends Recipe {
  id: string;
}
