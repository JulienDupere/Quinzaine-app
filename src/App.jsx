import { useState, useEffect, useCallback, useMemo } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

/* ---------- Config Firebase (stockage partagé entre tous les amis) ----------
   Suivez la procédure fournie pour remplir ces valeurs. Tant que apiKey vaut
   "YOUR_API_KEY", l'appli utilise le stockage local du navigateur à la place
   (fonctionne seule, mais pas partagé entre appareils). */
const firebaseConfig = {
  apiKey: "AIzaSyArbLILrIlqzUatEDMApPTRu2drbkLe0t8",
  authDomain: "boardgamequinzaine.firebaseapp.com",
  projectId: "boardgamequinzaine",
  storageBucket: "boardgamequinzaine.firebasestorage.app",
  messagingSenderId: "1063220856888",
  appId: "1:1063220856888:web:b562b600c946b62e36fecd",
};
const hasFirebase = firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY";
const db = hasFirebase ? getFirestore(initializeApp(firebaseConfig)) : null;

/* ---------- Données de départ (reprises de votre fichier Excel) ---------- */
const SEED_GAMES = [
{id:"g0",name:'10\' to Kill',min:3,max:4},
{id:"g1",name:'7 wonders',min:3,max:7},
{id:"g2",name:'A Feast for Odin',min:3,max:4},
{id:"g3",name:'Abyss',min:3,max:4},
{id:"g4",name:'Akropolis',min:3,max:4},
{id:"g5",name:'Alhambra',min:3,max:6},
{id:"g6",name:'Aquatica',min:3,max:4},
{id:"g7",name:'Archipelago',min:3,max:5},
{id:"g8",name:'Architects of West Kingdom',min:3,max:5},
{id:"g9",name:'Arcs',min:3,max:4},
{id:"g10",name:'Ark Nova',min:3,max:4},
{id:"g11",name:'Art Society',min:3,max:4},
{id:"g12",name:'Auctoritas',min:3,max:4},
{id:"g13",name:'Automobile 2009',min:4,max:5},
{id:"g14",name:'Azul',min:3,max:4},
{id:"g15",name:'Bang',min:4,max:7},
{id:"g16",name:'Barrage',min:3,max:4},
{id:"g17",name:'Battles for Westoros',min:2,max:3},
{id:"g18",name:'Bauernschlau',min:3,max:6},
{id:"g19",name:'Beasty bar',min:3,max:4},
{id:"g20",name:'Big Shot',min:3,max:4},
{id:"g21",name:'Bohnanza',min:3,max:7},
{id:"g22",name:'Boursicocotte',min:3,max:5},
{id:"g23",name:'Brass Birmingham',min:3,max:4},
{id:"g24",name:'Buccaneer',min:3,max:4},
{id:"g25",name:'Bus',min:3,max:5},
{id:"g26",name:'Canne Stars scripts and screens',min:3,max:4},
{id:"g27",name:'Can\'t stop',min:2,max:2},
{id:"g28",name:'Capitain Sonar',min:6,max:8},
{id:"g29",name:'Carcassonne',min:3,max:5},
{id:"g30",name:'Cascadia',min:3,max:4},
{id:"g31",name:'Castle of Burgundy',min:3,max:4},
{id:"g32",name:'Castle of Mad King Ludwig',min:3,max:4},
{id:"g33",name:'Catane',min:3,max:6},
{id:"g34",name:'Caylus',min:3,max:5},
{id:"g35",name:'Century',min:3,max:5},
{id:"g36",name:'Citadels',min:3,max:8},
{id:"g37",name:'Clash of Cultures',min:3,max:4},
{id:"g38",name:'Climat évolution',min:3,max:6},
{id:"g39",name:'Cloudsphire',min:2,max:4},
{id:"g40",name:'Concordia',min:3,max:5},
{id:"g41",name:'Construction & Corruption',min:3,max:7},
{id:"g42",name:'Corrupt Bargain',min:4,max:4},
{id:"g43",name:'Cosmic encounter',min:3,max:8},
{id:"g44",name:'Courtisans',min:3,max:5},
{id:"g45",name:'Crusader Kings',min:3,max:5},
{id:"g46",name:'Cryptid',min:3,max:5},
{id:"g47",name:'Cyclades',min:3,max:5},
{id:"g48",name:'Darwin\'s journey',min:3,max:4},
{id:"g49",name:'Die Dracheninsel',min:3,max:4},
{id:"g50",name:'Die Sieben Weisen',min:3,max:5},
{id:"g51",name:'Diplomacy',min:7,max:7},
{id:"g52",name:'Dominion',min:3,max:4},
{id:"g53",name:'Downforce',min:3,max:6},
{id:"g54",name:'Draftausaurus',min:3,max:5},
{id:"g55",name:'Dragon Gold',min:3,max:6},
{id:"g56",name:'Dschunke',min:3,max:4},
{id:"g57",name:'Dwellings of Eldervale',min:3,max:4},
{id:"g58",name:'Earth',min:3,max:5},
{id:"g59",name:'Eclipse',min:3,max:6},
{id:"g60",name:'El Grande',min:3,max:5},
{id:"g61",name:'Empires',min:3,max:8},
{id:"g62",name:'Endeavor',min:3,max:5},
{id:"g63",name:'Éruption',min:3,max:4},
{id:"g64",name:'Everdell',min:3,max:4},
{id:"g65",name:'Fangfrisch (Cash-a-Catch)',min:3,max:5},
{id:"g66",name:'Fantasy',min:3,max:4},
{id:"g67",name:'Faraway',min:3,max:6},
{id:"g68",name:'Five Tribes',min:3,max:4},
{id:"g69",name:'Foundations of metropolis',min:3,max:4},
{id:"g70",name:'Fractured Sky',min:3,max:5},
{id:"g71",name:'Fresco',min:3,max:4},
{id:"g72",name:'Fresh Fish',min:3,max:5},
{id:"g73",name:'Game of Thrones',min:4,max:8},
{id:"g74",name:'Giro Galoppo',min:3,max:6},
{id:"g75",name:'Great Western Trail',min:3,max:4},
{id:"g76",name:'Habemus Papam',min:3,max:5},
{id:"g77",name:'Harmonies',min:3,max:4},
{id:"g78",name:'Heat',min:3,max:8},
{id:"g79",name:'Heckmeck am Karteneck',min:3,max:5},
{id:"g80",name:'Hegemony',min:3,max:4},
{id:"g81",name:'Hey that\'s my fish',min:3,max:4},
{id:"g82",name:'High Society',min:3,max:5},
{id:"g83",name:'Hive',min:2,max:2},
{id:"g84",name:'In the Shadow of the Emperor',min:3,max:4},
{id:"g85",name:'Inca Empire',min:3,max:4},
{id:"g86",name:'Indonesia',min:3,max:5},
{id:"g87",name:'Industria',min:3,max:4},
{id:"g88",name:'Intrigue',min:3,max:5},
{id:"g89",name:'Ivanhoe/Camelot',min:3,max:5},
{id:"g90",name:'Karuba',min:3,max:4},
{id:"g91",name:'Kelp: Shark vs Octopus',min:2,max:2},
{id:"g92",name:'Kemet',min:3,max:5},
{id:"g93",name:'King of Tokyo',min:3,max:6},
{id:"g94",name:'Kingdom Builder',min:3,max:5},
{id:"g95",name:'Kingdomino',min:3,max:4},
{id:"g96",name:'Kuh-nah',min:3,max:4},
{id:"g97",name:'Lancaster',min:3,max:5},
{id:"g98",name:'Les ruines perdues de Narak',min:3,max:4},
{id:"g99",name:'Libertalia',min:3,max:6},
{id:"g100",name:'Logic & Lore',min:2,max:2},
{id:"g101",name:'Looot',min:3,max:4},
{id:"g102",name:'Lords of Waterdeep',min:3,max:5},
{id:"g103",name:'Love Letter',min:3,max:6},
{id:"g104",name:'Lowenherz',min:3,max:4},
{id:"g105",name:'Madame Bonne Adieu',min:3,max:6},
{id:"g106",name:'Magical Athlete',min:2,max:6},
{id:"g107",name:'Magna Grecia',min:3,max:4},
{id:"g108",name:'Mandala',min:2,max:2},
{id:"g109",name:'Marajoara',min:3,max:4},
{id:"g110",name:'Marchands du Moyen-Âge',min:3,max:4},
{id:"g111",name:'Marchands et Maraudeurs',min:3,max:4},
{id:"g112",name:'Maria',min:3,max:3},
{id:"g113",name:'Marracash',min:3,max:5},
{id:"g114",name:'Match Madness',min:3,max:4},
{id:"g115",name:'Métro',min:3,max:6},
{id:"g116",name:'Mexica',min:3,max:4},
{id:"g117",name:'Mini ville',min:3,max:4},
{id:"g118",name:'Modern Art',min:3,max:5},
{id:"g119",name:'Mogul',min:4,max:5},
{id:"g120",name:'Monopoly',min:5,max:8},
{id:"g121",name:'Mr. Jack',min:2,max:2},
{id:"g122",name:'Municipium',min:3,max:5},
{id:"g123",name:'Mycelia',min:3,max:4},
{id:"g124",name:'Neuroshima Hex',min:3,max:4},
{id:"g125",name:'New Orleans Big Bang (1990)',min:3,max:6},
{id:"g126",name:'Not alone',min:3,max:7},
{id:"g127",name:'Onitama',min:2,max:2},
{id:"g128",name:'Orion',min:2,max:2},
{id:"g129",name:'Outlive',min:3,max:4},
{id:"g130",name:'Paris Paris',min:3,max:4},
{id:"g131",name:'Parks',min:3,max:5},
{id:"g132",name:'Pax Pamir',min:3,max:5},
{id:"g133",name:'Photosynthesis',min:3,max:4},
{id:"g134",name:'Pompei',min:3,max:4},
{id:"g135",name:'Princes de la Rennaissance',min:3,max:6},
{id:"g136",name:'Puerto Rico',min:3,max:5},
{id:"g137",name:'Pyramido',min:3,max:4},
{id:"g138",name:'Quacks',min:3,max:4},
{id:"g139",name:'RA',min:3,max:5},
{id:"g140",name:'Raiders of the North Sea',min:3,max:4},
{id:"g141",name:'Res Arcana',min:3,max:5},
{id:"g142",name:'REX',min:5,max:6},
{id:"g143",name:'Rival Restaurants',min:3,max:6},
{id:"g144",name:'RoboRally',min:3,max:8},
{id:"g145",name:'Root',min:3,max:6},
{id:"g146",name:'Saboteur',min:3,max:8},
{id:"g147",name:'Samouraï',min:3,max:4},
{id:"g148",name:'Santa Monica',min:3,max:4},
{id:"g149",name:'Santiago',min:4,max:5},
{id:"g150",name:'Santorini',min:2,max:4},
{id:"g151",name:'Scale of Fate',min:3,max:4},
{id:"g152",name:'Scotland Yard',min:3,max:6},
{id:"g153",name:'Sea Salt & Paper',min:3,max:4},
{id:"g154",name:'Sengoku : Provinces en Guerre',min:3,max:4},
{id:"g155",name:'Senji',min:3,max:6},
{id:"g156",name:'Serengeti',min:3,max:6},
{id:"g157",name:'Shamans',min:3,max:5},
{id:"g158",name:'Sheriff of Nottingham',min:3,max:5},
{id:"g159",name:'Skull',min:3,max:6},
{id:"g160",name:'Splendor',min:3,max:4},
{id:"g161",name:'Star Wars Rebellion',min:2,max:4},
{id:"g162",name:'Street Car',min:3,max:6},
{id:"g163",name:'Struggle of Empires',min:3,max:7},
{id:"g164",name:'Super Fantasy Brawl',min:2,max:2},
{id:"g165",name:'Tank battle',min:2,max:2},
{id:"g166",name:'Targi',min:2,max:2},
{id:"g167",name:'Terra Mystica',min:3,max:5},
{id:"g168",name:'Terraforming Mars',min:3,max:5},
{id:"g169",name:'The end of the Triumvirat',min:3,max:3},
{id:"g170",name:'The Isle of Cats : Explore & Draw',min:3,max:6},
{id:"g171",name:'The Old King\'s Crown',min:3,max:4},
{id:"g172",name:'The Quest for El Dorado',min:3,max:4},
{id:"g173",name:'Ticket to Ride',min:3,max:5},
{id:"g174",name:'Tiki Topple',min:3,max:4},
{id:"g175",name:'Tiny Town',min:3,max:6},
{id:"g176",name:'Tokaido',min:2,max:5},
{id:"g177",name:'Très futé',min:3,max:4},
{id:"g178",name:'Tribun',min:3,max:5},
{id:"g179",name:'Turing Machine',min:3,max:8},
{id:"g180",name:'Tzolk\'in',min:3,max:4},
{id:"g181",name:'Veiled Fate',min:3,max:8},
{id:"g182",name:'Vicious Gardens',min:3,max:4},
{id:"g183",name:'Wallenstein',min:3,max:5},
{id:"g184",name:'War Chest',min:2,max:4},
{id:"g185",name:'War of the ring',min:2,max:4},
{id:"g186",name:'War of the Roses',min:3,max:4},
{id:"g187",name:'Welcome to',min:3,max:8},
{id:"g188",name:'Whymrspan',min:3,max:5},
{id:"g189",name:'Wingspan',min:3,max:5},
{id:"g190",name:'Yuan : L\'art de la guerre',min:3,max:8},
{id:"g191",name:'Zoo Vadis',min:3,max:7},
{id:"g192",name:'City of Gears',min:2,max:4},
{id:"g193",name:'Through the ages',min:2,max:4},
{id:"g194",name:'Dune, Imperium',min:2,max:4},
{id:"g195",name:'Tsuro',min:2,max:8},
{id:"g196",name:'Eternal decks',min:2,max:4},
{id:"g197",name:'12 Rivers',min:2,max:4}
];
const SEED_SPLITS = [
{id:"s0",name:'3-3 Split Table',parts:[3,3]},
{id:"s1",name:'3-4 Split Table',parts:[3,4]},
{id:"s2",name:'4-4 Split Table',parts:[4,4]},
{id:"s3",name:'5-3 Split Table',parts:[5,3]}
];
const SEED_PLAYERS = [
{id:"p0",name:'Julien Dupéré',present:true},
{id:"p1",name:'Olivier Parent',present:true},
{id:"p2",name:'Mathieu Lavoie',present:true},
{id:"p3",name:'Jean-Simon Leduc',present:true},
{id:"p4",name:'Mehdi Jebel',present:true},
{id:"p5",name:'Philippe Rouleau',present:true},
{id:"p6",name:'Alex-Xavier C.',present:true},
{id:"p7",name:'Jean-François Pelletier',present:true},
{id:"p8",name:'Vincent Beaulac',present:true}
];

