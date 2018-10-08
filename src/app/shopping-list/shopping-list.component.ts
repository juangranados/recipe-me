// src/app/shopping-list/shopping-list.component.ts
import {
    AfterViewInit,
    Component,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';
import { addIngredient, Ingredient } from '../shared/ingredient.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
    CloudFirestoreService,
    States
} from '../shared/cloud-firestore.service';
import * as shoppingListActions from './shopping-list.actions';
import * as fromShoppingList from './shopping-list.reducer';
import * as fromAuth from '../auth/auth.reducer';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
    MatDialog,
    MatPaginator,
    MatSort,
    MatTableDataSource
} from '@angular/material';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { delay } from 'rxjs/operators';
import { ShoppingListUnsubscribeService } from './shopping-list-unsubscribe.service';

@Component({
    selector: 'app-shopping-list',
    templateUrl: './shopping-list.component.html',
    styleUrls: ['./shopping-list.component.css']
})
export class ShoppingListComponent implements OnInit, AfterViewInit, OnDestroy {
    dataSource = new MatTableDataSource<Ingredient>(); // Propiedad para que la tabla dibuje los datos.
    displayedColumns: string[] = [
        'ingredientName',
        'ingredientAmount',
        'ingredientUnit',
        'actions'
    ]; // Columnas que se muestran en la tabla.
    // Acceso a la directiva MatPaginator de la tabla.
    @ViewChild(MatPaginator)
    paginator: MatPaginator;
    // Acceso a la directiva MatShort de la tabla.
    @ViewChild(MatSort)
    sort: MatSort;

    // Valores para las unidades
    units = ['gr', 'kg', 'ml', 'cl', 'l', 'ud'];

    // Path de Cloud Firestore donde se almacena la lista de la compra
    cloudFirestorePath: string;

    // Propiedad de la interfaz que identifica unívocamente al ingrediente
    cloudFirestoreFieldPath = 'ingredientName';

    // Propiedad para sincronizar el formulario de ingredientes
    ingredientsForm: FormGroup;

    isLoading$: Observable<boolean>; // Observable para mostrar o no el spinner
    ingredients$: Observable<any>; // Observable para saber si hay ingredientes en el store.

    /**
     * Constructor de la clase del componente.
     * @param {CloudFirestoreService} cloudFirestoreService: instancia global de la clase del servicio CloudFirestoreService.
     * @param store: estado de la parte shopping-list.
     * @param dialog: material dialog para invocar al componente ConfirmDialogComponent.
     * @param unsubscribeService
     */
    constructor(
        private cloudFirestoreService: CloudFirestoreService,
        private store: Store<fromShoppingList.State>,
        private dialog: MatDialog,
        private unsubscribeService: ShoppingListUnsubscribeService
    ) {}

    /**
     * Método que se ejecuta en la creación del componente.
     */
    ngOnInit(): void {
        // Se especifica la ruta donde almacenar la lista de la compra.
        this.store
            .pipe(select(fromAuth.getUid))
            .subscribe(
                (uid: string) =>
                    (this.cloudFirestorePath = `users/${uid}/shopping-list`)
            );
        // Se inicializa el store con los ingredientes de la colección shopping-list recuperados de Cloud Firestore si estan ya sincronizados.
        this.store
            .pipe(select(fromShoppingList.getIsSynced))
            .subscribe((isSynced: boolean) =>
                this.store.dispatch(
                    new shoppingListActions.ShoppingListStartSyncing()
                )
            );

        // Observable isLoading del estado para mostrar el spinner.
        this.isLoading$ = this.store.pipe(
            select(fromShoppingList.getIsLoading)
        );

        // Observable a los ingredientes del store para mostrar o no la tabla.
        this.ingredients$ = this.store.pipe(select(fromShoppingList.selectIds));

        // Se inicializa el observable de la lista de ingredientes para que la vista se pueda suscribir a él y mostrarlo por pantalla.
        // No es necesario cancelar la suscripción porque lo hará ngrx.
        this.store
            .pipe(
                select(fromShoppingList.selectAll),
                delay(0)
            )
            .subscribe(ingredients => {
                this.dataSource.data = ingredients;
            });

        // Se crea una nueva instancia de FormGroup en la propiedad ingredientsForm
        // que se enlaza con el formulario de la vista.
        this.ingredientsForm = new FormGroup({
            ingredientName: new FormControl(null, Validators.required),
            ingredientAmount: new FormControl(null, [
                Validators.required,
                Validators.min(1),
                Validators.max(10000)
            ]),
            ingredientUnit: new FormControl(null, Validators.required)
        });
    }
    ngAfterViewInit(): void {
        // Se asignan la paginación y la ordenación al datasource de la tabla.
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
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
     * Método que se ejecuta al pulsar el botón 'Limpiar formulario' y borra el mismo.
     */
    onClearForm() {
        this.ingredientsForm.reset();
    }

    /**
     * Copia los datos del ingrediente recibido en el formulario.
     * @param ingredient: ingrediente a copiar en el formulario.
     */
    onClickItem(ingredient) {
        this.ingredientsForm.setValue({
            ingredientName: ingredient.ingredientName,
            ingredientAmount: ingredient.ingredientAmount,
            ingredientUnit: ingredient.ingredientUnit
        });
    }

    /**
     * Borra el elemento con el nombre especificado en el formulario
     */
    onDeleteItem(ingredient: Ingredient) {
        // Se borra el elemento si existe.
        this.cloudFirestoreService.deleteElementCheckingIfExists<Ingredient>(
            ingredient,
            this.cloudFirestorePath,
            this.cloudFirestoreFieldPath,
            States.ShoppingList
        );
    }
    onAddIngredient() {
        this.cloudFirestoreService.customAddElementCheckingIfExists<Ingredient>(
            this.ingredientsForm.value,
            this.cloudFirestorePath,
            this.cloudFirestoreFieldPath,
            States.ShoppingList,
            addIngredient
        );
    }

    onDeleteShoppingList() {
        // Se abre el cuadro de diálogo pasándole la receta.
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: '¿Quieres borrar la lista completa?'
        });
        // Suscripción al observable que devolverá los datos al cerrarse el dialog
        dialogRef.afterClosed().subscribe(
            // En este ejemplo sólo se muestra en consola, aunque se puede ejecutar
            // cualquier lógica al obtener el resultado
            result => {
                if (result) {
                    // Borrar la lista completa
                    this.cloudFirestoreService.deleteCollection(
                        this.cloudFirestorePath,
                        States.ShoppingList
                    );
                }
            }
        );
    }

    onEditItem() {
        this.cloudFirestoreService.addElementCheckingIfExists<Ingredient>(
            this.ingredientsForm.value,
            this.cloudFirestorePath,
            this.cloudFirestoreFieldPath,
            States.ShoppingList
        );
    }

    ngOnDestroy(): void {
        this.unsubscribeService.unsubscribeComponent$.next();
        this.store.dispatch(new shoppingListActions.ShoppingListStoptSyncing());
    }
}
