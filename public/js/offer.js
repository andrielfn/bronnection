var app = window.app || {};

(function($, app){
  function Offer() {
    app.trace("New offer created.")

    this.peerConnection = this.createPeerConnection();
    this.dataChannel = this.createDataChannel();

    this.setHandlers();
  }

  fn = Offer.prototype;

  // ============================================
  // All below here is duplicated with Caller.
  // ============================================
  fn.createPeerConnection = function() {
    app.trace("Offer PeerConnection created.")
    return new RTCPeerConnection(
      null,
      { optional: [{ RtpDataChannels: true }] }
    )
  }

  fn.createDataChannel = function() {
    app.trace("Offer DataChannel created.")
    return this.peerConnection.createDataChannel("sendDataChannel", { reliable: false });
  }

  fn.setHandlers = function() {
    this.peerConnection.onicecandidate = this.onIceDandidate;
    this.dataChannel.onopen = this.onDataChanelStateChanged.bind(this);
    this.dataChannel.onclose = this.onDataChanelStateChanged.bind(this);
    this.dataChannel.onmessage = this.onDataChannelMessage;
  }

  fn.onIceDandidate = function(event) {
    if (event.candidate) {
      caller.peerConnection.addIceCandidate(event.candidate);
      app.trace("Offer ICE Candidate: " + event.candidate.candidate)
    }
  }

  fn.onDataChanelStateChanged = function() {
    var state = this.dataChannel.readyState;

    trace("Offer channel state is: " + state);
  }

  fn.onDataChannelMessage = function(e) {
    $(document).trigger("chat.newMessage", e.data);

    trace("Offer received new message: " + e.data);
  }

  app.Offer = Offer;
}(jQuery, app))
