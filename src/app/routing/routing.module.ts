// src/app/routing/routing.module.ts
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth/auth.guard';
import { HomeComponent } from '../core/home/home.component';
import { PageNotFoundComponent } from '../core/page-not-found/page-not-found.component';

// Rutas de la aplicación
// Lazy loading para RecipeModule y ShoppingListModule
const appRoutes: Routes = [
    // Ruta home, solo se puede entrar autenticado, por eso se protege con canActivate
    { path: '', component: HomeComponent, canActivate: [AuthGuard] },
    // Rutas precargadas, solo se puede entrar autenticado, por eso se protege con canLoad al estar precargadas.
    // { path: 'recipes', loadChildren: '../recipe/recipe.module#RecipeModule', canLoad: [AuthGuard] },
    {
        path: 'recipes',
        loadChildren: '../recipe/recipe.module#RecipeModule',
        canLoad: [AuthGuard],
        runGuardsAndResolvers: 'always' // Para que ejecute los guards al refrescar página
    },
    {
        path: 'shopping-list',
        loadChildren:
            '../shopping-list/shopping-list.module#ShoppingListModule',
        canLoad: [AuthGuard],
        runGuardsAndResolvers: 'always' // Para que ejecute los guards al refrescar página
    },
    { path: 'not-found', component: PageNotFoundComponent },
    { path: '**', redirectTo: '/not-found' }
];

// Se importa y exporta RouterModule.
// forRoot() configura las rutas en Angular para la el root module, para el resto de módulos de
// rutas se utilizará forChild()
@NgModule({
    imports: [
        RouterModule.forRoot(appRoutes, {
            preloadingStrategy: PreloadAllModules,
            onSameUrlNavigation: 'reload' // Para que permita refresco de página.
        })
    ],
    exports: [RouterModule],
    declarations: []
})
export class RoutingModule {}
