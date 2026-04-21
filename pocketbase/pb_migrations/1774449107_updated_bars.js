/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_175513025")

  // add field
  collection.fields.addAt(5, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1559021502",
    "max": 0,
    "min": 0,
    "name": "adress",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // update field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "number1542800728",
    "max": 5,
    "min": 1,
    "name": "note",
    "onlyInt": true,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_175513025")

  // remove field
  collection.fields.removeById("text1559021502")

  // update field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "number1542800728",
    "max": 5,
    "min": 1,
    "name": "field",
    "onlyInt": true,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
})
