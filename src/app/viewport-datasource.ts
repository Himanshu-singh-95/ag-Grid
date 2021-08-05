import { MockServer } from "./mock-server";

export class ViewportDatasource {
  mockServer: MockServer;
  connectionId: any;
  params: any;
  constructor(mockServer: any) {
    this.mockServer = mockServer;
    this.connectionId = this.mockServer.connect(this.eventListener.bind(this));
  }

  setViewportRange = (firstRow: string, lastRow: string) => {
    console.log('setViewportRange: ' + firstRow + ' to ' + lastRow);
    this.mockServer.setViewportRange(this.connectionId, firstRow, lastRow);
  };

  init = (params: any) => {
    this.params = params;
  };

  destroy = () => {
    this.mockServer.disconnect(this.connectionId);
  };

  eventListener = (event: any) => {
    switch (event.eventType) {
      case 'rowCountChanged':
        this.onRowCountChanged(event);
        break;
      case 'rowData':
        this.onRowData(event);
        break;
      case 'dataUpdated':
        this.onDataUpdated(event);
        break;
    }
  };

  onRowData = (event: { rowDataMap: any }) => {
    var rowDataFromServer = event.rowDataMap;
    this.params.setRowData(rowDataFromServer);
  };

  onDataUpdated = (event: { changes: any[] }) => {
    event.changes.forEach(
      (change: { rowIndex: any; columnId: any; newValue: any }) => {
        var rowNode = this.params.getRow(change.rowIndex);
        if (!rowNode || !rowNode.data) {
          return;
        }
        rowNode.setDataValue(change.columnId, change.newValue);
      }
    );
  };

  onRowCountChanged = (event: { rowCount: any }) => {
    var rowCountFromServer = event.rowCount;
    var keepRenderedRows = true;
    this.params.setRowCount(rowCountFromServer, keepRenderedRows);
  };
}
