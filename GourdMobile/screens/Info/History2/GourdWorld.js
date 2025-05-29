import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

function GourdWorld() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={styles.iconCircle}>
            <Icon name="earth" size={38} color="#58b368" />
          </View>
          <Text style={styles.header}>Gourds Around the World</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.content}>
            Gourds are among the oldest cultivated plants in human history, with evidence of domestication stretching back over 10,000 years. Civilizations across Africa, Asia, and the Americas grew gourds not just as a food source but for their versatility. Once dried, the hard shells of gourds made them ideal natural containers, commonly used for storing water, grains, and seeds. The durability of dried gourds also led to their adaptation into tools and even musical instruments. In regions with limited access to manufactured goods, gourds became essential to daily life, especially in arid areas where other materials were scarce.
          </Text>
          <Text style={styles.content}>
            The unique shapes and smooth surface of gourds have also made them a popular medium for artistic and cultural expression worldwide. Many cultures would carve, paint, or decorate gourds, often for ritualistic or ceremonial purposes. In some traditions, they are still used as offerings or as part of cultural ceremonies. Gourds have also had a significant role in traditional music, especially as percussion instruments. For example, in West Africa, the shekere is a gourd-based instrument covered with beads that produce rhythmic sounds, while maracas in Latin America are crafted using small gourds. In India, dried gourds are used in stringed instruments like the tanpura and sitar, serving as resonators and adding depth to the sound.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FFF8",
  },
  scrollContent: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 34,
    maxWidth: Math.min(500, width - 8),
    alignSelf: "center",
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
    width: 56,
    height: 56,
    borderRadius: 28,
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
    fontSize: 26,
    fontWeight: "700",
    color: "#209150",
    textAlign: "left",
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
    fontSize: 17,
    color: "#38734e",
    lineHeight: 26,
    textAlign: "justify",
    marginBottom: 8,
    fontWeight: "400",
  },
});

export default GourdWorld;