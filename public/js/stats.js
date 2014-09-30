var app = window.app || {};

(function($, app){
  function Stats() {
    this.websocket = new WebSocket("ws://localhost:4000/ws-stats");
    this.offersTableStats = $('[data-table-offers-stats]');
    this.callersTableStats = $('[data-table-callers-stats]');

    this.websocket.onmessage = this.onStatusUpdate.bind(this);
  }

  var fn = Stats.prototype;

  fn.onStatusUpdate = function(message) {
    var stats = JSON.parse(message.data);
    this.updateStats(stats);
  }

  // Come on, a bad code is always good for health.
  fn.updateStats = function(stats) {
    var offersGames = this.offersTableStats.find('[data-games-column-stats]'),
        offersMusic = this.offersTableStats.find('[data-music-column-stats]'),
        offersCinema = this.offersTableStats.find('[data-cinema-column-stats]'),
        callersGames = this.callersTableStats.find('[data-games-column-stats]'),
        callersMusic = this.callersTableStats.find('[data-music-column-stats]'),
        callersCinema = this.callersTableStats.find('[data-cinema-column-stats]');

    offersGames.html(stats.connected_offers.games);
    offersMusic.html(stats.connected_offers.music);
    offersCinema.html(stats.connected_offers.cinema);
    callersGames.html(stats.connected_callers.games);
    callersMusic.html(stats.connected_callers.music);
    callersCinema.html(stats.connected_callers.cinema);
  }

  app.Stats = Stats;
}(jQuery, app))
