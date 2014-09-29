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
  var client *Client
  var room *Room

  for {
    err := websocket.JSON.Receive(ws, &gm)

    if err == io.EOF {
      if client.Type == "offer" {
        log.Println("Room:", room)
        availableOffers.Remove(client.Subject, client.Uuid)
        websocket.JSON.Send(room.Caller.Websocket, serverChatMessage("Offer disconnected. :("))
      } else {
        websocket.JSON.Send(room.Offer.Websocket, serverChatMessage("Caller disconnected. :("))
      }

      log.Println(client.Uuid, "is out")
      statsChannel <- true
      return
    } else if err != nil {
      log.Println(err)
    } else {
      switch gm.Type {
      case "new_offer":
        client = newOffer(gm.Data, ws)

      case "new_caller":
        client, room = newCaller(gm.Data, ws)

      case "caller_description":
        d := &Description{}
        if err := json.Unmarshal(gm.Data, d); err == nil {
          websocket.JSON.Send(room.Offer.Websocket, &DescriptionMessage{Type: "caller_description", Description: *d})
        }

      case "caller_ice_candidate":
        ice := &IceCandidate{}
        if err := json.Unmarshal(gm.Data, ice); err == nil {
          websocket.JSON.Send(room.Offer.Websocket, &IceCandidateMessage{Type: "caller_ice_candidate", Candidate: *ice})
        }

      case "ice_candidate":
        ice := &IceCandidate{}
        if err := json.Unmarshal(gm.Data, ice); err == nil {
          client.AddIceCandidate(ice)
        }
      }
    }
  }
}

func newCaller(rm json.RawMessage, ws *websocket.Conn) (c *Client, r *Room) {
  data := NewCallerMessageData{}

  if err := json.Unmarshal(rm, &data); err != nil {
    log.Println(err)
    return nil, nil
  }

  c = &Client{
    Websocket: ws,
    Uuid:      uuid.New(),
    Subject:   data.Subject,
    Type:      "caller"}

  log.Println(c.Uuid, "as a new caller")

  // Non-blocking channel send.
  select {
  case statsChannel <- true:
  default:
  }

  if o := availableOffers.Find(data.Subject); o != nil {
    availableOffers.Remove(data.Subject, o.Uuid)

    websocket.JSON.Send(ws, serverChatMessage("Offer found!"))
    websocket.JSON.Send(ws, &DescriptionMessage{Type: "offer_description", Description: o.Description})

    for _, ice := range o.IceCandidates {
      websocket.JSON.Send(ws, &IceCandidateMessage{Type: "offer_ice_candidate", Candidate: *ice})
    }

    return c, &Room{Offer: o, Caller: c}
  } else {
    websocket.JSON.Send(ws, serverChatMessage("No offer available found. Waiting new offer connect..."))
  }

  return c, nil
}

func newOffer(rm json.RawMessage, ws *websocket.Conn) (c *Client) {
  data := NewOfferMessageData{}

  if err := json.Unmarshal(rm, &data); err == nil {
    c = &Client{
      Websocket:   ws,
      Uuid:        uuid.New(),
      Subject:     data.Subject,
      Type:        "offer",
      Description: data.Descrption}

    availableOffers.Add(c)
    websocket.JSON.Send(ws, serverChatMessage("You are connected and waiting a caller."))

    // Non-blocking channel send
    select {
    case statsChannel <- true:
    default:
    }

    log.Println(c.Uuid, "as a new offer")
  } else {
    log.Println(err)
  }

  return c
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
