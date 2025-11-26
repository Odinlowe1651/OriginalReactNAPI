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
  Alert,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function Home() {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    loadFavorites();
    fetchCharacters(1, '');
  }, []);

  // Cargar favoritos
  const loadFavorites = async () => {
    try {
      const savedFavorites = await AsyncStorage.getItem('rickMortyFavorites');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } catch (error) {
      console.error('Error cargando favoritos:', error);
    }
  };

  // Obtener personajes
  const fetchCharacters = async (page = 1, search = '') => {
    setLoading(true);
    try {
      let url = `https://rickandmortyapi.com/api/character?page=${page}`;
      if (search) {
        url += `&name=${search}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setCharacters(data.results);
        setTotalPages(data.info.pages);
      } else {
        setCharacters([]);
        Alert.alert('Sin resultados', 'No se encontraron personajes');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los personajes');
      setCharacters([]);
    }
    setLoading(false);
  };

  // Toggle favorito
  const toggleFavorite = async (character) => {
    const isFav = favorites.some(fav => fav.id === character.id);
    let newFavorites;

    if (isFav) {
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

  // Buscar
  const handleSearch = () => {
    setCurrentPage(1);
    fetchCharacters(1, searchTerm);
  };

  // Paginación
  const nextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      fetchCharacters(newPage, searchTerm);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      fetchCharacters(newPage, searchTerm);
    }
  };

  // Renderizar personaje
  const renderCharacter = ({ item }) => (
    <TouchableOpacity style={styles.characterCard}>
      <TouchableOpacity
        style={[styles.favoriteBtn, isFavorite(item.id) && styles.favoriteBtnActive]}
        onPress={() => toggleFavorite(item)}
      >
        <Text style={styles.favoriteBtnText}>
          {isFavorite(item.id) ? '❤️' : '🤍'}
        </Text>
      </TouchableOpacity>

      <Image source={{ uri: item.image }} style={styles.characterImage} />

      <View style={styles.characterInfo}>
        <Text style={styles.characterName}>{item.name}</Text>

        <View style={styles.badges}>
          <View style={[
            styles.statusBadge,
            item.status === 'Alive' && styles.statusAlive,
            item.status === 'Dead' && styles.statusDead
          ]}>
            <Text style={styles.badgeText}>{item.status}</Text>
          </View>

          <View style={styles.speciesBadge}>
            <Text style={styles.badgeText}>{item.species}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>�� Rick & Morty 👽</Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar personaje..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Buscar</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Cargando personajes...</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={characters}
            renderItem={renderCharacter}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            contentContainerStyle={styles.listContainer}
          />

          <View style={styles.pagination}>
            <TouchableOpacity
              style={[styles.paginationBtn, currentPage === 1 && styles.disabled]}
              onPress={prevPage}
              disabled={currentPage === 1}
            >
              <Text style={styles.paginationBtnText}>Anterior</Text>
            </TouchableOpacity>

            <Text style={styles.pageInfo}>
              Página {currentPage} de {totalPages}
            </Text>

            <TouchableOpacity
              style={[styles.paginationBtn, currentPage === totalPages && styles.disabled]}
              onPress={nextPage}
              disabled={currentPage === totalPages}
            >
              <Text style={styles.paginationBtnText}>Siguiente</Text>
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
    fontSize: 28,
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    marginVertical: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    marginHorizontal: 10,
    marginBottom: 20,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 25,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 25,
    justifyContent: 'center',
    borderRadius: 25,
  },
  searchButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContainer: {
    paddingHorizontal: 5,
  },
  characterCard: {
    flex: 1,
    backgroundColor: 'white',
    margin: 8,
    borderRadius: 15,
    overflow: 'hidden',
    maxWidth: (width - 40) / 2,
  },
  favoriteBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    width: 35,
    height: 35,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  favoriteBtnActive: {
    backgroundColor: '#ffe0e0',
  },
  favoriteBtnText: {
    fontSize: 20,
  },
  characterImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  characterInfo: {
    padding: 10,
  },
  characterName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  badges: {
    flexDirection: 'row',
    gap: 5,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#e2e3e5',
  },
  statusAlive: {
    backgroundColor: '#d4edda',
  },
  statusDead: {
    backgroundColor: '#f8d7da',
  },
  speciesBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#e7f3ff',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  paginationBtn: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  paginationBtnText: {
    color: '#667eea',
    fontWeight: 'bold',
  },
  disabled: {
    opacity: 0.5,
  },
  pageInfo: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
