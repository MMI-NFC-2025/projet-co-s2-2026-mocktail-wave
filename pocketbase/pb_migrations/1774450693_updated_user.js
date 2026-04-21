/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1377172174")

  // add field
  collection.fields.addAt(12, new Field({
    "hidden": false,
    "id": "date3855028431",
    "max": "",
    "min": "",
    "name": "born_date",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  // add field
  collection.fields.addAt(13, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_1687431684",
    "hidden": false,
    "id": "relation3452114260",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "member_of",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(14, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_1687431684",
    "hidden": false,
    "id": "relation3410069630",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "leader_of",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(15, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_1377172174",
    "hidden": false,
    "id": "relation569274473",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "friends",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(16, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3078198291",
    "hidden": false,
    "id": "relation1476559580",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "sub",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(17, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_4092854851",
    "hidden": false,
    "id": "relation195266743",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "cart",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1377172174")

  // remove field
  collection.fields.removeById("date3855028431")

  // remove field
  collection.fields.removeById("relation3452114260")

  // remove field
  collection.fields.removeById("relation3410069630")

  // remove field
  collection.fields.removeById("relation569274473")

  // remove field
  collection.fields.removeById("relation1476559580")

  // remove field
  collection.fields.removeById("relation195266743")

  return app.save(collection)
})
