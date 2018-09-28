// src/app/recipe/recipe-detail/recipe-detail.component.ts
import {
    AfterViewInit,
    Component,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';
import {
    ActivatedRoute,
    NavigationEnd,
    Params,
    Router,
    RouterEvent
} from '@angular/router';
import {
    CloudFirestoreService,
    States
} from '../../shared/cloud-firestore.service';
import { addIngredient, Ingredient } from '../../shared/ingredient.model';
import { Recipe, RecipeId } from '../recipe.model';
import * as fromRecipe from '../recipe.reducer';
import { select, Store } from '@ngrx/store';
import { delay, take } from 'rxjs/operators';
import {
    MatDialog,
    MatPaginator,
    MatSort,
    MatTableDataSource
} from '@angular/material';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import * as fromAuth from '../../auth/auth.reducer';
import { Subscription } from 'rxjs';
import * as recipeActions from '../recipe.actions';

@Component({
    selector: 'app-recipe-detail',
    templateUrl: './recipe-detail.component.html',
    styleUrls: ['./recipe-detail.component.css']
})
export class RecipeDetailComponent implements OnInit, AfterViewInit {
    recipe: Recipe = {
        recipeDescription: 'Cargando',
        recipeImagePath: 'assets/recipes.jpg',
        recipeInstructions: 'Cargando',
        recipeName: 'Cargando',
        ingredients: []
    };
    id: string;
    cloudFirestoreRecipePath: string;
    cloudFirestoreShoppinglistPath: string;
    dataSource = new MatTableDataSource<Ingredient>(); // Propiedad para que la tabla dibuje los datos.
    displayedColumns: string[] = [
        'ingredientName',
        'ingredientAmount',
        'ingredientUnit'
    ]; // Columnas que se muestran en la tabla.
    @ViewChild(MatPaginator)
    paginator: MatPaginator; // Acceso a la directiva MatPaginator de la tabla.
    @ViewChild(MatSort)
    sort: MatSort; // Acceso a la directiva MatShort de la tabla.
    routeSubscription: Subscription;
    /**
     * Constructor de la clase.
     * @param {CloudFirestoreService} cloudFirestoreService
     * @param {Router} router
     * @param activatedRoute
     * @param store
     * @param dialog
     */
    constructor(
        private cloudFirestoreService: CloudFirestoreService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private store: Store<fromRecipe.State>,
        private dialog: MatDialog
    ) {}

    /**
     * Método ngOnInit en el cual se suscribe al cambio de parámetros de la ruta
     * para así actualizar la receta a mostrar
     */
    ngOnInit() {
        // Se especifica la ruta donde almacenar la receta.
        this.store.pipe(select(fromAuth.getUid)).subscribe((uid: string) => {
            this.cloudFirestoreRecipePath = `users/${uid}/recipes`;
            this.cloudFirestoreShoppinglistPath = `users/${uid}/shopping-list`;
        });

        // Almacenar la receta y los ingredientes en la tabla
        // Almacenar el id de la ruta
        this.routeSubscription = this.activatedRoute.params.subscribe(
            (params: Params) => {
                this.id = params['id'];
                // Se recupera la receta del store.
                this.store
                    .pipe(select(fromRecipe.getRecipeById(this.id)))
                    .pipe(take(1))
                    .subscribe((data: Recipe) => {
                        if (data) {
                            this.recipe = { ...data };
                            this.dataSource.data = this.recipe.ingredients;
                        } else {
                            this.getIdOrNotFound();
                        }
                    });
            }
        );
    }

    ngAfterViewInit(): void {
        // Se asignan la paginación y la ordenación al datasource de la tabla.
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    /**
     * Busca de nuevo el ID esperando a que se inicialice el store
     */
    getIdOrNotFound() {
        this.store
            .pipe(select(fromRecipe.getIsSynced))
            .pipe(delay(0))
            .subscribe((isSynced: boolean) => {
                if (isSynced) {
                    this.store
                        .pipe(select(fromRecipe.getRecipeById(this.id)))
                        .pipe(take(1))
                        .subscribe((data: Recipe) => {
                            if (data) {
                                this.recipe = { ...data };
                                this.dataSource.data = this.recipe.ingredients;
                            } else {
                                this.router.navigate(['not-found']);
                            }
                        });
                }
            });
    }
    /**
     * Método que aplica el filtro seleccionado al datasource de la tabla.
     * @param filterValue: valor del filtro.
     */
    applyFilter(filterValue: string) {
        // Se aplica el filtro a cada fila del datasource.
        this.dataSource.filter = filterValue.trim().toLowerCase();
        // Si hay paginación, se aplica el filtro solo a esa página.
        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    /**
     * Método que se ejecuta al pulsar el botón "Enviar a la lista"
     * y envía los ingredientes de la receta a la lista de la compra.
     */
    onSendToShoppingList() {
        this.cloudFirestoreService.customAddElementsCheckingIfExists(
            this.recipe.ingredients,
            this.cloudFirestoreShoppinglistPath,
            'ingredientName',
            States.Recipes,
            addIngredient
        );
    }

    /**
     * Borra la receta de Cloud Firestore.
     */
    onDelete() {
        // Se abre el cuadro de diálogo pasándole la receta.
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: `¿Quieres borrar la receta ${this.recipe.recipeName}?`
        });
        // Suscripción al observable que devolverá los datos al cerrarse el dialog
        dialogRef.afterClosed().subscribe(
            // En este ejemplo sólo se muestra en consola, aunque se puede ejecutar
            // cualquier lógica al obtener el resultado
            result => {
                if (result) {
                    // Borrar la receta
                    this.cloudFirestoreService.deleteElement(
                        this.id,
                        this.cloudFirestoreRecipePath,
                        States.Recipes
                    );
                    this.router.navigate(['/recipes']);
                }
            }
        );
    }
    /**
     * Informa al state de que se selecciona una receta
     */
    onSelect() {
        this.store.dispatch(
            new recipeActions.RecipeSelected({
                ...this.recipe,
                id: this.id
            })
        );
        // this.router.navigate([`/recipes/${this.id}/edit`]);
    }
}
