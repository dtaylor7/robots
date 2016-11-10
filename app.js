const directions = ['N', 'E', 'S', 'W'];

const run = (input, callback) => {

  if(!input){
    return callback("No input given");
  }

  const commands = input
  .toUpperCase()
  .replace(/^\s*[\r\n]/gm, "")
  .split('\n');

  // get grid size from commands
  const gridSize = commands.shift().split(" ");

  if(gridSize[0] > 50 || gridSize[1] > 50){
    return callback('Grid to big');
  }

  // loop through commands and create array of robots
  let robots = [];
  for(var i = 0; i < commands.length; i+=2){

    const position = commands[i].split(' ');
    const robot = {
      position: {
        x: parseInt(position[0]),
        y: parseInt(position[1]),
        d: position[2]
      },
      commands: Array.from(commands[i+1].replace(/\s/g, ""))
    };

    if(robot.commands.length > 100){
      return callback("Commands too long for robot");
    }

    robots.push(robot);

  }

  let scents = [];

  const output = robots.map((robot) => {

    let msg = "";

    // loop through each robot and run commands
    robot.commands.some((command) => {



      const currentIndex = directions.indexOf(robot.position.d);

      switch(command){
        case 'R':
          robot.position.d = currentIndex + 1 > directions.length-1 ? directions[0] : directions[currentIndex + 1];
          break;
        case 'L':
          robot.position.d = currentIndex - 1 < 0 ? directions[directions.length-1] : directions[currentIndex - 1];
          break;
        case 'F':

          let oldPosition = {
            x: robot.position.x,
            y: robot.position.y
          };

          switch(robot.position.d){
            case 'N':
              robot.position.y++;
              break;
            case 'E':
              robot.position.x++;
              break;
            case 'S':
              robot.position.y--;
              break;
            case 'W':
              robot.position.x--;
              break;
          }

          // if previous robot has died here reverse command
          if(scents[`${robot.position.x},${robot.position.y}`]){
            robot.position.x = oldPosition.x;
            robot.position.y = oldPosition.y;
          }

          break;

      }

      // if robot goes off the grid append LOST to and stop moving
      if(robot.position.x < 0 || robot.position.x > gridSize[0] || robot.position.y < 0 || robot.position.y > gridSize[1]){
        // add coords to scent array ( use key for fast lookup )
        scents[`${robot.position.x},${robot.position.y}`] = true;
        msg += ` LOST`;
        return true;
      }else{
        msg = `${robot.position.x} ${robot.position.y} ${robot.position.d}`;
      }

    });

    return msg;

  });

  callback(null, output);

};


document.querySelector('#run').addEventListener('click', function(){

  const input = document.querySelector('#input').value;

  run(input, function(err, output){

    if(err){
      return alert(err);
    }

    document.querySelector('#output').value = output.join("\n");

  })

});