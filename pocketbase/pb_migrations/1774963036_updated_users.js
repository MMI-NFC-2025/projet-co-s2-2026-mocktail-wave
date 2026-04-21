/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1377172174")

  // add field
  collection.fields.addAt(16, new Field({
    "hidden": false,
    "id": "select1886265130",
    "maxSelect": 1,
    "name": "emailConf",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "privee",
      "public",
      "amis"
    ]
  }))

  // add field
  collection.fields.addAt(17, new Field({
    "hidden": false,
    "id": "select4257167234",
    "maxSelect": 1,
    "name": "nameConf",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "privee",
      "public",
      "amis"
    ]
  }))

  // add field
  collection.fields.addAt(18, new Field({
    "hidden": false,
    "id": "select2939922488",
    "maxSelect": 1,
    "name": "eventsConf",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "privee",
      "public",
      "amis"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1377172174")

  // remove field
  collection.fields.removeById("select1886265130")

  // remove field
  collection.fields.removeById("select4257167234")

  // remove field
  collection.fields.removeById("select2939922488")

  return app.save(collection)
})
