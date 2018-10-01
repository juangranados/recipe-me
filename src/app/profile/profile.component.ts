import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import * as fromProfile from './profile.reducer';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
    isLoading$: Observable<boolean>; // Observable para mostrar o no el spinner
    constructor(private store: Store<fromProfile.State>) {}

    ngOnInit(): void {
        // Suscripción a la propiedad isLoading del estado para mostrar el spinner.
        this.isLoading$ = this.store.pipe(select(fromProfile.getIsLoading));
    }
}
