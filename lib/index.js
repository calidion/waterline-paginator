export default {
  _populate: function (query, populates) {
    if (populates) {
      for (var i = 0; i < populates.length; i++) {
        var populateItem = populates[i];
        if (typeof populateItem === 'string') {
          query.populate(populates[i]);
        }
        if (typeof populateItem === 'object') {
          for (var key in populateItem) {
            if (typeof key === 'string') {
              query.populate(key, populateItem[key]);
            }
          }
        }
      }
    }
  },
  _sort: function (query, orders) {
    if (orders) {
      for (var i = 0; i < orders.length; i++) {
        query.sort(orders[i]);
      }
    }
  },
  _count: function (model, conditions) {
    return model.count(conditions);
  },

  _onError: function (cb) {
    return function (reason) {
      cb(true, reason);
    };
  },

  paginate: function (data, cb) {
    if (!cb) {
      throw new Error("Callback must not be null");
    }
    if (!data) {
      throw new Error("data must not be null");
    }
    if (!data.model) {
      throw new Error("Model must not be null");
    }
    data.conditions = data.conditions ? data.conditions : {};
    var query = data.model.find(data.conditions);
    this._populate(query, data.populates);
    this._sort(query, data.sorts);
    if (!data.page || data.page <= 0) {
      data.page = 1;
    }
    var limit = data.limit ? data.limit : process.env.WATERLINE_PAGINATOR_LIMIT || 10;
    var offset = (data.page - 1) * limit || 0;
    var one = query.limit(limit).skip(offset);
    var all = this._count(data.model, data.conditions);

    Promise.all([one, all]).then(function (value) {
      var results = value[0];
      var countValue = value[1];
      if (countValue) {
        var total = parseInt(countValue / limit, 10);
        if ((countValue % limit) !== 0) {
          total++;
        }
        cb(false, {
          total: total,
          count: countValue,
          page: data.page,
          results: results
        });
      } else {
        cb(false, {
          total: 0,
          page: 0,
          count: 0,
          results: []
        });
      }
    }, this._onError(cb));
  }
};
