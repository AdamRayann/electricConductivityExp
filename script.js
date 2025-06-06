const wirePath = document.getElementById('wire-path');
const battery = document.getElementById('battery');
const bulb = document.getElementById('bulb');
const electronsGroup = document.getElementById('electrons');
const testZone = document.getElementById('test-zone');
const testZoneLabel = document.getElementById('test-zone-label');
const gifDisplay = document.getElementById('gif-display');
const electronViewCheckbox = document.getElementById('electron-view');
const atomicViewCheckbox = document.getElementById('atomic-view');
const explanationBox = document.getElementById('explanation-box');
const conductivityBtn = document.getElementById('conductivity-btn');
const structureBtn = document.getElementById('structure-btn');

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
  saltedWater: { conductive: true, speed: 0.003 },
  meltedSalt: { conductive: true, speed: 0.003 }
};

const itemExplanations = {
  silver: {
  structure: `الفضة Ag في الحالة الصلبة:\n• ذرات الفضة مرتبة في شبكة بلورية منتظمة (شبيهة بمكعب)، وكل ذرة تفقد إلكترونًا واحدًا من غلافها الخارجي.\n• الإلكترونات المفقودة لا ترتبط بأي ذرة معينة، بل تتحرك بحرية داخل المعدن فيما يُعرف بـبحر الإلكترونات.`,
  conductivity: `سبب التوصيل للكهرباء:\n• لأن معدن الفضة يحتوي على إلكترونات حرة الحركة وتتحرك بسهولة في الشبكة المعدنية.`
},
  graphite: {
  structure: `الجرافيت في الحالة الصلبة:\n• يتكون الجرافيت من طبقات متوازية من ذرات الكربون المرتبطة بروابط تساهمية قوية داخل كل طبقة.\n• كل ذرة كربون في الطبقة الواحدة ترتبط بثلاث ذرات كربون أخرى، وتُشكّل شبكة سداسية منتظمة (مثل خلايا النحل).\n• هذا يترك إلكترونًا حرًّا واحدًا من كل ذرة غير مرتبط في رباط تساهمي، ويشارك في انتاج سحابة إلكترونية حرة تمتد فوق وتحت الطبقة.`,
  conductivity: `سبب التوصيل للكهرباء:\n• هذه الإلكترونات الحرة يمكنها التحرك بحرية داخل الطبقات، مما يتيح مرور التيار الكهربائي.`
}
,
  diamond: {
  conductivity: `سبب عدم التوصيل للكهرباء:\n• يتطلب التوصيل الكهربائي وجود إلكترونات حرة الحركة قادرة على الانتقال عبر المادة.\n• في الألماس، تكون جميع الإلكترونات مقيدة داخل الروابط التساهمية، ولا توجد إلكترونات حرة.\n• لذلك، لا يستطيع الألماس نقل التيار الكهربائي، ويُعتبر مادة عازلة.`,
  structure: `الألماس في الحالة الصلبة:\n• يتكون الألماس من ذرات كربون C، وكل ذرة كربون ترتبط مع 4 ذرات كربون أخرى بروابط تساهمية قوية جدًا.\n• تُشكل هذه الروابط شبكة ثلاثية الأبعاد منتظمة وثابتة تعرف باسم الشبكة البلورية المكعبة.\n• كل إلكترون من إلكترونات التكافؤ الأربعة لكل ذرة كربون مشارك في رباط تساهمي واحد، أي لا يوجد إلكترونات حرة.`
},
saltedWater: {
  structure: `ملح كلوريد الصوديوم في الحالة السائلة NaCl(l) أو في المحلول المائي NaCl(aq):\n• تنفصل بلورات NaCl إلى أيونات حرة:\n  - Na⁺(aq)\n  - Cl⁻(aq)\n• تتحرك هذه الأيونات بحرية بين جزيئات الماء (في المحلول) أو داخل السائل المنصهر.`,
  conductivity: `سبب التوصيل للكهرباء:\n• الأيونات الحرة الحركة تحمل شحنات كهربائية سالبة وموجبة، مما يسمح بنقل التيار الكهربائي عبر المحلول أو السائل المنصهر.`
},
sugar: {
  structure: `سكر الجلوكوز (C6H12O6) في الحالة الصلبة:\n• كل جزيء سكر يتكوّن من ذرات كربون وهيدروجين وأوكسجين، مترابطة بروابط تساهمية (كوفلنتية).\n• في الحالة الصلبة، تكون الجزيئات مرتّبة بشكل منتظم في شبكة جزيئية، لكن لا توجد جسيمات مشحونة (أيونات) حرة الحركة.`,
  conductivity: `لماذا لا يوصّل الكهرباء؟\n• لأن نقل التيار الكهربائي يحتاج إلى جسيمات مشحونة حرة الحركة (مثل إلكترونات أو أيونات).\n• في السكر الصلب: لا توجد أيونات. الجزيئات غير مشحونة. لا توجد إلكترونات حرة كما في المعادن. لذلك لا يمكن للجزيئات أن تنقل الكهرباء.`
},
salt: {
  structure: `ملح كلوريد الصوديوم NaCl(s) في الحالة الصلبة:\n• شبكة بلورية منتظمة مكونة من أيونات Na⁺ موجبة وأيونات Cl⁻ سالبة مرتبة في نمط ثلاثي الأبعاد.\n• الأيونات ثابتة في أماكنها بسبب التجاذب القوي بين الشحنات المتعاكسة.`,
  conductivity: `سبب عدم التوصيل للكهرباء:\n• لا توجد جسيمات مشحونة حرة الحركة.\n• الأيونات محبوسة داخل الشبكة البلورية، فلا يمكنها التحرك لتوصيل التيار الكهربائي.`
},
meltedSalt: {
  structure: `ملح كلوريد الصوديوم في الحالة السائلة NaCl(l) أو في المحلول المائي NaCl(aq):\n• تنفصل بلورات NaCl إلى أيونات حرة:\n  - Na⁺(aq)\n  - Cl⁻(aq)\n• تتحرك هذه الأيونات بحرية بين جزيئات الماء (في المحلول) أو داخل السائل المنصهر.`,
  conductivity: `سبب التوصيل للكهرباء:\n• الأيونات الحرة الحركة تحمل شحنات كهربائية سالبة وموجبة، مما يسمح بنقل التيار الكهربائي عبر المحلول أو السائل المنصهر.`
}




};


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

  if (itemDropped && conductivityMap[droppedItemType]?.conductive) {
    startElectronAnimation(path, conductivityMap[droppedItemType].speed);
  } else if (itemDropped) {
    startElectronAnimation(path, 0);
  } else {
    stopElectronAnimation();
  }
}

