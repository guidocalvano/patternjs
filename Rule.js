

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

					(o[k] !== undefined) && this.match(pattern[k], o[k], match);
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

/*
// a rule that illustrates why this is useful
var dataToVector = new Rule().init(
	{dimensions: {width: 'X', height: 'Y'}, topSpeed: 'Z'},
	['X', 'Y', 'Z']);
var data = {model: "Ford T", dimensions: {width: 10, height: 13, length: 23}, topSpeed: 123};
var vector = dataToVector.apply(data);

// a rule that has pretty much everything but the kitchen sink in it
var s = new Rule().init({a: 'X', b: ['Y', 'Z']}, {henk: 'X', truus: {greet: ['Z', 'Y'], jan: function() { return 'iets';}}, harrie: 2, freddie: false, rudy: NaN, lars: Infinity}, function(m) {return m['X']}, function(m) {return m.X;});
// applied to an object
s.apply({a: 'iets', b: [1, 4]});
// results in
{"henk":"iets","truus":{"greet":[4,1],"jan":"iets"},"harrie":2,"freddie":false,"rudy":null,"lars":null}
*/

(typeof module !== "undefined" ) && module && module.exports && (module.exports = DataTable);

