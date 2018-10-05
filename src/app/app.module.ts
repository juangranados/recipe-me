// src/app/app.module.ts
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import {
    RouterStateSerializer,
    StoreRouterConnectingModule
} from '@ngrx/router-store';
import { FlexLayoutModule } from '@angular/flex-layout';

import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { AuthModule } from './auth/auth.module';
import { CoreModule } from './core/core.module';
import { NgxSpinnerModule } from 'ngx-spinner'; // Spinner de carga.
import { metaReducers, reducers } from './app.reducer'; // Funciones reducer de la aplicación.
import { AuthEffects } from './auth/auth.effects';
import { ConfirmDialogComponent } from './shared/confirm-dialog/confirm-dialog.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material/material.module';
import { CustomSerializer } from './routing/router-serializer';
import { AngularFireStorageModule } from '@angular/fire/storage';

@NgModule({
    declarations: [AppComponent, ConfirmDialogComponent],
    imports: [
        AuthModule,
        BrowserModule,
        MaterialModule, // Angular Material
        FlexLayoutModule, // Angular Material Flex Layout
        BrowserAnimationsModule, // Angular Material Animations
        CoreModule,
        StoreModule.forRoot(reducers, { metaReducers }), // Funciones reducer de la aplicación.
        !environment.production
            ? StoreDevtoolsModule.instrument({ maxAge: 25 })
            : [], // Configuración de las herramientas de desarrollo sólo en entorno de desarrollo. Guarda 25 cambios de estado.
        EffectsModule.forRoot([AuthEffects]), // Efectos de ngrx. Sólo se importa los de auth porque cada módulo importará los suyos.
        StoreRouterConnectingModule.forRoot({ stateKey: 'router' }), // Añade el router al store con nombre router.
        AngularFireAuthModule, // imports firebase/auth, only needed for auth features.
        AngularFirestoreModule.enablePersistence(), // imports firebase/firestore, only needed for database features
        AngularFireModule.initializeApp(environment.firebase), // Inicializa Firebase
        AngularFireStorageModule // Modulo de almacenamiento.
    ],
    entryComponents: [ConfirmDialogComponent], // Para poder mostrar el diálogo en otros componentes.
    providers: [{ provide: RouterStateSerializer, useClass: CustomSerializer }],
    bootstrap: [AppComponent]
})
export class AppModule {}
