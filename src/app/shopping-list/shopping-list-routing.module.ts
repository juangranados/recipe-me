import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../auth/auth.guard';
import { ShoppingListComponent } from './shopping-list.component';
// canActivate es redundante al tener el canLoad en la ruta cargada con lazy loading.
// Se deja por motivos de demostración.
const shoppingListRoutes: Routes = [
    { path: '', canActivate: [AuthGuard], component: ShoppingListComponent }
];

@NgModule({
    imports: [
        RouterModule.forChild(shoppingListRoutes)
    ],
    exports: [RouterModule],
    declarations: []
})
export class ShoppingListRoutingModule { }
