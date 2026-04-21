/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1377172174")

  // remove field
  collection.fields.removeById("bool3401286895")

  // remove field
  collection.fields.removeById("bool3806046039")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1377172174")

  // add field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "bool3401286895",
    "name": "eventsVisibility",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // add field
  collection.fields.addAt(9, new Field({
    "hidden": false,
    "id": "bool3806046039",
    "name": "NameVisibility",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
})
