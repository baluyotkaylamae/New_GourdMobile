import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const MedicinalUses = () => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={styles.iconCircle}>
            <Icon name="medical-bag" size={38} color="#58b368" />
          </View>
          <Text style={styles.header}>Medicinal Uses</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.content}>
            Gourds have been traditionally used in various cultures for their health benefits. Here are some notable medicinal uses:
          </Text>
          <View style={styles.bulletRow}>
            <Icon name="needle" size={22} color="#3c8c3d" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Blood Sugar Management: </Text>
              Bitter gourd is known for its potential to lower blood sugar levels, making it beneficial for individuals with diabetes. It contains compounds that mimic insulin and may improve glucose uptake.
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <Icon name="food-apple-outline" size={22} color="#3c8c3d" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Digestive Health: </Text>
              The high fiber content in sponge and bottle gourd aids digestion, prevents constipation, and promotes a healthy gut. Fiber-rich foods can help maintain bowel regularity and reduce the risk of digestive disorders.
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <Icon name="face-woman-outline" size={22} color="#3c8c3d" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Skin Health: </Text>
              Bitter gourd is often used in traditional medicine for its anti-inflammatory and antibacterial properties. It may help treat skin conditions like acne and psoriasis when consumed or applied topically.
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <Icon name="water" size={22} color="#3c8c3d" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Hydration and Detoxification: </Text>
              Bottle gourd’s high-water content helps keep the body hydrated, while its diuretic properties may support detoxification processes by promoting urination and flushing out toxins.
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <Icon name="scale-bathroom" size={22} color="#3c8c3d" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Weight Management: </Text>
              Due to their low calorie and high fiber content, gourds like sponge and bottle gourd can aid in weight loss by providing satiety without excessive caloric intake.
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

export default MedicinalUses;