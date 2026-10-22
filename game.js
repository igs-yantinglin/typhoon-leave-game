(() => {
  "use strict";

  const TRACK_DURATION = 10_000;
  const DECISION_DURATION = 5_000;
  const svgNS = "http://www.w3.org/2000/svg";
  const $ = (id) => document.getElementById(id);
  const el = {
    gameBoard: $("gameBoard"), threadsPanel: $("threadsPanel"), threadsExpand: $("threadsExpand"), threadsFeed: $("threadsFeed"), threadsCount: $("threadsCount"), coordinateValue: $("coordinateValue"),
    headerStatus: $("headerStatus"), screenClock: $("screenClock"), radarTag: $("radarTag"),
    stormName: $("stormName"), dayProgress: $("dayProgress"), dayLabel: $("dayLabel"),
    introOverlay: $("introOverlay"), startButton: $("startButton"), phaseFlash: $("phaseFlash"),
    trackLayer: $("trackLayer"), forecastLayer: $("forecastLayer"), actualLayer: $("actualLayer"), forecastOverlay: $("forecastOverlay"), forecastOptions: $("forecastOptions"), clockCard: $("clockCard"), clockCaption: $("clockCaption"),
    timeLabel: $("timeLabel"), countdown: $("countdown"), clockUnit: $("clockUnit"),
    timerFill: $("timerFill"), decisionHint: $("decisionHint"),
    holidayButton: $("holidayButton"), workButton: $("workButton"), soundToggle: $("soundToggle"),
    resultOverlay: $("resultOverlay"), newsPage: document.querySelector(".news-page"),
    newsBadge: $("newsBadge"), newsDate: $("newsDate"), newsHeadline: $("newsHeadline"), newsDeck: $("newsDeck"),
    newsPhoto: $("newsPhoto"), newsShot: $("newsShot"), photoCaption: $("photoCaption"), factDecision: $("factDecision"), factRoute: $("factRoute"),
    factWeather: $("factWeather"), factReaction: $("factReaction"), citizenQuote: $("citizenQuote"),
    tickerText: $("tickerText"), replayButton: $("replayButton"), handCursor: $("handCursor")
  };

  const routes = [
    {name: "中線逼近", risk: .78, points: [[650,413],[610,363],[550,312],[490,278],[420,243]]},
    {name: "北轉擦邊", risk: .35, points: [[650,413],[630,345],[590,278],[530,209],[490,140]]},
    {name: "南側掠過", risk: .46, points: [[650,432],[610,414],[560,380],[490,346],[420,312]]},
    {name: "急轉西北", risk: .65, points: [[650,432],[620,389],[560,346],[500,295],[430,255]]},
    {name: "海上徘徊", risk: .51, points: [[650,382],[594,340],[574,301],[543,315],[475,277]]},
    {name: "東岸貼近", risk: .72, points: [[650,435],[593,402],[555,347],[488,302],[438,245]]},
    {name: "北上加速", risk: .39, points: [[650,426],[613,368],[574,284],[537,218],[485,174]]},
    {name: "南海迴轉", risk: .58, points: [[650,435],[596,416],[541,390],[535,349],[467,316]]}
  ];
  // 實際天氣：晴天、風雨不大、暴風雨、颱風放慢到傍晚才來
  const weatherOdds = {
    land:  {stormy: .68, late: .2, mild: .12},
    north: {sunny: .42, mild: .33, late: .12, stormy: .13},
    south: {sunny: .3, mild: .38, late: .14, stormy: .18}
  };
  const weatherFacts = {sunny: "晴朗 · 無風無雨", mild: "陣雨 · 風雨不大", stormy: "暴風雨 · 強風豪雨", late: "早上晴朗 · 傍晚暴風雨"};
  const stormNames = ["海鷗", "銀燕", "青檸", "紫蘭", "珊瑚", "山竹"];
  // 以公開颱風假討論常見的短句、通勤／排班焦慮和互相吐槽寫成虛構貼文。
  const p = (name, handle, text, likes) => ({name, handle, text, likes});
  const trackingPosts = [
    [
      p("板橋小蔡", "banciao_jo", "路徑又往北畫了一點。我先不要跟主管聊明天。", 23),
      p("林口的風", "linkou_wind", "每次颱風還在海上，群組就先開始問要不要上班😂", 386),
      p("阿蓉", "aron_mom", "拜託不要前一天深夜才講，小孩托育真的不是按一下就有。", 179),
      p("淡水觀測站(?)", "danshui_window", "目前窗外：樹葉都沒動。先存檔，五天後回來看。", 57),
      p("桃園通勤中", "taoyuan_train", "我只求北北基桃不要四個不同答案，跨縣市上班會瘋。", 813)
    ],
    [
      p("中和社畜", "zhonghe_work", "公司群組開始有人貼氣象圖了。這代表大家都不想上班。", 644),
      p("阿明爸", "dad_ming", "請問有人知道學校如果停課、公司沒停班，小孩要放哪裡嗎🥲", 1240),
      p("基隆雨傘人", "keelung_umbrella", "基隆人看現在這點雨：嗯，日常。", 291),
      p("海邊的怡", "coast_yi", "不要只看颱風中心有沒有碰到台灣啦，外圍雨帶也會來。", 407),
      p("夜班小蕙", "night_shift_hui", "我們班表已經排到下週。颱風假對夜班真的很玄。", 88)
    ],
    [
      p("氣象圖看太多", "map_refresh", "剛剛那條線是不是又往左飄了？我是不是眼花。", 968),
      p("桃園機車族", "scooter_tao", "明天如果真的有風，我不想騎車過橋欸。", 1512),
      p("遠端仔", "home_office", "老闆：如果放假就居家上班。我的颱風假被雲端吃掉了。", 1340),
      p("阿珍", "jen_092", "我媽說先買泡麵，我爸說先訂 KTV，兩個人都很有信心。", 2078),
      p("北投鄰居", "beitou_nextdoor", "北邊跟市區體感差很多，拜託不要只看我這邊晴天。", 214)
    ],
    [
      p("捷運末班常客", "last_mrt", "三條路線三種命運，手機電量先幫我撐到公告。", 528),
      p("汐止阿豪", "xizhi_hao", "每次說『擦邊』我家門口就先積水，真的不要太早說沒事。", 1890),
      p("中壢早餐店", "breakfast_zhongli", "拜託早點決定，我明天的吐司到底要備幾條？", 754),
      p("新店媽媽", "xindian_mom", "小孩一直問明天放不放，我比他還想知道。", 314),
      p("社畜氣象台", "office_radar", "預測 60% 登陸，也就是還有 40% 可以變魔術。", 1625)
    ],
    [
      p("信義區晚餐", "xinyi_dinner", "20:00 前我先不洗澡，怕錯過那篇公告。", 463),
      p("三重通勤仔", "sanchong_bus", "我明天 6 點要搭第一班公車，拜託準時公告拜託。", 2037),
      p("小學家長群", "parent_chat", "群組已經問第 87 次了，老師也還在等啊。", 1161),
      p("輪班阿樂", "shift_ale", "放不放都可以，先讓我知道明天幾點起床。", 864),
      p("蘆洲的我", "luzhou_me", "北轉？登陸？我現在只剩『重整公告頁面』這個選項。", 2863)
    ]
  ];
  const waitingPosts = [
    [p("阿宏", "hong_refresh", "20:00 了。我手指已經放在重新整理上。", 1044), p("等等等等", "wait_wait", "公告在哪裡，我家群組開始傳假圖了。", 2290), p("基隆雨傘人", "keelung_umbrella", "先講結果，我雨傘拿在手上了。", 622)],
    [p("夜班小蕙", "night_shift_hui", "拜託快一點，夜班現在到底要不要進去？", 1830), p("中壢早餐店", "breakfast_zhongli", "吐司還沒決定要不要解凍欸。", 816), p("阿蓉", "aron_mom", "學校群組全部顯示正在輸入中……", 1520)],
    [p("板橋小蔡", "banciao_jo", "不是，我都刷到第三遍了還沒出來？", 1133), p("桃園通勤中", "taoyuan_train", "車票先買還是先等等？救命。", 917), p("汐止阿豪", "xizhi_hao", "外面風真的有起來，不要拖啦。", 2650)],
    [p("小學家長群", "parent_chat", "我在家長群說『應該快了』，現在被標記 14 次。", 2247), p("阿珍", "jen_092", "這五秒比等醫院叫號還久。", 734), p("遠端仔", "home_office", "我們主管已經打好『大家明天線上見』了吧。", 1422)],
    [p("三重通勤仔", "sanchong_bus", "我要睡了，拜託給我一個答案🥲", 3942), p("等等等等", "wait_wait", "再不發我真的要截圖這個沉默時刻。", 2710), p("阿明爸", "dad_ming", "明天誰顧小孩，現在還是未知數。", 3250)]
  ];

  let phase = "idle";
  let route = null;
  let storm = "";
  let actualWeather = "sunny";
  let actualRoute = null;
  let forecastBranches = [];
  let trackStart = 0;
  let decisionStart = 0;
  let shownDay = -1;
  let decisionElapsed = 0;
  let animationId = 0;
  let intervalId = 0;
  let newsTimeout = 0;
  let soundEnabled = false;
  let audioContext = null;
  let touchHideTimeout = 0;
  let pathElement = null;
  let pathLength = 0;
  let stormElement = null;
  let markerElements = [];
  let lastHeartbeat = -1;
  let lastPublicSecond = -1;
  let feedPosts = [];
  let totalPostCount = 0;
  let revealAnimationId = 0;

  const randomBetween = (min, max) => min + Math.random() * (max - min);
  const clamp = (number, min, max) => Math.max(min, Math.min(max, number));
  const pathY = (latitudePosition) => 86 + latitudePosition * .65;
  const mapCoordinate = (point) => `${(31.1 - ((point.y - 86) / .65) / 34.27).toFixed(1)}°N　${(111.5 + point.x / 40).toFixed(1)}°E`;

  function buildRound() {
    const template = routes[Math.floor(Math.random() * routes.length)];
    route = {...template, points: template.points.map(([x, y], index) => [
      Math.round(x + randomBetween(-8, 8) - index * randomBetween(0, 4)),
      Math.round(pathY(clamp(y + randomBetween(-12, 12), 54, 437)))
    ])};
    const end = route.points.at(-1);
    const landing = Math.round(clamp(template.risk * 74 + randomBetween(-10, 10), 17, 69));
    const north = Math.round(clamp((100 - landing) * randomBetween(.43, .68), 12, 67));
    const south = 100 - landing - north;
    forecastBranches = [
      {type: "north", name: "北轉", probability: north, points: [end, [end[0] - 8, end[1] - 25], [452, pathY(120)], [421, pathY(56)]]},
      {type: "land", name: "登陸", probability: landing, points: [end, [end[0] - 30, end[1] + (pathY(245) - end[1]) * .45], [382, pathY(245)], [315, pathY(270)]]},
      {type: "south", name: "南掠", probability: south, points: [end, [end[0] - 10, end[1] + 29], [425, pathY(350)], [370, pathY(415)]]}
    ];
    let roll = Math.random();
    if (roll < .24) {
      const surprises = [
        {type: "surprise", name: "意外急轉登陸", points: [end, [end[0] + 25, end[1] - 23], [395, pathY(205)], [325, pathY(198)]], weatherOdds: {stormy: .75, late: .25}},
        {type: "surprise", name: "突然折返外海", points: [end, [end[0] + 35, end[1] - 10], [end[0] + 80, end[1] - 60], [end[0] + 110, end[1] - 115]], weatherOdds: {sunny: .85, mild: .15}},
        {type: "surprise", name: "海上減速滯留", points: [end, [end[0] - 24, end[1] - 12], [end[0] - 16, end[1] - 49], [394, pathY(205)]], weatherOdds: {late: .66, stormy: .22, mild: .12}},
        {type: "surprise", name: "擦過北海岸", points: [end, [end[0] - 22, end[1] - 46], [419, pathY(136)], [349, pathY(84)]], weatherOdds: {mild: .43, sunny: .35, stormy: .22}}
      ];
      actualRoute = surprises[Math.floor(Math.random() * surprises.length)];
    } else {
      roll = Math.random() * 100;
      let cumulative = 0;
      const selected = forecastBranches.find(branch => (cumulative += branch.probability) >= roll) || forecastBranches.at(-1);
      actualRoute = {...selected, weatherOdds: weatherOdds[selected.type]};
    }
    let weatherRoll = Math.random();
    actualWeather = Object.keys(actualRoute.weatherOdds).find(key => (weatherRoll -= actualRoute.weatherOdds[key]) < 0) || "mild";
  }

  function renderFeed() {
    const previousScroll = el.threadsFeed.scrollTop;
    el.threadsFeed.replaceChildren();
    el.threadsCount.textContent = `${totalPostCount} 則即時討論`;
    feedPosts.forEach((post) => {
      const item = document.createElement("article");
      item.className = "thread-post";
      const avatar = document.createElement("div");
      avatar.className = "thread-avatar";
      avatar.textContent = post.name.slice(0, 1);
      const body = document.createElement("div");
      body.className = "thread-body";
      const meta = document.createElement("div");
      meta.className = "thread-meta";
      const name = document.createElement("strong");
      name.textContent = post.name;
      const handle = document.createElement("span");
      handle.textContent = `@${post.handle} · ${post.postedAt || "剛剛"}`;
      meta.append(name, handle);
      const copy = document.createElement("p");
      copy.textContent = post.text;
      const like = document.createElement("button");
      like.type = "button";
      like.className = `thread-like${post.liked ? " liked" : ""}`;
      like.setAttribute("aria-label", `${post.name}的貼文，${post.liked ? "取消愛心" : "按愛心"}`);
      like.innerHTML = `<span aria-hidden="true">${post.liked ? "♥" : "♡"}</span> ${post.likes.toLocaleString("zh-TW")}`;
      like.addEventListener("click", () => {
        post.liked = !post.liked;
        post.likes += post.liked ? 1 : -1;
        renderFeed();
      });
      body.append(meta, copy, like);
      item.append(avatar, body);
      el.threadsFeed.append(item);
    });
    el.threadsFeed.scrollTop = previousScroll;
  }

  function addPost(post) {
    if (!post) return;
    totalPostCount++;
    const postedAt = phase === "tracking" ? `${5 - shownDay} 天前` : "剛剛";
    feedPosts.unshift({...post, postedAt, liked: false});
    feedPosts = feedPosts.slice(0, 24);
    renderFeed();
    el.threadsFeed.scrollTop = 0;
  }

  function addSampledPosts(pool, count) {
    const available = [...pool];
    for (let i = 0; i < count && available.length; i++) {
      const index = Math.floor(Math.random() * available.length);
      addPost(available.splice(index, 1)[0]);
    }
  }

  function playTone(frequency, length = .11, type = "sine", volume = .045) {
    if (!soundEnabled) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === "suspended") audioContext.resume();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      gain.gain.setValueAtTime(volume, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + length);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + length);
    } catch { /* 音效失敗不影響操作。 */ }
  }

  function svg(tag, attributes) {
    const node = document.createElementNS(svgNS, tag);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, String(value)));
    return node;
  }

  function smoothPath(points) {
    let d = `M${points[0][0]} ${points[0][1]}`;
    for (let i = 0; i < points.length - 1; i++) {
      const previous = points[Math.max(0, i - 1)];
      const start = points[i];
      const end = points[i + 1];
      const next = points[Math.min(points.length - 1, i + 2)];
      const c1 = [start[0] + (end[0] - previous[0]) / 6, start[1] + (end[1] - previous[1]) / 6];
      const c2 = [end[0] - (next[0] - start[0]) / 6, end[1] - (next[1] - start[1]) / 6];
      d += ` C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${end[0]} ${end[1]}`;
    }
    return d;
  }

  function drawForecast() {
    el.forecastLayer.replaceChildren();
    el.forecastOptions.replaceChildren();
    forecastBranches.forEach((branch) => {
      el.forecastLayer.append(svg("path", {class: `forecast-route ${branch.type}`, d: smoothPath(branch.points)}));
      const item = document.createElement("div");
      item.className = `forecast-option ${branch.type}`;
      const name = document.createElement("span");
      name.textContent = branch.name;
      const percent = document.createElement("strong");
      percent.textContent = `${branch.probability}%`;
      item.append(name, percent);
      el.forecastOptions.append(item);
    });
    el.forecastOverlay.hidden = false;
    el.forecastLayer.classList.add("visible");
  }

  function revealActualRoute(choice, announcedElapsed) {
    el.actualLayer.replaceChildren();
    el.forecastLayer.classList.add("dimmed");
    const actualPath = svg("path", {class: "actual-route", d: smoothPath(actualRoute.points)});
    el.actualLayer.append(actualPath);
    const total = actualPath.getTotalLength();
    actualPath.style.strokeDasharray = String(total);
    actualPath.style.strokeDashoffset = String(total);
    el.radarTag.textContent = `實際走向 · ${actualRoute.name}`;
    el.dayLabel.textContent = "實際路徑揭曉";
    showFlash(actualRoute.type === "surprise" ? "颱風突然變向！" : `颱風${actualRoute.name}！`);
    const begun = performance.now();
    const animate = (now) => {
      if (phase !== "resolving") return;
      const progress = clamp((now - begun) / 1750, 0, 1);
      actualPath.style.strokeDashoffset = String(total * (1 - progress));
      const point = actualPath.getPointAtLength(total * progress);
      stormElement.setAttribute("transform", `translate(${point.x.toFixed(2)} ${point.y.toFixed(2)})`);
      el.coordinateValue.textContent = mapCoordinate(point);
      if (progress < 1) revealAnimationId = requestAnimationFrame(animate);
    };
    revealAnimationId = requestAnimationFrame(animate);
    newsTimeout = setTimeout(() => showNews(choice, announcedElapsed), 2250);
  }

  function setupTrack() {
    el.trackLayer.replaceChildren();
    pathElement = svg("path", {class: "track-line", d: smoothPath(route.points)});
    el.trackLayer.append(pathElement);
    pathLength = pathElement.getTotalLength();
    pathElement.style.strokeDasharray = String(pathLength);
    pathElement.style.strokeDashoffset = String(pathLength);
    markerElements = route.points.map(([x, y], index) => {
      const marker = svg("g", {class: "track-marker-group"});
      marker.append(svg("circle", {class: "track-marker", cx: x, cy: y, r: 5}));
      const label = svg("text", {class: "track-label", x: x + 11, y: y - 12});
      label.textContent = `D-${5 - index}`;
      marker.append(label);
      el.trackLayer.append(marker);
      return marker;
    });
    stormElement = svg("g", {class: "storm-visual"});
    stormElement.append(svg("circle", {class: "storm-cloud", cx: 0, cy: 0, r: 78}));
    const spin = svg("g", {class: "storm-spin"});
    spin.append(svg("path", {class: "storm-swish", d: "M-44 6 C-45-29-12-52 17-45 C44-38 57-15 49 9 M39-10 C43 18 25 37 4 39 C-16 40-30 28-31 11"}));
    spin.append(svg("path", {class: "storm-swish", d: "M-18-14 C-5-28 17-23 22-7 C26 10 12 21-2 17"}));
    stormElement.append(spin);
    stormElement.append(svg("circle", {class: "storm-core", cx: 0, cy: 0, r: 8}));
    el.trackLayer.append(stormElement);
    updateTrack(0);
  }

  function updateTrack(progress) {
    if (!pathElement) return;
    const fraction = Math.max(0, Math.min(1, progress));
    pathElement.style.strokeDashoffset = String(pathLength * (1 - fraction));
    const point = pathElement.getPointAtLength(pathLength * fraction);
    stormElement.setAttribute("transform", `translate(${point.x.toFixed(2)} ${point.y.toFixed(2)})`);
    el.coordinateValue.textContent = mapCoordinate(point);
    markerElements.forEach((marker, index) => marker.style.opacity = fraction >= index / 4 - .015 ? "1" : "0");
  }

  function showDay(day) {
    shownDay = day;
    [...el.dayProgress.children].forEach((bar, index) => {
      bar.className = index < day ? "done" : index === day ? "current" : "";
    });
    const dayNumber = 5 - day;
    const hour = ["06:00", "08:00", "10:00", "14:00", "18:00"][day];
    el.dayLabel.textContent = `${dayNumber} 天前`;
    el.screenClock.textContent = `D-${dayNumber} / ${hour}`;
    el.radarTag.textContent = `${storm} · ${route.name}`;
    if (day >= 3 && el.forecastOverlay.hidden) drawForecast();
    addSampledPosts(trackingPosts[day], 3);
    playTone(470 + day * 75, .09);
  }

  function showFlash(message) {
    el.phaseFlash.textContent = message;
    el.phaseFlash.classList.remove("show");
    void el.phaseFlash.offsetWidth;
    el.phaseFlash.classList.add("show");
  }

  function latePenalty(elapsed) {
    return Math.max(0, Math.floor(elapsed / 1000) - 1) * 3;
  }

  function startRound() {
    cancelAnimationFrame(animationId);
    cancelAnimationFrame(revealAnimationId);
    clearInterval(intervalId);
    clearTimeout(newsTimeout);
    buildRound();
    storm = stormNames[Math.floor(Math.random() * stormNames.length)];
    phase = "tracking";
    trackStart = performance.now();
    shownDay = -1;
    decisionElapsed = 0;
    lastHeartbeat = -1;
    lastPublicSecond = -1;
    feedPosts = [];
    totalPostCount = 0;
    el.gameBoard.classList.remove("is-decision", "is-urgent");
    el.threadsPanel.classList.remove("expanded");
    el.threadsExpand.setAttribute("aria-expanded", "false");
    el.threadsExpand.setAttribute("aria-label", "放大 Threads");
    el.threadsExpand.textContent = "放大";
    el.forecastLayer.replaceChildren();
    el.forecastLayer.classList.remove("visible", "dimmed");
    el.actualLayer.replaceChildren();
    el.forecastOverlay.hidden = true;
    el.introOverlay.classList.add("is-hidden");
    el.resultOverlay.hidden = true;
    document.body.classList.remove("result-open");
    document.body.classList.remove("desk-hand-active");
    el.handCursor.classList.remove("visible", "down", "impact");
    el.holidayButton.disabled = true;
    el.workButton.disabled = true;
    el.clockCard.classList.remove("decision-time", "urgent");
    el.clockCard.classList.add("briefing");
    el.gameBoard.classList.add("is-briefing");
    el.clockCaption.textContent = "預報簡報 · 尚未開放宣布";
    el.timeLabel.textContent = "先看完五天路徑";
    el.clockUnit.textContent = "";
    el.countdown.textContent = "D-5";
    el.timerFill.style.width = "0%";
    el.headerStatus.textContent = "衛星資料接收中";
    el.decisionHint.textContent = "20:00 開放宣布";
    el.stormName.textContent = `${storm}颱風`;
    el.phaseFlash.classList.remove("show");
    setupTrack();
    showDay(0);
    intervalId = setInterval(() => tick(performance.now()), 100);
    animationId = requestAnimationFrame(frame);
  }

  function frame(now) {
    tick(now);
    if (phase === "tracking" || phase === "decision") animationId = requestAnimationFrame(frame);
  }

  function enterDecision(now) {
    phase = "decision";
    decisionStart = now;
    decisionElapsed = 0;
    el.holidayButton.disabled = false;
    el.workButton.disabled = false;
    el.clockCard.classList.remove("briefing");
    el.clockCard.classList.add("decision-time");
    el.gameBoard.classList.remove("is-briefing");
    showFlash("20:00 開放宣布！");
    el.clockCaption.textContent = "公告倒數";
    el.timeLabel.textContent = "20:00 立即宣布";
    el.clockUnit.textContent = "秒";
    el.countdown.textContent = "5";
    el.screenClock.textContent = "決策時刻 / 20:00";
    el.dayLabel.textContent = "等待公告";
    el.headerStatus.textContent = "全市等待你的宣布";
    el.decisionHint.textContent = "立即宣布";
    el.timerFill.style.width = "100%";
    updateTrack(1);
    el.gameBoard.classList.add("is-decision");
    addSampledPosts(waitingPosts[0], 2);
    playTone(720, .16, "triangle", .06);
    setTimeout(() => playTone(920, .21, "triangle", .05), 110);
    if (window.matchMedia("(max-width: 900px)").matches) {
      el.holidayButton.scrollIntoView({block: "nearest", behavior: "smooth"});
    }
    if (!window.matchMedia("(hover:hover) and (pointer:fine)").matches) el.handCursor.classList.remove("visible");
  }

  function tick(now) {
    if (phase === "tracking") {
      const elapsed = now - trackStart;
      updateTrack(elapsed / TRACK_DURATION);
      const day = Math.min(4, Math.floor(elapsed / 2000));
      if (day !== shownDay) showDay(day);
      el.countdown.textContent = `D-${5 - day}`;
      el.timerFill.style.width = `${Math.min(100, 100 * elapsed / TRACK_DURATION)}%`;
      if (elapsed >= TRACK_DURATION) enterDecision(now);
    } else if (phase === "decision") {
      decisionElapsed = now - decisionStart;
      const penalty = latePenalty(decisionElapsed);
      el.countdown.textContent = String(Math.max(0, Math.ceil((DECISION_DURATION - decisionElapsed) / 1000)));
      el.timeLabel.textContent = "20:00 立即宣布";
      el.screenClock.textContent = "決策時刻 / 20:00";
      el.timerFill.style.width = `${Math.max(0, 100 * (1 - decisionElapsed / DECISION_DURATION))}%`;
      el.decisionHint.textContent = penalty ? `猶豫扣分：-${penalty}%` : "立即宣布";
      const urgent = decisionElapsed >= 3000;
      el.clockCard.classList.toggle("urgent", urgent);
      el.gameBoard.classList.toggle("is-urgent", urgent);
      const second = Math.floor(decisionElapsed / 1000);
      if (second !== lastPublicSecond) {
        lastPublicSecond = second;
        if (second >= 1 && second <= 4) addSampledPosts(waitingPosts[second], 2);
      }
      const beatLength = urgent ? 650 : 1000;
      const heartbeat = Math.floor((now - decisionStart) / beatLength);
      if (heartbeat !== lastHeartbeat) {
        lastHeartbeat = heartbeat;
        playTone(urgent ? 125 : 105, .17, "sine", .06);
        setTimeout(() => { if (phase === "decision") playTone(92, .11, "sine", .035); }, 180);
      }
      if (decisionElapsed >= DECISION_DURATION) {
        makeDecision("none");
        return;
      }
    }
  }

  function makeDecision(choice) {
    if (phase !== "decision") return;
    phase = "resolving";
    cancelAnimationFrame(animationId);
    clearInterval(intervalId);
    el.holidayButton.disabled = true;
    el.workButton.disabled = true;
    el.gameBoard.classList.remove("is-decision", "is-urgent");
    const announcedElapsed = Math.min(DECISION_DURATION, decisionElapsed);
    const chosenButton = choice === "holiday" ? el.holidayButton : choice === "work" ? el.workButton : null;
    if (chosenButton) {
      chosenButton.classList.add("selected", "is-impact");
      el.handCursor.classList.add("impact");
      el.gameBoard.classList.add("hit");
      setTimeout(() => {
        chosenButton.classList.remove("selected", "is-impact");
        el.handCursor.classList.remove("impact");
        el.gameBoard.classList.remove("hit");
      }, 550);
    }
    el.headerStatus.textContent = choice === "none" ? "公告時限已過" : "市府公告已發布";
    el.dayLabel.textContent = choice === "holiday" ? "宣布放假" : choice === "work" ? "宣布不放" : "逾時未公告";
    el.clockCaption.textContent = choice === "none" ? "公告時限已過" : "20:00 市府公告";
    el.timeLabel.textContent = el.dayLabel.textContent;
    el.countdown.textContent = choice === "none" ? "0" : "✓";
    el.clockUnit.textContent = choice === "none" ? "秒" : "";
    el.timerFill.style.width = "0%";
    playTone(choice === "holiday" ? 310 : 250, .2, "sawtooth", .035);
    revealActualRoute(choice, announcedElapsed);
  }

  // 結局 = 決定 × 實際天氣；tier 決定徽章顏色，base 是當選率基準
  const endings = {
    holiday: {
      sunny: {tier: "bad", base: 38, headline: "放假放到大晴天！電影院、KTV 全城塞爆",
        deck: "市府宣布停班停課後，實際風雨卻遠比預測輕微。今早無風無雨、陽光露臉，熱門商圈湧入人潮，市民質疑停班決策過於草率。",
        caption: "晴空下的街頭，排隊人潮比風雨還猛烈", quote: "「我都排到第三場電影了，說好的颱風在哪裡？」",
        ticker: "百貨停車場上午即滿位｜KTV 訂位一位難求｜市府承受決策質疑",
        post: {name: "真心市民", handle: "honest_voice", text: "電影票都快買不到了，說好的颱風呢？", likes: 5210}},
      mild: {tier: "mixed", base: 55, headline: "放了個毛毛雨颱風假！早午餐店爆滿、老闆氣到狂打電話",
        deck: "市府宣布停班停課，實際只有零星小雨和微風。早午餐店、百貨公司湧入人潮，上班族開心補眠，雇主與部分家長則質疑放得太保守。",
        caption: "細雨中的排隊人潮，有人歡呼有人皺眉", quote: "「雨小到傘都不用開，但我還是要說：謝謝市長！」",
        ticker: "早午餐店候位破百號｜雇主團體：損失誰負責｜上班族：這假放得剛好",
        post: {name: "補眠中", handle: "sleep_more", text: "雨小小的，但能睡到中午就是好市長。", likes: 3320}},
      stormy: {tier: "good", base: 78, headline: "狂風暴雨襲城！提前放假讓通勤人潮平安留家",
        deck: "颱風凌晨增強，今早路樹倒伏、部分道路積水。市府提前宣布停班停課，避開尖峰通勤時段，防災決策獲得市民肯定。",
        caption: "清晨道路積水，街道維持低交通量", quote: "「還好不用冒雨趕上班，這次真的有先想到大家。」",
        ticker: "強風造成多處路樹倒塌｜防災中心持續監控｜市民肯定提前公告",
        post: {name: "路人小庭", handle: "city_walk", text: "這雨真的不是開玩笑，停班停課決定得好。", likes: 2830}},
      late: {tier: "good", base: 84, headline: "神預判！早上晴天被罵翻，傍晚暴雨全城翻盤喊讚",
        deck: "停班停課當天上午陽光露臉，市府一度被罵放錯假；颱風腳步放慢，傍晚狂風暴雨直撲市區，若照常上班，下班尖峰恐怕全困在路上。",
        caption: "傍晚暴雨突襲，逛街人潮抱著購物袋衝回家", quote: "「早上我還在罵，傍晚我收回，市長對不起。」",
        ticker: "颱風腳步放慢傍晚登陸｜下班尖峰零受困｜網友：早上罵的出來道歉",
        post: {name: "打臉自己", handle: "my_bad", text: "早上發文罵放錯假的我，現在看著窗外暴雨默默刪文。", likes: 6480}}
    },
    work: {
      sunny: {tier: "good", base: 78, headline: "颱風擦身而過！照常上班上課，城市運作如常",
        deck: "颱風實際影響輕微，今早陽光露臉、風雨平靜。市府宣布照常上班上課，交通及校園正常運作，避免停班停課造成的不必要影響。",
        caption: "晴朗早晨，通勤與校園作息正常", quote: "「路上根本沒風雨，照常上班是合理的。」",
        ticker: "今早風雨平靜｜大眾運輸正常營運｜市府決策獲肯定",
        post: {name: "路人小庭", handle: "city_walk", text: "外面大太陽，這次不放假我覺得合理。", likes: 2830}},
      mild: {tier: "good", base: 68, headline: "撐傘上班有點濕！風雨不大，城市照常運作",
        deck: "市府宣布照常上班上課，今早僅有陣雨與陣風。通勤族撐傘出門、鞋襪難免濕，交通大致正常，多數市民認為決策合理但抱怨連連。",
        caption: "陣雨中的上班路，傘開開關關", quote: "「褲管濕了一半，但真的沒到要放假啦。」",
        ticker: "陣雨陣風交通大致正常｜捷運運量略增｜市民：合理但很濕",
        post: {name: "濕襪子", handle: "wet_socks", text: "合理是合理，但我的襪子不同意。", likes: 2140}},
      stormy: {tier: "bad", base: 38, headline: "暴風雨中照常上班！通勤族受困車站、街頭亂成一團",
        deck: "市府宣布照常上班上課，颱風卻在清晨增強。捷運站擠滿濕透的乘客，多處道路積水，家長與上班族痛批公告低估風雨。",
        caption: "暴雨中的通勤路，車站外排起長隊", quote: "「鞋子全濕了，路都淹了，還要我們到公司？」",
        ticker: "尖峰時段公車延誤｜多處路段積水｜市民要求檢討決策",
        post: {name: "真心市民", handle: "honest_voice", text: "淋到全身濕才到公司，這個決策真的離譜。", likes: 5210}},
      late: {tier: "bad", base: 30, headline: "下班才遇暴風雨！上班族困在市區、計程車排到天荒地老",
        deck: "市府宣布照常上班，上午風平浪靜；颱風傍晚提前增強，下班尖峰遇上狂風暴雨，公車停駛、計程車一車難求，大批上班族受困市區。",
        caption: "下班尖峰暴雨，等不到車的上班族擠在站牌", quote: "「早上還在笑沒放到颱風假，現在回不了家了。」",
        ticker: "下班尖峰公車停駛｜叫車等候逾一小時｜市府：颱風提前增強",
        post: {name: "回不了家", handle: "stuck_downtown", text: "叫車排第 87 位，今晚可能要睡公司了。", likes: 7350}}
    },
    none: {
      sunny: {tier: "bad", base: 38, headline: "五秒決策期錯過！晴天仍讓全城白等公告",
        deck: "今早無風無雨，但市府錯過前晚八點的公告時限。市民整晚等消息，學校與公司臨時協調，行政效率遭質疑。",
        caption: "天氣放晴，民眾仍在等市府正式訊息", quote: "「放不放都可以，至少早點講吧！」",
        ticker: "公告時限已過｜校園與職場安排混亂｜民眾批評市府失聯",
        post: {name: "真心市民", handle: "honest_voice", text: "一整晚不公告，大家都在等，太誇張了。", likes: 5210}},
      mild: {tier: "bad", base: 38, headline: "沒公告又下小雨！全城各自解讀，一半上班一半在家",
        deck: "市府錯過前晚八點公告時限，今早又飄著小雨。部分公司照常上班、部分店家自行休息，市民整個早上在群組互問今天到底要不要出門。",
        caption: "騎樓下滑手機的人潮，沒人知道今天放不放", quote: "「我們公司放、老婆公司沒放，到底誰說了算？」",
        ticker: "公司店家各自宣布｜市府專線一早爆線｜民眾批評沒有標準",
        post: {name: "群組已讀", handle: "group_chat", text: "家族群組吵了一早上要不要出門，市府在哪？", likes: 4410}},
      stormy: {tier: "bad", base: 38, headline: "五秒內沒按！暴雨襲城，市府失聯惹民怨",
        deck: "市府錯過前晚八點的公告時限，民眾只得冒著強風出門。道路積水與交通延誤接連發生，延誤決策引發批評。",
        caption: "強風雨中，未接獲公告的民眾照常通勤", quote: "「昨天晚上等到睡著，早上還是沒有消息。」",
        ticker: "市府逾時未公告｜尖峰交通受阻｜民眾要求說明",
        post: {name: "真心市民", handle: "honest_voice", text: "等不到公告只好冒雨出門，全身濕透。", likes: 5210}},
      late: {tier: "bad", base: 30, headline: "整晚沒公告、傍晚又暴雨！市民受困超商，市府全天失聯",
        deck: "市府錯過公告時限，市民早上只好照常出門；颱風傍晚登陸，狂風暴雨讓大批民眾受困超商與騎樓，市府整天沒有說明。",
        caption: "暴雨夜的超商擠滿等雨停的民眾", quote: "「從昨晚等公告，等到今晚等雨停。」",
        ticker: "傍晚強風豪雨｜超商擠滿避雨人潮｜議員要求市長說明",
        post: {name: "超商避難中", handle: "711_refugee", text: "超商的關東煮都被避雨的人買光了。", likes: 6020}}
    }
  };
  // 同一種天氣也可能引出不同新聞角度；照片沿用相同天氣與決策的場景。
  const endingVariants = {
    holiday: {
      sunny: {headline: "晴到像週末！颱風假變商圈人潮戰，影城加開場次仍秒殺", deck: "停班停課後，北北基桃整天沒什麼風雨。影城與 KTV 訂位湧入，留在家中的家長卻得臨時顧小孩；市民質疑市府把預測當成了確定結果。", quote: "「放假不是不開心啦，但這天氣到底是放什麼？」", ticker: "影城臨時加開場次｜KTV 訂位塞滿｜家長臨時調整托育", post: p("排隊排到隔壁", "queue_everywhere", "颱風還沒來，影城排隊先排成颱風眼？？", 4873), baseShift: -2},
      mild: {headline: "雨傘開不到十分鐘！颱風假讓百貨熱鬧、家長群組吵翻", deck: "停班停課後只下了幾場短雨，商圈很快擠滿人。有人覺得多一天安全緩衝剛好，有人抱怨工作與托育臨時停擺，留言區兩邊都不讓。", quote: "「雨有下啦，但我傘都還沒甩乾就停了。」", ticker: "午後短暫陣雨｜商圈候位排長龍｜家長與雇主意見分歧", post: p("傘還沒乾", "tiny_rain", "我承認有下雨，三分鐘。剩下整天都在排午餐。", 2048), baseShift: 2},
      stormy: {headline: "早一步停班躲過通勤暴雨！市民貼出空蕩車站：這次有料", deck: "清晨強風豪雨掃過北北基桃，原本最擁擠的通勤時段人潮大減。市民分享空蕩車站與積水街道照片，肯定提前宣布讓大家留在安全處。", quote: "「平常這個時間我在月台，今天在家聽雨聲。」", ticker: "通勤時段風雨最強｜公共運輸減班｜提前停班獲肯定", post: p("三重通勤仔", "sanchong_bus", "看樓下那棵樹整根歪掉，我今天沒出門真的謝謝。", 6382), baseShift: 3},
      late: {headline: "上午被笑放錯假、下班時段暴雨救了決策！留言區集體刪文", deck: "上午晴朗讓停班決策一度挨批；颱風海上減速後傍晚才帶來強風豪雨。原本會在下班路上的人潮留在家中，社群風向迅速逆轉。", quote: "「我早上說市長亂放，現在窗戶在晃，收回。」", ticker: "上午晴朗引質疑｜傍晚雨勢急增｜通勤風險因停班降低", post: p("刪文速度冠軍", "delete_my_post", "我早上的限動已經刪了，不用提醒我謝謝🙂", 7241), baseShift: 2}
    },
    work: {
      sunny: {headline: "沒放假被酸一夜，隔天艷陽證明預測轉彎！通勤族改口", deck: "前晚宣布照常上班上課後，抱怨聲一度灌滿討論區。隔天颱風轉離、北北基桃天氣平穩，部分市民改口認為市府判斷準確。", quote: "「昨天罵得太快，今天還真的大太陽。」", ticker: "颱風中心遠離｜早尖峰運行正常｜討論區出現道歉文", post: p("昨天很兇的我", "sorry_yesterday", "昨天說不放很扯，今天曬到瞇眼。好我道歉。", 5012), baseShift: 3},
      mild: {headline: "雨衣穿了又脫！照常上班大致平順，網友只抗議鞋襪濕透", deck: "今早偶有陣雨，但交通沒有明顯受阻。照常上班上課引來一些失望留言，也有市民認為小雨不足以停班，真正受傷的只有襪子。", quote: "「市長判斷合理，我的鞋子沒有同意。」", ticker: "通勤交通大致正常｜零星陣雨｜網友發起濕襪照串", post: p("濕襪子", "wet_socks", "我不同意今天上班，但我承認理由只有我的襪子。", 2983), baseShift: -1},
      stormy: {headline: "『照常上班』四個字被洗版！大雨灌進車站，通勤族怒拍現場", deck: "清晨雨勢突然增強，車站出入口擠滿躲雨的人。昨晚的照常上班公告遭截圖轉傳，市民批評市府低估實際路徑與通勤風險。", quote: "「不是想放假，是現在根本沒辦法安全到公司。」", ticker: "車站湧入避雨人潮｜道路積水｜市府公告遭轉傳批評", post: p("站外排隊中", "wet_platform", "公車沒來，鞋裡有水，主管問我到哪了。", 8402), baseShift: -3},
      late: {headline: "早上沒風雨、傍晚回不了家！計程車需求暴增，通勤族困在辦公室", deck: "上午平靜讓不放假的決定看似正確，傍晚颱風雨帶卻撞上下班尖峰。公車延誤、叫車排隊暴增，市民質疑市府只看了早上的預報。", quote: "「早上出門像平常，現在想回家像抽獎。」", ticker: "下班尖峰雨勢急增｜叫車需求暴增｜民眾批評預測失準", post: p("還在辦公室", "office_afterdark", "車叫不到，主管先走了，便利商店的飯糰剩兩個。", 9130), baseShift: -2}
    },
    none: {
      sunny: {headline: "晴天也能搞到全城失眠！市府沒公告，家長上班族輪流罵", deck: "隔天雖然無風無雨，前晚未在決策時限內公告仍讓公司、學校和家長各自猜測。市民認為天氣判斷可以有誤差，行政訊息不能消失。", quote: "「太陽出來我可以接受，公告沒出來我不行。」", ticker: "前晚公告缺席｜校園職場各自聯絡｜行政效率遭批評", post: p("家長群 99+", "parents_99", "最後是班導先說照常到校，市府到底去哪了？", 5771), baseShift: -2},
      mild: {headline: "一點小雨、滿城問號！市府逾時未公告，群組截圖真假難辨", deck: "隔天只有短暫陣雨，市府卻一直沒有正式停班課訊息。真假公告截圖在群組流傳，家長與輪班工作者只能各自打電話確認。", quote: "「不是雨有多大，是我們根本不知道要去哪裡。」", ticker: "假公告截圖流傳｜學校接電話接不停｜市府遭批失聯", post: p("群組已讀", "group_chat", "我媽傳來三張不同版本公告，到底哪張是真的？", 6721), baseShift: -3},
      stormy: {headline: "沒公告還遇豪雨！家長冒雨送學又折返，市府專線打不通", deck: "強風豪雨在清晨襲來，前晚未公告讓家長與通勤族照常出門。現場照片與市府未發布決策的截圖同時洗版，民怨迅速升高。", quote: "「出門十分鐘，整個人濕透，學校又說再等等。」", ticker: "清晨強風豪雨｜學校家長聯絡混亂｜市府專線塞線", post: p("抱小孩找雨衣", "raincoat_parent", "小孩鞋子泡水了，我們到底要不要進學校？", 10324), baseShift: -4},
      late: {headline: "從早等到晚都沒公告！暴雨卡住下班車潮，市民怒問誰負責", deck: "前晚沒有停班課決定，上午天氣平靜時市府也沒有補充說明。傍晚暴雨撞上下班時間，大批市民困在市區，怒火指向一直沉默的決策室。", quote: "「等了一整天的答案，最後等到一場暴雨。」", ticker: "決策時限已過｜傍晚雨帶襲城｜下班交通大亂", post: p("卡在市區", "stuck_in_city", "從昨天晚上刷到今天晚上，現在連回家的車都刷不到。", 11892), baseShift: -4}
    }
  };
  const reactionPosts = {
    holiday: {
      sunny: [p("電影票守門員", "cinema_queue", "影城 app 當掉了，說好的颱風呢。", 5121), p("KTV 訂不到", "singing_no_room", "放假但 KTV 比跨年還難訂是什麼意思。", 3920), p("阿明爸", "dad_ming", "大家去唱歌，我在家陪小孩寫功課🙂", 2184)],
      mild: [p("早午餐候位中", "brunch_87", "候位 87 號，雨停了我還沒吃到。", 2661), p("小老闆", "shop_owner", "員工放假我支持，但店要不要開真的很難決定。", 711), p("遠端仔", "home_office", "同事都放假，我還在 Teams，雨還只是毛毛雨。", 1964)],
      stormy: [p("汐止阿豪", "xizhi_hao", "剛剛那陣風直接把垃圾桶吹走，還好不用出門。", 6623), p("阿蓉", "aron_mom", "小孩在家比較亂，但至少不用冒雨送學。", 3199), p("三重通勤仔", "sanchong_bus", "平常這時間在站牌，今天看窗外就夠了。", 4510)],
      late: [p("上午嘴太快", "morning_hot_take", "早上笑放錯假，現在窗戶在叫。", 7452), p("下班路倖存者", "home_by_six", "如果今天上班，我現在應該困在市政府站。", 3961), p("刪文中", "delete_in_progress", "好啦市長這次你對，我刪文。", 5810)]
    },
    work: {
      sunny: [p("板橋小蔡", "banciao_jo", "昨天一直說要放的人今天去哪了😂", 2880), p("桃園通勤中", "taoyuan_train", "火車正常、太陽正常、我上班的心情不正常。", 3457), p("氣象圖看太多", "map_refresh", "颱風真的轉出去了欸。", 1730)],
      mild: [p("濕襪子", "wet_socks", "上班合理，但捷運冷氣吹濕襪真的不合理。", 3102), p("小學家長群", "parent_chat", "小孩到了學校，雨也停了，今天算平安過關。", 811), p("雨傘忘記帶", "umbrella_where", "有下雨有上班，我只輸在忘記帶傘。", 1427)],
      stormy: [p("車站出口", "station_exit", "出口那邊根本走不出去，雨橫著打。", 8902), p("阿蓉", "aron_mom", "小孩鞋子全濕，這樣還要上課？", 6588), p("主管已讀", "boss_seen", "我拍淹水照傳公司，回覆只有『注意安全』。", 10713)],
      late: [p("叫車排第 87", "taxi_87", "叫車排隊比早上的上班打卡還長。", 6340), p("夜班小蕙", "night_shift_hui", "換班的人回不了家，接班的人進不來。", 2257), p("便利商店過夜", "convenience_night", "雨大到不敢走，店裡剩兩個飯糰。", 8031)]
    },
    none: {
      sunny: [p("阿明爸", "dad_ming", "結果大晴天，但我昨天為了等公告沒睡好。", 3620), p("輪班阿樂", "shift_ale", "天氣不是重點，班表不能讓我用猜的。", 4171), p("板橋小蔡", "banciao_jo", "市府這次是放了一個『公告假』嗎？", 2852)],
      mild: [p("群組已讀", "group_chat", "公司說去問學校，學校說看市府，市府沒有公告。", 5314), p("阿蓉", "aron_mom", "小孩書包帶了又放下，到底怎樣啦。", 4018), p("小老闆", "shop_owner", "員工一直問我，我也在問市府啊。", 1928)],
      stormy: [p("三重通勤仔", "sanchong_bus", "走到站牌全身濕了，公車也沒來。", 9390), p("小學家長群", "parent_chat", "家長群訊息 300 則，官方答案 0 則。", 10084), p("汐止阿豪", "xizhi_hao", "雨這麼大還沒公告，我真的看不懂。", 7345)],
      late: [p("夜班小蕙", "night_shift_hui", "夜班怎麼交接？昨晚沒答案今晚也沒有。", 6430), p("卡在市區", "stuck_in_city", "想回家的人都擠在騎樓，市府終於要說話了嗎。", 11235), p("阿明爸", "dad_ming", "現在雨大到接不到小孩，昨天就應該講清楚。", 8921)]
    }
  };
  const tierBadge = {good: "決策獲肯定", mixed: "評價兩極", bad: "決策遭批評"};
  const tierComment = {
    good: (score) => `新聞說得有道理，市長下期當選率現在 ${score}%。`,
    mixed: (score) => `放得剛好還是太保守？吵翻了，下期當選率 ${score}%。`,
    bad: (score) => `市長下期當選率只剩 ${score}%，民怨正在升高。`
  };

  function showNews(choice, announcedElapsed) {
    const original = endings[choice][actualWeather];
    const alternate = Math.random() < .5 ? endingVariants[choice][actualWeather] : null;
    const story = alternate ? {...original, ...alternate, base: original.base + (alternate.baseShift || 0)} : original;
    const stormy = actualWeather === "stormy" || actualWeather === "late";
    const hesitationPenalty = latePenalty(announcedElapsed);
    const penalty = hesitationPenalty + (choice === "none" ? 10 : 0);
    const base = story.base;
    const luck = Math.floor(Math.random() * 11) - 5;
    const score = Math.max(3, Math.min(96, base + luck - penalty));
    const announcedAt = "20:00";
    const timing = choice === "none" ? "；市府未在晚間八點的五秒決策期內公告" : hesitationPenalty ? `；晚間八點公告，猶豫 ${(announcedElapsed / 1000).toFixed(1)} 秒，另扣 ${hesitationPenalty}%` : "；晚間八點即時公告";
    el.newsPage.classList.toggle("good-result", story.tier === "good");
    el.newsPage.classList.toggle("mixed-result", story.tier === "mixed");
    el.newsBadge.textContent = tierBadge[story.tier];
    const newsTime = actualWeather === "late" ? ["20:00", "晚間追蹤"] : stormy ? ["09:00", "即時快訊"] : ["15:00", "午後追蹤"];
    el.newsDate.replaceChildren(`翌日 ${newsTime[0]}`, document.createElement("br"), newsTime[1]);
    el.newsHeadline.textContent = story.headline;
    const routeImpact = {
      sunny: "北北基桃幾乎無風無雨",
      mild: "北北基桃只有短暫陣雨",
      stormy: "北北基桃遇上強風豪雨",
      late: "雨帶直到傍晚才掃進北北基桃"
    };
    const routeLead = `颱風最後${actualRoute.name}，${routeImpact[actualWeather]}。`;
    el.newsDeck.textContent = routeLead + story.deck.replace(/。$/, "") + timing + "。";
    el.newsPhoto.classList.toggle("sunny", !stormy);
    el.newsPhoto.classList.toggle("stormy", stormy);
    el.photoCaption.textContent = story.caption;
    el.newsShot.src = `assets/news-${choice}-${actualWeather}.webp`;
    el.newsShot.alt = story.caption;
    el.factDecision.textContent = choice === "holiday" ? `停班停課 · ${announcedAt}` : choice === "work" ? `照常上班上課 · ${announcedAt}` : "五秒內未公告";
    el.factRoute.textContent = actualRoute.name;
    el.factWeather.textContent = weatherFacts[actualWeather];
    el.factReaction.textContent = `${score}%`;
    el.citizenQuote.textContent = story.quote;
    el.tickerText.textContent = story.ticker;
    feedPosts = [];
    totalPostCount = 0;
    addSampledPosts(reactionPosts[choice][actualWeather], 3);
    addPost(p("氣象阿文", "weatherwen", `最後走${actualRoute.name}。預測線只能參考，現場天氣才是答案。`, actualRoute.type === "surprise" ? 6872 : 1583));
    addPost(story.post);
    addPost({name: "市政觀察", handle: "civic_eye", text: tierComment[story.tier](score), likes: story.tier === "bad" ? 3670 : 1450});
    el.resultOverlay.hidden = false;
    document.body.classList.add("result-open");
    document.body.classList.remove("desk-hand-active");
    el.handCursor.classList.remove("visible");
    phase = "result";
    el.replayButton.focus();
    playTone(story.tier === "good" ? 660 : story.tier === "mixed" ? 440 : 240, .28, "triangle", .04);
  }

  el.startButton.addEventListener("click", startRound);
  el.replayButton.addEventListener("click", startRound);
  el.holidayButton.addEventListener("click", () => makeDecision("holiday"));
  el.workButton.addEventListener("click", () => makeDecision("work"));
  el.soundToggle.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    el.soundToggle.setAttribute("aria-pressed", String(soundEnabled));
    el.soundToggle.setAttribute("aria-label", soundEnabled ? "關閉音效" : "開啟音效");
    el.soundToggle.querySelector(".sound-label").textContent = soundEnabled ? "音效開" : "音效關";
    if (soundEnabled) playTone(650, .12);
  });
  el.threadsExpand.addEventListener("click", () => {
    const expanded = el.threadsPanel.classList.toggle("expanded");
    el.threadsExpand.setAttribute("aria-expanded", String(expanded));
    el.threadsExpand.setAttribute("aria-label", expanded ? "縮小 Threads" : "放大 Threads");
    el.threadsExpand.textContent = expanded ? "收起" : "放大";
  });

  document.addEventListener("keydown", (event) => {
    if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
    if (phase === "decision" && event.key.toLowerCase() === "a") makeDecision("holiday");
    if (phase === "decision" && event.key.toLowerCase() === "d") makeDecision("work");
    if (phase === "idle" && event.key === "Enter") startRound();
    if (phase === "result" && event.key === "Enter") startRound();
  });

  const setHandPosition = (event) => {
    const frame = el.gameBoard.getBoundingClientRect();
    const x = event.clientX - frame.left;
    const pointerY = event.clientY - frame.top;
    if (x < 0 || x > frame.width || pointerY < 0 || pointerY > frame.height) {
      el.handCursor.classList.remove("visible");
      document.body.classList.remove("desk-hand-active");
      return;
    }
    const overDisplay = event.target.closest?.(".screen-frame, .threads-panel, .result-overlay");
    const touchButton = event.pointerType === "touch" && event.target.closest?.(".decision-button:not(:disabled)");
    const desktopDesk = event.pointerType === "mouse" && matchMedia("(hover:hover) and (pointer:fine)").matches && pointerY >= frame.height * .62;
    if (overDisplay || (!touchButton && !desktopDesk)) {
      el.handCursor.classList.remove("visible");
      document.body.classList.remove("desk-hand-active");
      return;
    }
    const y = pointerY;
    el.handCursor.style.left = `${x}px`;
    el.handCursor.style.top = `${y}px`;
    el.handCursor.classList.add("visible");
    document.body.classList.toggle("desk-hand-active", Boolean(desktopDesk));
    if (event.pointerType === "touch") {
      clearTimeout(touchHideTimeout);
      touchHideTimeout = setTimeout(() => el.handCursor.classList.remove("visible"), 700);
    }
  };
  document.addEventListener("pointermove", (event) => {
    if (event.pointerType === "mouse" && !matchMedia("(hover:hover) and (pointer:fine)").matches) return;
    setHandPosition(event);
  }, {passive: true});
  document.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 && event.pointerType !== "touch") return;
    setHandPosition(event);
    el.handCursor.classList.add("down");
    const button = event.target.closest?.(".decision-button:not(:disabled)");
    if (button) button.classList.add("is-pressed");
    if (phase === "tracking" && event.target.closest?.(".decision-button")) showFlash("簡報中，20:00 才能宣布");
  }, {passive: true});
  const releaseHand = () => {
    el.handCursor.classList.remove("down");
    el.holidayButton.classList.remove("is-pressed");
    el.workButton.classList.remove("is-pressed");
    if (!matchMedia("(hover:hover) and (pointer:fine)").matches) {
      clearTimeout(touchHideTimeout);
      touchHideTimeout = setTimeout(() => el.handCursor.classList.remove("visible"), 350);
    }
  };
  document.addEventListener("pointerup", releaseHand, {passive: true});
  document.addEventListener("pointercancel", releaseHand, {passive: true});
  document.addEventListener("pointerleave", () => {
    el.handCursor.classList.remove("visible");
    document.body.classList.remove("desk-hand-active");
  });
  el.newsShot.addEventListener("error", () => el.newsShot.removeAttribute("src"));
  el.gameBoard.append(el.resultOverlay);
  addPost(p("基隆雨傘人", "keelung_umbrella", "新的路徑圖出了。我先不賭明天要不要上班。", 86));
  if (matchMedia("(hover:hover) and (pointer:fine)").matches) document.body.classList.add("hand-enabled");
})();
