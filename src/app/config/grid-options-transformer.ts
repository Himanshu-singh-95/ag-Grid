import { CurrencyPipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { ColDef, GridOptions } from '@ag-grid-community/core';

@Injectable()
export class GridOptionsTransformer {
  constructor(private currencyPipe: CurrencyPipe) {}

  get ColumnDefs() {
    return this.columnDefs;
  }

  get GridOptions() {
    return this.gridOptions;
  }

  private columnDefs: ColDef[] = [
    {
      field: 'tradingAgent',
      rowGroup: true,
      enableRowGroup: true,
      hide: true,
      filter: 'agTextColumnFilter',
      filterParams: {
        filterOptions: ['contains', 'startsWith', 'endsWith'],
        defaultOption: 'startsWith',
      },
    },
    // {
    //   field: 'code',
    //   filter: 'agTextColumnFilter',
    //   filterParams: {
    //     filterOptions: ['contains', 'startsWith', 'endsWith'],
    //     defaultOption: 'startsWith',
    //   },
    //   maxWidth: 90,
    // },
    {
      field: 'name',
      filter: 'agTextColumnFilter',
      filterParams: {
        filterOptions: ['contains', 'startsWith', 'endsWith'],
        defaultOption: 'startsWith',
      },
      minWidth: 220,
    },
    {
      field: 'bid',
      type: 'number',
      valueFormatter: ({ value }: { [key: string]: any }) =>
        this.currencyPipe.transform(value) as string,
      aggFunc: 'max',
    },
    {
      field: 'mid',
      type: 'number',
      valueFormatter: ({ value }: { [key: string]: any }) =>
        this.currencyPipe.transform(value) as string,
      aggFunc: 'max',
    },
    {
      field: 'ask',
      type: 'number',
      valueFormatter: ({ value }: { [key: string]: any }) =>
        this.currencyPipe.transform(value) as string,
      aggFunc: 'min',
    },
    {
      field: 'volume',
      type: 'number',
      aggFunc: 'sum',
    },
  ];

  private gridOptions: GridOptions = {
    columnDefs: this.columnDefs,
    defaultColDef: {
      flex: 1,
      minWidth: 140,
      resizable: true,
      filter: true,
      sortable: true,
      filterParams: {
        buttons: ['apply', 'clear'],
        closeOnApply: true,
        suppressAndOrCondition: true,
        inRangeInclusive: true,
        filterOptions: ['equals', 'lessThanOrEqual', 'greaterThanOrEqual'],
      },
      allowedAggFuncs: ['sum', 'min', 'max'],
    },
    autoGroupColumnDef: {
      headerName: 'Trading Agent',
      field: 'code',
      minWidth: 200,
      cellRenderer: 'agGroupCellRenderer',
      cellRendererParams: {
        checkbox: true,
      },
    },
    columnTypes: {
      number: {
        cellClass: 'cell-number',
        cellRenderer: 'agAnimateShowChangeCellRenderer',
        enableValue: true,
      },
    },
    rowSelection: 'multiple',
    // rowModelType: 'viewport',
    // implement this so that we can do selection
    getRowNodeId: (data: any) => {
      // the code is unique, so perfect for the id
      return data.code;
    },
    enableRangeSelection: true,
    groupSelectsChildren: true,
    suppressAggFuncInHeader: true,
    groupIncludeFooter: true,
    groupIncludeTotalFooter: true,
    suppressFieldDotNotation: true,
    // groupHideOpenParents: true,
    // suppressRowClickSelection: true,
    sideBar: 'columns',
    rowGroupPanelShow: 'always',
    animateRows: true,
    debug: true,
  };
}
