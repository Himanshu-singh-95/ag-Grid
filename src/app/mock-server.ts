import { Subject } from 'rxjs';
import { StockData } from './app.component';

export interface Changes {
  rowIndex: number;
  code: any;
  columnId: string;
  newValue: any;
}
export class MockServer {
  connections: any = {};
  nextConnectionId = 0;
  allData: StockData[] = [];
  informConnectionMessage = new Subject<Changes[]>();
  traderAgentData = [
    'Morgan Stanley',
    'Wells Fargo',
    'Charles Schwab',
    'Goldman Sachs',
    'JPMC',
    'Portware',
  ];

  constructor() {}

  periodicallyUpdateData = () => {
    var changes: never[] = [];
    this.makeSomePriceChanges(changes);
    this.makeSomeVolumeChanges(changes);
    this.informConnectionsOfChanges(changes);
  };

  informConnectionsOfChanges = (changes: Changes[]) => {
    this.informConnectionMessage.next(changes);
    // Object.keys(this.connections).forEach((connectionId) => {
    //   var connection = this.connections[connectionId];
    //   var changesThisConnection: any[] = [];
    //   changes.forEach(function (change: { rowIndex: number }) {
    //     var changeInRange =
    //       change.rowIndex >= connection.firstRow &&
    //       change.rowIndex <= connection.lastRow;
    //     if (changeInRange) {
    //       changesThisConnection.push(change);
    //     }
    //   });
    //   if (changesThisConnection.length > 0) {
    //     this.sendEventAsync(connectionId, {
    //       eventType: 'dataUpdated',
    //       changes: changesThisConnection,
    //     });
    //   }
    // });
  };

  makeSomeVolumeChanges = (changes: Changes[]) => {
    for (var i = 0; i < 10; i++) {
      var index = Math.floor(this.allData.length * Math.random());
      var dataItem = this.allData[index];
      var move = Math.floor(10 * Math.random()) - 5;
      var newValue = dataItem.volume + move;
      dataItem.volume = newValue;
      changes.push({
        rowIndex: index,
        code: dataItem.code,
        columnId: 'volume',
        newValue: dataItem.volume,
      });
    }
  };

  makeSomePriceChanges = (changes: Changes[]) => {
    for (var i = 0; i < 10; i++) {
      var index = Math.floor(this.allData.length * Math.random());
      var dataItem = this.allData[index];
      var move = Math.floor(30 * Math.random()) / 10 - 1;
      var newValue = dataItem.mid + move;
      dataItem.mid = newValue;
      this.setBidAndAsk(dataItem);
      changes.push({
        rowIndex: index,
        code: dataItem.code,
        columnId: 'mid',
        newValue: dataItem.mid,
      });
      changes.push({
        rowIndex: index,
        code: dataItem.code,
        columnId: 'bid',
        newValue: dataItem.bid,
      });
      changes.push({
        rowIndex: index,
        code: dataItem.code,
        columnId: 'ask',
        newValue: dataItem.ask,
      });
    }
  };

  init = (allData: StockData[]) => {
    this.allData = allData;
    this.allData.forEach((dataItem) => {
      dataItem.volume = Math.floor(Math.random() * 10000 + 100);
      dataItem.mid = Math.random() * 300 + 20;
      dataItem.tradingAgent = this.traderAgentData[Math.floor(Math.random() * this.traderAgentData.length)];
      this.setBidAndAsk(dataItem);
    });
    setInterval(this.periodicallyUpdateData.bind(this), 200);
  };

  setBidAndAsk = function (dataItem: {
    bid: number;
    mid: number;
    ask: number;
  }) {
    dataItem.bid = dataItem.mid * 0.98;
    dataItem.ask = dataItem.mid * 1.02;
  };

  connect = (listener: any) => {
    var connectionId = this.nextConnectionId;
    this.nextConnectionId++;
    this.connections[connectionId] = {
      listener: listener,
      rowsInClient: {},
      firstRow: 0,
      lastRow: -1,
    };
    this.sendEventAsync(connectionId, {
      eventType: 'rowCountChanged',
      rowCount: this.allData.length,
    });
    return connectionId;
  };

  sendEventAsync = (connectionId: string | number, event: any) => {
    var listener = this.connections[connectionId].listener;
    setTimeout(function () {
      listener(event);
    }, 20);
  };

  disconnect = (connectionId: string | number) => {
    delete this.connections[connectionId];
  };

  setViewportRange = (
    connectionId: string | number,
    firstRow: any,
    lastRow: any
  ) => {
    var connection = this.connections[connectionId];
    connection.firstRow = firstRow;
    connection.lastRow = lastRow;
    this.purgeFromClientRows(connection.rowsInClient, firstRow, lastRow);
    this.sendResultsToClient(connectionId, firstRow, lastRow);
  };

  purgeFromClientRows = function (
    rowsInClient: any[],
    firstRow: number,
    lastRow: number
  ) {
    Object.keys(rowsInClient).forEach(function (rowIndexStr) {
      var rowIndex = parseInt(rowIndexStr);
      if (rowIndex < firstRow || rowIndex > lastRow) {
        delete rowsInClient[rowIndex];
      }
    });
  };

  sendResultsToClient = (
    connectionId: string | number,
    firstRow: number,
    lastRow: number
  ) => {
    if (firstRow < 0 || lastRow < firstRow) {
      console.warn('start or end is not valid');
      return;
    }
    var rowsInClient = this.connections[connectionId].rowsInClient;
    var rowDataMap: any = {};
    for (var i = firstRow; i <= lastRow; i++) {
      if (rowsInClient[i]) {
        continue;
      }
      rowDataMap[i] = JSON.parse(JSON.stringify(this.allData[i]));
      rowsInClient[i] = true;
    }
    this.sendEventAsync(connectionId, {
      eventType: 'rowData',
      rowDataMap: rowDataMap,
    });
  };

  getRowCount = () => {
    return this.allData.length;
  };
}
