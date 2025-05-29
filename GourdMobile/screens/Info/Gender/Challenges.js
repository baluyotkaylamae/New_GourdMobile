import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const PollinationChallenges = () => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={styles.iconCircle}>
            <Icon name="alert-decagram-outline" size={38} color="#e6b347" />
          </View>
          <Text style={styles.header}>Challenges in Pollination</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.content}>
            Pollination can be challenging, particularly if there are not enough pollinators in the area. Factors like habitat loss, pesticide use, and climate change have led to declining pollinator populations, which can affect gourd production. Additionally, poor weather conditions such as excessive rain or extreme heat can hinder pollination, as bees and other insects may be less active in such conditions.
          </Text>
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
      backgroundColor: "#fff7e6",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 14,
      shadowColor: "#ffe3b5",
      shadowOpacity: 0.19,
      shadowRadius: 10,
      elevation: 3,
    },
    header: {
      fontSize: 26,
      fontWeight: "700",
      color: "#b68400",
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
      marginBottom: 4,
      fontWeight: "400",
    },
    bold: {
      fontWeight: "bold",
      color: "#b68400",
    },
});

export default PollinationChallenges;