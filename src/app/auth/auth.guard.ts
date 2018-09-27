// src/app/auth/auth.guard.ts
import { Injectable, OnDestroy } from '@angular/core';
import {
    CanActivate,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    Router,
    CanLoad,
    Route
} from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import * as fromAuth from './auth.reducer';
import { select, Store } from '@ngrx/store';

@Injectable({
    providedIn: 'root'
})
/**
 * Route Guard que sólo permite entrar a una ruta si el usuario está autenticado.
 */
export class AuthGuard implements CanActivate, CanLoad, OnDestroy {
    isAuthenticated = false;
    isAuthenticatedSubscription: Subscription;
    constructor(private store: Store<fromAuth.State>, private router: Router) {
        this.isAuthenticatedSubscription = this.store
            .pipe(select(fromAuth.getAuthState))
            .subscribe(isAuthenticated => {
                this.isAuthenticated = !!isAuthenticated;
            });
    }
    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {
        // Observable que indica si el usuario está logueado.
        // Este observable al suscribirse a él devolverá el valor isAuthenticated del auth store.
        // canActivate puede devolver un observable del que sólo se toma el primer valor y se cierra la suscripción.
        return this.isAuthenticated;
    }

    canLoad(route: Route): Observable<boolean> | Promise<boolean> | boolean {
        // Observable que indica si el usuario está logueado.
        // Este observable al suscribirse a él devolverá el valor isAuthenticated del auth store.
        // canActivate puede devolver un observable del que sólo se toma el primer valor y se cierra la suscripción.
        return this.isAuthenticated;
    }

    ngOnDestroy(): void {
        this.isAuthenticatedSubscription.unsubscribe();
    }
}
