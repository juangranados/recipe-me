import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent implements OnInit {
  // Recepción de datos de los componentes que invocan el dialog
  constructor(@Inject(MAT_DIALOG_DATA) public passedData: any) {}

  ngOnInit() {}
}
