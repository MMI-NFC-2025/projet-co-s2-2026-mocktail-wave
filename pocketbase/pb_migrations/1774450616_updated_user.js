/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1377172174")

  // update field
  collection.fields.addAt(11, new Field({
    "hidden": false,
    "id": "number1542800728",
    "max": 9999,
    "min": 1000,
    "name": "tag",
    "onlyInt": true,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1377172174")

  // update field
  collection.fields.addAt(11, new Field({
    "hidden": false,
    "id": "number1542800728",
    "max": 9999,
    "min": 1000,
    "name": "field",
    "onlyInt": true,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
})
