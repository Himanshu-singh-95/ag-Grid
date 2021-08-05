import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CurrencyPipe } from '@angular/common';
import { GridOptionsTransformer } from './config/grid-options-transformer';
import { AgGridModule } from '@ag-grid-community/angular';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AgGridModule.withComponents([])
  ],
  providers: [HttpClient, CurrencyPipe, GridOptionsTransformer],
  bootstrap: [AppComponent]
})
export class AppModule { }
