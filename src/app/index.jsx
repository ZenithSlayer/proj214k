import React from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import StorePage from './store';
import Art from '../assets/wideArt.jpg';

const Home = () => {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <View style={{ padding: 16, alignItems: 'center' }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', marginVertical: 16, textAlign: 'center', color: '#111827' }}>
          Welcome to 214K!
        </Text>
        
        <Image 
          source={Art} 
          style={{ width: '100%', height: 200, borderRadius: 8, marginBottom: 20 }} 
          resizeMode="cover" 
        />
        
        <StorePage />
      </View>
    </ScrollView>
  );
};

export default Home;