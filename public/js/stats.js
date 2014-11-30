var app = window.app || {};

(function($, app){
  function Stats() {
    this.websocket = new WebSocket("ws://localhost:4000/ws-stats");
    this.listRooms = $('[data-list-rooms]');

    this.websocket.onmessage = this.onStatusUpdate.bind(this);
  }

  var fn = Stats.prototype;

  fn.onStatusUpdate = function(message) {
    var stats = JSON.parse(message.data);
    console.log(stats);
    this.updateStats(stats);
  }

  // Come on, a bad code is always good for health.
  fn.updateStats = function(stats) {
    this.listRooms.html('');
    stats.forEach(this.printTable.bind(this));
  }

  fn.printTable = function(e) {
    this.listRooms.append(this.newTableRow(e.room_id, e.connected_clients));
  }

  fn.newTableRow = function(roomId, connectedClients) {
    return "<tr><td>" + roomId + "</td><td>" + connectedClients + "</td></tr>";
  }

  app.Stats = Stats;
}(jQuery, app))
