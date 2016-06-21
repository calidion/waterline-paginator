var sailsMemoryAdapter = require('sails-memory');
var Waterline = require('waterline');
var config = {
  adapters: {
    memory: sailsMemoryAdapter
  },
  connections: {
    default: {
      adapter: 'memory'
    }
  },
  defaults: {
    migrate: 'alter'
  }
};

var model = {
  connection: 'default',
  identity: 'model',
  schema: true,
  tableName: 'area',
  autoCreatedAt: false,
  autoUpdatedAt: false,
  attributes: {
    name: 'string',
    type: 'string'
  }
};

var waterline = new Waterline();

var connection = Waterline.Collection.extend(model);
waterline.loadCollection(connection);

export default function name(cb) {
  waterline.initialize(config, cb);
  //  waterline.initialize(config, function (error, ontology) {
  //   // ontology.collections[model.name.toLowerCase()];
  // });
}
