// src/app/recipe/recipe-list/recipe-item/recipe-item.component.ts
import { Component, Input } from '@angular/core';
import { RecipeId } from '../../recipe.model';
import { Store } from '@ngrx/store';
import * as fromRecipe from '../../recipe.reducer';
import * as recipeActions from '../../recipe.actions';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CloudFirestoreService,
  States
} from '../../../shared/cloud-firestore.service';
import { MatDialog } from '@angular/material';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-recipe-item',
  templateUrl: './recipe-item.component.html',
  styleUrls: ['./recipe-item.component.css']
})
export class RecipeItemComponent {
  // Propiedad para almacenar el objeto de tipo receta.
  // No recibe ningún valor inicial, puesto que se lo proporciona otro componente.
  // Mediante el decorador Input se hace visible al resto de componentes para que le envíen el dato.
  // La definición de este objeto RecipeId se encuentra en recipe.model.ts
  @Input()
  recipe: RecipeId;
  cloudFirestorePath = 'recipes';

  constructor(
    private store: Store<fromRecipe.State>,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cloudFirestoreService: CloudFirestoreService,
    private dialog: MatDialog
  ) {}

  onView() {
    this.store.dispatch(new recipeActions.RecipeSelected(this.recipe));
    this.router
      .navigate(['view'], { relativeTo: this.activatedRoute })
      .catch(error => console.log(error));
  }
  onEdit() {
    this.store.dispatch(new recipeActions.RecipeSelected(this.recipe));
    this.router
      .navigate(['edit'], { relativeTo: this.activatedRoute })
      .catch(error => console.log(error));
  }
  /**
   * Borra la receta de Cloud Firestore.
   */
  onDelete() {
    // Se abre el cuadro de diálogo pasándole la receta.
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: 'Vas a borrar la receta ' + this.recipe.recipeName
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
