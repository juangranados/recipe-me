// src/app/recipe/recipe-list/recipe-list.component.ts
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { select, Store } from '@ngrx/store';
import * as fromRecipe from '../recipe.reducer';
import * as recipeActions from '../recipe.actions';
import { Observable } from 'rxjs';
import { RecipeId } from '../recipe.model';
import { MatPaginator, MatTableDataSource } from '@angular/material';
import { delay } from 'rxjs/operators';

@Component({
    selector: 'app-recipe-list',
    templateUrl: './recipe-list.component.html',
    styleUrls: ['./recipe-list.component.css']
})
export class RecipeListComponent implements OnInit, OnDestroy {
    recipesObservable: Observable<RecipeId[]>; // Observable para obtener los datos del datasource.
    @ViewChild(MatPaginator)
    paginator: MatPaginator; // Acceso a la directiva MatPaginator de la tabla.
    dataSource = new MatTableDataSource<any>(); // Propiedad para que la tabla dibuje los datos.
    isLoadingObservable: Observable<Boolean>; // Observable para saber si está cargando la app
    /**
     * Constructor de la clase
     * @param store
     */
    constructor(private store: Store<fromRecipe.State>) {}

    /**
     * Método ngOnInit que se ejecuta al inicializar el componente.
     * Se copia la lista de recetas del servicio RecipeService a la propiedad recipes
     * para poder usarlas en la vista.
     */
    ngOnInit() {
        // Suscripción a la propiedad isLoading del estado para mostrar el spinner.
        this.isLoadingObservable = this.store.pipe(
            select(fromRecipe.getIsLoading)
        );
        this.store
            .pipe(
                select(fromRecipe.selectAll),
                delay(0) // https://blog.angular-university.io/angular-debugging/
            )
            .subscribe(recipes => {
                this.dataSource.data = recipes;
                this.recipesObservable = this.dataSource.connect();
            }); // Se copian todas las recetas al datasource
        this.dataSource.paginator = this.paginator; // Se añade un paginador al datasource.
        // se conecta el datasource al observable para recorrer las recetas.
        this.store.dispatch(new recipeActions.RecipeSelected(null)); // No hay ninguna receta seleccionada.
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

    ngOnDestroy(): void {
        if (this.dataSource) {
            this.dataSource.disconnect(); // Desconectar el datasource
        }
    }
}
