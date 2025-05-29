import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const NutritionalProfile = () => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={styles.iconCircle}>
            <Icon name="nutrition" size={38} color="#58b368" />
          </View>
          <Text style={styles.header}>Health Benefits and Nutritional Value</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.content}>
            Gourds are not only versatile in the kitchen but also packed with essential nutrients and health benefits. Understanding their nutritional profiles and medicinal uses can encourage healthier dietary choices.
          </Text>

          <View style={styles.bulletRow}>
            <Icon name="clipboard-list-outline" size={22} color="#3c8c3d" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Nutritional Profile of Each Gourd</Text>
            </Text>
          </View>
          {/* Bitter Gourd */}
          <View style={styles.bulletRow}>
            <Icon name="leaf" size={22} color="#3c8c3d" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Bitter Gourd (Ampalaya):</Text>
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="alpha-v-box-outline" size={18} color="#3c8c3d" style={styles.infoIcon} />
            <Text style={styles.infoText}>Vitamins: Rich in Vitamin C, which boosts the immune system and promotes healthy skin.</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="alpha-m-box-outline" size={18} color="#3c8c3d" style={styles.infoIcon} />
            <Text style={styles.infoText}>Minerals: Contains potassium, which helps regulate blood pressure, and iron, essential for blood health.</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="star-circle-outline" size={18} color="#3c8c3d" style={styles.infoIcon} />
            <Text style={styles.infoText}>Antioxidants: High levels of flavonoids and phenolic compounds that may help reduce oxidative stress.</Text>
          </View>
          {/* Sponge Gourd */}
          <View style={styles.bulletRow}>
            <Icon name="leaf" size={22} color="#3c8c3d" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Sponge Gourd (Patola):</Text>
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="alpha-v-box-outline" size={18} color="#3c8c3d" style={styles.infoIcon} />
            <Text style={styles.infoText}>Vitamins: A good source of Vitamins A and C, promoting vision health and immune function.</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="alpha-m-box-outline" size={18} color="#3c8c3d" style={styles.infoIcon} />
            <Text style={styles.infoText}>Minerals: Contains calcium and magnesium, vital for bone health.</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="star-circle-outline" size={18} color="#3c8c3d" style={styles.infoIcon} />
            <Text style={styles.infoText}>Antioxidants: Offers dietary fiber, which aids in digestion and can help maintain healthy cholesterol levels.</Text>
          </View>
          {/* Bottle Gourd */}
          <View style={styles.bulletRow}>
            <Icon name="leaf" size={22} color="#3c8c3d" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Bottle Gourd (Upo):</Text>
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="alpha-v-box-outline" size={18} color="#3c8c3d" style={styles.infoIcon} />
            <Text style={styles.infoText}>Vitamins: High in Vitamin B, particularly B1 (thiamine) and B2 (riboflavin), which support energy metabolism.</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="alpha-m-box-outline" size={18} color="#3c8c3d" style={styles.infoIcon} />
            <Text style={styles.infoText}>Minerals: Rich in potassium, which helps maintain fluid balance and supports heart health.</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="star-circle-outline" size={18} color="#3c8c3d" style={styles.infoIcon} />
            <Text style={styles.infoText}>Antioxidants: Contains a significant amount of water, making it hydrating and low in calories, which is beneficial for weight management.</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  )
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
    fontSize: 16,
    color: "#38734e",
    lineHeight: 26,
    textAlign: "justify",
    marginBottom: 16,
    fontWeight: "400",
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
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
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginLeft: 30,
    marginBottom: 4,
    paddingRight: 4,
  },
  infoIcon: {
    marginRight: 7,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    color: "#38734e",
    lineHeight: 22,
    textAlign: "left",
  },
});

export default NutritionalProfile;