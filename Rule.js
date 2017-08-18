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


function Rule() {};

Rule.prototype = Object.create({}, {
	init: {value: function(pattern, reconstruction, accept) {
		this.pattern = pattern;
		this.reconstruction = reconstruction;

		this.accept = accept || function() { return true;};

		return this;
	}},
	apply: {value: function(o) {
		var match = this.match(this.pattern, o);

		if (!this.accept(match)) return null;

		if (this.reconstruction === undefined) return match;

		return this.reconstruct(this.reconstruction, match);

	}},

	match: {value: function(pattern, o, match) {
		match = match || {};
		switch (typeof pattern) {
			case 'string':
				match[pattern] = o;
				return match;
			case 'object':
				Object.keys(pattern).map(function(k) {

					o[k] && this.match(pattern[k], o[k], match);
				}.bind(this));
				return match;
			default:


		}

		return match;

	}},
	reconstruct: {value: function(reconstruction, match) {
		if (!reconstruction) return reconstruction; // false, null, undefined, NaN

		switch (typeof reconstruction) {
			case 'boolean':
			case 'number': // true, 1, 3, Infinity, -Infinity
				return reconstruction;
			case 'string': // a literal match
				return match[reconstruction];
			case 'function':
				return reconstruction(match); // can be used to escape strings
			case 'object':
				var o = reconstruction.constructor(); // arrays and objects will be copied, and probably even things with prototypes

				Object.keys(reconstruction).map(function(k) {
					o[k] = this.reconstruct(reconstruction[k], match);
				}.bind(this));

				return o;
		}
	}}

});
