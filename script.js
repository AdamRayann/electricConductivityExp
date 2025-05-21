const wirePath = document.getElementById('wire-path');
const battery = document.getElementById('battery');
const bulb = document.getElementById('bulb');
const electronsGroup = document.getElementById('electrons');
const testZone = document.getElementById('test-zone');
const testZoneLabel = document.getElementById('test-zone-label');
const gifDisplay = document.getElementById('gif-display');

let dragging = null;
let electronAnimationIds = [];
let electronCount = 10;
let itemDropped = false;
let droppedItemType = null;

const conductivityMap = {
  silver: { conductive: true, speed: 0.006 },
  graphite: { conductive: true, speed: 0.003 },
  diamond: { conductive: false, speed: 0 },
  salt: { conductive: false, speed: 0 },
  sager: { conductive: false, speed: 0 },
  saltedWater: { conductive: true, speed: 0.003 }
};

// Setup drag start function globally
window.handleDragStart = function (event, type) {
  event.dataTransfer.setData('text/plain', type);
  droppedItemType = type;
};

function getMousePos(evt) {
  const svg = document.getElementById('circuit');
  const rect = svg.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

let lastPath = [];

function updateWires() {
  const ax = parseFloat(battery.getAttribute('x')) - 100;
  const ay = parseFloat(battery.getAttribute('y')) + 50;
  const bx = parseFloat(bulb.getAttribute('x')) + 50;
  const by = parseFloat(bulb.getAttribute('y')) + 100;

  const junctionX = ax + 200;

  const path = [
    { x: ax + 100, y: ay },
    { x: ax - 150, y: ay },
    { x: ax - 150, y: by + 50 },
    { x: bx, y: by + 50 },
    { x: bx + 300, y: by + 50 },
    { x: bx + 300, y: ay },
    { x: junctionX, y: ay }
  ];

  lastPath = path;

  let d = `M ${path[0].x},${path[0].y}`;
  for (let i = 1; i < path.length; i++) {
    d += ` L ${path[i].x},${path[i].y}`;
  }
  wirePath.setAttribute('d', d);

  if (!itemDropped) {
    const testX = path[4].x - 50;
    const testY = (path[4].y + path[5].y) / 2 - 75;
    testZone.setAttribute('x', testX);
    testZone.setAttribute('y', testY);
    testZoneLabel.setAttribute('x', testX + 15);
    testZoneLabel.setAttribute('y', testY + 80);
  }

  if (itemDropped) {
    const conductivity = conductivityMap[droppedItemType];
    if (conductivity?.conductive) {
      bulb.setAttribute('href', 'img/bulbOn.png');
      startElectronAnimation(path, conductivity.speed);
    } else {
      bulb.setAttribute('href', 'img/bulbOff.png');
      startElectronAnimation(path, 0);
    }
  } else {
    stopElectronAnimation();
  }
}

function startElectronAnimation(path, speed = 0.003) {
  electronsGroup.innerHTML = '';
  electronAnimationIds.forEach(id => cancelAnimationFrame(id));
  electronAnimationIds = [];

  for (let i = 0; i < electronCount; i++) {
    const electron = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    electron.setAttribute('r', 6);
    electron.setAttribute('fill', 'red');
    electronsGroup.appendChild(electron);
    animateElectron(electron, (i / electronCount), path, speed);
  }
}

function animateElectron(electron, delay, path, speed) {
  let t = delay;
  function step() {
    t += speed;
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

function stopElectronAnimation() {
  bulb.setAttribute('href', 'img/bulbOff.png');
  electronAnimationIds.forEach(id => cancelAnimationFrame(id));
  electronAnimationIds = [];
  electronsGroup.innerHTML = '';
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

function handleDropEvent(e) {
  e.preventDefault();
  if (!droppedItemType || itemDropped) return;

  itemDropped = true;
  testZone.style.display = 'none';
  testZoneLabel.style.display = 'none';

  const x = testZone.getAttribute('x');
  const y = testZone.getAttribute('y');
  gifDisplay.style.display = 'flex';
  gifDisplay.innerHTML = `<img src="img/${droppedItemType}.gif" alt="${droppedItemType} gif" />`;


  const img = document.createElementNS("http://www.w3.org/2000/svg", "image");
  img.setAttribute("href", `img/${droppedItemType}.png`);
  img.setAttribute("x", x);
  img.setAttribute("y", y);
  img.setAttribute("width", "100");
  img.setAttribute("height", "190");
  img.setAttribute("id", "dropped-item");
  document.getElementById("circuit").appendChild(img);

  enableDroppedItemReset();

  const conductivity = conductivityMap[droppedItemType];
  if (conductivity?.conductive) {
    bulb.setAttribute('href', 'img/bulbOn.png');
    startElectronAnimation(lastPath, conductivity.speed);
  } else {
    bulb.setAttribute('href', 'img/bulbOff.png');
    startElectronAnimation(lastPath, 0);
  }
}

[testZone, testZoneLabel].forEach(el => {
  el.addEventListener('dragover', e => e.preventDefault());
  el.addEventListener('drop', handleDropEvent);
});

function enableDroppedItemReset() {
  const dropped = document.getElementById('dropped-item');
  if (!dropped) {
    gifDisplay.style.display = 'none';
    return;}

  dropped.style.cursor = 'pointer';
  dropped.setAttribute('draggable', true);

  const reset = () => {
    dropped.remove();
    gifDisplay.style.display = 'none';
    testZone.style.display = 'block';
    testZoneLabel.style.display = 'block';
    itemDropped = false;
    droppedItemType = null;
    stopElectronAnimation();
    updateWires();
  };

  dropped.addEventListener('click', reset);
  dropped.addEventListener('dragstart', reset);
}

document.getElementById('reset-btn').addEventListener('click', () => {
  const dropped = document.getElementById('dropped-item');
  if (dropped) dropped.remove();
  gifDisplay.style.display = 'none';

  testZone.style.display = 'block';
  testZoneLabel.style.display = 'block';
  
  itemDropped = false;
  droppedItemType = null;
  
  stopElectronAnimation();
  bulb.setAttribute('href', 'img/bulbOff.png');
  updateWires();
});




function preloadImages(imageNames, onComplete) {
  let loadedCount = 0;
  const total = imageNames.length;

  imageNames.forEach(name => {
    const img = new Image();
    img.src = `img/${name}`;
    img.onload = () => {
      loadedCount++;
      if (loadedCount === total) {
        onComplete(); // All images loaded
      }
    };
    img.onerror = () => {
      console.warn(`❌ Failed to load img/${name}`);
      loadedCount++;
      if (loadedCount === total) {
        onComplete(); // Even with errors, continue
      }
    };
  });
}

const imageFiles = [
  'silver.png',
  'graphite.png',
  'diamond.png',
  'battery.png',
  'bulbOn.png',
  'bulbOff.png',
  'bg.jpg'
];

preloadImages(imageFiles, () => {
  console.log('✅ All images loaded. Starting the app...');
});
