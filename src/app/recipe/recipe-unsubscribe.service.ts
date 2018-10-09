import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
/**
 * Permite lanzar un observable que para la sincronización que se produce en RecipeEffects
 * entre Firebase y el perfil.
 */
export class RecipeUnsubscribeService {
    // Subject que emite datos mediante el método next()
    public unsubscribeComponent$ = new Subject<void>();
    // Se transforma el subject en un observable para que pueda ser consumido por takeUntil
    // de manera que al primer next takeUntil pare la suscripción.
    public unsubscribe$ = this.unsubscribeComponent$.asObservable();
    constructor() {}
}
