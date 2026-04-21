/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_518223192")

  // update collection data
  unmarshal({
    "name": "users"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_518223192")

  // update collection data
  unmarshal({
    "name": "utilisateurs"
  }, collection)

  return app.save(collection)
})
