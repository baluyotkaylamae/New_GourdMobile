import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

function GourdPhi() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <View style={styles.iconCircle}>
            <Icon name="map-marker-radius-outline" size={38} color="#58b368" />
          </View>
          <Text style={styles.header}>Gourds in the Philippines</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.content}>
            In the Philippines, gourds have long held a place of importance, especially in traditional cuisine and folk medicine. Bitter gourd, or ampalaya, is a prominent ingredient in Filipino dishes like Pinakbet, a mixed vegetable stew with a unique flavor profile, and Ginisang Ampalaya, a sautéed dish combining bitter gourd with eggs, garlic, and onions. Bottle gourd, or upo, is also popular in soups and stews, often cooked with garlic, tomatoes, and fish to create flavorful and nutritious meals. In addition to its culinary uses, bitter gourd is deeply embedded in Filipino medicinal practices. Known for its potential to help manage blood sugar levels, ampalaya has been a traditional remedy for diabetes and is still used in herbal medicine across the country.
          </Text>
          <Text style={styles.content}>
            The cultural significance of gourds in the Philippines extends beyond cuisine and health. While gourds are less commonly depicted in Philippine folklore, they symbolize abundance and resilience due to their ability to grow in challenging conditions. In contemporary Filipino culture, ampalaya is widely available as a dietary supplement and herbal tea, reflecting an ongoing appreciation for its health benefits. Gourds continue to bridge the past with the present, maintaining a strong presence in Filipino culture as both a practical resource and a symbol of natural health.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FFF8", // lighter, soft green-tinted bg
  },
  scrollContent: {
    padding: 0,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e6f9ed",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    shadowColor: "#b5f2c9",
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 3,
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    color: "#209150",
    textAlign: "left",
    fontFamily: "serif",
    letterSpacing: 0.3,
    flexShrink: 1,
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 18,
    marginVertical: 10,
    borderRadius: 18,
    padding: 22,
    shadowColor: "#aee4bb",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 12,
    elevation: 3,
  },
  content: {
    fontSize: 18,
    color: "#38734e",
    lineHeight: 28,
    textAlign: "left",
    fontFamily: "serif",
    marginBottom: 8,
    fontWeight: "400",
  },
});

export default GourdPhi;