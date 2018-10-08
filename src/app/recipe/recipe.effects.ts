import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { Action, select, Store } from '@ngrx/store';
import {
    catchError,
    delay,
    first,
    map,
    mergeMap,
    switchMap,
    take,
    takeUntil
} from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import * as recipeActions from './recipe.actions';
import * as fromRecipe from './recipe.reducer';
import * as fromAuth from '../auth/auth.reducer';
import { Recipe } from './recipe.model';
import { RecipeUnsubscribeService } from './recipe-unsubscribe.service';

// https://itnext.io/3-common-mistakes-when-using-angular-ngrx-firebase-9de4e241d866
// Las clase que contienen los efectos deben llevar el decorador @Injectable()
@Injectable()
export class RecipeEffects {
    /**
     * Constructor de la clase que contiene los efectos de recipes.
     * @param actions$: las clases con efectos siempre reciben un observable de tipo Action para filtrar las acciones.
     * @param afs: instancia de la clase AngularFirestore para realizar operaciones sobre Cloud Firestore.
     * @param store: store de la parte recipes para poder lanzar acciones.
     * @param unsubscribeService: servicio que contiene un observable que se utiliza para parar la suscripción a
     * stateChanges de la colección de recetas.
     */
    constructor(
        private actions$: Actions,
        private readonly afs: AngularFirestore,
        private store: Store<fromRecipe.State>,
        private unsubscribeService: RecipeUnsubscribeService
    ) {}

    // Efecto que se ejecuta al lanzar la acción RECIPES_SYNC.
    @Effect()
    query$: Observable<Action> = this.actions$ // Sintaxis por defecto.
        .pipe(
            ofType(recipeActions.RECIPE_START_SYNCING) // Sólo se ejecuta si la acción es de tipo RECIPES_SYNC.
        )
        .pipe(
            // Se recupera el UID del usuario del store
            switchMap(() => {
                return this.store.pipe(
                    select(fromAuth.getUid),
                    takeUntil(this.unsubscribeService.unsubscribe$)
                );
            })
        )
        .pipe(
            switchMap((uid: string) => {
                // Se comprueba si la colección contiene datos para indicar que se empieza la carga.
                this.afs
                    .collection<Recipe>(`users/${uid}/recipes`)
                    .stateChanges()
                    .pipe(take(1))
                    .subscribe(data => {
                        if (data.length) {
                            this.store.dispatch(
                                new recipeActions.RecipeStartLoading() // Se cambia el estado para reflejar que se inicia una operación asíncrona en Firebase.
                            );
                        }
                    });
                // Se devuelve un observable nuevo que informa de los cambios que se producen sobre una colección de Cloud Firestore.
                // Al inicio, devuelve todos los elementos de la colección como added.
                // Conforme se vayan produciendo modificaciones irá devolviendo los cambios en los documentos de la colección.
                // La suscripción esta activa hasta que se reciba la orden de unsubscribe desde el servicio unsubscribeService al destruirse el componente RecipesComponent.
                return this.afs
                    .collection<Recipe>(`users/${uid}/recipes`)
                    .stateChanges()
                    .pipe(takeUntil(this.unsubscribeService.unsubscribe$));
                // .pipe(delay(1000)); // Delay de palisco para mostrar el spinner.
                // return this.afs.collection<Recipe>('recipes').stateChanges(); // Se devuelve un Observable que enviará todos los cambios que se producen en la colección.
            }),
            mergeMap(actions => actions), // Se agrupan todos los observables recibidos para procesar las acciones que devuelve Cloud Firestore.
            map(action => {
                // Se procesa cada acción devuelta por Cloud Firestore para modificar el estado de la parte recipes.
                // Se comprueba en el store si se ha marcado el inicio de la carga para pararlo y la sincronización figura como no sincronizado, ya que se reciben los datos.
                this.store
                    .pipe(
                        select(fromRecipe.getStatus),
                        take(1)
                    ) // La suscripción coge sólo un elemento y se cierra.
                    .subscribe(
                        (status: { isSynced: boolean; isLoading: boolean }) => {
                            if (status.isLoading) {
                                this.store.dispatch(
                                    new recipeActions.RecipeStopLoading()
                                ); // Se informa al estado de que para la carga al recibirse los datos de Cloud Firestore.
                            }
                            if (!status.isSynced) {
                                this.store.dispatch(
                                    new recipeActions.RecipeSynced()
                                ); // Se informa al estado de que para la carga al recibirse los datos de Cloud Firestore.
                            }
                        }
                    );
                // Se lanza una acción nueva por cada acción devuelta por Cloud Firestore.
                return {
                    type: `[Recipes] Recipe ${action.type}`, // Tipo de la acción que devuelve Firebase: added | modified | removed
                    payload: {
                        id: action.payload.doc.id, // Id del documento
                        ...action.payload.doc.data() // Contenido del documento.
                    }
                };
            }),
            catchError((error, caught) => {
                // Si se produce un error, por ejemplo al salir de Firebase, la conexión se interrumpe al terminar el observable.
                this.store.dispatch(
                    new recipeActions.RecipeErrorSync(
                        'Se ha interrumpido la conexión con Firebase para obtener las recetas. ' +
                            error.message
                    )
                );
                return caught; // Si se devuelve caught el efecto volverá a ejecutarse. Por defecto tras un error el efecto no se vuelve a ejecutar.
            })
        );
}
