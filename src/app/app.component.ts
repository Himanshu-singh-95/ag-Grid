import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ColDef, GridOptions } from '@ag-grid-community/core';
// import { ViewportRowModelModule } from '@ag-grid-enterprise/viewport-row-model';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import '@ag-grid-community/core/dist/styles/ag-grid.css';
import '@ag-grid-community/core/dist/styles/ag-theme-alpine.css';


import { Changes, MockServer } from './mock-server';
import { ViewportDatasource } from './viewport-datasource';
import { GridOptionsTransformer } from './config/grid-options-transformer';

import { BehaviorSubject } from 'rxjs';
import * as _ from 'lodash';

export interface StockData {
  tradingAgent: string;
  code: string;
  name: string;
  bid: number;
  mid: number;
  ask: number;
  volume: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  private gridApi: any;
  private gridColumnApi: any;
  public columnDefs: ColDef[] = [];
  public defaultColDef: any;
  public rowSelection: any;
  public rowModelType: any;
  public getRowNodeId: any;
  public components: any;
  public viewportRowModelBufferSize!: number;
  public viewportRowModelPageSize!: number;
  public modules: any[] = [
    // ViewportRowModelModule,
    RowGroupingModule,
    ClientSideRowModelModule,
    MenuModule,
    ColumnsToolPanelModule,
    SetFilterModule,
  ];
  private mockServer = new MockServer();
  public rowData = new BehaviorSubject<StockData[]>([]);
  public gridOptions!: GridOptions;
  viewportDatasource!: ViewportDatasource;

  constructor(
    private http: HttpClient,
    private gridConfig: GridOptionsTransformer
  ) {
    this.http
      .get<StockData[]>('https://www.ag-grid.com/example-assets/stocks.json')
      .subscribe((data) => {
        this.mockServer.init(data);
        // this.viewportDatasource = new ViewportDatasource(this.mockServer);
        // this.gridApi.setViewportDatasource(this.viewportDatasource);
        console.log('data', data);

        this.rowData.next(data);
      });
  }

  ngOnInit(): void {
    this.gridOptions = this.gridConfig.GridOptions;

    // the below code is for periodically applytransacion in the grid
    this.mockServer.informConnectionMessage.subscribe((changes: Changes[]) => {
      const updates: any[] = [];
      changes.forEach((change) => {
        const isFound = _.find(updates, { code: change.code });
        if (!_.isNil(isFound)) {
          isFound[change.columnId] = change.newValue;
          return;
        }
        updates.push(change);
      });
      this.gridApi.applyTransaction({ updates });
    });
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    // this.http
    //   .get<StockData[]>('https://www.ag-grid.com/example-assets/stocks.json')
    //   .subscribe((data) => {
    //     this.mockServer.init(data);
    //     this.viewportDatasource = new ViewportDatasource(this.mockServer);
        // this.gridApi.setViewportDatasource(this.viewportDatasource);
    //     this.rowData.next(data);
        setTimeout(() => {
          this.gridApi.sizeColumnsToFit();
        }, 100);
    //   });
  }
}
