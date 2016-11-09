var MARS = {};

MARS.Config = {

	grid: {
		x: 10, // sections across
		y: 10 // sections down
	},
	gridSectionSize: 40, // the size of each individual section
	animationDelay: 200 // time in milliseconds between each command the robot goes through

};

MARS.App = function(options){

	var grid = null;
	var sidePanel = null;

	return {

		init: function(){

			this.render();

			this.addEvents();

			this.resize();

		},

		render: function(){

			this.grid = new MARS.Grid({
				el: $('#marshan-land'),
				parent: this
			});
			this.grid.init();

			this.sidePanel = new MARS.SidePanel({
				el: $('#sidePanel'),
				parent: this
			});
			this.sidePanel.init();

		},

		addEvents: function(){

			var self = this;
			$(window).resize(function(){
				self.resize();
			});

		},

		resize: function(){

			$('#container').width($(window).width() - this.sidePanel.el.width());
			this.grid.resize();

		}

	};

}();

jQuery(document).ready(function($) {

	MARS.App.init();

});