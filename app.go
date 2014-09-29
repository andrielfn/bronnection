package main

import (
  "code.google.com/p/go-uuid/uuid"
  "encoding/json"
  "io"
  "log"
  "net/http"

  "code.google.com/p/go.net/websocket"
)

var availableOffers = make(AvailableOffers)
var statsChannel = make(chan bool)

func websocketHandler(ws *websocket.Conn) {
  defer func() {
    ws.Close()
  }()

  var gm GenericMessage
  var offer *Offer

  for {
    err := websocket.JSON.Receive(ws, &gm)

    if err == io.EOF {
      availableOffers.Remove(offer.Subject, offer.Uuid)
      log.Println(offer.Uuid, "is out")
      // log.Println(offer.Uuid, " is out")
      statsChannel <- true
      return
    } else if err != nil {
      log.Println(err)
    } else {
      switch gm.Type {
      case "new_offer":
        offer = newOffer(gm.Data, ws)
      case "new_caller":
        newCaller(gm.Data, ws)
      }
    }
  }
}

func newCaller(rm json.RawMessage, ws *websocket.Conn) {
  data := NewCallerMessageData{}

  if err := json.Unmarshal(rm, &data); err == nil {
    if offer := availableOffers.Find(data.Subject); offer != nil {
      // offer ok
    } else {
      websocket.JSON.Send(ws, serverChatMessage("No offer available found. Waiting new offer connect..."))
    }

    // Non-blocking channel send
    select {
    case statsChannel <- true:
    default:
    }
  } else {
    log.Println(err)
  }
}

func newOffer(rm json.RawMessage, ws *websocket.Conn) (offer *Offer) {
  data := NewOfferMessageData{}

  if err := json.Unmarshal(rm, &data); err == nil {
    offer = &Offer{Uuid: uuid.New(), Subject: data.Subject}
    availableOffers.Add(offer)
    websocket.JSON.Send(ws, serverChatMessage("You are connected and waiting a caller."))

    // Non-blocking channel send
    select {
    case statsChannel <- true:
    default:
    }

    log.Println(offer.Uuid, "as a new offer")
  } else {
    log.Println(err)
  }

  return offer
}

func websocketStatsHandler(ws *websocket.Conn) {
  defer func() {
    log.Println("Stats closed")
    ws.Close()
  }()

  websocket.JSON.Send(ws, StatusMessage{
    ConnectedOffers:  Subjects{Games: len(availableOffers["games"]), Music: len(availableOffers["music"]), Cinema: len(availableOffers["cinema"])},
    ConnectedCallers: Subjects{Games: 0, Music: 0, Cinema: 0}})

  for {
    select {
    case <-statsChannel:
      log.Println("Sending a status update")
      websocket.JSON.Send(ws, StatusMessage{
        ConnectedOffers:  Subjects{Games: len(availableOffers["games"]), Music: len(availableOffers["music"]), Cinema: len(availableOffers["cinema"])},
        ConnectedCallers: Subjects{Games: 0, Music: 0, Cinema: 0}})
    }
  }
}

func main() {
  http.Handle("/", http.FileServer(http.Dir("public")))
  http.Handle("/ws", websocket.Handler(websocketHandler))
  http.Handle("/ws-stats", websocket.Handler(websocketStatsHandler))

  log.Println("Server listening at :4000")

  http.ListenAndServe(":4000", nil)
}