const COUNTS = [2, 3, 4, 5, 6, 7, 8, 9, 10];
const BUDGET = 10;
const STATE_KEY = "quinzaine_state_v1";
const WHOAMI_KEY = "quinzaine_whoami_v1";
const DRAW_KEY = "quinzaine_last_draw_v1";
const ADMIN_KEY = "quinzaine_admin_v1";
const ADMIN_PIN = "0000"; // Changez ce code si vous voulez — c'est le mot de passe pour retirer des jeux/joueurs/tables.

function uid(prefix) {
  return prefix + Math.random().toString(36).slice(2, 9);
}

function seedState() {
  return { games: SEED_GAMES, splits: SEED_SPLITS, players: SEED_PLAYERS, prefs: {} };
}

/* ---------- Aides de stockage (Firebase si configuré, sinon localStorage) ---------- */
async function storageGet(key, shared) {
  try {
    if (!shared || !db) return localStorage.getItem(key);
    const snap = await getDoc(doc(db, "quinzaine", key));
    return snap.exists() ? JSON.stringify(snap.data().value) : null;
  } catch (e) {
    return null;
  }
}
async function storageSet(key, value, shared, retried) {
  try {
    if (!shared || !db) {
      localStorage.setItem(key, value);
      return true;
    }
    await setDoc(doc(db, "quinzaine", key), { value: JSON.parse(value) });
    return true;
  } catch (e) {
    if (!retried) {
      await new Promise((r) => setTimeout(r, 300));
      return storageSet(key, value, shared, true);
    }
    return false;
  }
}

