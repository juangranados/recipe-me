import { Component, OnInit } from '@angular/core';
import {
    ActivatedRoute,
    NavigationEnd,
    Params,
    Router,
    RouterEvent
} from '@angular/router';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import {
    CloudFirestoreService,
    States
} from '../../shared/cloud-firestore.service';
import { Recipe, RecipeId } from '../recipe.model';
import * as fromRecipe from '../recipe.reducer';
import { select, Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import * as fromAuth from '../../auth/auth.reducer';
import * as recipeActions from '../recipe.actions';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-recipe-edit',
    templateUrl: './recipe-edit.component.html',
    styleUrls: ['./recipe-edit.component.css']
})
export class RecipeEditComponent implements OnInit {
    // Path de Cloud Firestore donde se almacena la lista de la recetas.
    cloudFirestorePath: string;

    // Propiedad de la interfaz que identifica unívocamente a la receta.
    cloudFirestoreFieldPath = 'recipeName';

    // Modo de edición o de nueva receta
    editMode = false;

    // Valores para las unidades
    units = ['gr', 'kg', 'ml', 'cl', 'l', 'ud'];

    // Formulario
    recipeForm: FormGroup;

    recipe: Recipe;

    id: string;

    routeSubscription: Subscription;

    navigationSubscription: Subscription;

    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private cloudFirestoreService: CloudFirestoreService,
        private store: Store<fromRecipe.State>
    ) {}

    ngOnInit() {
        // Comprobar si las recetas del store están sicronizadas con Firebase.
        // Se comprueba aquí para que funcione la navegación directa.
        this.store
            .pipe(select(fromRecipe.getIsSynced))
            .pipe(take(1))
            .subscribe((isSynced: boolean) => {
                if (!isSynced) {
                    // Se inicializa el store con los ingredientes de la colección
                    // recipes recuperados de Cloud Firestore.
                    this.store.dispatch(new recipeActions.RecipeStartSyncing());
                }
            });
        // Se especifica la ruta donde almacenar la lista de la compra.
        this.store
            .pipe(select(fromAuth.getUid))
            .subscribe(
                (uid: string) =>
                    (this.cloudFirestorePath = `users/${uid}/recipes`)
            );
        // Almacenar la receta y los ingredientes en la tabla
        // Almacenar el id de la ruta
        this.routeSubscription = this.activatedRoute.params.subscribe(
            (params: Params) => {
                this.id = params['id'];
                if (this.id) {
                    // Se recupera la receta del store.
                    this.store
                        .pipe(select(fromRecipe.getRecipeById(this.id)))
                        .subscribe((data: Recipe) => {
                            if (data) {
                                this.recipe = { ...data };
                                this.editMode = true;
                                this.initForm();
                            } else {
                                // Se comprueba si no se ha encontrado debido a una recarga de la página o navegación directa, ya que el store
                                // no se ha sincronizado con Firebase.
                                this.navigationSubscription = this.router.events.subscribe(
                                    (routerEvent: RouterEvent) => {
                                        // If it is a NavigationEnd event re-initalise the component
                                        if (
                                            routerEvent instanceof NavigationEnd
                                        ) {
                                            this.getIdOrNotFound();
                                        } else {
                                            this.router.navigate(['not-found']);
                                        }
                                    }
                                );
                            }
                        });
                } else {
                    this.initForm();
                }
            }
        );
    }
    /**
     * Busca de nuevo el ID esperando a que se inicialice el store
     */
    getIdOrNotFound() {
        this.store
            .pipe(select(fromRecipe.getIsSynced))
            .subscribe((isSynced: boolean) => {
                if (isSynced) {
                    this.store
                        .pipe(select(fromRecipe.getRecipeById(this.id)))
                        .pipe(take(1))
                        .subscribe((data: Recipe) => {
                            if (data) {
                                this.recipe = { ...data };
                                this.editMode = true;
                                this.initForm();
                            } else {
                                this.router.navigate(['not-found']);
                            }
                        });
                }
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
                            ingredientAmount: new FormControl(
                                ingredient.ingredientAmount,
                                [
                                    Validators.required,
                                    Validators.min(0),
                                    Validators.max(10000)
                                ]
                            ),
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
            recipeImagePath: new FormControl(
                recipeImagePath,
                Validators.required
            ),
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
                this.id,
                this.recipeForm.value,
                this.cloudFirestorePath,
                States.Recipes
            );
            // Se navega de vuelta a la receta
            this.router.navigate([`/recipes/${this.id}`], {
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
            this.router.navigate([`/recipes/${this.id}`]);
        } else {
            // Se navega de vuelta al índice
            this.router.navigate(['/recipes']);
        }
    }
}
