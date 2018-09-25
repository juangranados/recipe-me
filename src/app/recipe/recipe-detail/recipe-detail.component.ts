// src/app/recipe/recipe-detail/recipe-detail.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  CloudFirestoreService,
  States
} from '../../shared/cloud-firestore.service';
import { addIngredient, Ingredient } from '../../shared/ingredient.model';
import { RecipeId } from '../recipe.model';
import * as fromRecipe from '../recipe.reducer';
import { select, Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import {
  MatDialog,
  MatPaginator,
  MatSort,
  MatTableDataSource
} from '@angular/material';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.css']
})
export class RecipeDetailComponent implements OnInit {
  recipe: RecipeId;
  id: string;
  cloudFirestorePath = 'recipes';
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
  /**
   * Constructor de la clase.
   * @param {CloudFirestoreService} cloudFirestoreService
   * @param {Router} router
   * @param store
   * @param dialog
   */
  constructor(
    private cloudFirestoreService: CloudFirestoreService,
    private router: Router,
    private store: Store<fromRecipe.State>,
    private dialog: MatDialog
  ) {}

  /**
   * Método ngOnInit en el cual se suscribe al cambio de parámetros de la ruta
   * para así actualizar la receta a mostrar
   */
  ngOnInit() {
    // Almacenar la receta y los ingredientes en la tabla
    this.store
      .pipe(select(fromRecipe.getRecipeSelected))
      .pipe(take(1))
      .subscribe(recipe => {
        this.recipe = recipe;
        this.dataSource.data = recipe.ingredients;
        // Se asignan la paginación y la ordenación al datasource de la tabla.
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
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
      'shopping-list',
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
            this.recipe.id,
            this.cloudFirestorePath,
            States.Recipes
          );
          this.router.navigate(['/recipes']);
        }
      }
    );
  }
}