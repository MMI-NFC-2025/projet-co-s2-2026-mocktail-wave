/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1687431684")

  // add field
  collection.fields.addAt(5, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_518223192",
    "hidden": false,
    "id": "relation1168167679",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "members",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(6, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_518223192",
    "hidden": false,
    "id": "relation4125354711",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "leader",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1687431684")

  // remove field
  collection.fields.removeById("relation1168167679")

  // remove field
  collection.fields.removeById("relation4125354711")

  return app.save(collection)
})
