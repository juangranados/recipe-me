import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import {
  CloudFirestoreService,
  States
} from '../../shared/cloud-firestore.service';
import { RecipeId } from '../recipe.model';
import * as fromRecipe from '../recipe.reducer';
import { select, Store } from '@ngrx/store';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-recipe-edit',
  templateUrl: './recipe-edit.component.html',
  styleUrls: ['./recipe-edit.component.css']
})
export class RecipeEditComponent implements OnInit {
  // Path de Cloud Firestore donde se almacena la lista de la recetas.
  cloudFirestorePath = 'recipes';

  // Propiedad de la interfaz que identifica unívocamente a la receta.
  cloudFirestoreFieldPath = 'recipeName';

  // Modo de edición o de nueva receta
  editMode = false;

  // Valores para las unidades
  units = ['gr', 'kg', 'ml', 'cl', 'l', 'ud'];

  // Formulario
  recipeForm: FormGroup;

  recipe: RecipeId;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private cloudFirestoreService: CloudFirestoreService,
    private store: Store<fromRecipe.State>
  ) {}

  ngOnInit() {
    // Almacenar la receta
    this.store
      .pipe(select(fromRecipe.getRecipeSelected))
      .pipe(take(1))
      .subscribe(recipe => {
        if (recipe) {
          this.recipe = recipe;
          this.editMode = true;
        } else {
          this.editMode = false;
        }
        this.initForm();
      });
  }

  /**
   * Inicialización del objeto formulario en función de si se está editando o no.
   */
  private initForm() {
    // Variables para almacenar los atributos de la receta en el caso de edición.
    let recipeName = '';
    let recipeImagePath = '';
    let recipeDescription = '';
    let recipeInstructions = '';
    // Array de controles de formulario que contendrá los ingredientes.
    // Como no se sabe su número se inicializa el array vacío y se irán añadiendo después.
    const ingredients = new FormArray([]);

    // Se está en modo edición
    if (this.editMode) {
      recipeName = this.recipe.recipeName;
      recipeImagePath = this.recipe.recipeImagePath;
      recipeDescription = this.recipe.recipeDescription;
      recipeInstructions = this.recipe.recipeInstructions;
      // Cargar ingredientes
      if (this.recipe.ingredients) {
        for (const ingredient of this.recipe.ingredients) {
          // Se cargan todos los ingredientes como FormControl en un FormGroup.
          ingredients.push(
            new FormGroup({
              ingredientName: new FormControl(
                ingredient.ingredientName,
                Validators.required
              ),
              ingredientAmount: new FormControl(ingredient.ingredientAmount, [
                Validators.required,
                Validators.min(0),
                Validators.max(10000)
              ]),
              ingredientUnit: new FormControl(
                ingredient.ingredientUnit,
                Validators.required
              )
            })
          );
        }
      }
    }
    // Se asignan los valores al formulario
    this.recipeForm = new FormGroup({
      recipeName: new FormControl(recipeName, Validators.required),
      recipeDescription: new FormControl(
        recipeDescription,
        Validators.required
      ),
      recipeInstructions: new FormControl(
        recipeInstructions,
        Validators.required
      ),
      recipeImagePath: new FormControl(recipeImagePath, Validators.required),
      ingredients: ingredients
    });
  }

  /**
   * Añadir un nuevo control para un ingrediente en el formulario
   */
  onAddIngredient() {
    (<FormArray>this.recipeForm.get('ingredients')).push(
      new FormGroup({
        ingredientName: new FormControl(null, Validators.required),
        ingredientAmount: new FormControl(null, Validators.required),
        ingredientUnit: new FormControl(null, Validators.required)
      })
    );
  }
  /**
   * Envío del formulario
   */
  onSubmit() {
    // Se comprueba si se está creando una receta nueva o modificando una existente.
    if (this.editMode) {
      // Como el objeto que representa el formulario tiene exactamente el mismo tipo que la clase Recipe,
      // se puede agregar directamente recipeForm.value como una receta al array de RecipeService.
      this.cloudFirestoreService.editElement(
        this.recipe.id,
        this.recipeForm.value,
        this.cloudFirestorePath,
        States.Recipes
      );
      // Se navega de vuelta a la receta
      this.router.navigate(['/recipes'], {
        relativeTo: this.activatedRoute
      });
    } else {
      this.cloudFirestoreService.addElementCheckingIfExists(
        this.recipeForm.value,
        this.cloudFirestorePath,
        this.cloudFirestoreFieldPath,
        States.Recipes
      );
      this.router.navigate(['/recipes']);
    }
  }

  /**
   * Borrar el ingrediente con índice i de la receta.
   * @param {number} i: índice del ingrediente a borrar.
   */
  onDeleteIngredient(i: number) {
    (<FormArray>this.recipeForm.get('ingredients')).removeAt(i);
  }

  /**
   * Al pulsar cancelar se sale del componente
   */
  onCancel() {
    if (this.editMode) {
      // Se navega de vuelta a la receta
      this.router.navigate(['/recipes/view']);
    } else {
      // Se navega de vuelta al índice
      this.router.navigate(['/recipes']);
    }
  }
}
