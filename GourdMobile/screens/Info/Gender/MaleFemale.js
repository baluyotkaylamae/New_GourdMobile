import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const MaleFemaleFlowers = () => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={styles.iconCircle}>
            <Icon name="flower" size={38} color="#58b368" />
          </View>
          <Text style={styles.header}>Male vs Female Flowers</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.content}>
            Gourd plants are unique in having distinct male and female flowers on the same plant, a feature that plays a critical role in fruit production:
          </Text>

          <View style={styles.bulletRow}>
            <Icon name="gender-male" size={22} color="#3c8c3d" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Male Flowers: </Text>
              These flowers are typically smaller and grow on long, slender stems. They produce pollen but do not bear fruit. Male flowers tend to bloom first and in greater numbers than female flowers, ensuring ample pollen is available for pollination.
            </Text>
          </View>

          <View style={styles.bulletRow}>
            <Icon name="gender-female" size={22} color="#3c8c3d" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Female Flowers: </Text>
              Female flowers are distinguishable by the small, immature fruit (ovary) visible at the base of the bloom. This ovary will develop into a full-sized gourd if the flower is successfully pollinated. Female flowers are often slightly larger and bloom after the initial appearance of male flowers.
            </Text>
          </View>

          <View style={styles.bulletRow}>
            <Icon name="eye-outline" size={22} color="#3c8c3d" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>
              The visual differences between male and female flowers make it easy to identify each type, which can be beneficial for both natural and hand-pollination efforts.
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

export default MaleFemaleFlowers;