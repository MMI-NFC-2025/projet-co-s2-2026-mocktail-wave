/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1377172174")

  // add field
  collection.fields.addAt(19, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_1377172174",
    "hidden": false,
    "id": "relation1741658329",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "ReceiveFriendRequest",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1377172174")

  // remove field
  collection.fields.removeById("relation1741658329")

  return app.save(collection)
})
