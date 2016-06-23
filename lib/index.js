import async from 'async';

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

  _onResult: function (data, result, cb) {
    if (data.imageModel && data.linkKey) {
      this._onImage(data, result, cb);
    } else {
      cb(false, result);
    }
  },

  _onAsyncImageEnd: function (data, cb) {
    return function (err) {
      if (err) {
        cb(true);
      } else {
        cb(false, data);
      }
    };
  },

  _onFetchImage: function (result, idx, next) {
    return function (error, image) {
      if (error) {
        console.error(error);
        return next(null, result[idx++]);
      }
      let images = [];
      let sis = [];
      if (image && image.length) {
        for (var i = 0; i < image.length; i++) {
          if (image[i].image) {
            sis.push(image[i].id);
            images.push(image[i].image.toJSON());
          }
        }
      }
      result.results[idx].sis = sis;
      result.results[idx].images = images;
      next(null, result.results[idx++]);
    };
  },

  _getImageCondition: function (data, result, item, idx, next) {
    var imageCondition = {};
    if (typeof data.linkKey === 'string') {
      imageCondition[data.linkKey] = item.id;
    } else {
      if (!item[data.linkKey.item]) {
        return next(null, result.results[idx++]);
      }
      imageCondition[data.linkKey.key] = item[data.linkKey.item].id;
    }
    return imageCondition;
  },

  _onItem: function (data, result, idx) {
    var self = this;
    return function (item, next) {
      var imageCondition = self._getImageCondition(data, result, item, idx, next);
      var fieldName = data.fieldName || 'image';
      data.imageModel
        .find(imageCondition)
        .populate(fieldName)
        .sort(fieldName + ' desc')
        .exec(self._onFetchImage(result, idx, next));
    };
  },

  _onImage: function (data, result, cb) {
    var idx = 0;
    async.mapSeries(result.results, this._onItem(data, result, idx), this._onAsyncImageEnd(result, cb));
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
    var self = this;

    Promise.all([one, all]).then(function (value) {
      var results = value[0];
      var countValue = value[1];
      if (countValue) {
        var total = parseInt(countValue / limit, 10);
        if ((countValue % limit) !== 0) {
          total++;
        }
        self._onResult(data, {
          total: total,
          count: countValue,
          page: data.page,
          results: results
        }, cb);
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
