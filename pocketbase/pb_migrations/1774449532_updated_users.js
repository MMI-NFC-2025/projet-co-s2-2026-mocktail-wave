/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_518223192")

  // add field
  collection.fields.addAt(8, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_1687431684",
    "hidden": false,
    "id": "relation1894054520",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "member",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(9, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_1687431684",
    "hidden": false,
    "id": "relation4065325025",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "Leader",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(10, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_518223192",
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
  collection.fields.addAt(11, new Field({
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
  collection.fields.addAt(12, new Field({
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
  const collection = app.findCollectionByNameOrId("pbc_518223192")

  // remove field
  collection.fields.removeById("relation1894054520")

  // remove field
  collection.fields.removeById("relation4065325025")

  // remove field
  collection.fields.removeById("relation569274473")

  // remove field
  collection.fields.removeById("relation1476559580")

  // remove field
  collection.fields.removeById("relation195266743")

  return app.save(collection)
})
