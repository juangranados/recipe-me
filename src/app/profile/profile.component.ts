import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import * as fromProfile from './profile.reducer';
import * as fromAuth from '../auth/auth.reducer';
import * as profileActions from './profile.actions';
import { ProfileUnsubscribeService } from './profile-unsubscribe.service';
import { take } from 'rxjs/operators';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
    isLoading$: Observable<boolean>; // Observable para mostrar o no el spinner
    constructor(
        private store: Store<fromProfile.State>,
        private unsubscribeService: ProfileUnsubscribeService
    ) {}

    ngOnInit(): void {
        // Suscripción a la propiedad isLoading del estado para mostrar el spinner.
        this.isLoading$ = this.store.pipe(select(fromProfile.getIsLoading));
        // Se lanza la sincronización del estado del perfil con Firebase en el
        // caso de no estar ya sincronizado.
        this.store
            .pipe(select(fromProfile.getIsSynced))
            .pipe(take(1))
            .subscribe((isSynced: boolean) => {
                if (!isSynced) {
                    this.store
                        .pipe(select(fromAuth.getUid))
                        .subscribe((uid: string) => {
                            if (uid) {
                                // Se sincroniza sólo cuando se obtiene el UID del usuario logueado.
                                this.store.dispatch(
                                    new profileActions.StartSyncProfileData()
                                );
                            }
                        });
                }
            });
    }
    /**
     * Al salir del componente, se libera la memoria del state, ya que no se
     * utiliza fuera de este componente.
     */
    ngOnDestroy(): void {
        // Se para la suscripción a Firebase.
        this.unsubscribeService.unsubscribeComponent$.next();
        // Se liberan los datos del store.
        this.store.dispatch(new profileActions.StopSyncProfileData());
    }
}