/* ---------- Logique du tirage ---------- */
function poolFor(state, count, presentIds) {
  const entries = [];
  state.games.forEach((g) => {
    if (count >= g.min && count <= g.max) entries.push({ id: g.id, name: g.name, kind: "game" });
  });
  state.splits.forEach((s) => {
    if (s.parts[0] + s.parts[1] === count) entries.push({ id: s.id, name: s.name, kind: "split", parts: s.parts });
  });
  const weights = entries.map((e) => {
    let total = 0;
    const contributors = [];
    presentIds.forEach((pid) => {
      const p = state.prefs[pid];
      const v = (p && p[count] ? p[count][e.id] : 0) || 0;
      if (v > 0) {
        total += v;
        const player = state.players.find((pl) => pl.id === pid);
        contributors.push({ name: player ? player.name : pid, pts: v });
      }
    });
    contributors.sort((a, b) => b.pts - a.pts);
    return { ...e, weight: total, contributors };
  });
  const totalWeight = weights.reduce((a, b) => a + b.weight, 0);
  return { entries: weights.filter((w) => w.weight > 0).sort((a, b) => b.weight - a.weight), totalWeight };
}

function weightedPick(entries, totalWeight, rng) {
  let r = rng() * totalWeight;
  for (const e of entries) {
    if (r < e.weight) return e;
    r -= e.weight;
  }
  return entries[entries.length - 1];
}

function runDraw(state, n, presentIds, rng) {
  const { entries, totalWeight } = poolFor(state, n, presentIds);
  if (totalWeight <= 0) return null;
  const winner = weightedPick(entries, totalWeight, rng);
  const result = { count: n, winner: winner.name, kind: winner.kind, contributors: winner.contributors, tables: [] };
  if (winner.kind === "split") {
    winner.parts.forEach((p) => {
      const sub = poolFor(state, p, presentIds);
      if (sub.totalWeight > 0) {
        const subWinner = weightedPick(sub.entries, sub.totalWeight, rng);
        result.tables.push({ count: p, winner: subWinner.name, contributors: subWinner.contributors });
      } else {
        result.tables.push({ count: p, winner: null, contributors: [] });
      }
    });
  }
  return result;
}

