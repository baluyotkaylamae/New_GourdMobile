import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const BottleGourd = () => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={styles.iconCircle}>
            <Icon name="food-apple-outline" size={38} color="#58b368" />
          </View>
          <Text style={styles.header}>Types of Gourds in the Philippines</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.bulletRow}>
            <Icon name="leaf" size={22} color="#3c8c3d" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Bottle Gourd (Upo)</Text>
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <Icon name="test-tube" size={22} color="#3c8c3d" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Scientific Name: </Text>Lagenaria siceraria
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <Icon name="text-box-outline" size={22} color="#3c8c3d" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Description: </Text>
              Bottle gourd, or upo, is a large, light green gourd with a smooth skin. It has a bulbous shape, resembling a bottle when mature, and has a soft texture when cooked.
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <Icon name="silverware-fork-knife" size={22} color="#3c8c3d" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Uses: </Text>
              Often featured in dishes like ginataang upo (bottle gourd cooked in coconut milk) or sautéed upo with shrimp. Its neutral flavor makes it versatile in various recipes, where it absorbs the flavors of other ingredients.
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

export default BottleGourd;