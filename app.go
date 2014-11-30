package main

import (
  "code.google.com/p/go-uuid/uuid"
  "code.google.com/p/go.net/websocket"
  "encoding/json"
  "io"
  "log"
  "net/http"
  "time"
)

var availableRooms = make(AvailableRooms)
var statsChannel = make(chan bool)

func websocketHandler(ws *websocket.Conn) {
  defer func() {
    ws.Close()
  }()

  var gm GenericMessage
  var room *Room
  var sessionId string = uuid.New()
  log.Println("Client connected:", sessionId)

  for {
    err := websocket.JSON.Receive(ws, &gm)
    if err == io.EOF {
      room.RemoveClient(sessionId)
      log.Println("Client disconencted", sessionId)
      if len(room.Clients) == 0 {
        log.Println("Removing room", room.RoomId)
        availableRooms.Remove(room.RoomId)
      }

      statsChannel <- true
      return
    } else if err != nil {
      log.Println(err)
    } else {
      switch gm.Type {
      case "new_room":
        room = newRoom(gm.Data, ws, sessionId)
        log.Println("New room:", room.RoomId)

      case "join_room":
        room = joinRoom(gm.Data, ws, sessionId)
        log.Println("Join room:", room.RoomId)

      case "offer_description":
        time.Sleep(1 * time.Second)
        log.Println("Received OFFER description.")

        d := NewRoomMessageData{}
        if err := json.Unmarshal(gm.Data, &d); err == nil {
          desc := &DescriptionMessage{Type: "caller_description", Description: d.Description}
          room.SendToOutClients(desc, sessionId)
        }

      case "caller_ice_candidate":
        ice := &IceCandidate{}
        if err := json.Unmarshal(gm.Data, ice); err == nil {
          // log.Println("CALLER ICE:", strings.Split(ice.Candidate, " ")[2], strings.Split(ice.Candidate, " ")[4])
          ic := &IceCandidateMessage{Type: "caller_ice_candidate", Candidate: *ice}
          room.SendToInClients(ic, sessionId)
        }

      case "offer_ice_candidate":
        ice := &IceCandidate{}
        if err := json.Unmarshal(gm.Data, ice); err == nil {
          // log.Println("OFFER ICE:", strings.Split(ice.Candidate, " ")[2], strings.Split(ice.Candidate, " ")[4])
          ic := &IceCandidateMessage{Type: "offer_ice_candidate", Candidate: *ice}
          room.SendToOutClients(ic, sessionId)
        }
      }
    }
  }
}

func joinRoom(rm json.RawMessage, ws *websocket.Conn, sId string) (r *Room) {
  data := NewRoomMessageData{}

  if err := json.Unmarshal(rm, &data); err != nil {
    log.Println(err)
  }

  r = availableRooms.Get(data.RoomId)

  if r == nil {
    websocket.JSON.Send(ws, serverChatMessage("No room available with this ID."))
    return nil
  }

  c := &Client{Websocket: ws, Uuid: sId, State: "out"}
  r.AddClient(c)
  desc := &DescriptionMessage{Type: "caller_description", Description: data.Description}
  r.SendToInClients(desc, sId)

  // Non-blocking channel send.
  select {
  case statsChannel <- true:
  default:
  }

  return r
}

func newRoom(rm json.RawMessage, ws *websocket.Conn, sId string) (r *Room) {
  data := NewRoomMessageData{}

  if err := json.Unmarshal(rm, &data); err != nil {
    log.Println(err)
  }

  c := &Client{
    Websocket: ws,
    Uuid:      sId,
    State:     "in",
    Username:  data.Username,
  }

  r = &Room{RoomId: data.RoomId}
  r.AddClient(c)

  availableRooms.Add(r)

  websocket.JSON.Send(ws, serverChatMessage("You are connected and waiting a user get in."))

  // Non-blocking channel send
  select {
  case statsChannel <- true:
  default:
  }

  return r
}

func status() []StatusRoom {
  sr := make([]StatusRoom, len(availableRooms))
  i := 0
  for _, v := range availableRooms {
    sr[i] = StatusRoom{RoomId: v.RoomId, ConnectedClients: len(v.Clients)}
    i++
  }

  return sr
}

func websocketStatsHandler(ws *websocket.Conn) {
  defer func() {
    log.Println("Stats closed")
    ws.Close()
  }()

  websocket.JSON.Send(ws, status())

  for {
    select {
    case <-statsChannel:
      log.Println("Sending a status update")
      websocket.JSON.Send(ws, status())
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
