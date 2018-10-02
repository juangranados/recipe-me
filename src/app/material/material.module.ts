import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatTabsModule,
    MatCardModule,
    MatSelectModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatSnackBarModule,
    MatDialogModule,
    MatMenuModule,
    MAT_DATE_LOCALE,
    MatPaginatorIntl
} from '@angular/material';
import { getSpanishPaginatorIntl } from './spanish-paginator-intl';
const materialModules = [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatTabsModule,
    MatCardModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatDialogModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatSnackBarModule,
    MatMenuModule
];
@NgModule({
    imports: [...materialModules],
    exports: [...materialModules],
    providers: [
        { provide: MAT_DATE_LOCALE, useValue: 'es-ES' }, // Formato español para el datepicker.
        { provide: MatPaginatorIntl, useValue: getSpanishPaginatorIntl() } // Traducción del paginador de tablas.
    ],

    declarations: []
})
export class MaterialModule {}
