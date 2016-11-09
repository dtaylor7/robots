MARS.Grid = function(options){

	return {

		sections: [],
		robots: [],
		currentRobot: -1,

		init: function(){

			$.extend(this, options);

			this.render();

			return this;

		},

		render: function(){

			this.setSize();

			this.renderGrid();

		},

		renderGrid: function(){

			var self = this;

			for(var y = MARS.Config.grid.y-1; y > -1; y--){

				for(var x = 0; x < MARS.Config.grid.x; x++){

					var section = new MARS.Section({
						el: $($('#T_gridSection').html()),
						coordinates: {
							x: x,
							y: y
						}
					});

					self.el.append(section.init().el);

					self.sections[ x + ',' + y ] = section;

				}

			}

		},

		setSize: function(){

			this.el.css({
				width: MARS.Config.grid.x * MARS.Config.gridSectionSize,
				height: MARS.Config.grid.y * MARS.Config.gridSectionSize,
				marginTop: ($(window).height() - (MARS.Config.grid.y * MARS.Config.gridSectionSize)) / 2
			});

		},

		resize: function(){

			this.el.css({
				marginTop: ($(window).height() - (MARS.Config.grid.y * MARS.Config.gridSectionSize)) / 2
			});

		},

		addRobot: function(options){

			var self = this;
			var robot = new MARS.Robot({
				el: $($('#T_robot').html()),
				section: this.sections[options.coords.x + ',' + options.coords.y],
				startDirection: options.direction,
				command: options.command,
				parent: this,
				onEnd: function(){
					self.nextRobot();
				}
			});

			this.robots.push(robot);

		},

		reset: function(){
			this.currentRobot = -1;
			this.robots = [];
			this.sections = [];
			this.el.html('');
		},

		activateRobot: function(robot){

			if(this.robotActive || !robot){
				return false;
			}

			this.robotActive = true;
			robot.init();

		},

		nextRobot: function(){

			MARS.App.sidePanel.newRobotLog();

			this.robotActive = false;
			this.currentRobot++;
			this.activateRobot(this.robots[this.currentRobot]);

		},

		getSection: function(x, y){

			return this.sections[ x + ',' + y ] ? this.sections[ x + ',' + y ] : false;

		}

	};

};

MARS.Section = function(options){

	return {

		robotIsLost: [],

		init: function(){

			$.extend(this, options);

			this.render();

			return this;

		},

		render: function(){

			this.el.css({
				width: MARS.Config.gridSectionSize,
				height: MARS.Config.gridSectionSize
			});

		},

		robotLost: function(direction){

			this.robotIsLost.push(direction);
			this.el.addClass('lostRobot');

		}

	};

};

