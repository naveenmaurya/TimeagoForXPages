/*
 * timeago: a jQuery plugin, version: 0.9.3 (2011-01-21)
 * @requires jQuery v1.2.3 or later
 *
 * Timeago is a jQuery plugin that makes it easy to support automatically
 * updating fuzzy timestamps (e.g. "4 minutes ago" or "about 1 day ago").
 *
 * For usage and examples, visit:
 * http://timeago.yarp.com/
 *
 * Licensed under the MIT:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright (c) 2008-2011, Ryan McGeary (ryanonjavascript -[at]- mcgeary [*dot*] org)
 */
dojo.provide('timeago.Timeago');

dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require("dojo.i18n");
dojo.requireLocalization("timeago", "Timeago");

dojo.declare('timeago.Timeago', [dijit._Widget], {
    settings: {
        refreshMillis: 60000,
		secRefreshMillis: 5000,
		allowFuture: false,
		strings: {
	}	  
	},
	interval: null,
	postCreate: function() {
		this.settings.strings = dojo.i18n.getLocalization('timeago', "Timeago", this.lang);
		
		this.refresh();		
		
		if (this.timeout > 0) {
			this.interval = setInterval("dijit.byId('"+this.id+"').refresh();", this.timeout);
		}
	},
	
	inWords: function(distanceMillis) {
		var $l = this.settings.strings;
		var prefix = $l.prefixAgo;
		var suffix = $l.suffixAgo;
		if (this.settings.allowFuture) {
			if (distanceMillis < 0) {
				prefix = $l.prefixFromNow;
				suffix = $l.suffixFromNow;
			}
			distanceMillis = Math.abs(distanceMillis);
		}

		var seconds = distanceMillis / 1000;
		var minutes = seconds / 60;
		var hours = minutes / 60;
		var days = hours / 24;
		var years = days / 365;

		function substitute(stringOrFunction, number) {
			var string = dojo.isFunction(stringOrFunction) ? stringOrFunction(number, distanceMillis) : stringOrFunction;
			var value = ($l.numbers && $l.numbers[number]) || number;
			return string.replace(/%d/i, value);
		}

		var words = seconds < 45 && substitute($l.seconds, Math.round(seconds)) ||
		seconds < 90 && substitute($l.minute, 1) ||
		minutes < 45 && substitute($l.minutes, Math.round(minutes)) ||
		minutes < 90 && substitute($l.hour, 1) ||
		hours < 24 && substitute($l.hours, Math.round(hours)) ||
		hours < 48 && substitute($l.day, 1) ||
		days < 30 && substitute($l.days, Math.floor(days)) ||
		days < 60 && substitute($l.month, 1) ||
		days < 365 && substitute($l.months, Math.floor(days / 30)) ||
		years < 2 && substitute($l.year, 1) ||
		substitute($l.years, Math.floor(years));

		return dojo.trim([prefix, words, suffix].join(" "));
	},
	parse: function(iso8601) {
		if(!iso8601) return new Date();
		var s = dojo.trim(iso8601);	  
		s = s.replace(/\.\d\d\d+/,""); // remove milliseconds
		s = s.replace(/-/,"/").replace(/-/,"/");
		s = s.replace(/T/," ").replace(/Z/," UTC");
		s = s.replace(/([\+\-]\d\d)\:?(\d\d)/," $1$2"); // -04:00 -> -0400
		return new Date(s);
	},
	datetime: function() {
		var isTime = this.domNode.tagName.toLowerCase() === "time";
		var iso8601 = isTime ? dojo.attr(this.domNode, "datetime") : dojo.attr(this.domNode, "title");
		return this.parse(iso8601);
	},

	refresh: function () {
		var data = this.prepareData();
		if (!isNaN(data.datetime)) {
			this.domNode.innerHTML = this.inWords(this.distance(data.datetime));
		}
	
		if(this.distance(data.datetime) < 45000) {
			this.timeout = this.settings.secRefreshMillis;
		} else if (this.timeout == this.settings.secRefreshMillis) {
			this.timeout = this.settings.refreshMillis;
			clearInterval(this.interval);
			this.interval = setInterval("dijit.byId('"+this.id+"').refresh();", this.timeout);
		} else {
			this.timeout = this.settings.refreshMillis;
		}
	
		return ;
	},

	prepareData: function () {
		if (!this.timeago) {
			this.timeago= {
				datetime: this.datetime()
			};
			var text = dojo.trim(this.domNode.innerHTML);
			if (text.length > 0) {
				dojo.attr(this.domNode, "title", text);
			}
		}
		return this.timeago;
	},
	distance: function (date) {
		return (new Date().getTime() - date.getTime());
	}
});