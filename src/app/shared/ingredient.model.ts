// src/app/recipe/shared/ingredient.model.ts
export enum Units {
    gr,
    kg,
    ml,
    cl,
    l,
    ud
}
export interface Ingredient {
    ingredientName: string;
    ingredientAmount: number;
    ingredientUnit: Units;
}
export interface IngredientId extends Ingredient {
    id: string;
}
export function addIngredient(
    source: IngredientId,
    destination: Ingredient
): Ingredient {
    return {
        ingredientName: source.ingredientName,
        ingredientAmount:
            Number(source.ingredientAmount) +
            Number(destination.ingredientAmount),
        ingredientUnit: source.ingredientUnit
    };
}
