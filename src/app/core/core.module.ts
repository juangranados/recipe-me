import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './navigation/header/header.component';
import { HomeComponent } from './home/home.component';
import { RoutingModule } from '../routing/routing.module';
import { MaterialModule } from '../material/material.module';
import { SidenavListComponent } from './navigation/sidenav-list/sidenav-list.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

@NgModule({
    imports: [
        CommonModule, // Para usar directivas de Angular.
        RoutingModule, // Para poder navegar.
        BrowserAnimationsModule, // Animaciones de Angular Material.
        MaterialModule, // Angular Material.
        FlexLayoutModule // Flex Layout para Angular Material.
    ],
    declarations: [
        // Componentes declarados en AppModule que pasan a estar en este módulo por limpieza.
        HeaderComponent,
        HomeComponent,
        SidenavListComponent,
        PageNotFoundComponent
    ],
    exports: [
        HeaderComponent, // Para poder hacer referencia a él desde otros componentes usando el selector <app-header></app-header>.
        SidenavListComponent, // Para poder hacer referencia a él desde otros componentes usando el selector <app-sidenav-list></app-sidenav-list>.
        RoutingModule // Para que esté disponible la navegación en los componentes y no volver a importarla en AppModule.
    ]
})
export class CoreModule {}