/* ---------- Petits composants ---------- */
function DieBadge({ n, active, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="die-badge"
      style={{
        opacity: disabled ? 0.35 : 1,
        background: active ? "var(--gold)" : "var(--parchment)",
        color: active ? "var(--ink)" : "var(--ink)",
        transform: active ? "translateY(-2px)" : "none",
        boxShadow: active
          ? "0 4px 0 var(--wood-dark), 0 6px 10px rgba(0,0,0,.35)"
          : "0 3px 0 var(--wood-dark), 0 4px 8px rgba(0,0,0,.25)",
      }}
      title={n + " joueurs"}
    >
      {n}
    </button>
  );
}

function contribText(contributors) {
  if (!contributors || contributors.length === 0) return "";
  return contributors.map((c) => `${c.name} (${c.pts} pt${c.pts > 1 ? "s" : ""})`).join(" · ");
}

function Ticket({ title, subtitle, big, contributors }) {
  return (
    <div className="ticket">
      <div className="ticket-notch left" />
      <div className="ticket-notch right" />
      <div className="ticket-eyebrow">{subtitle}</div>
      <div className={big ? "ticket-title big" : "ticket-title"}>{title}</div>
      {contributors && contributors.length > 0 && <div className="ticket-meta">Choisi par {contribText(contributors)}</div>}
    </div>
  );
}

function Bar({ pct, label, sub, contributors }) {
  return (
    <div className="odds-row">
      <div className="odds-label">
        <span>{label}</span>
        <span className="odds-pct">{pct.toFixed(1)}%</span>
      </div>
      <div className="odds-track">
        <div className="odds-fill" style={{ width: pct + "%" }} />
      </div>
      {contributors && contributors.length > 0 && <div className="odds-contrib">{contribText(contributors)}</div>}
      {sub ? <div className="odds-sub">{sub}</div> : null}
    </div>
  );
}

function AdminBar({ isAdmin, pinInput, setPinInput, pinError, tryUnlock, lock }) {
  return (
    <div className="panel admin-bar">
      {isAdmin ? (
        <div className="row" style={{ justifyContent: "space-between" }}>
          <span>🔓 Mode administrateur actif</span>
          <button className="btn" onClick={lock}>
            Verrouiller
          </button>
        </div>
      ) : (
        <>
          <div className="row">
            <input
              type="password"
              className="text-input"
              placeholder="Code administrateur"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") tryUnlock();
              }}
            />
            <button className="btn" onClick={tryUnlock}>
              Déverrouiller
            </button>
          </div>
          {pinError && <div className="hint admin-error">Code incorrect.</div>}
          <div className="hint">Déverrouillez pour retirer des jeux, joueurs ou tables de scission. Tout le monde peut continuer à en ajouter.</div>
        </>
      )}
    </div>
  );
}

