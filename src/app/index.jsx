import { Image, ScrollView, Text, View } from 'react-native';
import Art from '../assets/wideArt.jpg';
import { useAppTheme } from '../context/ThemeContext';
import { Link } from 'expo-router'; // Use Expo Router link if needed

const Home = () => {
  const { theme } = useAppTheme();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ padding: 16, alignItems: 'center' }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', marginVertical: 16, textAlign: 'center', color: theme.text }}>
          Welcome to 214K!
        </Text>
        
        <Image 
          source={Art} 
          style={{ width: '100%', height: 200, borderRadius: 8, marginBottom: 20 }} 
          resizeMode="cover" 
        />
        
        {/* If you want users to navigate to store, use a Link or router */}
        <Link href="/store" style={{ color: theme.accent, fontSize: 16, marginTop: 10 }}>
          Go to Store
        </Link>
      </View>
    </ScrollView>
  );
};

export default Home;