function startElectronAnimation(path, speed = 0.003) {
  bulb.setAttribute('href', speed > 0 ? 'img/bulbOn.png' : 'img/bulbOff.png');
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

  const img = document.createElementNS("http://www.w3.org/2000/svg", "image");
  img.setAttribute("href", `img/${droppedItemType}.png`);
  img.setAttribute("x", x);
  img.setAttribute("y", y);
  img.setAttribute("width", "100");
  img.setAttribute("height", "190");
  img.setAttribute("id", "dropped-item");
  document.getElementById("circuit").appendChild(img);

  enableDroppedItemReset();
  updateGifDisplay();
  updateExplanationBox();
  updateWires();
}

[testZone, testZoneLabel].forEach(el => {
  el.addEventListener('dragover', e => e.preventDefault());
  el.addEventListener('drop', handleDropEvent);
});

document.getElementById('reset-btn').addEventListener('click', () => {
  const dropped = document.getElementById('dropped-item');
  if (dropped) dropped.remove();
  testZone.style.display = 'block';
  testZoneLabel.style.display = 'block';
  itemDropped = false;
  droppedItemType = null;
  stopElectronAnimation();
  gifDisplay.style.display = 'none';
  explanationBox.textContent = '';
  updateWires();
});

function enableDroppedItemReset() {
  const dropped = document.getElementById('dropped-item');
  if (!dropped) return;

  dropped.style.cursor = 'pointer';
  dropped.setAttribute('draggable', true);

  const reset = () => {
    dropped.remove();
    testZone.style.display = 'block';
    testZoneLabel.style.display = 'block';
    itemDropped = false;
    droppedItemType = null;
    stopElectronAnimation();
    gifDisplay.style.display = 'none';
    explanationBox.textContent = '';
    updateWires();
  };

  dropped.addEventListener('click', reset);
  dropped.addEventListener('dragstart', reset);
}

electronViewCheckbox.addEventListener('change', () => {
  if (electronViewCheckbox.checked) {
    atomicViewCheckbox.checked = false;
    updateGifDisplay();
  }
});

atomicViewCheckbox.addEventListener('change', () => {
  if (atomicViewCheckbox.checked) {
    electronViewCheckbox.checked = false;
    updateGifDisplay();
  }
});

function updateGifDisplay() {
  if (!itemDropped || !droppedItemType) {
    gifDisplay.style.display = 'none';
    return;
  }

  let src = '';
  if (electronViewCheckbox.checked) {
    src = `img/${droppedItemType}.gif`;
  } else if (atomicViewCheckbox.checked) {
    src = `img/${droppedItemType}_atomic.png`;
  }

  gifDisplay.src = src;
  gifDisplay.style.display = 'block';
}

let currentExplanationType = 'structure'; // default

function updateExplanationBox() {
  if (!itemDropped || !droppedItemType) {
    explanationBox.textContent = '';
    return;
  }

  const data = itemExplanations[droppedItemType];
  if (!data) return;

  explanationBox.textContent = currentExplanationType === 'conductivity'
    ? data.conductivity
    : data.structure;
}


const activeBg = '#c2d7e7';
const defaultBg = ''; 

conductivityBtn.addEventListener('click', () => {
  if (droppedItemType && itemExplanations[droppedItemType]) {
    explanationBox.textContent = itemExplanations[droppedItemType].conductivity || 'لا يوجد شرح موصلية متاح.';
  } else {
    explanationBox.textContent = 'يرجى إسقاط عنصر في منطقة الاختبار أولاً.';
  }

  conductivityBtn.classList.add('active');
  structureBtn.classList.remove('active');
});

structureBtn.addEventListener('click', () => {
  if (droppedItemType && itemExplanations[droppedItemType]) {
    explanationBox.textContent = itemExplanations[droppedItemType].structure || 'لا يوجد شرح مبنى متاح.';
  } else {
    explanationBox.textContent = 'يرجى إسقاط عنصر في منطقة الاختبار أولاً.';
  }

  structureBtn.classList.add('active');
  conductivityBtn.classList.remove('active');
});


const toggleArrow = document.getElementById('toggle-explanation-arrow');
const explanationContainer = document.getElementById('explanation-container');

toggleArrow.addEventListener('click', () => {
  explanationContainer.classList.toggle('collapsed');
  toggleArrow.textContent = explanationContainer.classList.contains('collapsed') ? '▲' : '▼';
});
