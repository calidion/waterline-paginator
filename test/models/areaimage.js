module.exports = {
  connection: 'default',
  identity: 'areaimage',
  schema: true,
  tableName: 'areaimage',
  autoCreatedAt: false,
  autoUpdatedAt: false,
  attributes: {
    area: {
      model: 'area'
    },
    image: {
      model: 'image'
    }
  }
};
