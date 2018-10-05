import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import * as fromProfile from '../profile.reducer';
import { AngularFireStorage } from '@angular/fire/storage';
import * as fromRoot from '../../app.reducer';
import { ProfileModel } from '../profile.model';
import { MessageService } from '../../shared/message.service';

@Component({
    selector: 'app-profile-view',
    templateUrl: './profile-view.component.html',
    styleUrls: ['./profile-view.component.css']
})
export class ProfileViewComponent implements OnInit {
    isLoading = true; // Se utiliza para mostrar un spinner mientras se obtiene el enlace de descarga de la imagen de Firebase.
    isSynced = false; // Se utiliza para saber si el estado del perfil está conectado con Cloud Firestore.
    profileImage: string; // Ruta de descarga de la imagen.
    profile: ProfileModel; // Datos del perfil del usuario.

    constructor(
        private storage: AngularFireStorage, // Módulo para interactuar con el almacenamiento de Firebase
        private store: Store<fromRoot.State>, // Estado de la aplicación
        private messageService: MessageService
    ) {}

    /**
     * Método ngOnInit que se ejecuta al inicio del componente.
     */
    ngOnInit() {
        // Se obtiene el perfil del usuario del estado.
        this.store
            .pipe(select(fromProfile.getProfile))
            .subscribe((profileData: ProfileModel) => {
                // Si hay datos, ya que puede no haberlos si se ha recargado la
                // página y se ha lanzado la sincronización entre Firebase y el
                // estado en el componente padre, puede tardar algo en sincronizarse.
                if (profileData.name) {
                    // Se obtiene la url de descarga desde la ruta de Firebase Storage.
                    this.storage
                        .ref(profileData.profileImage)
                        .getDownloadURL() // Método que obtiene la ruta descargable de la imagen del perfil.
                        .toPromise()
                        .then((url: string) => {
                            this.profileImage = url; // Ruta de la imagen.
                            this.isLoading = false; // Se ha obtenido la ruta, ya no se muestra el spinner.
                        })
                        .catch(error =>
                            this.messageService.setMessage(error.message)
                        );
                    this.profile = profileData; // Se obtienen los datos del perfil.
                    this.isSynced = true; // El perfil está sincronizado.
                }
            });
    }
}
