// src/app/shared/cloud-firestore.service.ts
import { Injectable } from '@angular/core';
import { MessageService } from './message.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { catchError, map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import * as shoppingListActions from '../shopping-list/shopping-list.actions';
import * as fromShoppingList from '../shopping-list/shopping-list.reducer';
import * as fromRecipe from '../recipe/recipe.reducer';
import * as recipeActions from '../recipe/recipe.actions';
import { select, Store } from '@ngrx/store';

export enum States {
    ShoppingList,
    Recipes
}

@Injectable({
    providedIn: 'root'
})
export class CloudFirestoreService {
    constructor(
        private messageService: MessageService,
        private readonly afs: AngularFirestore,
        private shoppingListStore: Store<fromShoppingList.State>,
        private recipeStore: Store<fromRecipe.State>
    ) {}

    private stopLoading(state: States) {
        if (state === States.ShoppingList) {
            this.shoppingListStore
                .pipe(select(fromShoppingList.getIsLoading))
                .pipe(take(1))
                .subscribe(isLoading => {
                    if (isLoading) {
                        this.shoppingListStore.dispatch(
                            new shoppingListActions.ShoppingListStopLoading()
                        );
                    }
                });
        } else if (state === States.Recipes) {
            this.recipeStore
                .pipe(select(fromRecipe.getIsLoading))
                .pipe(take(1))
                .subscribe(isLoading => {
                    if (isLoading) {
                        this.recipeStore.dispatch(
                            new recipeActions.RecipeStopLoading()
                        );
                    }
                });
        }
    }
    private startLoading(state: States) {
        if (state === States.ShoppingList) {
            this.shoppingListStore
                .pipe(select(fromShoppingList.getIsLoading))
                .pipe(take(1))
                .subscribe(isLoading => {
                    if (!isLoading) {
                        this.shoppingListStore.dispatch(
                            new shoppingListActions.ShoppingListStartLoading()
                        );
                    }
                });
        } else if (state === States.Recipes) {
            this.recipeStore
                .pipe(select(fromRecipe.getIsLoading))
                .pipe(take(1))
                .subscribe(isLoading => {
                    if (!isLoading) {
                        this.recipeStore.dispatch(
                            new recipeActions.RecipeStartLoading()
                        );
                    }
                });
        }
    }
    private registerError(state: States, error: String) {
        if (state === States.ShoppingList) {
            this.shoppingListStore.dispatch(
                new shoppingListActions.ShoppingListError(error)
            );
        } else if (state === States.Recipes) {
            this.recipeStore.dispatch(new recipeActions.RecipeError(error));
        }
    }
    /**
     * Devuelve un observable al que al suscribirse devolverá todos los objetos del path.
     * @param {string} path: ruta dentro de la BBDD de Cloud Firestore.
     * @returns {Observable<T>}: observable al que al suscribirse devolverá todos los objetos del path.
     */
    getCollection<T>(path: string): Observable<T[]> {
        return this.afs.collection<T>(path).valueChanges();
    }

    /**
     * Devuelve un observable al que al suscribirse devolverá todos los objetos del path con su id.
     * @param {string} path: ruta dentro de la BBDD de Cloud Firestore.
     * @returns {Observable<T>}: observable al que al suscribirse devolverá todos los objetos del path con su id.
     */
    getCollectionWithID<T>(path: string): Observable<T[]> {
        return this.afs
            .collection<T>(path)
            .snapshotChanges()
            .pipe(
                map(actions =>
                    actions.map(a => {
                        const data = a.payload.doc.data() as any;
                        const id = a.payload.doc.id;
                        return { id, ...data };
                    })
                ),
                catchError((error, caught) => {
                    console.log(error);
                    return caught;
                })
            );
    }

