package main

import (
  "encoding/json"
  "io"
  "log"
  "net/http"

  "code.google.com/p/go.net/websocket"
)

var availableOffers = make(AvailableOffers)
var statsChannel = make(chan bool)

func websocketHandler(ws *websocket.Conn) {
  var gm GenericMessage

  for {
    err := websocket.JSON.Receive(ws, &gm)

    if err == io.EOF {

    } else if err != nil {
      log.Println(err)
    } else {
      parseMessage(gm, ws)
    }
  }
}

func parseMessage(gm GenericMessage, ws *websocket.Conn) {
  switch gm.Type {
  case "new_offer":
    data := AvailableOfferMessageData{}
    if err := json.Unmarshal(gm.Data, &data); err == nil {
      availableOffers.Add(data.Subject, &Offer{Uuid: "12312313"})
      websocket.JSON.Send(ws, serverChatMessage("You are connected and waiting a caller."))
      statsChannel <- true
    } else {
      log.Println(err)
    }
  }

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
