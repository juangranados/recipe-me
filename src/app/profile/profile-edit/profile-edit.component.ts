import { Component, OnInit } from '@angular/core';
import { catchError, finalize } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/storage';
import { select, Store } from '@ngrx/store';
import * as fromProfile from '../profile.reducer';
import * as fromAuth from '../../auth/auth.reducer';
import { ProfileModel } from '../profile.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from '../../shared/message.service';
import * as profileActions from '../profile.actions';
import { Router } from '@angular/router';

@Component({
    selector: 'app-profile-edit',
    templateUrl: './profile-edit.component.html',
    styleUrls: ['./profile-edit.component.css']
})
export class ProfileEditComponent implements OnInit {
    uploadPercent: Observable<number>; // Porcentaje de subida.
    profileImage = null; // Imagen actual del perfil.
    uid: string; // uid del usuario autenticado.
    isLoading = true; // Enlace de descarga de la foto no recibido.
    isUploading = false; // Enlace de descarga de la foto recibido.
    isSynced = false; // Perfil sincronizado con el store.
    profile: ProfileModel; // Datos del perfil.
    profileForm: FormGroup; // Formulario.
    newProfilePath = null;
    uploadError = false;

    constructor(
        private storage: AngularFireStorage,
        private store: Store<fromProfile.State>,
        private messageService: MessageService,
        private router: Router
    ) {}

    ngOnInit() {
        this.store
            .pipe(select(fromProfile.getIsLoading))
            .subscribe((isLoading: boolean) => {
                if (isLoading && this.isLoading) {
                    this.isLoading = false; // Evita que salgan dos spinner.
                }
            });
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
            )
            // profileImage: new FormControl(null, Validators.required)
        });
    }

    uploadFile(event) {
        if (this.newProfilePath) {
            this.storage.ref(this.newProfilePath).delete();
        }
        const file = event.target.files[0];
        const randomId = Math.random()
            .toString(36)
            .substring(2);
        this.newProfilePath = `${this.uid}/profile/${randomId}`;
        const fileRef = this.storage.ref(this.newProfilePath);
        this.isUploading = true;
        const task = this.storage.upload(this.newProfilePath, file);

        // get notified when the download URL is available
        task.snapshotChanges()
            .pipe(
                finalize(() =>
                    fileRef.getDownloadURL().subscribe(url => {
                        this.profileImage = url;
                        this.isUploading = false;
                        this.uploadError = false;
                    })
                ),
                catchError((error, caught) => {
                    this.messageService.setMessage(error.message);
                    this.uploadError = true;
                    return caught;
                })
            )
            .subscribe();

        // observe percentage changes
        this.uploadPercent = task.percentageChanges();
    }

    onSubmit() {
        this.isLoading = true;
        if (this.newProfilePath) {
            this.store.dispatch(
                new profileActions.SetProfileData({
                    ...this.profileForm.value,
                    profileImage: this.newProfilePath
                })
            );
            this.storage.ref(this.profile.profileImage).delete();

            this.router.navigate(['/profile']);
        } else {
            this.store.dispatch(
                new profileActions.SetProfileData({
                    ...this.profileForm.value,
                    profileImage: this.profile.profileImage
                })
            );
            this.router.navigate(['/profile']);
        }
    }
    onCancel() {
        this.isLoading = true;
        if (this.newProfilePath) {
            this.storage
                .ref(this.newProfilePath)
                .delete()
                .pipe(
                    finalize(() => {
                        this.router.navigate(['/profile']);
                    })
                )
                .subscribe();
        } else {
            this.router.navigate(['/profile']);
        }
    }
}
