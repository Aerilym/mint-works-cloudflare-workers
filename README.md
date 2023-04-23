# Mint Works API

## POST /api/game

Body Example

```json
{
  "players": [
    {
      "name": "Player 1",
      "age": 21,
      "tokens": 3
    },
    {
      "name": "Player 2",
      "age": 22,
      "tokens": 3
    }
  ]
}
```

## GET /api/game/:id

## PUT /api/game/:id

Body Example

```json
{
  "turn": { "action": { "_type": "Produce" }, "playerName": "Player 2" }
}
```