    /**
     * Añade un elemento a Cloud Firestore.
     * @param {T} element: elemento a añadir.
     * @param {string} path: ruta dentro de la BBDD de Cloud Firestore.
     * @param state: estado al que afecta la operación para actualizar el estado de isLoading y reflejar la carga y posibles errores.
     */
    public addElement<T>(element: T, path: string, state: States) {
        this.startLoading(state);
        this.afs
            .collection(path)
            .add(element)
            .then(docRef => {
                this.messageService.setMessage(
                    'Elemento guardado en Cloud Firestore'
                );
                this.stopLoading(state);
            })
            .catch(error => {
                this.messageService.setMessage(
                    'Error al guardar el elemento en Cloud Firestore: ' +
                        error.message
                );
                this.stopLoading(state);
                this.registerError(
                    state,
                    'Error al guardar el elemento en Cloud Firestore: ' +
                        error.message
                );
            });
    }

    /**
     * Borra un elemento de tipo genérico a Cloud Firestore.
     * @param {string} id: id del elemento a borrar.
     * @param {string} path: ruta dentro de la BBDD de Cloud Firestore.
     * @param state: estado al que afecta la operación para actualizar el estado de isLoading y reflejar la carga y posibles errores.
     */
    deleteElement(id: string, path: string, state: States) {
        this.startLoading(state);
        this.afs
            .collection(path)
            .doc(id)
            .delete()
            .then(() => {
                this.messageService.setMessage(
                    'Elemento eliminado de Cloud Firestore'
                );
                this.stopLoading(state);
            })
            .catch(error => {
                this.messageService.setMessage(
                    'Error al borrar el elemento en Cloud Firestore: ' +
                        error.message
                );
                this.stopLoading(state);
                this.registerError(
                    state,
                    'Error al borrar el elemento en Cloud Firestore: ' +
                        error.message
                );
            });
    }

    /**
     * Edita un elemento dado su id en Cloud Firestore
     * @param {string} id: id del elemento a editar.
     * @param {T} element: elemento que sobrescribirá.
     * @param {string} path: ruta ruta dentro de la BBDD de Cloud Firestore.
     * @param state: estado al que afecta la operación para actualizar el estado de isLoading y reflejar la carga y posibles errores.
     */
    editElement<T>(id: string, element: T, path: string, state: States) {
        this.startLoading(state);
        this.afs
            .collection<T>(path)
            .doc(id)
            .update(element)
            .then(() => {
                this.messageService.setMessage(
                    'Elemento actualizado en Cloud Firestore'
                );
                this.stopLoading(state);
            })
            .catch(error => {
                this.messageService.setMessage(
                    'Error al editar el elemento en Cloud Firestore: ' +
                        error.message
                );
                this.stopLoading(state);
                this.registerError(
                    state,
                    'Error al editar el elemento en Cloud Firestore: ' +
                        error.message
                );
            });
    }

    /**
     * Método que devuelve un observable a una búsqueda dentro de Cloud Firestore.
     * @param {T} element: elemento a buscar.
     * @param {string} path: ruta dentro de la BBDD de Cloud Firestore.
     * @param {string} fieldPath: propiedad única del elemento para poder buscarlo dentro del path.
     * @returns {Observable<{id: string, data: T}[]>}: observable al que al suscribirse se obtendrán los resultados de la búsqueda.
     */
    searchElement<T>(
        element: T,
        path: string,
        fieldPath: string
    ): Observable<T[]> {
        // Busqueda de los elementos sin id
        // this.afs.collection('shopping-list', ref => ref.where('ingredientName', '==', ingredient.ingredientName))
        //     .valueChanges()
        //         .subscribe((data) => console.log(data));

        // Búsqueda de elementos con id
        return this.afs
            .collection<T>(path, ref =>
                ref.where(fieldPath, '==', element[fieldPath])
            )
            .snapshotChanges()
            .pipe(
                map(actions =>
                    actions.map(a => {
                        const data = a.payload.doc.data() as any;
                        const id = a.payload.doc.id;
                        return { id, ...data };
                    })
                )
            );
    }

