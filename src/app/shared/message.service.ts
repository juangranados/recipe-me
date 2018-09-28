import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Message, MessageType } from './message.model';
import { Store } from '@ngrx/store';
import * as fromShoppingList from '../shopping-list/shopping-list.reducer';
import * as shoppingListActions from '../shopping-list/shopping-list.actions';
import { MatSnackBar } from '@angular/material';

@Injectable({
    providedIn: 'root'
})
export class MessageService {
    public message = new Subject<Message>();
    public setMessage(message: string) {
        this.matSnackBar.open(message, null, { duration: 3000 });
    }
    constructor(
        private store: Store<fromShoppingList.State>,
        private matSnackBar: MatSnackBar
    ) {}
}
