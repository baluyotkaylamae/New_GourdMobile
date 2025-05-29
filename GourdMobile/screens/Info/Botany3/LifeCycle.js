import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const LifeCycle = () => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={styles.iconCircle}>
            <Icon name="progress-clock" size={38} color="#58b368" />
          </View>
          <Text style={styles.header}>Life Cycle of a Gourd Plant</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.content}>
            Gourd plants have a well-defined life cycle that includes four primary stages, each crucial for the plant’s growth and fruit production:
          </Text>

          <View style={styles.bulletRow}>
            <Icon name="seed" size={22} color="#3c8c3d" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Germination: </Text>
              Seeds sprout under warm, moist conditions. Small roots and shoots emerge as the plant begins to establish itself.
            </Text>
          </View>

          <View style={styles.bulletRow}>
            <Icon name="sprout" size={22} color="#3c8c3d" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Vegetative Growth: </Text>
              The young plant quickly develops stems, leaves, and tendrils, forming a dense vine that spreads over time. This stage focuses on building a robust structure for supporting future flowers and fruits.
            </Text>
          </View>

          <View style={styles.bulletRow}>
            <Icon name="flower-outline" size={22} color="#3c8c3d" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Flowering: </Text>
              The plant begins to produce flowers, which appear in abundance. The first to bloom are male flowers, followed by female flowers after a short period. This stage is essential for setting up the conditions needed for pollination.
            </Text>
          </View>

          <View style={styles.bulletRow}>
            <Icon name="fruit-cherries" size={22} color="#3c8c3d" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Pollination and Fruiting: </Text>
              During pollination, pollen from male flowers is transferred to female flowers by insects or through hand-pollination. Once pollination is successful, the female flowers develop into fruits, which continue to grow and mature over several weeks. The fruits are ready for harvest when they reach full size or when they dry, depending on the gourd type.
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

export default LifeCycle;