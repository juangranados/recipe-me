import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { catchError, finalize, take } from 'rxjs/operators';
import { select, Store } from '@ngrx/store';
import * as fromAuth from '../auth/auth.reducer';
import * as fromProfile from './profile.reducer';
import * as profileActions from './profile.actions';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
    uploadPercent: Observable<number>;
    downloadURL: Observable<string>;
    profileImage;
    uid: string;
    constructor(
        private storage: AngularFireStorage,
        private store: Store<fromProfile.State>
    ) {}

    ngOnInit(): void {
        this.store.pipe(select(fromAuth.getUid)).subscribe((uid: string) => {
            this.uid = uid;
            if (uid) {
                this.store.dispatch(new profileActions.GetProfileData());
            }
            this.profileImage = this.storage
                .ref(`${this.uid}/profile/profile`)
                .getDownloadURL();
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