    /**
     * Añade un elemento si no existe y lo sobrescribe si existe para no generar duplicados en la BBDD de Cloud Firestore.
     * Este método supone que no hay duplicidades en la colección y la búsqueda devolverá un único resultado, si devolviese más, sólo se
     * editaría el primero.
     * @param {T} element: elemento a añadir.
     * @param {string} path: ruta dentro de la BBDD de Cloud Firestore.
     * @param {string} fieldPath: propiedad única del elemento para poder buscarlo dentro del path.
     * @param state: estado al que afecta la operación para actualizar el estado de isLoading y reflejar la carga y posibles errores.
     */
    addElementCheckingIfExists<T>(
        element: T,
        path: string,
        fieldPath: string,
        state: States
    ) {
        this.startLoading(state);
        this.searchElement(element, path, fieldPath)
            .pipe(take(1))
            .subscribe(
                // Sólo interesa el primer resultado ya que no hay elementos duplicados en esta colección.
                data => {
                    this.stopLoading(state);
                    if (data.length !== 0) {
                        this.editElement(data[0]['id'], element, path, state);
                    } else {
                        this.addElement(element, path, state);
                    }
                    // Pipe(1) se utiliza para cancelar la suscripción al recibir el primer resultado de no usarlo, ésta volvería a devolver
                    // resultados y se añadiría otra vez el elemento al llamarse a la función de la suscripción, generando un bucle infinito.
                }
            );
    }

    /**
     * Añade un elemento si no existe y lo sobrescribe tratandolo primero con una función si existe para no generar duplicados en la BBDD de
     * Cloud Firestore.
     * Este método supone que no hay duplicidades en la colección y la búsqueda devolverá un único resultado, si devolviese más, sólo se
     * editaría el primero.
     * @param {T} element: elemento a añadir.
     * @param {string} path: ruta dentro de la BBDD de Cloud Firestore.
     * @param {string} fieldPath: propiedad única del elemento para poder buscarlo dentro del path.
     * @param state: estado al que afecta la operación para actualizar el estado de isLoading y reflejar la carga y posibles errores.
     * @param {(source: T, destination: T) => T} addMethod: función que define como se suman los elementos dentro de la
     * colección, para no sobreescribir elementos, sino sumar o tratar sus campos por ejemplo.
     */
    customAddElementCheckingIfExists<T>(
        element: T,
        path: string,
        fieldPath: string,
        state: States,
        addMethod: (source: T, destination: T) => T
    ) {
        this.startLoading(state);
        this.searchElement(element, path, fieldPath)
            .pipe(take(1))
            .subscribe(
                // Sólo interesa el primer resultado ya que no hay elementos duplicados en esta colección.
                (data: T[]) => {
                    this.stopLoading(state);
                    if (data.length !== 0) {
                        const finalElement = addMethod(data[0], element);
                        this.editElement(
                            data[0]['id'],
                            finalElement,
                            path,
                            state
                        );
                    } else {
                        this.addElement(element, path, state);
                    }
                }
            );
    }

    /**
     * Borra un elemento si existe dentro del path de Cloud Firestore.
     * @param {T} element: elemento a borrar.
     * @param {string} path: ruta dentro de la BBDD de Cloud Firestore.
     * @param {string} fieldPath: propiedad única del elemento para poder buscarlo dentro del path.
     * @param state: estado al que afecta la operación para actualizar el estado de isLoading y reflejar la carga y posibles errores.
     */
    deleteElementCheckingIfExists<T>(
        element: T,
        path: string,
        fieldPath: string,
        state: States
    ) {
        this.startLoading(state);
        this.searchElement(element, path, fieldPath)
            .pipe(take(1))
            .subscribe((data: T[]) => {
                this.stopLoading(state);
                if (data.length !== 0) {
                    this.deleteElement(data[0]['id'], path, state);
                } else {
                    this.messageService.setMessage(
                        'El elemento a borrar no existe en Cloud Firestore'
                    );
                    this.stopLoading(state);
                    this.registerError(
                        state,
                        'El elemento a borrar no existe en Cloud Firestore'
                    );
                }
            });
    }

