import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/storage';
import { select, Store } from '@ngrx/store';
import * as fromProfile from '../profile.reducer';
import * as fromAuth from '../../auth/auth.reducer';
import { ProfileModel } from '../profile.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-profile-edit',
    templateUrl: './profile-edit.component.html',
    styleUrls: ['./profile-edit.component.css']
})
export class ProfileEditComponent implements OnInit {
    uploadPercent: Observable<number>; // Porcentaje de subida.
    downloadURL: Observable<string>; // ruta de la imagen subida.
    profileImage; // Imagen actual del perfil.
    uid: string; // uid del usuario autenticado.
    isLoading = true; // Enlace de descarga de la foto recibido.
    isSynced = false; // Perfil sincronizado con el store.
    profile: ProfileModel; // Datos del perfil.
    profileForm: FormGroup; // Formulario.

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
                if (profileData.name) {
                    this.storage
                        .ref(profileData.profileImage)
                        .getDownloadURL()
                        .subscribe((url: string) => {
                            this.profileImage = url;
                            this.isLoading = false;
                        });
                    this.profile = profileData;
                    this.initForm();
                    this.isSynced = true;
                }
            });
    }
    initForm() {
        this.profileForm = new FormGroup({
            name: new FormControl(this.profile.name, Validators.required),
            surname: new FormControl(this.profile.surname, Validators.required),
            birthDate: new FormControl(
                this.profile.birthDate,
                Validators.required
            ),
            profileImage: new FormControl()
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
    onSubmit() {}
    onCancel() {}
}
