import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const topicIcons = {
    Introduction: "sprout-outline",
    History: "history",
    Botany: "leaf",
    FlowerGender: "flower-outline",
    TypesInPhilippines: "shape-outline",
    HealthBenefits: "heart-outline",
    CommonIssues: "bug-outline",
};

const subtopicIcons = {
    Definition: "book-open-outline",
    ChaUses: "star-outline",
    GourdWorld: "earth",
    GourdPhi: "map-marker-radius-outline",
    Anatomy: "leaf",
    LifeCycle: "recycle-variant",
    MaleFemaleFlowers: "gender-male-female",
    ImportanceFlowers: "poll",
    PollinationProcess: "flower-outline",
    PollinationChallenges: "alert-circle-outline",
    BitterGourd: "food-apple-outline",
    SpongeGourd: "food-apple-outline",
    BottleGourd: "food-apple-outline",
    WaxGourd: "food-apple-outline",
    NutritionalProfile: "food-apple-outline",
    MedicinalUses: "pill",
    Pests: "bug-outline",
    Diseases: "bacteria-outline",
    PreventiveMeasures: "shield-check-outline",
};

const InfoMenu = ({ navigation }) => {
    const [expandedTopics, setExpandedTopics] = useState({});

    const toggleTopic = (topic) => {
        setExpandedTopics((prev) => ({
            ...prev,
            [topic]: !prev[topic],
        }));
    };

    const renderChevron = (expanded) => (
        <Animated.View style={{ 
            transform: [{ rotate: expanded ? "90deg" : "0deg" }],
            marginLeft: 10
        }}>
            <Icon name="chevron-right" size={24} color="#3C8C3D" />
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Gourd Information</Text>
            
            <ScrollView 
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Introduction to Gourds */}
                <View style={styles.cardContainer}>
                    <TouchableOpacity 
                        style={styles.cardHeader} 
                        onPress={() => toggleTopic("Introduction")}
                        activeOpacity={0.7}
                    >
                        <View style={styles.cardHeaderContent}>
                            <Icon name={topicIcons.Introduction} size={24} color="#3C8C3D" style={styles.topicIcon} />
                            <Text style={styles.cardTitle}>Introduction to Gourds</Text>
                        </View>
                        {renderChevron(expandedTopics["Introduction"])}
                    </TouchableOpacity>
                    
                    {expandedTopics["Introduction"] && (
                        <View style={styles.subtopics}>
                            <TouchableOpacity 
                                style={styles.subtopicItem} 
                                onPress={() => navigation.navigate("Definition")}
                                activeOpacity={0.6}
                            >
                                <Icon name={subtopicIcons.Definition} size={20} color="#3C8C3D" />
                                <Text style={styles.subtopicText}>Definition</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={styles.subtopicItem} 
                                onPress={() => navigation.navigate("ChaUses")}
                                activeOpacity={0.6}
                            >
                                <Icon name={subtopicIcons.ChaUses} size={20} color="#3C8C3D" />
                                <Text style={styles.subtopicText}>Characteristics and Uses of Gourds</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* History and Cultural Significance */}
                <View style={styles.cardContainer}>
                    <TouchableOpacity 
                        style={styles.cardHeader} 
                        onPress={() => toggleTopic("History")}
                        activeOpacity={0.7}
                    >
                        <View style={styles.cardHeaderContent}>
                            <Icon name={topicIcons.History} size={24} color="#3C8C3D" style={styles.topicIcon} />
                            <Text style={styles.cardTitle}>History and Cultural Significance</Text>
                        </View>
                        {renderChevron(expandedTopics["History"])}
                    </TouchableOpacity>
                    
                    {expandedTopics["History"] && (
                        <View style={styles.subtopics}>
                            <TouchableOpacity 
                                style={styles.subtopicItem} 
                                onPress={() => navigation.navigate("GourdWorld")}
                                activeOpacity={0.6}
                            >
                                <Icon name={subtopicIcons.GourdWorld} size={20} color="#3C8C3D" />
                                <Text style={styles.subtopicText}>Gourds Around the World</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={styles.subtopicItem} 
                                onPress={() => navigation.navigate("GourdPhi")}
                                activeOpacity={0.6}
                            >
                                <Icon name={subtopicIcons.GourdPhi} size={20} color="#3C8C3D" />
                                <Text style={styles.subtopicText}>Gourds in the Philippines</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Botany of Gourds */}
                <View style={styles.cardContainer}>
                    <TouchableOpacity 
                        style={styles.cardHeader} 
                        onPress={() => toggleTopic("Botany")}
                        activeOpacity={0.7}
                    >
                        <View style={styles.cardHeaderContent}>
                            <Icon name={topicIcons.Botany} size={24} color="#3C8C3D" style={styles.topicIcon} />
                            <Text style={styles.cardTitle}>Botany of Gourds</Text>
                        </View>
                        {renderChevron(expandedTopics["Botany"])}
                    </TouchableOpacity>
                    
                    {expandedTopics["Botany"] && (
                        <View style={styles.subtopics}>
                            <TouchableOpacity 
                                style={styles.subtopicItem} 
                                onPress={() => navigation.navigate("Anatomy")}
                                activeOpacity={0.6}
                            >
                                <Icon name={subtopicIcons.Anatomy} size={20} color="#3C8C3D" />
                                <Text style={styles.subtopicText}>Anatomy of a Gourd Plant</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={styles.subtopicItem} 
                                onPress={() => navigation.navigate("LifeCycle")}
                                activeOpacity={0.6}
                            >
                                <Icon name={subtopicIcons.LifeCycle} size={20} color="#3C8C3D" />
                                <Text style={styles.subtopicText}>Life Cycle of a Gourd Plant</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Understanding Flower Gender in Gourds */}
                <View style={styles.cardContainer}>
                    <TouchableOpacity 
                        style={styles.cardHeader} 
                        onPress={() => toggleTopic("FlowerGender")}
                        activeOpacity={0.7}
                    >
                        <View style={styles.cardHeaderContent}>
                            <Icon name={topicIcons.FlowerGender} size={24} color="#3C8C3D" style={styles.topicIcon} />
                            <Text style={styles.cardTitle}>Flower Gender in Gourds</Text>
                        </View>
                        {renderChevron(expandedTopics["FlowerGender"])}
                    </TouchableOpacity>
                    
                    {expandedTopics["FlowerGender"] && (
                        <View style={styles.subtopics}>
                            <TouchableOpacity 
                                style={styles.subtopicItem} 
                                onPress={() => navigation.navigate("MaleFemaleFlowers")}
                                activeOpacity={0.6}
                            >
                                <Icon name={subtopicIcons.MaleFemaleFlowers} size={20} color="#3C8C3D" />
                                <Text style={styles.subtopicText}>Male vs. Female Flowers</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={styles.subtopicItem} 
                                onPress={() => navigation.navigate("ImportanceFlowers")}
                                activeOpacity={0.6}
                            >
                                <Icon name={subtopicIcons.ImportanceFlowers} size={20} color="#3C8C3D" />
                                <Text style={styles.subtopicText}>Importance in Pollination</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={styles.subtopicItem} 
                                onPress={() => navigation.navigate("PollinationProcess")}
                                activeOpacity={0.6}
                            >
                                <Icon name={subtopicIcons.PollinationProcess} size={20} color="#3C8C3D" />
                                <Text style={styles.subtopicText}>Pollination Process</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={styles.subtopicItem} 
                                onPress={() => navigation.navigate("PollinationChallenges")}
                                activeOpacity={0.6}
                            >
                                <Icon name={subtopicIcons.PollinationChallenges} size={20} color="#3C8C3D" />
                                <Text style={styles.subtopicText}>Challenges in Pollination</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Types of Gourds in the Philippines */}
                <View style={styles.cardContainer}>
                    <TouchableOpacity 
                        style={styles.cardHeader} 
                        onPress={() => toggleTopic("TypesInPhilippines")}
                        activeOpacity={0.7}
                    >
                        <View style={styles.cardHeaderContent}>
                            <Icon name={topicIcons.TypesInPhilippines} size={24} color="#3C8C3D" style={styles.topicIcon} />
                            <Text style={styles.cardTitle}>Types of Gourds in PH</Text>
                        </View>
                        {renderChevron(expandedTopics["TypesInPhilippines"])}
                    </TouchableOpacity>
                    
                    {expandedTopics["TypesInPhilippines"] && (
                        <View style={styles.subtopics}>
                            <TouchableOpacity 
                                style={styles.subtopicItem} 
                                onPress={() => navigation.navigate("BitterGourd")}
                                activeOpacity={0.6}
                            >
                                <Icon name={subtopicIcons.BitterGourd} size={20} color="#3C8C3D" />
                                <Text style={styles.subtopicText}>Bitter Gourd (Ampalaya)</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={styles.subtopicItem} 
                                onPress={() => navigation.navigate("SpongeGourd")}
                                activeOpacity={0.6}
                            >
                                <Icon name={subtopicIcons.SpongeGourd} size={20} color="#3C8C3D" />
                                <Text style={styles.subtopicText}>Sponge Gourd (Patola)</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={styles.subtopicItem} 
                                onPress={() => navigation.navigate("BottleGourd")}
                                activeOpacity={0.6}
                            >
                                <Icon name={subtopicIcons.BottleGourd} size={20} color="#3C8C3D" />
                                <Text style={styles.subtopicText}>Bottle Gourd (Upo)</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Health Benefits and Nutritional Value */}
                <View style={styles.cardContainer}>
                    <TouchableOpacity 
                        style={styles.cardHeader} 
                        onPress={() => toggleTopic("HealthBenefits")}
                        activeOpacity={0.7}
                    >
                        <View style={styles.cardHeaderContent}>
                            <Icon name={topicIcons.HealthBenefits} size={24} color="#3C8C3D" style={styles.topicIcon} />
                            <Text style={styles.cardTitle}>Health Benefits</Text>
                        </View>
                        {renderChevron(expandedTopics["HealthBenefits"])}
                    </TouchableOpacity>
                    
                    {expandedTopics["HealthBenefits"] && (
                        <View style={styles.subtopics}>
                            <TouchableOpacity 
                                style={styles.subtopicItem} 
                                onPress={() => navigation.navigate("NutritionalProfile")}
                                activeOpacity={0.6}
                            >
                                <Icon name={subtopicIcons.NutritionalProfile} size={20} color="#3C8C3D" />
                                <Text style={styles.subtopicText}>Nutritional Profile</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={styles.subtopicItem} 
                                onPress={() => navigation.navigate("MedicinalUses")}
                                activeOpacity={0.6}
                            >
                                <Icon name={subtopicIcons.MedicinalUses} size={20} color="#3C8C3D" />
                                <Text style={styles.subtopicText}>Medicinal Uses</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Common Issues and Pests Affecting Gourds */}
                <View style={styles.cardContainer}>
                    <TouchableOpacity 
                        style={styles.cardHeader} 
                        onPress={() => toggleTopic("CommonIssues")}
                        activeOpacity={0.7}
                    >
                        <View style={styles.cardHeaderContent}>
                            <Icon name={topicIcons.CommonIssues} size={24} color="#3C8C3D" style={styles.topicIcon} />
                            <Text style={styles.cardTitle}>Common Issues and Pests</Text>
                        </View>
                        {renderChevron(expandedTopics["CommonIssues"])}
                    </TouchableOpacity>
                    
                    {expandedTopics["CommonIssues"] && (
                        <View style={styles.subtopics}>
                            <TouchableOpacity 
                                style={styles.subtopicItem} 
                                onPress={() => navigation.navigate("Pests")}
                                activeOpacity={0.6}
                            >
                                <Icon name={subtopicIcons.Pests} size={20} color="#3C8C3D" />
                                <Text style={styles.subtopicText}>Common Pests</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={styles.subtopicItem} 
                                onPress={() => navigation.navigate("Diseases")}
                                activeOpacity={0.6}
                            >
                                <Icon name={subtopicIcons.Diseases} size={20} color="#3C8C3D" />
                                <Text style={styles.subtopicText}>Common Diseases</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={styles.subtopicItem} 
                                onPress={() => navigation.navigate("PreventiveMeasures")}
                                activeOpacity={0.6}
                            >
                                <Icon name={subtopicIcons.PreventiveMeasures} size={20} color="#3C8C3D" />
                                <Text style={styles.subtopicText}>Preventive Measures</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5FCF5",
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    header: {
        fontSize: 24,
        fontWeight: "700",
        color: "#26762A",
        textAlign: "center",
        marginVertical: 20,
        fontFamily: "serif",
    },
    cardContainer: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },
    cardHeader: {
        paddingVertical: 18,
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    cardHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    topicIcon: {
        marginRight: 12,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: "600",
        color: "#2C482D",
        flexShrink: 1,
    },
    subtopics: {
        backgroundColor: "#F8FBF8",
        borderTopWidth: 1,
        borderTopColor: "#E8F5E9",
        paddingVertical: 8,
    },
    subtopicItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        paddingLeft: 44, // Align with the card title
    },
    subtopicText: {
        fontSize: 15,
        color: "#3A563A",
        marginLeft: 12,
    },
});

export default InfoMenu;