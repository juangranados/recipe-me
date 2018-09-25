// src/app/auth/auth-routing.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {SigninComponent} from './signin/signin.component';
import {SignupComponent} from './signup/signup.component';

const authRoutes: Routes = [
    { path: 'sign-in', component: SigninComponent },
    { path: 'sign-up', component: SignupComponent }
];

@NgModule({
    imports: [
        RouterModule.forChild(authRoutes)
    ],
    exports: [RouterModule],
    declarations: []
})
export class AuthRoutingModule { }
