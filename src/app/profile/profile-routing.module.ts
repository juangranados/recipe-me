import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileComponent } from './profile.component';
import { ProfileViewComponent } from './profile-view/profile-view.component';
import { ProfileEditComponent } from './profile-edit/profile-edit.component';

const profileRoutes: Routes = [
    {
        path: '',
        component: ProfileComponent,
        children: [
            { path: '', component: ProfileViewComponent },
            { path: 'edit', component: ProfileEditComponent }
        ]
    }
];
@NgModule({
    imports: [RouterModule.forChild(profileRoutes)],
    exports: [RouterModule],
    declarations: []
})
export class ProfileRoutingModule {}
