function DataTable() {}

DataTable.prototype = Object.create({}, {
	init: {value: function(data) {
		this.data = data || [];
	}},
	initInterpretation: {value: function(dataSet, interpretation) {
		this.data = dataSet.map(function(row) {
			var newRow = {};

			Object.keys(interpretation).map(function(k) {
				newRow[k] = this.getPath(row, interpretation[k]);
			}.bind(this));
		}.bind(this));
	}},
	getPath: {value: function(o, path) {
		var result = o;
		path.map(function(k) {
			result = result[k];
		});

		return result;
	}},
	setPath: {value: function(o, path, v) {
		var cursor = o;

		var lastKey = path[path.length - 1];

		path.map(function(k) {
			cursor[k] = (k === lastKey) ?
				v
				: (cursor[k] || {});

			cursor = cursor[k];
		});
	}},
	restructureAs: {value: function(interpretation) {

		var newDataSet = this.data.map(function(row) {
			var newRow = {};

			Object.keys(interpretation).map(function(k) {
				this.setPath(newRow, interpretation[k], row[k]);
			}.bind(this));

			return newRow;
		});

		return new DataTable.initInterpretation(this.data, interpretation);
	}}
});
