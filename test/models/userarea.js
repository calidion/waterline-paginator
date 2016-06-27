module.exports = {
  connection: 'default',
  identity: 'userarea',
  schema: true,
  tableName: 'userarea',
  autoCreatedAt: false,
  autoUpdatedAt: false,
  attributes: {
    area: {
      model: 'area'
    },
    name: {
      type: 'string'
    }
  }
};
