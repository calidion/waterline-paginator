import async from 'async';

const paginator = {
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
      if (!err) {
        cb(false, data);
      }
    };
  },

  _onFetchImage: function (results, idx, next) {
    return function (error, image) {
      if (error) {
        console.error(error);
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
      results[idx].sis = sis;
      results[idx].images = images;
      next(null, results[idx++]);
    };
  },

  _getImageCondition: function (data, results, item, idx, next) {
    if (!data || !item || !data.linkKey) {
      return null;
    }
    var imageCondition = {};
    if (typeof data.linkKey === 'string') {
      imageCondition[data.linkKey] = item.id;
    } else {
      if (!item[data.linkKey.item]) {
        return next(null, results[idx++]);
      }
      imageCondition[data.linkKey.key] = item[data.linkKey.item].id;
    }
    return imageCondition;
  },

  _onItem: function (data, results, idx) {
    var self = this;
    return function (item, next) {
      var imageCondition = self._getImageCondition(data, results, item, idx, next);
      // if the condition is negative, then the function next has been returned
      if (imageCondition) {
        var fieldName = data.fieldName || 'image';
        data.imageModel
          .find(imageCondition)
          .populate(fieldName)
          .sort(fieldName + ' desc')
          .exec(self._onFetchImage(results, idx++, next));
      } else {
        idx++;
      }
    };
  },

  _onImage: function (data, result, cb) {
    var idx = 0;
    async.mapSeries(result.results, this._onItem(data, result.results, idx), this._onAsyncImageEnd(result, cb));
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
  },
  _onPage: function (resolve, reject) {
    return function (err, data) {
      if (err) {
        reject(err);
      }
      resolve(data);
    };
  },
  page: function (data) {
    return new Promise(function (resolve, reject) {
      paginator.paginate(data, paginator._onPage(resolve, reject));
    });
  }
};

export default paginator;
