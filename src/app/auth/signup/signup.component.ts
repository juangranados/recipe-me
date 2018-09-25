import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import * as fromAuth from '../auth.reducer';
import * as authActions from '../auth.actions';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
    signupForm: FormGroup; // Formulario de registro
    maxDateToRegister: Date; // Fecha que contiene 18 años atrás.
    isLoading$: Observable<boolean>; // Observable que recuperará el valor isLoading del central store de Redux.

    constructor(private store: Store<fromAuth.State>) {}

    /**
     * Método que comprueba si las contraseñas coinciden.
     * @param formGroup: formulario que pasa Angular de manera automática.
     */
    static passwordMatchValidator(formGroup: FormGroup) {
        return formGroup.get('password1').value ===
            formGroup.get('password2').value
            ? null
            : { passwordMismatch: true };
    }
    /**
     * Método ngOnInit que se ejecuta al crearse el componente.
     */
    ngOnInit() {
        // Creación del nuevo formulario con los valores por defecto.
        this.signupForm = new FormGroup(
            {
                email: new FormControl(null, [
                    Validators.required,
                    Validators.pattern(
                        '[A-Za-z0-9._%+-]{3,}@[a-zA-Z]{2,}([.]{1}[a-zA-Z]{2,}|[.]{1}[a-zA-Z]{2,}[.]{1}[a-zA-Z]{2,})'
                    )
                ]),
                password1: new FormControl(null, [
                    Validators.required,
                    Validators.minLength(6)
                ]),
                password2: new FormControl(null, Validators.required),
                birthDate: new FormControl(null, Validators.required),
                agree: new FormControl(null, Validators.required)
            },
            SignupComponent.passwordMatchValidator
        );
        // Restar 18 años a la fecha actual para determinar la edad mínima de registro.
        this.maxDateToRegister = new Date();
        this.maxDateToRegister.setFullYear(
            this.maxDateToRegister.getFullYear() - 18
        );

        // Observable que indica si se está esperando la respuesta de Firebase para mostrar un Spinner.
        // Este observable al suscribirse a él con async devolverá el valor isLoading del central store.
        this.isLoading$ = this.store.pipe(select(fromAuth.getIsLoading));
    }

    /**
     * Método que se ejecuta al pulsar el botón de Entrar.
     */
    onSubmit() {
        this.store.dispatch(
            new authActions.Register({
                email: this.signupForm.value.email,
                password: this.signupForm.value.password1,
                birthDate: this.signupForm.value.birthDate
            })
        );
        this.signupForm.reset();
    }
}
