import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable, throwError } from 'rxjs';
import { Action, select, Store } from '@ngrx/store';
import * as fromAuth from '../auth/auth.reducer';
import * as profileActions from './profile.actions';
import { catchError, map, switchMap, take } from 'rxjs/operators';
import * as fromProfile from './profile.reducer';
import { AngularFirestore } from '@angular/fire/firestore';
import { ProfileModel } from './profile.model';
import { MessageService } from '../shared/message.service';

@Injectable()
export class ProfileEffects {
    constructor(
        private actions$: Actions,
        private store: Store<fromProfile.State>,
        private afs: AngularFirestore,
        private messageService: MessageService
    ) {}
    // Obtener datos del perfil de Firebase
    @Effect()
    getProfileData$: Observable<Action> = this.actions$
        .pipe(ofType(profileActions.SYNC_PROFILE_DATA))
        .pipe(switchMap(() => this.store.pipe(select(fromAuth.getUid))))
        .pipe(
            switchMap((uid: string) => {
                if (uid) {
                    return this.afs
                        .collection('users')
                        .doc<ProfileModel>(uid)
                        .valueChanges();
                } else {
                    return throwError(
                        new Error(
                            'No se pueden recuperar los datos del perfil porque el uid del usuario es null'
                        )
                    );
                }
            })
        )
        .pipe(
            map((profileData: ProfileModel) => {
                this.store
                    .pipe(
                        select(fromProfile.getIsSynced),
                        take(1)
                    )
                    .subscribe((isSynced: boolean) => {
                        if (!isSynced) {
                            this.store.dispatch(
                                new profileActions.SyncedProfileData()
                            );
                        }
                    });
                return new profileActions.StoreProfileData(profileData);
            }),
            catchError((error, caught) => {
                this.store.dispatch(
                    new profileActions.ErrorGettingProfileData(error.message)
                );
                this.store
                    .pipe(
                        select(fromAuth.getUid),
                        take(1)
                    )
                    .subscribe((uid: string) => {
                        if (uid) {
                            this.messageService.setMessage(error.message);
                        }
                    });
                return caught;
            })
        );
}
