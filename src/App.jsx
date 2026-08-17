import React, { useState, useEffect } from 'react';

// Configuration JSONBin
const BIN_ID = '67cb2737ad19ca34f8185c7b';
const MASTER_KEY = '$2a$10$wO082I6A4rEBRXJjJ3LNO.O7mYjWThmC8I1WOnJ3g1TmsR3sXJqKi';
const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

export default function App() {
  const [data, setData] = useState({ players: [], games: [], history: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('ranking');

  // Formulaires
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newGameName, setNewGameName] = useState('');
  const [newGameMaxPoints, setNewGameMaxPoints] = useState(10);

  // Partie jouée
  const [selectedGame, setSelectedGame] = useState('');
  const [gameResults, setGameResults] = useState({});

  // Charger les données depuis JSONBin
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/latest`, {
        headers: { 'X-Master-Key': MASTER_KEY }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.record) {
          setData(json.record);
        }
      }
    } catch (err) {
      console.error("Erreur de chargement:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveData = async (newData) => {
    setSaving(true);
    setData(newData);
    try {
      await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': MASTER_KEY
        },
        body: JSON.stringify(newData)
      });
    } catch (err) {
      console.error("Erreur de sauvegarde:", err);
    } finally {
      setSaving(false);
    }
  };

  // Ajouter un joueur
  const handleAddPlayer = (e) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    const newData = {
      ...data,
      players: [...data.players, { id: Date.now().toString(), name: newPlayerName.trim(), score: 0 }]
    };
    saveData(newData);
    setNewPlayerName('');
  };

  // Ajouter un jeu
  const handleAddGame = (e) => {
    e.preventDefault();
    if (!newGameName.trim()) return;
    const newData = {
      ...data,
      games: [...data.games, { id: Date.now().toString(), name: newGameName.trim(), maxPoints: Number(newGameMaxPoints) }]
    };
    saveData(newData);
    setNewGameName('');
    setNewGameMaxPoints(10);
  };

  // Enregistrer une partie
  const handleRecordGame = (e) => {
    e.preventDefault();
    if (!selectedGame) return;

    const game = data.games.find(g => g.id === selectedGame);
    if (!game) return;

    const updatedPlayers = data.players.map(player => {
      const pts = Number(gameResults[player.id] || 0);
      return { ...player, score: player.score + pts };
    });

    const newHistoryEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('fr-FR'),
      gameName: game.name,
      scores: gameResults
    };

    const newData = {
      ...data,
      players: updatedPlayers,
      history: [newHistoryEntry, ...(data.history || [])]
    };

    saveData(newData);
    setSelectedGame('');
    setGameResults({});
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
        <h2>Chargement des données de La Quinzaine...</h2>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif', color: '#333' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        <h1 style={{ margin: '0', color: '#2c3e50' }}>🎲 La Quinzaine</h1>
        {saving && <span style={{ color: '#e67e22', fontSize: '0.9em' }}>Enregistrement en cours...</span>}
      </header>

      {/* Navigation */}
      <nav style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={() => setActiveTab('ranking')}
          style={{ flex: 1, padding: '10px', background: activeTab === 'ranking' ? '#3498db' : '#f1f1f1', color: activeTab === 'ranking' ? '#fff' : '#333', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          Classement
        </button>
        <button 
          onClick={() => setActiveTab('record')}
          style={{ flex: 1, padding: '10px', background: activeTab === 'record' ? '#3498db' : '#f1f1f1', color: activeTab === 'record' ? '#fff' : '#333', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          Saisir une partie
        </button>
        <button 
          onClick={() => setActiveTab('manage')}
          style={{ flex: 1, padding: '10px', background: activeTab === 'manage' ? '#3498db' : '#f1f1f1', color: activeTab === 'manage' ? '#fff' : '#333', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          Gestion
        </button>
      </nav>

      {/* Tab Classement */}
      {activeTab === 'ranking' && (
        <div>
          <h2>Classement Général</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr style={{ background: '#f8f9fa', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '10px' }}>Joueur</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Points Total</th>
              </tr>
            </thead>
            <tbody>
              {[...data.players].sort((a, b) => b.score - a.score).map((player) => (
                <tr key={player.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>{player.name}</td>
                  <td style={{ padding: '10px', textAlign: 'right', color: '#27ae60', fontWeight: 'bold' }}>{player.score} pts</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab Saisir Partie */}
      {activeTab === 'record' && (
        <div>
          <h2>Enregistrer les résultats d'un jeu</h2>
          <form onSubmit={handleRecordGame}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Sélectionner le jeu :</label>
              <select 
                value={selectedGame} 
                onChange={(e) => setSelectedGame(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                required>
                <option value="">-- Choisir un jeu --</option>
                {data.games.map(g => (
                  <option key={g.id} value={g.id}>{g.name} (Max {g.maxPoints} pts)</option>
                ))}
              </select>
            </div>

            {selectedGame && (
              <div style={{ marginBottom: '15px' }}>
                <h4>Points attribués aux joueurs :</h4>
                {data.players.map(player => (
                  <div key={player.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span>{player.name} :</span>
                    <input 
                      type="number" 
                      min="0"
                      value={gameResults[player.id] || 0}
                      onChange={(e) => setGameResults({ ...gameResults, [player.id]: e.target.value })}
                      style={{ width: '80px', padding: '5px', borderRadius: '5px', border: '1px solid #ccc' }}
                    />
                  </div>
                ))}
              </div>
            )}

            <button type="submit" style={{ width: '100%', padding: '12px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
              Valider et ajouter au classement
            </button>
          </form>
        </div>
      )}

      {/* Tab Gestion */}
      {activeTab === 'manage' && (
        <div>
          <h2>Configuration</h2>
          
          <div style={{ marginBottom: '30px', background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
            <h3>Ajouter un joueur</h3>
            <form onSubmit={handleAddPlayer} style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                placeholder="Nom du joueur" 
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                style={{ flex: 1, padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
              />
              <button type="submit" style={{ padding: '8px 15px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Ajouter</button>
            </form>
          </div>

          <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
            <h3>Ajouter un jeu</h3>
            <form onSubmit={handleAddGame} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input 
                type="text" 
                placeholder="Nom du jeu" 
                value={newGameName}
                onChange={(e) => setNewGameName(e.target.value)}
                style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
              />
              <input 
                type="number" 
                placeholder="Points max" 
                value={newGameMaxPoints}
                onChange={(e) => setNewGameMaxPoints(e.target.value)}
                style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
              />
              <button type="submit" style={{ padding: '8px 15px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Ajouter le jeu</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
