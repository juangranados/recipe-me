// src/app/shopping-list/shopping-list.effects.ts
import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { Action, select, Store } from '@ngrx/store';
import {
    catchError,
    delay,
    map,
    mergeMap,
    switchMap,
    take,
    takeUntil
} from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire//firestore';
import { Ingredient } from '../shared/ingredient.model';
import * as shoppingListActions from './shopping-list.actions';
import * as fromShoppingList from './shopping-list.reducer';
import * as fromAuth from '../auth/auth.reducer';
import { ShoppingListUnsubscribeService } from './shopping-list-unsubscribe.service';
import * as fromRecipe from '../recipe/recipe.reducer';
import * as recipeActions from '../recipe/recipe.actions';

// Las clase que contienen los efectos deben llevar el decorador @Injectable()
@Injectable()
export class ShoppingListEffects {
    /**
     * Constructor de la clase que contiene los efectos de la shopping-list.
     * @param actions$: las clases con efectos siempre reciben un observable de tipo Action para filtrar las acciones.
     * @param afs: instancia de la clase AngularFirestore para realizar operaciones sobre Cloud Firestore.
     * @param store: estado actual para lanzar acciones.
     * @param unsubscribeService
     */
    constructor(
        private actions$: Actions,
        private readonly afs: AngularFirestore,
        private store: Store<fromShoppingList.State>,
        private unsubscribeService: ShoppingListUnsubscribeService
    ) {}

    // Efecto que se ejecuta al lanzar la acción SHOPPING_LIST_START_SYNCING.
    @Effect()
    query$: Observable<Action> = this.actions$ // Sintaxis por defecto.
        .pipe(
            ofType(shoppingListActions.SHOPPING_LIST_START_SYNCING) // Sólo se ejecuta si la acción es de tipo SHOPPING_LIST_START_SYNCING.
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
                    .collection<Ingredient>(`users/${uid}/shopping-list`)
                    .stateChanges()
                    .pipe(take(1))
                    .subscribe(data => {
                        if (data.length) {
                            this.store.dispatch(
                                new shoppingListActions.ShoppingListStartLoading() // Se cambia el estado para reflejar que se inicia una operación asíncrona en Firebase.
                            );
                        }
                    });
                // Se devuelve un observable nuevo que informa de los cambios que se producen sobre una colección de Cloud Firestore.
                // Al inicio, devuelve todos los elementos de la colección como added.
                // Conforme se vayan produciendo modificaciones irá devolviendo los cambios en los documentos de la colección.
                // La suscripción esta activa hasta que se reciba la orden de unsubscribe desde el servicio unsubscribeService al destruirse el componente ShoppingListComponent.
                return this.afs
                    .collection<Ingredient>(`users/${uid}/shopping-list`)
                    .stateChanges()
                    .pipe(takeUntil(this.unsubscribeService.unsubscribe$));
                // .pipe(delay(2000)); // Delay de palisco para mostrar el spinner.
                // return this.afs.collection<Ingredient>('shopping-list').stateChanges(); // Se devuelve un Observable que enviará todos los cambios que se producen en la colección.
            }),
            mergeMap(actions => actions), // Se agrupan todos los observables recibidos en uno solo para procesar las acciones que devuelve Cloud Firestore.
            map(action => {
                // Se procesa cada acción devuelta por Cloud Firestore para modificar el estado de la parte shopping list.
                // Se comprueba en el store si se ha marcado el inicio de la carga para pararlo, ya que se reciben los datos.
                this.store
                    .pipe(
                        select(fromShoppingList.getStatus),
                        take(1)
                    ) // La suscripción coge sólo un elemento y se cierra.
                    .subscribe(
                        (status: { isSynced: boolean; isLoading: boolean }) => {
                            if (status.isLoading) {
                                this.store.dispatch(
                                    new shoppingListActions.ShoppingListStopLoading()
                                ); // Se informa al estado de que para la carga al recibirse los datos de Cloud Firestore.
                            }
                            if (!status.isSynced) {
                                this.store.dispatch(
                                    new shoppingListActions.ShoppingListSynced()
                                ); // Se informa al estado de que para la carga al recibirse los datos de Cloud Firestore.
                            }
                        }
                    );
                // Se lanza una acción nueva por cada acción devuelta por Cloud Firestore.
                return {
                    type: `[Shopping List] Ingredient ${action.type}`, // Tipo de la acción que devuelve Firebase: added | modified | removed
                    payload: {
                        id: action.payload.doc.id, // Id del documento
                        ...action.payload.doc.data() // Contenido del documento.
                    }
                };
            }),
            catchError((error, caught) => {
                // Si se produce un error, por ejemplo al salir de Firebase, la conexión se interrumpe al terminar el observable.
                this.store.dispatch(
                    new shoppingListActions.ShoppingListError( // Se añade el error al estado.
                        'Se ha interrumpido la conexión con Firebase para obtener la lista de la compra: ' +
                            error.message
                    )
                );
                return caught; // Si se devuelve caught el efecto volverá a ejecutarse. Por defecto tras un error el efecto no se vuelve a ejecutar.
            })
        );
}