    /**
     * Devuelve el observable correspondiente al elemento.
     * @param {string} id: id del elemento.
     * @param {string} path: ruta dentro de la BBDD de Cloud Firestore.
     * @returns {Observable<{}>}: observable correspondiente al elemento al que al suscribirse se obtendrá su valor.
     */
    getElement<T>(id: string, path: string): Observable<{}> {
        return this.afs
            .collection<T>(path)
            .doc(id)
            .valueChanges();
    }

    /**
     * Añade varios elementos a una colección comprobando primero que existen mediante el fieldPath,
     * el cual es un campo que no se debería repetir en la colección (porque el usuario quiere, cloud firestore lo permite)
     * @param {T[]} elements: array de elementos a añadir
     * @param {string} path: ruta dentro de la BBDD de Cloud Firestore.
     * @param {string} fieldPath: propiedad única del elemento para poder buscarlo dentro del path.
     * @param state: estado al que afecta la operación para actualizar el estado de isLoading y reflejar la carga y posibles errores.
     */
    addElementsCheckingIfExists<T>(
        elements: T[],
        path: string,
        fieldPath: string,
        state: States
    ) {
        for (const element of elements) {
            this.addElementCheckingIfExists(element, path, fieldPath, state);
        }
    }

    /**
     * Añade un array de elementos si no existen y los sobrescribe tratándolos primero con una función si existen para no generar duplicados
     * en la BBDD de Cloud Firestore.
     * Este método supone que no hay duplicidades en la colección y la búsqueda devolverá un único resultado, si devolviese más, sólo se
     * editaría el primero.
     * @param {T} elements: elementos a añadir.
     * @param {string} path: ruta dentro de la BBDD de Cloud Firestore.
     * @param {string} fieldPath: propiedad única del elemento para poder buscarlo dentro del path.
     * @param state: estado al que afecta la operación para actualizar el estado de isLoading y reflejar la carga y posibles errores.
     * colección, para no sobrescribir elementos, sino sumar o tratar sus campos por ejemplo.
     * @param addMethod
     */
    customAddElementsCheckingIfExists<T>(
        elements: T[],
        path: string,
        fieldPath: string,
        state: States,
        addMethod: (source: T, destination: T) => T
    ) {
        for (const element of elements) {
            this.customAddElementCheckingIfExists(
                element,
                path,
                fieldPath,
                state,
                addMethod
            );
        }
    }

    /**
     * Añade un array de elementos a Cloud Firestore.
     * @param elements: array de documentos a incluir en la colección.
     * @param {string} path: ruta dentro de la BBDD de Cloud Firestore.
     * @param state: estado al que afecta la operación para actualizar el estado de isLoading y reflejar la carga y posibles errores.
     */
    addElements<T>(elements: T[], path: string, state: States) {
        for (const element of elements) {
            this.addElement(element, path, state);
        }
    }

    /**
     * Borra todos los elementos de una colección.
     * NOTA: según la arquitectura de Cloud Firestore, si tiene elementos que cuelgan de los elementos a eliminar, éstos no se eliminarán,
     * por lo que hay que estar seguro de que se borra el último elemento de un árbol.
     * @param {string} path: path de la colección a borrar.
     * @param state: estado al que afecta la operación para actualizar el estado de isLoading y reflejar la carga y posibles errores.
     */
    deleteCollection<T>(path: string, state: States) {
        this.startLoading(state);
        this.getCollectionWithID(path)
            .pipe(take(1))
            .subscribe((data: T[]) => {
                this.stopLoading(state);
                for (const element of data) {
                    this.deleteElement(element['id'], path, state);
                }
                this.messageService.setMessage('Colección borrada.');
                // Es muy importante usar pipe(take(1)) para cancelar la suscripción al primer resultado de la búsqueda o de lo contrario
                // borrará continuamente todos los elementos al mantenerse la suscripción activa.
            });
    }
}
