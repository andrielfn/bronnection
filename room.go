package main

import (
  "code.google.com/p/go.net/websocket"
)

type AvailableRooms map[string]*Room

type Room struct {
  RoomId  string
  Clients []*Client
}

func (r *Room) AddClient(c *Client) {
  r.Clients = append(r.Clients, c)
}

func (r *Room) RemoveClient(sId string) {
  for i, v := range r.Clients {
    if v.Uuid == sId {
      r.Clients = append(r.Clients[:i], r.Clients[i+1:]...)
      return
    }
  }
}

func (r *Room) SendToOutClients(d interface{}, sId string) {
  for _, c := range r.Clients {
    if c.Uuid != sId && c.State == "out" {
      websocket.JSON.Send(c.Websocket, d)
    }
  }
}

func (r *Room) SendToInClients(d interface{}, sId string) {
  for _, c := range r.Clients {
    if c.Uuid != sId && c.State == "in" {
      websocket.JSON.Send(c.Websocket, d)
    }
  }
}

func (ar *AvailableRooms) Add(r *Room) {
  (*ar)[r.RoomId] = r
}

func (ar *AvailableRooms) Get(id string) *Room {
  return (*ar)[id]
}

func (ar *AvailableRooms) Remove(id string) {
  delete((*ar), id)
}
