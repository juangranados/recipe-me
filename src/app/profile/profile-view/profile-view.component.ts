import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import * as fromAuth from '../../auth/auth.reducer';
import * as fromProfile from '../profile.reducer';
import * as profileActions from '../profile.actions';
import { AngularFireStorage } from '@angular/fire/storage';
import * as fromRoot from '../../app.reducer';
import { ProfileModel } from '../profile.model';
import { take } from 'rxjs/operators';

@Component({
    selector: 'app-profile-view',
    templateUrl: './profile-view.component.html',
    styleUrls: ['./profile-view.component.css']
})
export class ProfileViewComponent implements OnInit {
    isLoading = true;
    isSynced = false;
    profileImage: string;
    profile: ProfileModel;

    constructor(
        private storage: AngularFireStorage,
        private store: Store<fromRoot.State>
    ) {}

    ngOnInit() {
        this.store
            .pipe(select(fromProfile.getProfile))
            .subscribe((profileData: ProfileModel) => {
                if (profileData.name) {
                    this.storage
                        .ref(profileData.profileImage)
                        .getDownloadURL()
                        .subscribe((url: string) => {
                            this.profileImage = url;
                            this.isLoading = false;
                        });
                    this.profile = profileData;
                    this.isSynced = true;
                }
            });
    }
}
