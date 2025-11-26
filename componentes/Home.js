import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Home() {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState([]);

  // Cargar favoritos al iniciar
  useEffect(() => {
    loadFavorites();
  }, []);

  // Cargar favoritos de AsyncStorage
  const loadFavorites = async () => {
    try {
      const savedFavorites = await AsyncStorage.getItem('rickMortyFavorites');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  // Función para cargar personajes
  const fetchCharacters = async (page = 1, search = '') => {
    setLoading(true);
    try {
      let url = `https://rickandmortyapi.com/api/character?page=${page}`;
      if (search) {
        url += `&name=${search}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error('No se encontraron personajes');

      const data = await response.json();
      setCharacters(data.results);
      setTotalPages(data.info.pages);
      setLoading(false);
    } catch (err) {
      Alert.alert('Error', err.message);
      setLoading(false);
      setCharacters([]);
    }
  };

  useEffect(() => {
    fetchCharacters(currentPage, searchTerm);
  }, [currentPage]);

  // Función para buscar
  const handleSearch = () => {
    setCurrentPage(1);
    fetchCharacters(1, searchTerm);
  };

  // Toggle favorito
  const toggleFavorite = async (character) => {
    let newFavorites;
    const isFavorite = favorites.some(fav => fav.id === character.id);

    if (isFavorite) {
      newFavorites = favorites.filter(fav => fav.id !== character.id);
    } else {
      newFavorites = [...favorites, character];
    }

    setFavorites(newFavorites);
    await AsyncStorage.setItem('rickMortyFavorites', JSON.stringify(newFavorites));
  };

  // Verificar si es favorito
  const isFavorite = (characterId) => {
    return favorites.some(fav => fav.id === characterId);
  };

  // Renderizar cada personaje
  const renderCharacter = ({ item }) => (
    <View style={styles.characterCard}>
      <TouchableOpacity
        style={[styles.favoriteBtn, isFavorite(item.id) && styles.favoriteBtnActive]}
        onPress={() => toggleFavorite(item)}
      >
        <Text>{isFavorite(item.id) ? '❤️' : '🤍'}</Text>
      </TouchableOpacity>

      <Image source={{ uri: item.image }} style={styles.characterImage} />
      <Text style={styles.characterName}>{item.name}</Text>

      <View style={styles.characterInfo}>
        <View style={[styles.statusBadge,
          item.status === 'Alive' && styles.alive,
          item.status === 'Dead' && styles.dead,
          item.status === 'unknown' && styles.unknown
        ]}>
          <Text style={styles.badgeText}>{item.status}</Text>
        </View>
        <View style={styles.speciesBadge}>
          <Text style={styles.badgeText}>{item.species}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👽 Rick & Morty 👽</Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar personaje..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Buscar</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00ff00" />
          <Text>Cargando personajes...</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={characters}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderCharacter}
            numColumns={2}
            contentContainerStyle={styles.list}
          />

          <View style={styles.pagination}>
            <TouchableOpacity
              onPress={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              style={[styles.paginationBtn, currentPage === 1 && styles.disabled]}
            >
              <Text>Anterior</Text>
            </TouchableOpacity>

            <Text style={styles.pageInfo}>
              Página {currentPage} de {totalPages}
            </Text>

            <TouchableOpacity
              onPress={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={[styles.paginationBtn, currentPage === totalPages && styles.disabled]}
            >
              <Text>Siguiente</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#00ff00',
    marginVertical: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#00ff00',
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: 'white',
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: '#00ff00',
    paddingHorizontal: 20,
    justifyContent: 'center',
    borderRadius: 5,
  },
  searchButtonText: {
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingBottom: 20,
  },
  characterCard: {
    flex: 1,
    backgroundColor: '#16213e',
    margin: 5,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  favoriteBtn: {
    position: 'absolute',
    top: 5,
    right: 5,
    zIndex: 1,
    padding: 5,
  },
  characterImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
  },
  characterName: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'center',
  },
  characterInfo: {
    flexDirection: 'row',
    marginTop: 5,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    marginRight: 5,
  },
  alive: {
    backgroundColor: '#00ff00',
  },
  dead: {
    backgroundColor: '#ff0000',
  },
  unknown: {
    backgroundColor: '#gray',
  },
  speciesBadge: {
    backgroundColor: '#0066ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  paginationBtn: {
    backgroundColor: '#00ff00',
    padding: 10,
    borderRadius: 5,
  },
  disabled: {
    opacity: 0.5,
  },
  pageInfo: {
    color: 'white',
  },
});
