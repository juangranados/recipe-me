import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { Action, select, Store } from '@ngrx/store';
import * as fromAuth from '../auth/auth.reducer';
import * as profileActions from './profile.actions';
import { catchError, map, switchMap } from 'rxjs/operators';
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
    @Effect()
    getProfileData$: Observable<Action> = this.actions$
        .pipe(ofType(profileActions.GET_PROFILE_DATA)) // Sólo se ejecuta este efecto ante acciones de tipo GET_AUTHENTICATION.
        .pipe(switchMap(() => this.store.pipe(select(fromAuth.getUid))))
        .pipe(
            switchMap((uid: string) =>
                this.afs
                    .collection('users')
                    .doc<ProfileModel>(uid)
                    .valueChanges()
            )
        )
        .pipe(
            map((profileData: ProfileModel) => {
                return new profileActions.StoreProfileData(profileData);
            }),
            catchError((error, caught) => {
                this.store.dispatch(
                    new profileActions.ErrorGettingProfileData(error.message)
                );
                this.messageService.setMessage(error.message);
                return caught;
            })
        );
}
