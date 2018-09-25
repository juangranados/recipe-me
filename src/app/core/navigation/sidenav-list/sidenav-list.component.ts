import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
// Carga del ngrx store
import { select, Store } from '@ngrx/store';
import * as fromAuth from '../../../auth/auth.reducer';
import * as authActions from '../../../auth/auth.actions'; // Importar las acciones disponibles para Auth.

@Component({
  selector: 'app-sidenav-list',
  templateUrl: './sidenav-list.component.html',
  styleUrls: ['./sidenav-list.component.css']
})
export class SidenavListComponent implements OnInit {
  @Output()
  closeSidenav = new EventEmitter<void>(); // Evento que indica la pulsación del botón que cierra el menú lateral.

  isAuthenticated$: Observable<boolean>; // Observable que indicará el estado de la autenticación obteniéndolo del store.

  constructor(private store: Store<fromAuth.State>) {}

  ngOnInit() {
    // Observable que indica si el usuario está logueado.
    // Este observable al suscribirse a él mediante async devolverá el valor isAuthenticated del central store.
    this.isAuthenticated$ = this.store.pipe(
      select(fromAuth.getIsAuthenticated)
    );
  }

  /**
   * Método que se ejecuta al pulsar el botón de cerrar el panel lateral.
   */
  onClose() {
    // Se emite el evento que indica la pulsación de cualquier botón que cerrará el menú lateral.
    this.closeSidenav.emit();
  }

  /**
   * Método que se ejecuta al pulsar el icono de logout.
   */
  onLogout() {
    // Se emite el evento que indica la pulsación de cualquier botón que cerrará el menú lateral.
    this.closeSidenav.emit();
    // Se sale de sesión.
    this.store.dispatch(new authActions.Logout());
  }
}
