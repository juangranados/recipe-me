import { Component, OnInit } from '@angular/core';
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
    isUploading = false; // Se está subiendo una imagen (para mostrar el progreso)
    isSynced = false; // Perfil sincronizado con el store.
    profile: ProfileModel; // Datos del perfil.
    profileForm: FormGroup; // Formulario.
    newProfilePath = null; // Ruta de la nueva foto en el storage.
    uploadError = false; // Error al subir la imagen.

    /**
     * Constructor de la clase
     * @param storage: instancia global de la clase AngularFireStorage para subir y descargar archivos.
     * @param store: estado de la aplicación.
     * @param messageService: instancia global de la clase MessageService para mostrar mensajes.
     * @param router: instancia global de la clase Router para navegar.
     */
    constructor(
        private storage: AngularFireStorage,
        private store: Store<fromProfile.State>,
        private messageService: MessageService,
        private router: Router
    ) {}

    ngOnInit() {
        // Se comprueba si está cargando el perfil para no mostrar dos spinner.
        // Este caso solo se daría en la recarga de págino ya que el perfil se sincroniza con el estado
        // en ProfileComponent.
        this.store
            .pipe(select(fromProfile.getIsLoading))
            .subscribe((isLoading: boolean) => {
                if (isLoading && this.isLoading) {
                    this.isLoading = false; // Evita que salgan dos spinner.
                }
            });
        // Se obtiene el UID del usuario autenticado para saber donde guardar la
        // nueva imagen de perfil.
        this.store.pipe(select(fromAuth.getUid)).subscribe((uid: string) => {
            if (uid) {
                this.uid = uid;
            }
        });
        // Se obtienen los datos del perfil almacenados en el estado que se han
        // recuperado de Cloud Firestore.
        this.store
            .pipe(select(fromProfile.getProfile))
            .subscribe((profileData: ProfileModel) => {
                if (profileData.name) {
                    // Obtiene el enlace de descarga del path de Firestore.
                    this.storage
                        .ref(profileData.profileImage)
                        .getDownloadURL()
                        .toPromise()
                        .then((url: string) => {
                            this.profileImage = url;
                            this.isLoading = false;
                        })
                        .catch(error =>
                            this.messageService.setMessage(error.message)
                        );
                    this.profile = profileData; // Resto de datos del perfil.
                    this.initForm(); // Se inicia el formulario con los datos existentes.
                    this.isSynced = true; // El estado esta sincronizado con Cloud Firestore.
                }
            });
    }

    /**
     * Inicia los valores del formulario.
     */
    initForm() {
        this.profileForm = new FormGroup({
            name: new FormControl(this.profile.name, Validators.required),
            surname: new FormControl(this.profile.surname, Validators.required),
            birthDate: new FormControl(
                this.profile.birthDate,
                Validators.required
            )
        });
    }

    /**
     * Sube la imagen al seleccionarla en la vista
     * @param event: contiene la imagen a subir entre sus propiedades.
     */
    uploadFile(event) {
        // Si ya había una subida, se borra.
        if (this.newProfilePath) {
            this.storage.ref(this.newProfilePath).delete();
        }
        // Imagen seleccionada por el usuario.
        const file = event.target.files[0];
        // Generar un id aleatorio para la imagen
        const randomId = Math.random()
            .toString(36)
            .substring(2);
        // Ruta de la imagen dentro de Firebase.
        this.newProfilePath = `${this.uid}/profile/${randomId}`;
        // Referencia de la imagen para subir.
        const fileRef = this.storage.ref(this.newProfilePath);
        // Para mostrar la barra de progreso.
        this.isUploading = true;
        // Subir imagen
        const task = this.storage.upload(this.newProfilePath, file);

        // Actuar después de la subida o ante error.
        task.then(() =>
            // Al terminar, se obtiene la url para descargar la imagen.
            fileRef.getDownloadURL().subscribe(url => {
                this.profileImage = url;
                this.isUploading = false;
                this.uploadError = false;
            })
        ).catch(error => {
            // Se produce un error en la subida.
            this.messageService.setMessage(error.message);
            this.uploadError = true;
        });

        // Observable que indica el porcentaje de la subida.
        this.uploadPercent = task.percentageChanges();
    }

    /**
     * Se envía el formulario.
     * Se actualiza el perfil en Cloud Firestore y se borra la imagen anterior
     * si se ha seleccionado una nueva.
     */
    onSubmit() {
        this.isLoading = true; // Se esta cargando.
        // Si hay nueva imagen, se graba en el perfil y borra la anterior de Firebase.
        if (this.newProfilePath) {
            this.store.dispatch(
                new profileActions.SetProfileData({
                    ...this.profileForm.value,
                    profileImage: this.newProfilePath
                })
            );
            // Borrar imagen anterior.
            this.storage
                .ref(this.profile.profileImage)
                .delete()
                .toPromise()
                .catch(error => this.messageService.setMessage(error.message));

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

    /**
     * Se navega de vuelta borrando la imagen subida si la hay.
     */
    onCancel() {
        this.isLoading = true;
        // Se borra la imagen  de Firebase si el usuario ha subido alguna.
        if (this.newProfilePath) {
            this.storage
                .ref(this.newProfilePath)
                .delete()
                .toPromise()
                .then(() => this.router.navigate(['/profile']))
                .catch(error => this.messageService.setMessage(error.message));
        } else {
            this.router.navigate(['/profile']);
        }
    }
}