MARS.Robot = function(options){

	return {

		currentDirection: 0,
		currentCommandPos: -1,
		directions: [
			'N',
			'E',
			'S',
			'W'
		],

		init: function(){

			$.extend(this, options);

			this.render();

			var self = this;
			// stay for one turn on rendered position
			setTimeout(function(){
				self.draw();
			}, MARS.Config.animationDelay);

			return this;

		},

		render: function(){

			this.setStartPoisiton();

			// add robot to its section
			this.section.el.append(this.el);

		},

		setStartPoisiton: function(){

			var self = this;
			for(var i = 0; i < this.directions.length; i++){
				if(self.directions[i] === self.startDirection){
					self.currentDirection = i;
					self.setDirectionClass();
				}
			}

		},

		draw: function(){

			this.currentCommandPos++;

			if(!this.command || this.currentCommandPos === this.command.length){
				this.end();
				return false;
			}

			var currentCommand = this.command[this.currentCommandPos];

			if(!this.canUseCommand(currentCommand)){
				this.draw();
				return false;
			}

			if(currentCommand === 'F'){
				this.moveFoward();
			}else{
				this.setDirection(currentCommand);
			}

			var self = this;
			setTimeout(function(){
				self.draw();
			}, MARS.Config.animationDelay);

		},

		canUseCommand: function(currentCommand){

			if(currentCommand !== 'F'){
				return true;
			}

			// check if a robot has died on this section before
			if(this.section.robotIsLost.length > 0){

				var self = this;

				for(var i = 0; i < this.section.robotIsLost.length; i ++){

					// if they are what direction did they go if they died
					if(self.directions[self.currentDirection] === self.section.robotIsLost[i]){

						return false;

					}

				}

			}

			return true;

		},

		end: function(lost){

			this.el.addClass('finished');

			// right the output
			var output = this.section.coordinates.x;
			output += ' ' + this.section.coordinates.y;
			output += ' ' + this.directions[this.currentDirection];

			// print output to the sidepanel log
			MARS.App.sidePanel.logCommand(output);

			if(this.isLost){
				MARS.App.sidePanel.logCommand(' LOST');
			}

			// trigger the onEnd callback
			if(this.onEnd){
				this.onEnd();
			}

		},

		setDirection: function(direction){

			// which way are we turning
			if(direction === "R"){
				this.currentDirection++;
			}else{
				this.currentDirection--;
			}

			// reset turning array
			if(this.currentDirection === this.directions.length){
				this.currentDirection = 0;
			}else if(this.currentDirection === -1){
				this.currentDirection = 3;
			}

			this.setDirectionClass();

		},

		setDirectionClass: function(){

			this.el.attr('class', 'robot ' + this.directions[this.currentDirection]);

		},

		moveFoward: function(){

			var section;

			switch(this.directions[this.currentDirection]){

				case 'N':

					section = this.parent.getSection(this.section.coordinates.x, this.section.coordinates.y+1);

					break;
				case 'S':

					section = this.parent.getSection(this.section.coordinates.x, this.section.coordinates.y-1);

					break;
				case 'E':

					section = this.parent.getSection(this.section.coordinates.x+1, this.section.coordinates.y);

					break;
				case 'W':

					section = this.parent.getSection(this.section.coordinates.x-1, this.section.coordinates.y);

					break;
			}

			if(!section){

				this.robotLost();

			}else{

				this.section = section;
				this.section.el.append(this.el);

			}

		},

		robotLost: function(){

			this.section.robotLost(this.directions[this.currentDirection]);
			this.el.remove();
			this.command = null;
			this.isLost = true;

		}

	};

};

MARS.SidePanel = function(options){

	return {

		visible: true,

		init: function(){

			$.extend(this, options);

			this.render();

			this.addEvents();

			return this;

		},

		render: function(){

			this.el.find('.input .speed').val(MARS.Config.animationDelay);

		},

		addEvents: function(){

			var self = this;
			this.el.find('.runCommand').click(function(){
				self.runCommand();
			});

		},

		runCommand: function(){

			// reset the grid
			MARS.App.grid.reset();

			// clear logs
			this.el.find('.output .logs').html('');

			// set the speed encase it has changed
			this.setSpeed(parseInt(this.el.find('.input .speed').val(), 11));

			var command = this.parseCommands();

			this.setGridSize(command.shift());

			this.createRobots(command);

			// start the animation
			MARS.App.grid.nextRobot();

		},

		setSpeed: function(speed){

			MARS.Config.animationDelay = speed;

		},

		parseCommands: function(){

			var command = this.el.find('.input textarea')
			.val()
			.toUpperCase()
			.replace(/^\s*[\r\n]/gm, "")
			.split('\n');

			return command;

		},

		setGridSize: function(gridCommand){

			var gridSize = gridCommand.split(' ');

			MARS.Config.grid = {
				x: parseInt(gridSize[0],11)+1,
				y: parseInt(gridSize[1],11)+1
			};

			// render the grid now we have new size
			MARS.App.grid.render();

		},

		createRobots: function(command){

			var self = this;

			for(var i = 0; i < command.length; i+=2){

				var startCommands = command[i].split(' ');

				MARS.App.grid.addRobot({
					coords: {
						x:startCommands[0],
						y:startCommands[1]
					},
					command: command[i+1].replace(/\s/g, ""),
					direction: startCommands[2]
				});

			}

		},

		logCommand: function(command){

			this.currentParagraph[0].innerHTML += ' ' + command;

		},

		newRobotLog: function(){

			this.currentParagraph = $('<p/>');

			this.el.find('.output .logs').append(this.currentParagraph);

		}

	};

};










