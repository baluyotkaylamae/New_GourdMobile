import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

function ChaUses() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={styles.iconCircle}>
            <Icon name="star-outline" size={38} color="#58b368" />
          </View>
          <Text style={styles.header}>Characteristics & Uses of Gourds</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.content}>
            Gourds have been valued across cultures for both their nutritional and practical qualities. Not only are they edible and nutritious, but once dried, many gourds develop a hard outer shell, making them suitable for a variety of non-food uses. Here’s a look at the most common uses of gourds:
          </Text>
          <View style={styles.bulletRow}>
            <Icon name="silverware-fork-knife" size={22} color="#3c8c3d" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Culinary Uses: </Text>
              Gourds are widely used in cuisines around the world. Bitter gourd, for instance, is a popular ingredient in Asian dishes due to its unique bitter flavor and health benefits, while sponge gourd is often enjoyed in soups and stir-fries.
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <Icon name="pill" size={22} color="#3c8c3d" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Medicinal Uses: </Text>
              Many types of gourds are believed to have health benefits. For example, bitter gourd is known for its ability to help regulate blood sugar levels and is high in vitamins A and C, iron, and potassium.
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <Icon name="palette-outline" size={22} color="#3c8c3d" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Decorative & Practical Applications: </Text>
              In addition to being a source of food, dried gourds have been used for centuries as natural containers for water and seeds, as well as for crafting musical instruments and decorative items.
            </Text>
          </View>
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
    marginBottom: 16,
    fontWeight: "400",
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
    marginLeft: 2,
    paddingRight: 4,
  },
  bulletIcon: {
    marginRight: 13,
    marginTop: 1,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    color: "#2C482D",
    lineHeight: 24,
    textAlign: "left",
  },
  bold: {
    fontWeight: "bold",
    color: "#209150",
  },
});

export default ChaUses;