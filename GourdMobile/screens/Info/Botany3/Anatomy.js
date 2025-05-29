import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const Anatomy = () => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={styles.iconCircle}>
            <Icon name="leaf" size={38} color="#58b368" />
          </View>
          <Text style={styles.header}>Anatomy of a Gourd Plant</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.content}>
            Gourds are robust, vining plants characterized by several key structures, each with a specific function that supports growth and fruit production:
          </Text>
          
          <View style={styles.bulletRow}>
            <Icon name="source-branch" size={22} color="#3c8c3d" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Roots: </Text>
              Gourd plants have extensive root systems that help them absorb water and nutrients from the soil, supporting their rapid growth. These roots anchor the plant and enable it to thrive in nutrient-poor soils.
            </Text>
          </View>
          
          <View style={styles.bulletRow}>
            <Icon name="sprout" size={22} color="#3c8c3d" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Stems and Tendrils: </Text>
              The stems of gourds are long, flexible, and often vine-like, allowing them to spread horizontally across the ground or climb vertical structures. Tendrils, small coiling structures along the stem, help the plant attach to supports like fences or trellises, promoting stability as the plant grows.
            </Text>
          </View>

          <View style={styles.bulletRow}>
            <Icon name="leaf-maple" size={22} color="#3c8c3d" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Leaves: </Text>
              Gourd leaves are typically large, lobed, and broad, helping to maximize sunlight absorption. Their shape also provides shade to the developing fruits below, protecting them from excessive sunlight.
            </Text>
          </View>
          
          <View style={styles.bulletRow}>
            <Icon name="flower-outline" size={22} color="#3c8c3d" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Flowers: </Text>
              Gourd plants produce both male and female flowers. These flowers are essential for reproduction and are generally large and yellow, attracting pollinators. Male flowers emerge first, followed by female flowers with a small, immature fruit at the base.
            </Text>
          </View>
          
          <View style={styles.bulletRow}>
            <Icon name="fruit-cherries" size={22} color="#3c8c3d" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Fruits: </Text>
              Once pollination occurs, the female flower's ovary develops into a mature gourd. Gourds vary in shape, size, and color, depending on the type (e.g., bitter gourd, sponge gourd, bottle gourd).
            </Text>
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

export default Anatomy;