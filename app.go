package main

import (
  "encoding/json"
  "io"
  "log"
  "net/http"

  "code.google.com/p/go.net/websocket"
)

var availableRooms = make(AvailableRooms)
var statsChannel = make(chan bool)

func websocketHandler(ws *websocket.Conn) {
  defer func() {
    ws.Close()
  }()

  var gm GenericMessage
  var room *Room

  for {
    err := websocket.JSON.Receive(ws, &gm)
    if err == io.EOF {
      log.Println("OUT")
      statsChannel <- true
      return
    } else if err != nil {
      log.Println(err)
    } else {
      switch gm.Type {
      case "new_room":
        room = newRoom(gm.Data, ws)
        log.Println("New room:", room.RoomId)

      case "join_room":
        room = joinRoom(gm.Data, ws)
        log.Println("Join room:", room.RoomId)

      case "caller_description":
        log.Println("Received caller description.")

        d := NewRoomMessageData{}
        if err := json.Unmarshal(gm.Data, &d); err == nil {
          websocket.JSON.Send(room.Offer.Websocket, &DescriptionMessage{Type: "caller_description", Description: d.Descrption})
        }

      case "caller_ice_candidate":
        log.Println("Received caller ICECandidate.")
        ice := &IceCandidate{}
        if err := json.Unmarshal(gm.Data, ice); err == nil {
          websocket.JSON.Send(room.Offer.Websocket, &IceCandidateMessage{Type: "caller_ice_candidate", Candidate: *ice})
        }

      case "offer_ice_candidate":
        log.Println("Received offer ICECandidate.")
        ice := &IceCandidate{}
        if err := json.Unmarshal(gm.Data, ice); err == nil {
          room.Offer.AddIceCandidate(ice)
        }
      }
    }
  }
}

func joinRoom(rm json.RawMessage, ws *websocket.Conn) (r *Room) {
  data := NewRoomMessageData{}

  if err := json.Unmarshal(rm, &data); err != nil {
    log.Println(err)
  }

  caller := &Client{Websocket: ws, Type: "caller", Description: data.Descrption}
  r = availableRooms.Get(data.RoomId)

  if r == nil {
    websocket.JSON.Send(ws, serverChatMessage("No room available with this ID."))
    return nil
  }

  r.Caller = caller

  websocket.JSON.Send(caller.Websocket, &DescriptionMessage{
    Type:        "offer_description",
    Description: r.Offer.Description})

  for _, ice := range r.Offer.IceCandidates {
    websocket.JSON.Send(ws, &IceCandidateMessage{Type: "offer_ice_candidate", Candidate: *ice})
  }

  // Non-blocking channel send.
  select {
  case statsChannel <- true:
  default:
  }

  return r
}

func newRoom(rm json.RawMessage, ws *websocket.Conn) (r *Room) {
  data := NewRoomMessageData{}

  if err := json.Unmarshal(rm, &data); err != nil {
    log.Println(err)
  }

  offer := &Client{Websocket: ws, Type: "offer", Description: data.Descrption}
  r = &Room{RoomId: data.RoomId, Offer: offer}
  availableRooms.Add(r)

  websocket.JSON.Send(ws, serverChatMessage("You are connected and waiting a user get in."))

  // Non-blocking channel send
  select {
  case statsChannel <- true:
  default:
  }

  return r
}

func websocketStatsHandler(ws *websocket.Conn) {
  defer func() {
    log.Println("Stats closed")
    ws.Close()
  }()

  // websocket.JSON.Send(ws, StatusMessage{
  //   ConnectedOffers:  Subjects{Games: len(availableOffers["games"]), Music: len(availableOffers["music"]), Cinema: len(availableOffers["cinema"])},
  //   ConnectedCallers: Subjects{Games: 0, Music: 0, Cinema: 0}})

  for {
    select {
    case <-statsChannel:
      log.Println("Sending a status update")
      // websocket.JSON.Send(ws, StatusMessage{
      //   ConnectedOffers:  Subjects{Games: len(availableOffers["games"]), Music: len(availableOffers["music"]), Cinema: len(availableOffers["cinema"])},
      //   ConnectedCallers: Subjects{Games: 0, Music: 0, Cinema: 0}})
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
