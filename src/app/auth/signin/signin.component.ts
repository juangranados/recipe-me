// src/app/auth/signin/signin.component.ts
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import * as authActions from '../auth.actions';
import * as fromAuth from '../auth.reducer';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {
  // Propiedad para utilizar el formulario de login.
  signinForm: FormGroup;
  isLoading$: Observable<boolean>; // Observable que recuperará el valor isLoading del central store de Redux.
  /**
   * Constructor de la clase
   * @param store: parte del store relativa a auth.
   */
  constructor(private store: Store<fromAuth.State>) {}

  /**
   * Método ngOnInit que se ejecuta al crearse el componente.
   */
  ngOnInit() {
    // Crear el formulario
    this.signinForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required])
    });
    // Observable que indica si se está esperando la respuesta de Firebase para mostrar un Spinner.
    // Este observable al suscribirse a él con async devolverá el valor isLoading del central store.
    this.isLoading$ = this.store.pipe(select(fromAuth.getIsLoading));
  }
  /**
   * Método que se ejecuta al pulsar el botón de Entrar.
   */
  onSubmit() {
    this.store.dispatch(
      new authActions.Login({
        email: this.signinForm.value.email,
        password: this.signinForm.value.password
      })
    );
  }
}
