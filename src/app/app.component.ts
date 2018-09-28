// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import * as authActions from './auth/auth.actions';
import * as fromAuth from './auth/auth.reducer';
import { Store } from '@ngrx/store';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    constructor(private authStore: Store<fromAuth.State>) {}
    ngOnInit(): void {
        // Se inicia la suscripción a la autenticación de usuarios de Firebase.
        this.authStore.dispatch(new authActions.GetAuthentication());
    }
}
