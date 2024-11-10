// Get the canvas and its context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Tank properties
const tankWidth = 40;
const tankHeight = 20;
const turretWidth = 30;
const turretHeight = 5;

// Player tanks
const tank1 = {
  x: 50,
  y: canvas.height - tankHeight,
  angle: 45,
  power: 50,
  color: 'green',
  health: 100, // Added health property
};

const tank2 = {
  x: canvas.width - 90,
  y: canvas.height - tankHeight,
  angle: 135,
  power: 50,
  color: 'blue',
  health: 100, // Added health property
};

let currentPlayer = tank1;
let otherPlayer = tank2;
let projectile = null;
let wind = { direction: 1, intensity: 0 }; // Added wind properties

// Obstacles with random placement and size
let obstacles = Array.from({ length: 5 }, () => ({
  x: Math.random() * (canvas.width - 100) + 50, // Random x position, keeping a margin
  y: canvas.height - Math.random() * 150 - 30, // Random y position, keeping it above the ground
  width: Math.random() * 60 + 20, // Random width between 20 and 80
  height: Math.random() * 50 + 20, // Random height between 20 and 70
}));

// Draw the tank with the specified properties
function drawTank(tank) {
  ctx.fillStyle = tank.color;
  ctx.fillRect(tank.x, tank.y, tankWidth, tankHeight);

  // Calculate turret end point
  const angleRad = (Math.PI / 180) * tank.angle;
  const turretX = tank.x + tankWidth / 2 + Math.cos(angleRad) * turretWidth;
  const turretY = tank.y - Math.sin(angleRad) * turretWidth;

  // Draw turret
  ctx.strokeStyle = 'black';
  ctx.lineWidth = turretHeight;
  ctx.beginPath();
  ctx.moveTo(tank.x + tankWidth / 2, tank.y);
  ctx.lineTo(turretX, turretY);
  ctx.stroke();
}

// Draw the projectile if it exists
function drawProjectile() {
  if (projectile) {
    ctx.beginPath();
    ctx.arc(projectile.x, projectile.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'red';
    ctx.fill();
  }
}

// Draw obstacles
function drawObstacles() {
  ctx.fillStyle = 'brown';
  obstacles.forEach((obstacle) => {
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
  });
}

// Draw wind indicator
function drawWind() {
  ctx.fillStyle = 'black';
  ctx.font = '16px Arial';
  ctx.fillText(
    `Wind: ${wind.intensity.toFixed(1)} ${wind.direction > 0 ? '→' : '←'}`,
    canvas.width - 150,
    30
  );
}

// Main draw function
function draw() {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw both tanks
  drawTank(tank1);
  drawTank(tank2);

  // Draw obstacles
  drawObstacles();

  // Draw the projectile
  drawProjectile();

  // Display current player information
  ctx.fillStyle = 'black';
  ctx.font = '20px Arial';
  ctx.fillText(
    `Player: ${currentPlayer.color.toUpperCase()} | Angle: ${currentPlayer.angle} | Power: ${currentPlayer.power} | Health: ${currentPlayer.health}`,
    10,
    30
  );

  // Draw wind indicator
  drawWind();
}

// Update projectile motion and handle collision detection
function updateProjectile() {
  if (projectile) {
    // Update projectile position based on velocity
    projectile.x += projectile.vx + wind.intensity * wind.direction * 0.02;
    projectile.y += projectile.vy;
    projectile.vy += 0.098; // Simulate gravity effect

    // Check for collision with the ground
    if (projectile.y > canvas.height) {
      projectile = null; // Reset the projectile
      switchPlayers(); // Switch turns
    }

    // Check for collision with the other tank
    if (
      projectile &&
      projectile.x > otherPlayer.x &&
      projectile.x < otherPlayer.x + tankWidth &&
      projectile.y > otherPlayer.y &&
      projectile.y < otherPlayer.y + tankHeight
    ) {
      otherPlayer.health -= 25; // Reduce health on hit
      if (otherPlayer.health <= 0) {
        alert(`${currentPlayer.color.toUpperCase()} Player Wins!`);
        document.location.reload();
      } else {
        projectile = null;
        switchPlayers();
      }
    }

    // Check for collision with obstacles
    obstacles.forEach((obstacle, index) => {
      if (
        projectile &&
        projectile.x > obstacle.x &&
        projectile.x < obstacle.x + obstacle.width &&
        projectile.y > obstacle.y &&
        projectile.y < obstacle.y + obstacle.height
      ) {
        // Remove the obstacle on collision
        obstacles.splice(index, 1);
        projectile = null; // Reset the projectile
        switchPlayers(); // Switch turns
      }
    });
  }
}

// Main update function, which is the game loop
function update() {
  constrainPlayerStats();
  updateProjectile(); // Update projectile motion
  draw(); // Draw the game elements
  requestAnimationFrame(update); // Loop the update function
}

// Fire the projectile based on the current angle and power
function fireProjectile() {
  const angleRad = (Math.PI / 180) * currentPlayer.angle;
  projectile = {
    x: currentPlayer.x + tankWidth / 2,
    y: currentPlayer.y,
    vx: currentPlayer.power * Math.cos(angleRad) * 0.1,
    vy: -currentPlayer.power * Math.sin(angleRad) * 0.1,
  };
}

// Switch between players after a shot
function switchPlayers() {
  [currentPlayer, otherPlayer] = [otherPlayer, currentPlayer];
  // Change wind intensity and direction randomly each turn
  wind.intensity = Math.random() * 2;
  wind.direction = Math.random() > 0.5 ? 1 : -1;
}

// Keep the angle and power values within a reasonable range
function constrainPlayerStats() {
  if (currentPlayer.angle < 0) currentPlayer.angle = 0;
  if (currentPlayer.angle > 180) currentPlayer.angle = 180;
  if (currentPlayer.power < 10) currentPlayer.power = 10;
  if (currentPlayer.power > 250) currentPlayer.power = 250;
}

// Key controls for the game
document.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowUp':
      currentPlayer.angle += 1; // Increase angle
      break;
    case 'ArrowDown':
      currentPlayer.angle -= 1; // Decrease angle
      break;
    case 'ArrowLeft':
      currentPlayer.power -= 1; // Decrease power
      break;
    case 'ArrowRight':
      currentPlayer.power += 1; // Increase power
      break;
    case ' ': // Spacebar to fire
      if (!projectile) fireProjectile();
      break;
  }
});

// Start the game loop
update();