/* ---------- Application principale ---------- */
export default function App() {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveFlag, setSaveFlag] = useState("");
  const [tab, setTab] = useState("prefs");
  const [whoami, setWhoami] = useState("");
  const [selCount, setSelCount] = useState(4);
  const [localPts, setLocalPts] = useState({});
  const [gameFilter, setGameFilter] = useState("");
  const [newGame, setNewGame] = useState({ name: "", min: 3, max: 5 });
  const [newSplit, setNewSplit] = useState({ a: 3, b: 4 });
  const [newPlayer, setNewPlayer] = useState("");
  const [lastDraw, setLastDraw] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  useEffect(() => {
    (async () => {
      const raw = await storageGet(STATE_KEY, true);
      let s = raw ? JSON.parse(raw) : seedState();
      if (!raw) await storageSet(STATE_KEY, JSON.stringify(s), true);
      setState(s);
      const who = await storageGet(WHOAMI_KEY, false);
      if (who) setWhoami(who);
      const draw = await storageGet(DRAW_KEY, true);
      if (draw) setLastDraw(JSON.parse(draw));
      const admin = await storageGet(ADMIN_KEY, false);
      if (admin === "1") setIsAdmin(true);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!state || !whoami) return;
    const p = state.prefs[whoami];
    const cur = (p && p[selCount]) || {};
    setLocalPts(cur);
  }, [whoami, selCount, state]);

  const flash = (msg) => {
    setSaveFlag(msg);
    setTimeout(() => setSaveFlag(""), 2200);
  };

  const persist = useCallback(async (next) => {
    setState(next);
    const ok = await storageSet(STATE_KEY, JSON.stringify(next), true);
    if (!ok) flash("Échec de l'enregistrement — réessayez.");
  }, []);

  /* ----- Jeux ----- */
  const addGame = () => {
    if (!newGame.name.trim()) return;
    const g = { id: uid("g"), name: newGame.name.trim(), min: Number(newGame.min), max: Number(newGame.max) };
    persist({ ...state, games: [...state.games, g] });
    setNewGame({ name: "", min: 3, max: 5 });
  };
  const removeGame = (id) => {
    const prefs = { ...state.prefs };
    Object.keys(prefs).forEach((pid) => {
      COUNTS.forEach((c) => {
        if (prefs[pid][c]) delete prefs[pid][c][id];
      });
    });
    persist({ ...state, games: state.games.filter((g) => g.id !== id), prefs });
  };
  const addSplit = () => {
    const a = Number(newSplit.a), b = Number(newSplit.b);
    if (!a || !b) return;
    const s = { id: uid("s"), name: `${a}-${b} Split Table`, parts: [a, b] };
    persist({ ...state, splits: [...state.splits, s] });
  };
  const removeSplit = (id) => persist({ ...state, splits: state.splits.filter((s) => s.id !== id) });

  /* ----- Joueurs ----- */
  const addPlayer = () => {
    if (!newPlayer.trim()) return;
    const p = { id: uid("p"), name: newPlayer.trim(), present: true };
    persist({ ...state, players: [...state.players, p] });
    setNewPlayer("");
  };
  const removePlayer = (id) => {
    const prefs = { ...state.prefs };
    delete prefs[id];
    persist({ ...state, players: state.players.filter((p) => p.id !== id), prefs });
  };
  const togglePresent = (id) => {
    persist({ ...state, players: state.players.map((p) => (p.id === id ? { ...p, present: !p.present } : p)) });
  };

  /* ----- Admin ----- */
  const tryUnlock = async () => {
    if (pinInput === ADMIN_PIN) {
      setIsAdmin(true);
      setPinError(false);
      setPinInput("");
      await storageSet(ADMIN_KEY, "1", false);
    } else {
      setPinError(true);
    }
  };
  const lock = async () => {
    setIsAdmin(false);
    await storageSet(ADMIN_KEY, "0", false);
  };

  /* ----- Mes points ----- */
  const eligibleGames = useMemo(() => {
    if (!state) return [];
    const g = state.games.filter((g) => selCount >= g.min && selCount <= g.max);
    const s = state.splits.filter((s) => s.parts[0] + s.parts[1] === selCount);
    return [
      ...g.map((x) => ({ ...x, kind: "game" })),
      ...s.map((x) => ({ ...x, kind: "split", label: `${x.name} (table de ${x.parts[0]} + table de ${x.parts[1]})` })),
    ].filter((x) => x.name.toLowerCase().includes(gameFilter.toLowerCase()));
  }, [state, selCount, gameFilter]);

  const spent = Object.values(localPts).reduce((a, b) => a + (b || 0), 0);
  const remaining = BUDGET - spent;

  const setPts = (gameId, val) => {
    let v = Math.max(0, Math.min(BUDGET, Number(val) || 0));
    const others = spent - (localPts[gameId] || 0);
    if (others + v > BUDGET) v = BUDGET - others;
    setLocalPts({ ...localPts, [gameId]: v });
  };

  const saveMyPoints = async () => {
    const raw = await storageGet(STATE_KEY, true);
    const remote = raw ? JSON.parse(raw) : state;
    const prefs = { ...remote.prefs };
    prefs[whoami] = { ...(prefs[whoami] || {}), [selCount]: localPts };
    const next = { ...remote, prefs };
    await persist(next);
    flash("Points enregistrés ✓");
  };

  const whoName = state ? state.players.find((p) => p.id === whoami)?.name || "" : "";

  /* ----- Résumé ----- */
  const gameNameMap = useMemo(() => {
    if (!state) return {};
    const m = {};
    state.games.forEach((g) => (m[g.id] = g.name));
    state.splits.forEach((s) => (m[s.id] = s.name));
    return m;
  }, [state]);

  const playerSummaries = useMemo(() => {
    if (!state) return [];
    return state.players.map((p) => {
      const prefs = state.prefs[p.id] || {};
      let total = 0;
      const rows = COUNTS.map((c) => {
        const pts = prefs[c] || {};
        const items = Object.entries(pts)
          .filter(([, v]) => v > 0)
          .map(([gid, v]) => {
            total += v;
            return { name: gameNameMap[gid] || gid, v };
          })
          .sort((a, b) => b.v - a.v);
        return { count: c, items };
      }).filter((r) => r.items.length > 0);
      return { player: p, rows, total };
    });
  }, [state, gameNameMap]);

  const playersWithoutChoices = playerSummaries.filter((s) => s.total === 0);

  /* ----- Tirage ----- */
  const presentIds = useMemo(() => (state ? state.players.filter((p) => p.present).map((p) => p.id) : []), [state]);
  const presentCount = presentIds.length;

  const oddsByCount = useMemo(() => {
    if (!state) return {};
    const out = {};
    COUNTS.forEach((c) => (out[c] = poolFor(state, c, presentIds)));
    return out;
  }, [state, presentIds]);

  // Taille de table à tirer : par défaut le nombre de présents, mais ajustable
  // (ex. 6 amis autour de la table, mais on tire quand même parmi les jeux à 4).
  const canDraw = presentCount >= 2 && COUNTS.some((c) => oddsByCount[c] && oddsByCount[c].totalWeight > 0);

  const launchDraw = async () => {
    setRolling(true);
    setTimeout(async () => {
      const rng = Math.random;
      const results = COUNTS.map((c) => runDraw(state, c, presentIds, rng)).filter(Boolean);
      const payload = { ts: Date.now(), present: presentCount, by: whoName || "quelqu'un", results };
      setLastDraw(payload);
      await storageSet(DRAW_KEY, JSON.stringify(payload), true);
      setRolling(false);
    }, 650);
  };

  if (loading || !state) {
    return (
      <div className="qz-root qz-center">
        <Style />
        <div className="loader">🎲 Chargement de la table…</div>
      </div>
    );
  }

  return (
    <div className="qz-root">
      <Style />
      <header className="qz-header">
        <div className="qz-header-inner">
          <div className="crest">🎲</div>
          <div>
            <h1>La Quinzaine</h1>
            <p>Tirage des jeux de société entre amis</p>
          </div>
        </div>
        <nav className="tabs">
          {[
            ["prefs", "Mes points"],
            ["summary", "Résumé"],
            ["draw", "Tirage"],
            ["players", "Joueurs"],
            ["games", "Jeux"],
          ].map(([id, label]) => (
            <button key={id} className={"tab" + (tab === id ? " active" : "")} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="qz-main">
        {saveFlag && <div className="flash">{saveFlag}</div>}

        {tab === "prefs" && (
          <section>
            <div className="panel">
              <label className="field-label">Qui es-tu ?</label>
              <select
                className="select"
                value={whoami}
                onChange={async (e) => {
                  setWhoami(e.target.value);
                  await storageSet(WHOAMI_KEY, e.target.value, false);
                }}
              >
                <option value="">— choisir mon nom —</option>
                {state.players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {whoami && (
              <>
                <div className="panel">
                  <div className="field-label">Nombre de joueurs à cette table</div>
                  <div className="die-row">
                    {COUNTS.map((c) => (
                      <DieBadge key={c} n={c} active={selCount === c} onClick={() => setSelCount(c)} />
                    ))}
                  </div>
                  <div className="budget-bar">
                    <div className="budget-track">
                      <div
                        className="budget-fill"
                        style={{ width: (spent / BUDGET) * 100 + "%", background: remaining < 0 ? "var(--dice-red)" : "var(--gold)" }}
                      />
                    </div>
                    <div className="budget-label mono">
                      {spent} / {BUDGET} points utilisés
                    </div>
                  </div>
                </div>

                <div className="panel">
                  <input
                    className="text-input"
                    placeholder="Filtrer les jeux…"
                    value={gameFilter}
                    onChange={(e) => setGameFilter(e.target.value)}
                  />
                  <div className="game-list">
                    {eligibleGames.length === 0 && <div className="empty">Aucun jeu ne joue à {selCount} pour l’instant.</div>}
                    {eligibleGames.map((g) => (
                      <div className={"game-row" + (g.kind === "split" ? " split" : "")} key={g.id}>
                        <div className="game-name">
                          {g.kind === "split" ? "✂️ " : ""}
                          {g.kind === "split" ? g.label : g.name}
                          {g.kind !== "split" && <span className="minmax">{g.min}–{g.max} joueurs</span>}
                        </div>
                        <input
                          type="number"
                          min={0}
                          max={BUDGET}
                          className="pts-input mono"
                          value={localPts[g.id] || 0}
                          onChange={(e) => setPts(g.id, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                  <button className="btn primary" onClick={saveMyPoints}>
                    Enregistrer mes points pour {selCount} joueurs
                  </button>
                </div>
              </>
            )}
          </section>
        )}

        {tab === "summary" && (
          <section>
            <div className="panel">
              <div className="field-label">Vue d’ensemble</div>
              <div className="hint">
                {playerSummaries.length - playersWithoutChoices.length} / {playerSummaries.length} joueurs ont assigné des points.
              </div>
              {playersWithoutChoices.length > 0 && (
                <div className="chips" style={{ marginTop: 10 }}>
                  {playersWithoutChoices.map((s) => (
                    <span key={s.player.id} className="chip static pending">
                      ⏳ {s.player.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {playerSummaries
              .filter((s) => s.total > 0)
              .map((s) => (
                <div className="panel summary-card" key={s.player.id}>
                  <div className="summary-header">
                    <span className="summary-name">{s.player.name}</span>
                    <span className="summary-total mono">{s.total} pts au total</span>
                  </div>
                  {s.rows.map((r) => (
                    <div className="summary-row" key={r.count}>
                      <DieBadge n={r.count} active={false} disabled onClick={() => {}} />
                      <div className="summary-items">
                        {r.items.map((it, i) => (
                          <span className="pill" key={i}>
                            {it.name} <b>{it.v}</b>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
          </section>
        )}

        {tab === "draw" && (
          <section>
            <div className="panel">
              <div className="field-label">Présents ce soir ({presentCount}) — leurs points comptent dans le tirage</div>
              <div className="chips">
                {state.players.map((p) => (
                  <button key={p.id} className={"chip" + (p.present ? " on" : "")} onClick={() => togglePresent(p.id)}>
                    {p.name}
                  </button>
                ))}
              </div>
              <button className="btn primary big" disabled={!canDraw || rolling} onClick={launchDraw}>
                {rolling ? "🎲 On brasse…" : "Lancer le tirage pour toutes les tailles de table"}
              </button>
              <div className="hint">Un jeu est tiré pour chaque taille de table (2 à 8), avec les points de tous les présents. Si des gens se rajoutent ou partent, vous savez déjà quoi jouer.</div>
              {!canDraw && <div className="hint">Il faut au moins 2 joueurs présents et des points assignés pour au moins une taille de table.</div>}
            </div>

            {lastDraw && (
              <div className="panel results">
                <div className="field-label">
                  Dernier tirage — {lastDraw.present} présents, par {lastDraw.by}
                </div>
                {lastDraw.results && lastDraw.results.length > 0 ? (
                  <div className="ticket-grid">
                    {lastDraw.results.map((r) => (
                      <div className="ticket-group" key={r.count}>
                        <Ticket
                          title={r.winner}
                          subtitle={r.kind === "split" ? `Table de ${r.count} (scindée)` : `Table de ${r.count}`}
                          contributors={r.contributors}
                        />
                        {r.tables.length > 0 && (
                          <div className="sub-tickets">
                            {r.tables.map((t, i) => (
                              <Ticket key={i} title={t.winner || "—"} subtitle={`→ table de ${t.count}`} contributors={t.contributors} />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty">Pas assez de points assignés pour tirer un jeu.</div>
                )}
              </div>
            )}

            <div className="field-label" style={{ padding: "0 4px" }}>
              Cotes actuelles — une carte par taille de table
            </div>
            {COUNTS.every((c) => !(oddsByCount[c] && oddsByCount[c].totalWeight > 0)) && (
              <div className="panel">
                <div className="empty">Personne n’a encore assigné de points — allez dans « Mes points ».</div>
              </div>
            )}
            {COUNTS.map((c) => {
              const { entries, totalWeight } = oddsByCount[c] || { entries: [], totalWeight: 0 };
              if (totalWeight <= 0) return null;
              return (
                <div className="panel odds-panel" key={c}>
                  <div className="odds-title">
                    <DieBadge n={c} active={c === presentCount} disabled onClick={() => {}} />
                    <div className="odds-title-text">
                      <div className="odds-title-main">Table de {c} joueurs</div>
                      <div className="odds-title-sub">{totalWeight} point{totalWeight > 1 ? "s" : ""} au total</div>
                    </div>
                  </div>
                  {entries.map((e) => (
                    <Bar
                      key={e.id}
                      pct={(e.weight / totalWeight) * 100}
                      label={e.name}
                      sub={e.kind === "split" ? "table scindée" : null}
                      contributors={e.contributors}
                    />
                  ))}
                </div>
              );
            })}
          </section>
        )}

        {tab === "players" && (
          <section>
            <AdminBar isAdmin={isAdmin} pinInput={pinInput} setPinInput={setPinInput} pinError={pinError} tryUnlock={tryUnlock} lock={lock} />
            <div className="panel">
              <div className="field-label">Ajouter un·e ami·e</div>
              <div className="row">
                <input className="text-input" placeholder="Nom" value={newPlayer} onChange={(e) => setNewPlayer(e.target.value)} />
                <button className="btn" onClick={addPlayer}>
                  Ajouter
                </button>
              </div>
            </div>
            <div className="panel">
              {state.players.map((p) => (
                <div className="list-row" key={p.id}>
                  <label className="present-toggle">
                    <input type="checkbox" checked={p.present} onChange={() => togglePresent(p.id)} />
                    {p.name}
                  </label>
                  {isAdmin && (
                    <button className="icon-btn" onClick={() => removePlayer(p.id)} title="Retirer">
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === "games" && (
          <section>
            <AdminBar isAdmin={isAdmin} pinInput={pinInput} setPinInput={setPinInput} pinError={pinError} tryUnlock={tryUnlock} lock={lock} />
            <div className="panel">
              <div className="field-label">Ajouter un jeu</div>
              <div className="row wrap">
                <input
                  className="text-input"
                  placeholder="Nom du jeu"
                  value={newGame.name}
                  onChange={(e) => setNewGame({ ...newGame, name: e.target.value })}
                />
                <input
                  type="number"
                  className="num-input mono"
                  value={newGame.min}
                  onChange={(e) => setNewGame({ ...newGame, min: e.target.value })}
                  title="Min joueurs"
                />
                <span className="dash">–</span>
                <input
                  type="number"
                  className="num-input mono"
                  value={newGame.max}
                  onChange={(e) => setNewGame({ ...newGame, max: e.target.value })}
                  title="Max joueurs"
                />
                <button className="btn" onClick={addGame}>
                  Ajouter
                </button>
              </div>
            </div>

            <div className="panel">
              <div className="field-label">Tables de scission (ex. 3-4 = une table de 3 et une table de 4)</div>
              <div className="row">
                <input type="number" className="num-input mono" value={newSplit.a} onChange={(e) => setNewSplit({ ...newSplit, a: e.target.value })} />
                <span className="dash">+</span>
                <input type="number" className="num-input mono" value={newSplit.b} onChange={(e) => setNewSplit({ ...newSplit, b: e.target.value })} />
                <button className="btn" onClick={addSplit}>
                  Ajouter
                </button>
              </div>
              <div className="chips" style={{ marginTop: 10 }}>
                {state.splits.map((s) =>
                  isAdmin ? (
                    <button key={s.id} className="chip on" onClick={() => removeSplit(s.id)} title="Retirer">
                      {s.name} ✕
                    </button>
                  ) : (
                    <span key={s.id} className="chip on static">
                      {s.name}
                    </span>
                  )
                )}
              </div>
            </div>

            <div className="panel">
              <input className="text-input" placeholder="Filtrer les jeux…" value={gameFilter} onChange={(e) => setGameFilter(e.target.value)} />
              <div className="game-list">
                {state.games
                  .filter((g) => g.name.toLowerCase().includes(gameFilter.toLowerCase()))
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((g) => (
                    <div className="game-row" key={g.id}>
                      <div className="game-name">
                        {g.name}
                        <span className="minmax">
                          {g.min}–{g.max} joueurs
                        </span>
                      </div>
                      {isAdmin && (
                        <button className="icon-btn" onClick={() => removeGame(g.id)} title="Retirer">
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <footer className="qz-footer">Les données sont partagées avec toute personne ayant accès à cette page.</footer>
    </div>
  );
}

function Style() {
  return (
    <style>{`
      :root {
        --felt-950:#0f2118; --felt-800:#173628; --felt-700:#1f4534;
        --parchment:#f1e7d0; --parchment-dim:#e6d9ba; --ink:#2a1e12;
        --cream:#efe7d6; --gold:#c9a227; --dice-red:#a1382f; --wood-dark:#4a2f18;
        --wood:#7a5330;
      }
      * { box-sizing: border-box; }
      .qz-root {
        min-height: 100%; background: radial-gradient(ellipse at top, var(--felt-800), var(--felt-950) 70%);
        color: var(--cream); font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
        padding-bottom: 40px;
      }
      .qz-center { display:flex; align-items:center; justify-content:center; min-height:300px; }
      .loader { font-size: 18px; }
      .mono { font-family: ui-monospace, "SF Mono", "Cascadia Code", monospace; }
      .qz-header { padding: 22px 18px 0; border-bottom: 1px solid rgba(255,255,255,.08); }
      .qz-header-inner { display:flex; align-items:center; gap:14px; max-width:720px; margin:0 auto; }
      .crest { font-size:38px; filter: drop-shadow(0 3px 0 var(--wood-dark)); }
      .qz-header h1 { font-family: Iowan Old Style, Georgia, "Times New Roman", serif; font-size:28px; margin:0; letter-spacing:.5px; color: var(--parchment); }
      .qz-header p { margin: 2px 0 0; color: var(--gold); font-size: 13px; letter-spacing:.4px; }
      .tabs { max-width:720px; margin: 16px auto 0; display:flex; gap:4px; }
      .tab { flex:1; background:none; border:none; color: var(--cream); opacity:.6; padding:10px 6px; font-size:14px; cursor:pointer; border-bottom:3px solid transparent; }
      .tab.active { opacity:1; border-bottom:3px solid var(--gold); color: var(--parchment); font-weight:600; }
      .qz-main { max-width:720px; margin: 18px auto 0; padding: 0 16px; }
      .panel { background: var(--felt-700); border:1px solid rgba(255,255,255,.08); border-radius:14px; padding:16px; margin-bottom:16px; box-shadow: 0 6px 18px rgba(0,0,0,.25); }
      .field-label { font-size:12px; text-transform:uppercase; letter-spacing:1px; color: var(--gold); margin-bottom:10px; font-weight:700; }
      .select, .text-input, .num-input { width:100%; padding:10px 12px; border-radius:8px; border:1px solid var(--wood); background: var(--parchment); color: var(--ink); font-size:15px; }
      .num-input { width:64px; text-align:center; }
      .row { display:flex; gap:8px; align-items:center; }
      .row.wrap { flex-wrap:wrap; }
      .dash { color: var(--cream); opacity:.6; }
      .btn { background: var(--wood); color: var(--parchment); border:none; padding:10px 16px; border-radius:8px; cursor:pointer; font-size:14px; font-weight:600; }
      .btn.primary { background: var(--gold); color: var(--ink); }
      .btn.big { width:100%; padding:14px; font-size:16px; margin-top:8px; }
      .btn:disabled { opacity:.4; cursor:not-allowed; }
      .die-row { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:14px; }
      .die-badge { width:40px; height:40px; border-radius:9px; border:none; font-weight:800; font-size:16px; cursor:pointer; }
      .budget-track { height:10px; background: rgba(0,0,0,.3); border-radius:6px; overflow:hidden; }
      .budget-fill { height:100%; transition: width .2s; }
      .budget-label { font-size:12px; margin-top:6px; opacity:.85; }
      .game-list { display:flex; flex-direction:column; gap:6px; margin:12px 0; max-height:420px; overflow:auto; }
      .game-row { display:flex; align-items:center; justify-content:space-between; background: rgba(0,0,0,.18); padding:8px 10px; border-radius:8px; gap:10px; }
      .game-row.split { background: rgba(201,162,39,.15); }
      .game-name { font-size:14px; display:flex; flex-direction:column; gap:2px; }
      .minmax { font-size:11px; opacity:.6; }
      .pts-input { width:52px; padding:6px; border-radius:6px; border:1px solid var(--wood); text-align:center; background: var(--parchment); color: var(--ink); }
      .empty { opacity:.6; font-size:14px; padding: 10px 0; }
      .flash { background: var(--gold); color: var(--ink); padding:8px 14px; border-radius:8px; margin-bottom:12px; font-size:14px; font-weight:600; }
      .hint { font-size:12px; opacity:.7; margin-top:8px; }
      .chips { display:flex; flex-wrap:wrap; gap:8px; }
      .chip { background: rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.15); color: var(--cream); padding:8px 12px; border-radius:20px; cursor:pointer; font-size:13px; }
      .chip.on { background: var(--gold); color: var(--ink); border-color: var(--gold); font-weight:600; }
      .chip.static { cursor: default; opacity: .85; }
      .chip.pending { background: rgba(161,56,47,.25); border-color: var(--dice-red); }
      .summary-card { padding: 14px 16px; }
      .summary-header { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:10px; padding-bottom:8px; border-bottom:1px solid rgba(255,255,255,.08); }
      .summary-name { font-family: Iowan Old Style, Georgia, serif; font-size:16px; color: var(--parchment); font-weight:700; }
      .summary-total { font-size:11px; opacity:.6; }
      .summary-row { display:flex; gap:10px; align-items:flex-start; margin-bottom:10px; }
      .summary-row:last-child { margin-bottom:0; }
      .summary-row .die-badge { width:26px; height:26px; font-size:11px; flex-shrink:0; margin-top:1px; }
      .summary-items { display:flex; flex-wrap:wrap; gap:6px; }
      .pill { background: rgba(0,0,0,.22); padding:4px 9px; border-radius:6px; font-size:12px; }
      .pill b { color: var(--gold); margin-left:4px; }
      .admin-bar { padding: 12px 16px; }
      .admin-error { color: var(--dice-red); }
      .list-row { display:flex; align-items:center; justify-content:space-between; padding:8px 4px; border-bottom:1px solid rgba(255,255,255,.06); }
      .present-toggle { display:flex; align-items:center; gap:10px; font-size:14px; }
      .icon-btn { background:none; border:none; color: var(--dice-red); font-size:16px; cursor:pointer; padding:4px 8px; }
      .ticket-row { display:flex; flex-wrap:wrap; gap:14px; }
      .ticket-grid { display:flex; flex-wrap:wrap; gap:18px; }
      .ticket-group { display:flex; flex-direction:column; gap:8px; }
      .sub-tickets { display:flex; flex-wrap:wrap; gap:8px; padding-left:14px; }
      .sub-tickets .ticket { padding:10px 14px; min-width:160px; }
      .sub-tickets .ticket-title { font-size:15px; }
      .ticket { position:relative; background: var(--parchment); color: var(--ink); border-radius:10px; padding:16px 20px; min-width:220px; border:2px dashed var(--wood); }
      .ticket-notch { position:absolute; width:16px; height:16px; background: var(--felt-700); border-radius:50%; top:50%; transform:translateY(-50%); }
      .ticket-notch.left { left:-9px; } .ticket-notch.right { right:-9px; }
      .ticket-eyebrow { font-size:11px; text-transform:uppercase; letter-spacing:1px; opacity:.6; }
      .ticket-title { font-family: Iowan Old Style, Georgia, serif; font-size:18px; margin-top:4px; }
      .ticket-title.big { font-size:24px; }
      .ticket-meta { font-size:11px; opacity:.65; margin-top:6px; border-top:1px dashed var(--wood); padding-top:6px; }
      .odds-panel { padding-top:14px; }
      .odds-title { display:flex; align-items:center; gap:12px; margin-bottom:14px; }
      .odds-title .die-badge { width:34px; height:34px; font-size:14px; cursor:default; }
      .odds-title-main { font-weight:700; font-size:15px; color: var(--parchment); }
      .odds-title-sub { font-size:11px; opacity:.6; }
      .odds-row { margin-bottom:10px; padding-bottom:8px; border-bottom:1px solid rgba(255,255,255,.05); }
      .odds-label { display:flex; justify-content:space-between; font-size:13px; margin-bottom:3px; }
      .odds-pct { font-family: ui-monospace, monospace; color: var(--gold); }
      .odds-track { height:6px; background: rgba(0,0,0,.3); border-radius:4px; overflow:hidden; }
      .odds-fill { height:100%; background: var(--gold); }
      .odds-sub { font-size:10px; opacity:.5; }
      .odds-contrib { font-size:11px; opacity:.65; font-style:italic; margin-top:3px; }
      .qz-footer { text-align:center; font-size:11px; opacity:.5; margin-top:24px; }
    `}</style>
  );
}
