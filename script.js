const wirePath = document.getElementById('wire-path');
const battery = document.getElementById('battery');
const bulb = document.getElementById('bulb');
const electronsGroup = document.getElementById('electrons');
const testZone = document.getElementById('test-zone');
const testZoneLabel = document.getElementById('test-zone-label');

let dragging = null;
let electronAnimationIds = [];
let electronCount = 5;

function getMousePos(evt) {
  const svg = document.getElementById('circuit');
  const rect = svg.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

function updateWires() {
  const ax = parseFloat(battery.getAttribute('x')) - 100;
  const ay = parseFloat(battery.getAttribute('y')) + 50;
  const bx = parseFloat(bulb.getAttribute('x')) + 50;
  const by = parseFloat(bulb.getAttribute('y')) + 100;

  const junctionX = ax + 200;
  const topY = 150;
  const lowY = 600;

  const path = [
    { x: ax + 100, y: ay },      // from battery right
    { x: ax - 150, y: ay },      // go left
    { x: ax - 150, y: by },    // go down
    { x: bx, y: by },          // go right to bulb
    { x: bx + 300, y: by },      // right from bulb to open end
    { x: bx + 300, y: ay },    // up to placeholder
    { x: junctionX, y: ay }    // left to connect to battery
  ];

  // Update wire path
  let d = `M ${path[0].x},${path[0].y}`;
  for (let i = 1; i < path.length; i++) {
    d += ` L ${path[i].x},${path[i].y}`;
  }
  wirePath.setAttribute('d', d);

  // Stick test zone to the segment between path[4] and path[5]
  const testX = path[4].x - 50;
  const testY = (path[4].y + path[5].y) / 2 - 75;
  testZone.setAttribute('x', testX);
  testZone.setAttribute('y', testY);
  testZoneLabel.setAttribute('x', testX + 10);
  testZoneLabel.setAttribute('y', testY + 80);

  startElectronAnimation(path);
}

function startElectronAnimation(path) {
  electronsGroup.innerHTML = '';
  electronAnimationIds.forEach(id => cancelAnimationFrame(id));
  electronAnimationIds = [];

  for (let i = 0; i < electronCount; i++) {
    const electron = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    electron.setAttribute('r', 6);
    electron.setAttribute('fill', 'blue');
    electronsGroup.appendChild(electron);
    animateElectron(electron, i * 0.2, path);
  }
}

function animateElectron(electron, delay, path) {
  let t = delay;

  function step() {
    t += 0.003;
    if (t > 1) t = 0;
    const totalSegments = path.length - 1;
    const segment = Math.floor(t * totalSegments);
    const localT = (t * totalSegments) - segment;
    const p1 = path[segment];
    const p2 = path[segment + 1];
    const x = p1.x + (p2.x - p1.x) * localT;
    const y = p1.y + (p2.y - p1.y) * localT;
    electron.setAttribute('cx', x);
    electron.setAttribute('cy', y);
    const id = requestAnimationFrame(step);
    electronAnimationIds.push(id);
  }
  step();
}

function makeDraggable(el) {
  el.addEventListener('mousedown', () => {
    dragging = el;
  });
}

document.addEventListener('mousemove', (e) => {
  if (!dragging) return;
  const pos = getMousePos(e);
  dragging.setAttribute('x', pos.x - 50);
  dragging.setAttribute('y', pos.y - 50);
  updateWires();
});

document.addEventListener('mouseup', () => {
  dragging = null;
});

makeDraggable(battery);
makeDraggable(bulb);
updateWires();
