import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
// Carga del ngrx store
import { select, Store } from '@ngrx/store';
import * as fromAuth from '../../../auth/auth.reducer';
import * as authActions from '../../../auth/auth.actions';
import { Router } from '@angular/router'; // Importar las acciones disponibles para Auth.

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Output()
  sidenavToggle = new EventEmitter<void>(); // Evento que indica la pulsación del botón que abre el menú lateral.

  isAuthenticated$: Observable<boolean>; // Observable que indicará el estado de la autenticación obteniéndolo del store.

  constructor(private store: Store<fromAuth.State>, private router: Router) {}

  ngOnInit() {
    // Observable que indica si el usuario está logueado.
    // Este observable al suscribirse a él mediante async devolverá el valor isAuthenticated del central store.
    this.isAuthenticated$ = this.store.pipe(
      select(fromAuth.getIsAuthenticated)
    );
  }

  /**
   * Método que se ejecuta al pulsar el botón de abrir el panel lateral.
   */
  onToggleSidenav() {
    // Se emite el evento que indica la pulsación del botón que abre el menú lateral.
    this.sidenavToggle.emit();
  }
  /**
   * Método que se ejecuta al pulsar el icono de logout.
   */
  onLogout() {
    // Se sale de sesión.
    this.store.dispatch(new authActions.Logout());
  }
}
