package main

type AvailableRooms map[string]*Room

type Room struct {
  RoomId string
  Offer  *Client
  Caller *Client
}

func (ar *AvailableRooms) Add(r *Room) {
  (*ar)[r.RoomId] = r
}

func (ar *AvailableRooms) Get(id string) *Room {
  return (*ar)[id]
}
