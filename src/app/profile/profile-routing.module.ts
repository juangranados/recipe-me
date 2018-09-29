import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileComponent } from './profile.component';

const authRoutes: Routes = [{ path: '', component: ProfileComponent }];
@NgModule({
    imports: [RouterModule.forChild(authRoutes)],
    exports: [RouterModule],
    declarations: []
})
export class ProfileRoutingModule {}
