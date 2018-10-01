import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/storage';
import { select, Store } from '@ngrx/store';
import * as fromProfile from '../profile.reducer';
import * as fromAuth from '../../auth/auth.reducer';
import * as profileActions from '../profile.actions';
import { ProfileModel } from '../profile.model';

@Component({
    selector: 'app-profile-edit',
    templateUrl: './profile-edit.component.html',
    styleUrls: ['./profile-edit.component.css']
})
export class ProfileEditComponent implements OnInit {
    uploadPercent: Observable<number>;
    downloadURL: Observable<string>;
    profileImage;
    uid: string;
    isLoading = true;
    profile: ProfileModel;

    constructor(
        private storage: AngularFireStorage,
        private store: Store<fromProfile.State>
    ) {}

    ngOnInit() {
        this.store.pipe(select(fromAuth.getUid)).subscribe((uid: string) => {
            if (uid) {
                this.uid = uid;
            }
        });
        this.store
            .pipe(select(fromProfile.getProfile))
            .subscribe((profileData: ProfileModel) => {
                if (profileData) {
                    this.storage
                        .ref(profileData.profileImage)
                        .getDownloadURL()
                        .subscribe((url: string) => {
                            this.profileImage = url;
                            this.isLoading = false;
                        });
                    this.profile = profileData;
                } else {
                    this.store.dispatch(new profileActions.GetProfileData());
                }
            });
    }

    uploadFile(event) {
        const file = event.target.files[0];
        const filePath = `${this.uid}/profile/profile`;
        const fileRef = this.storage.ref(filePath);
        const task = this.storage.upload(filePath, file);

        // observe percentage changes
        this.uploadPercent = task.percentageChanges();
        // get notified when the download URL is available
        task.snapshotChanges()
            .pipe(finalize(() => (this.downloadURL = fileRef.getDownloadURL())))
            .subscribe();
    }
}
