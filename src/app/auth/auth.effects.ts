// src/app/auth/auth.effects.ts
import { Actions, Effect, ofType } from '@ngrx/effects';
import { AngularFireAuth } from '@angular/fire/auth';
import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { Action, Store } from '@ngrx/store';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';

import * as authActions from './auth.actions';
import * as fromAuth from './auth.reducer';
import { MessageService } from '../shared/message.service';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable()
export class AuthEffects {
  private birthDate;
  /**
   *
   * @param actions$: las clases con efectos siempre reciben un observable de tipo Action para filtrar las acciones.
   * @param AfAuth: instancia de la clase AngularFireAuth para manejar e interactuar con la autenticación de Firebase.
   * @param angularFirestore
   * @param store: store de la parte auth para poder lanzar acciones.
   * @param messageService: instancia de la clase MessageService para mostrar mensajes al usuario.
   * @param router: instancia de la clase Router de Angular para poder navegar tras la autenticación o logout.
   */
  constructor(
    private actions$: Actions,
    private AfAuth: AngularFireAuth,
    private angularFirestore: AngularFirestore,
    private store: Store<fromAuth.State>,
    private messageService: MessageService,
    private router: Router
  ) {}

  @Effect()
  login$: Observable<Action> = this.actions$
    .pipe(ofType(authActions.LOGIN)) // Sólo se ejecuta este efecto ante acciones de tipo LOGIN.
    .pipe(map((action: authActions.Login) => action.payload)) // Se recupera el payload
    .pipe(
      switchMap(authData => {
        // Se intenta autenticar el usuario en Firebase con las credenciales proporcionadas.
        // Se devuelve un observable que retornará los datos del usuario o un error.
        return from(
          this.AfAuth.auth.signInWithEmailAndPassword(
            authData.email,
            authData.password
          )
        );
      })
    )
    .pipe(
      map(() => {
        // Autenticación correcta
        // Se registra la acción de login correcto.
        return new authActions.LoginSuccessful();
      }),
      catchError((error, caught) => {
        // Error de autenticación.
        this.messageService.setMessage(
          'Error de autenticación: ' + error.message
        ); // Mensaje de error por pantalla.
        this.store.dispatch(new authActions.LoginError(error)); // Se registra el error en el store.
        return caught; // Si se devuelve caught el efecto volverá a ejecutarse. Por defecto tras un error el efecto no se vuelve a ejecutar.
      })
    );

  // Efecto para la acción REGISTER.
  @Effect()
  register$: Observable<Action> = this.actions$
    .pipe(ofType(authActions.REGISTER)) // Sólo se ejecuta este efecto ante acciones de tipo REGISTER.
    .pipe(map((action: authActions.Register) => action.payload)) // Se recupera el payload
    .pipe(
      switchMap(authData => {
        this.birthDate = authData.birthDate;
        // Se intenta crear el usuario en Firebase con las credenciales proporcionadas.
        // Se devuelve un observable que retornará los datos del usuario o un error.
        return from(
          this.AfAuth.auth.createUserWithEmailAndPassword(
            authData.email,
            authData.password
          )
        );
      })
    )
    .pipe(
      switchMap(userData => {
        // Registro correcto. Se crea documento del usuario en firebase.
        return from(
          this.angularFirestore
            .collection('users')
            .doc(`${userData.user.uid}`)
            .set({
              email: userData.user.email,
              birthDate: this.birthDate.toLocaleDateString('es-ES')
            })
        ); // Crear campo
      })
    )
    .pipe(
      map(() => new authActions.RegisterSuccessful()),
      catchError((error, caught) => {
        // Error de registro.
        this.messageService.setMessage('Error de registro: ' + error.message); // Mensaje de error por pantalla.
        this.store.dispatch(new authActions.RegisterError(error)); // Se registra el error en el store.
        return caught; // Si se devuelve caught el efecto volverá a ejecutarse. Por defecto tras un error el efecto no se vuelve a ejecutar.
      })
    );

  // Efecto para la acción GET_AUTHENTICATION.
  @Effect()
  getUser$: Observable<Action> = this.actions$
    .pipe(ofType(authActions.GET_AUTHENTICATION)) // Sólo se ejecuta este efecto ante acciones de tipo GET_AUTHENTICATION.
    .pipe(
      switchMap(() => {
        return this.AfAuth.authState; // Se devuelve un observable que informa de los cambios en la autenticación.
      })
    )
    .pipe(
      map(authData => {
        // Datos recibidos de authState
        if (authData) {
          // Hay usuario autenticado.
          this.router
            .navigate(['/']) // Se navega a la raíz.
            .catch(error => {
              this.messageService.setMessage(
                'Error en la navegación a la raíz: ' + error.message
              );
            });
          return new authActions.SetAuthenticated({
            uid: authData.uid,
            email: authData.email
          }); // Se registran los datos del usuario en el store.
        } else {
          // No hay usuario autenticado.
          this.router
            .navigate(['/sign-in']) // Se navega a la página de inicio de sesión.
            .catch(error => {
              this.messageService.setMessage(
                'Error en la navegación a /login: ' + error.message
              );
            });
          return new authActions.SetUnauthenticated(); // Se registra en el store que no hay ningún usuario autenticado.
        }
      }),
      catchError((error, caught) => {
        // Error al recuperar la autenticación.
        this.messageService.setMessage(
          'Error al consultar el estado de la autenticación en Firebase: ' +
            error.message
        ); // Se muestra el error por pantalla.
        this.store.dispatch(new authActions.GetAuthenticationError(error)); // Se registra el error en el estado.
        return caught; // Si se devuelve caught el efecto volverá a ejecutarse. Por defecto tras un error el efecto no se vuelve a ejecutar.
      })
    );

  // Efecto para la acción LOGOUT.
  @Effect()
  logout$: Observable<Action> = this.actions$
    .pipe(ofType(authActions.LOGOUT)) // Sólo se ejecuta este efecto ante acciones de tipo GET_AUTHENTICATION.
    .pipe(
      switchMap(() => {
        return this.AfAuth.auth.signOut(); // Se ejecuta la acción de logout.
      })
    )
    .pipe(
      map(() => {
        // Logout correcto.
        // Se registra la acción de logout correcto.
        return new authActions.LogoutSuccessful();
      }),
      catchError((error, caught) => {
        // Error en el logout.
        this.messageService.setMessage('Error en logout: ' + error.message); // Se muestra el error por pantalla.
        this.store.dispatch(new authActions.LogoutError(error)); // Se registra en el store el error.
        return caught; // Si se devuelve caught el efecto volverá a ejecutarse. Por defecto tras un error el efecto no se vuelve a ejecutar.
      })
    );
}
