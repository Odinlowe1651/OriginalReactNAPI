import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Alert
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function Original() {
  const [allCharacters, setAllCharacters] = useState([]);
  const [gameCharacters, setGameCharacters] = useState([]);
  const [playerTeam, setPlayerTeam] = useState([]);
  const [computerTeam, setComputerTeam] = useState([]);
  const [gamePhase, setGamePhase] = useState('loading');
  const [winner, setWinner] = useState(null);
  const [playerStats, setPlayerStats] = useState({ total: 0 });
  const [computerStats, setComputerStats] = useState({ total: 0 });

  // Función para obtener habilidad del personaje
  const getCharacterAbility = (character) => {
    const specificAbilities = {
      'Rick Sanchez': {
        name: 'Portal Borracho',
        description: 'Se escapa con un portal pero vuelve más ebrio (+50 ATK)'
      },
      'Morty Smith': {
        name: 'Ansiedad Extrema',
        description: 'Grita tan fuerte que aturde al enemigo (+30 DEF)'
      },
      'Summer Smith': {
        name: 'Instagram Influencer',
        description: 'Distrae al enemigo con selfies (-20 ATK enemigo)'
      },
      'Beth Smith': {
        name: 'Cirugía de Caballos',
        description: 'Cura heridas aleatorias (+40 HP)'
      },
      'Jerry Smith': {
        name: 'Ser Patético',
        description: 'Es tan patético que da pena atacarlo (+60 DEF)'
      },
      'Birdperson': {
        name: 'Vuelo Majestuoso',
        description: 'Esquiva todo por estar volando (+45 DEF)'
      },
      'Squanchy': {
        name: 'Squanchificar',
        description: 'Se transforma y squanchea todo (+70 ATK)'
      },
      'Mr. Poopybutthole': {
        name: 'Ooh-wee!',
        description: 'Anima tanto al equipo que todos mejoran (+25 ALL)'
      },
      'Evil Morty': {
        name: 'Manipulación',
        description: 'Controla mentes débiles (+80 ATK)'
      },
      'Mr. Meeseeks': {
        name: '¡Mírame!',
        description: 'Cumple una tarea y desaparece (+100 ATK, -100 HP)'
      }
    };

    if (specificAbilities[character.name]) {
      return specificAbilities[character.name];
    }

    // Habilidades genéricas por especie
    const genericAbilities = {
      'Human': { name: 'Drama Existencial', description: 'Crisis humana (+45 ATK)' },
      'Alien': { name: 'Tecnología Alienígena', description: 'Usa gadgets (+50 ATK)' },
      'Humanoid': { name: 'Híbrido Poderoso', description: 'Lo mejor de dos mundos (+40 ATK)' },
      'Robot': { name: 'Actualización 2.0', description: 'Se mejora a sí mismo (+50 ATK)' },
      'Animal': { name: 'Instinto Salvaje', description: 'Ataca con furia (+45 ATK)' },
      'Mythological Creature': { name: 'Poder Mítico', description: 'Invoca poderes antiguos (+65 ATK)' }
    };

    return genericAbilities[character.species] || {
      name: 'Habilidad Especial',
      description: 'Poder único (+35 ATK)'
    };
  };

  // Generar stats para cada personaje
  const generateCharacterStats = (character) => {
    const baseHP = 100 + (character.id * 7) % 150;
    const baseATK = 50 + (character.id * 11) % 100;
    const baseDEF = 30 + (character.id * 13) % 70;
    const ability = getCharacterAbility(character);

    return {
      ...character,
      hp: baseHP,
      attack: baseATK,
      defense: baseDEF,
      total: baseHP + baseATK + baseDEF,
      ability: ability,
      selected: false
    };
  };

  // Cargar personajes iniciales
  useEffect(() => {
    fetchRandomCharacters();
  }, []);

  const fetchRandomCharacters = async () => {
    setGamePhase('loading');
    try {
      const randomPage = Math.floor(Math.random() * 42) + 1;
      const response = await fetch(`https://rickandmortyapi.com/api/character?page=${randomPage}`);
      const data = await response.json();

      const shuffled = [...data.results].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 5);

      const charactersWithStats = selected.map(generateCharacterStats);

      setGameCharacters(charactersWithStats);
      setGamePhase('selecting');
      setPlayerTeam([]);
      setComputerTeam([]);
      setWinner(null);
    } catch (error) {
      console.error('Error fetching characters:', error);
      Alert.alert('Error', 'No se pudieron cargar los personajes');
    }
  };

  // Seleccionar personaje
  const selectCharacter = (character) => {
    if (playerTeam.length >= 3) return;
    if (playerTeam.find(c => c.id === character.id)) return;

    const newTeam = [...playerTeam, character];
    setPlayerTeam(newTeam);

    if (newTeam.length === 3) {
      selectComputerTeam();
    }
  };

  // Deseleccionar personaje
  const deselectCharacter = (characterId) => {
    setPlayerTeam(playerTeam.filter(c => c.id !== characterId));
  };

  // Selección de la computadora
  const selectComputerTeam = () => {
    const availableCharacters = [...gameCharacters];
    const weakCharacters = availableCharacters.filter(c => c.total < 300);
    const strongCharacters = availableCharacters.filter(c => c.total >= 300);

    let computerSelection = [];

    // Estrategia: Preferir personajes débiles
    if (weakCharacters.length >= 2) {
      const shuffledWeak = [...weakCharacters].sort(() => Math.random() - 0.5);
      computerSelection.push(shuffledWeak[0], shuffledWeak[1]);
    }

    // Agregar un tercer personaje
    while (computerSelection.length < 3) {
      const remaining = availableCharacters.filter(
        c => !computerSelection.find(cs => cs.id === c.id)
      );
      if (remaining.length > 0) {
        computerSelection.push(remaining[Math.floor(Math.random() * remaining.length)]);
      }
    }

    setComputerTeam(computerSelection);
    setGamePhase('battle');
    calculateBattle(playerTeam, computerSelection);
  };

  // Calcular batalla
  const calculateBattle = (playerT, computerT) => {
    const playerBaseTotal = playerT.reduce((sum, char) => {
      return sum + char.hp + char.attack + char.defense;
    }, 0);

    const computerBaseTotal = computerT.reduce((sum, char) => {
      return sum + char.hp + char.attack + char.defense;
    }, 0);

    // Ventajas para el jugador
    const playerBonus = Math.floor(playerBaseTotal * 0.15);
    const luckFactor = Math.floor(Math.random() * 50);
    const computerPenalty = Math.floor(computerBaseTotal * 0.10);

    const playerTotal = playerBaseTotal + playerBonus + luckFactor;
    const computerTotal = computerBaseTotal - computerPenalty;

    setPlayerStats({ total: playerTotal });
    setComputerStats({ total: computerTotal });

    setTimeout(() => {
      if (playerTotal > computerTotal) {
        setWinner('player');
      } else if (computerTotal > playerTotal) {
        setWinner('computer');
      } else {
        setWinner('player');
      }
      setGamePhase('result');
    }, 2000);
  };

  // Reiniciar juego
  const resetGame = () => {
    fetchRandomCharacters();
  };
   // RENDERIZADO DE LA UI
  return (
    <ScrollView style={styles.container}>
      {/* Header del juego */}
      <View style={styles.gameHeader}>
        <Text style={styles.gameTitle}>🎮 Rick & Morty TCG 🎮</Text>
        <Text style={styles.gameSubtitle}>¡Elige 3 personajes y batalla!</Text>
      </View>

      {/* Fase de carga */}
      {gamePhase === 'loading' && (
        <View style={styles.loadingScreen}>
          <ActivityIndicator size="large" color="#00ff00" />
          <Text style={styles.loadingText}>Abriendo portal interdimensional...</Text>
        </View>
      )}

      {/* Fase de selección */}
      {gamePhase === 'selecting' && (
        <View style={styles.selectionPhase}>
          <View style={styles.selectionInfo}>
            <Text style={styles.phaseTitle}>Selecciona tu equipo</Text>
            <View style={styles.teamCounter}>
              <Text style={styles.counterText}>{playerTeam.length}/3 seleccionados</Text>
            </View>
          </View>

          {/* Grid de personajes */}
          <View style={styles.charactersGrid}>
            {gameCharacters.map(character => {
              const isSelected = playerTeam.find(c => c.id === character.id);
              return (
                <TouchableOpacity
                  key={character.id}
                  style={[styles.characterCard, isSelected && styles.selectedCard]}
                  onPress={() => isSelected ? deselectCharacter(character.id) : selectCharacter(character)}
                >
                  <Image source={{ uri: character.image }} style={styles.cardImage} />

                  <Text style={[styles.cardName, isSelected && styles.selectedText]}>
                    {character.name}
                  </Text>

                  {/* Stats */}
                  <View style={styles.statsContainer}>
                    <View style={styles.stat}>
                      <Text style={styles.statIcon}>❤️</Text>
                      <Text style={[styles.statValue, isSelected && styles.selectedText]}>
                        {character.hp}
                      </Text>
                    </View>
                    <View style={styles.stat}>
                      <Text style={styles.statIcon}>⚔️</Text>
                      <Text style={[styles.statValue, isSelected && styles.selectedText]}>
                        {character.attack}
                      </Text>
                    </View>
                    <View style={styles.stat}>
                      <Text style={styles.statIcon}>🛡️</Text>
                      <Text style={[styles.statValue, isSelected && styles.selectedText]}>
                        {character.defense}
                      </Text>
                    </View>
                  </View>

                  {/* Habilidad */}
                  <View style={styles.abilityBox}>
                    <Text style={styles.abilityName}>{character.ability.name}</Text>
                    <Text style={styles.abilityDesc}>{character.ability.description}</Text>
                  </View>

                  {/* Poder total */}
                  <View style={styles.totalPower}>
                    <Text style={[styles.totalText, isSelected && styles.selectedText]}>
                      Poder: {character.total}
                    </Text>
                  </View>

                  {isSelected && (
                    <View style={styles.selectedBadge}>
                      <Text style={styles.selectedBadgeText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Equipo seleccionado */}
          {playerTeam.length > 0 && (
            <View style={styles.selectedTeam}>
              <Text style={styles.teamTitle}>Tu equipo:</Text>
              <View style={styles.miniTeam}>
                {playerTeam.map(char => (
                  <View key={char.id} style={styles.miniCard}>
                    <Image source={{ uri: char.image }} style={styles.miniImage} />
                    <Text style={styles.miniName}>{char.name.split(' ')[0]}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}

      {/* Fase de batalla */}
      {gamePhase === 'battle' && (
        <View style={styles.battlePhase}>
          <Text style={styles.battleTitle}>⚔️ ¡BATALLA! ⚔️</Text>

          <View style={styles.battleArena}>
            {/* Equipo del jugador */}
            <View style={styles.teamDisplay}>
              <Text style={styles.teamDisplayTitle}>Tu Equipo</Text>
              <View style={styles.teamCards}>
                {playerTeam.map(char => (
                  <View key={char.id} style={styles.battleCard}>
                    <Image source={{ uri: char.image }} style={styles.battleImage} />
                    <Text style={styles.battleCardName}>{char.name}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.teamTotal}>Total: {playerStats.total}</Text>
            </View>

            <Text style={styles.vsText}>VS</Text>

            {/* Equipo de la computadora */}
            <View style={styles.teamDisplay}>
              <Text style={styles.teamDisplayTitle}>Equipo Rival</Text>
              <View style={styles.teamCards}>
                {computerTeam.map(char => (
                  <View key={char.id} style={styles.battleCard}>
                    <Image source={{ uri: char.image }} style={styles.battleImage} />
                    <Text style={styles.battleCardName}>{char.name}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.teamTotal}>Total: {computerStats.total}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Fase de resultado */}
      {gamePhase === 'result' && (
        <View style={styles.resultPhase}>
          <View style={[
            styles.resultBanner,
            winner === 'player' ? styles.victoryBanner : styles.defeatBanner
          ]}>
            {winner === 'player' ? (
              <>
                <Text style={styles.resultTitle}>🎉 ¡VICTORIA! 🎉</Text>
                <Text style={styles.resultText}>
                  Ganaste con {playerStats.total} pts vs {computerStats.total}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.resultTitle}>😢 DERROTA 😢</Text>
                <Text style={styles.resultText}>
                  Perdiste {playerStats.total} pts vs {computerStats.total}
                </Text>
              </>
            )}
          </View>

          <TouchableOpacity style={styles.playAgainBtn} onPress={resetGame}>
            <Text style={styles.playAgainText}>🎮 Jugar de Nuevo</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

// ESTILOS
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  gameHeader: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  gameTitle: {
    fontSize: width < 400 ? 24 : 32,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  gameSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 10,
  },

  // Fase de carga
  loadingScreen: {
    height: height * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    marginTop: 20,
  },

  // Fase de selección
  selectionPhase: {
    paddingHorizontal: 10,
  },
  selectionInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  phaseTitle: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  teamCounter: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  counterText: {
    fontSize: 18,
    color: '#764ba2',
    fontWeight: 'bold',
  },

  // Grid de personajes
  charactersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  characterCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 15,
    padding: 10,
    margin: 5,
    width: width > 400 ? '45%' : '100%',
    alignItems: 'center',
  },
  selectedCard: {
    backgroundColor: '#764ba2',
  },
  cardImage: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    marginBottom: 10,
  },
  cardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  selectedText: {
    color: 'white',
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 10,
  },
  stat: {
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 20,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },

  // Habilidad
  abilityBox: {
    backgroundColor: 'rgba(240,147,251,0.3)',
    padding: 8,
    borderRadius: 10,
    width: '100%',
    marginBottom: 10,
  },
  abilityName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#764ba2',
    textAlign: 'center',
    marginBottom: 5,
  },
  abilityDesc: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },

  // Poder total
  totalPower: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  totalText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },

  // Badge de seleccionado
  selectedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#4caf50',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },

  // Equipo seleccionado
  selectedTeam: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 15,
    padding: 15,
    marginTop: 20,
    marginBottom: 20,
  },
  teamTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#764ba2',
    textAlign: 'center',
    marginBottom: 10,
  },
  miniTeam: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  miniCard: {
    alignItems: 'center',
    marginHorizontal: 5,
  },
  miniImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#764ba2',
  },
  miniName: {
    fontSize: 12,
    color: '#333',
    marginTop: 5,
  },

  // Fase de batalla
  battlePhase: {
    padding: 20,
  },
  battleTitle: {
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  battleArena: {
    alignItems: 'center',
  },
  teamDisplay: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
    width: '100%',
  },
  teamDisplayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#764ba2',
    textAlign: 'center',
    marginBottom: 10,
  },
  teamCards: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  battleCard: {
    alignItems: 'center',
  },
  battleImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#764ba2',
  },
  battleCardName: {
    fontSize: 12,
    color: '#333',
    marginTop: 5,
    textAlign: 'center',
  },
  teamTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: '#764ba2',
    padding: 10,
    borderRadius: 10,
    textAlign: 'center',
  },
  vsText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginVertical: 10,
  },

  // Fase de resultado
  resultPhase: {
    padding: 20,
    alignItems: 'center',
  },
  resultBanner: {
    padding: 30,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  victoryBanner: {
    backgroundColor: '#4caf50',
  },
  defeatBanner: {
    backgroundColor: '#f44336',
  },
  resultTitle: {
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 16,
    color: 'white',
  },
  playAgainBtn: {
    backgroundColor: '#764ba2',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  playAgainText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});