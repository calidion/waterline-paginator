module.exports = {
  connection: 'default',
  identity: 'area',
  schema: true,
  tableName: 'area',
  autoCreatedAt: false,
  autoUpdatedAt: false,
  attributes: {
    name: 'string',
    type: 'string',
    logo: {
      model: 'logo'
    }
  }
};
