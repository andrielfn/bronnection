var app = window.app || {};

(function($, app){
  function Caller() {
    app.trace("New caller created.")

    this.peerConnection = this.createPeerConnection();
    this.dataChannel = this.createDataChannel();

    this.setHandlers();

    this.createOffer();
  }

  fn = Caller.prototype;

  fn.createOffer = function() {
    this.peerConnection.createOffer(this.getCallerDescription.bind(this));
  }

  fn.getCallerDescription = function(description) {
    app.trace("Caller create an offer.")
    this.peerConnection.setLocalDescription(description);
    offer.peerConnection.setRemoteDescription(description);
    offer.peerConnection.createAnswer(this.getOfferDescription);
  }

  // The place of this is not here!!!!!
  fn.getOfferDescription = function(description) {
    app.trace("Offer create an answer.")
    offer.peerConnection.setLocalDescription(description);
    caller.peerConnection.setRemoteDescription(description);
  }

  // ============================================
  // All below here is duplicated with Offer.
  // ============================================
  fn.createPeerConnection = function() {
    app.trace("Caller PeerConnection created.")
    return new RTCPeerConnection(
      null,
      { optional: [{ RtpDataChannels: true }] }
    )
  }

  fn.createDataChannel = function() {
    app.trace("Caller DataChannel created.")
    return this.peerConnection.createDataChannel("sendDataChannel", { reliable: false });
  }

  fn.setHandlers = function() {
    this.peerConnection.onicecandidate = this.onIceDandidate;
    this.dataChannel.onopen = this.onDataChanelStateChanged.bind(this);
    this.dataChannel.onclose = this.onDataChanelStateChanged.bind(this);
  }

  fn.onIceDandidate = function(event) {
    if (event.candidate) {
      offer.peerConnection.addIceCandidate(event.candidate);
      app.trace("Caller ICE Candidate: " + event.candidate.candidate)
    }
  }

  fn.onDataChanelStateChanged = function() {
    var state = this.dataChannel.readyState;

    trace("Caller channel state is: " + state);
  }

  app.Caller = Caller;
}(jQuery, app))
