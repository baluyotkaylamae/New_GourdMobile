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
        <Animated.View style={{ transform: [{ rotate: expanded ? "90deg" : "0deg" }] }}>
            <Icon name="chevron-right" size={23} color="#3C8C3D" />
        </Animated.View>
    );

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>

            {/* Introduction to Gourds */}
            <TouchableOpacity style={styles.card} onPress={() => toggleTopic("Introduction")}>
                <View style={styles.cardRow}>
                    <View style={styles.iconTitleRow}>
                        <Icon name={topicIcons.Introduction} size={23} color="#3C8C3D" style={styles.topicIcon} />
                        <Text style={styles.cardTitle}>Introduction to Gourds</Text>
                    </View>
                    {renderChevron(expandedTopics["Introduction"])}
                </View>
                {expandedTopics["Introduction"] && (
                    <View style={styles.subtopics}>
                        <TouchableOpacity style={styles.subtopicRow} onPress={() => navigation.navigate("Definition")}>
                            <Icon name={subtopicIcons.Definition} size={17} color="#3C8C3D" style={styles.subtopicIcon} />
                            <Text style={styles.subtopic}>Definition</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.subtopicRow} onPress={() => navigation.navigate("ChaUses")}>
                            <Icon name={subtopicIcons.ChaUses} size={17} color="#3C8C3D" style={styles.subtopicIcon} />
                            <Text style={styles.subtopic}>Characteristics and Uses of Gourds</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </TouchableOpacity>

            {/* History and Cultural Significance */}
            <TouchableOpacity style={styles.card} onPress={() => toggleTopic("History")}>
                <View style={styles.cardRow}>
                    <View style={styles.iconTitleRow}>
                        <Icon name={topicIcons.History} size={23} color="#3C8C3D" style={styles.topicIcon} />
                        <Text style={styles.cardTitle}>History and Cultural Significance of Gourds</Text>
                    </View>
                    {renderChevron(expandedTopics["History"])}
                </View>
                {expandedTopics["History"] && (
                    <View style={styles.subtopics}>
                        <TouchableOpacity style={styles.subtopicRow} onPress={() => navigation.navigate("GourdWorld")}>
                            <Icon name={subtopicIcons.GourdWorld} size={17} color="#3C8C3D" style={styles.subtopicIcon} />
                            <Text style={styles.subtopic}>Gourds Around the World</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.subtopicRow} onPress={() => navigation.navigate("GourdPhi")}>
                            <Icon name={subtopicIcons.GourdPhi} size={17} color="#3C8C3D" style={styles.subtopicIcon} />
                            <Text style={styles.subtopic}>Gourds in the Philippines</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </TouchableOpacity>

            {/* Botany of Gourds */}
            <TouchableOpacity style={styles.card} onPress={() => toggleTopic("Botany")}>
                <View style={styles.cardRow}>
                    <View style={styles.iconTitleRow}>
                        <Icon name={topicIcons.Botany} size={23} color="#3C8C3D" style={styles.topicIcon} />
                        <Text style={styles.cardTitle}>Botany of Gourds</Text>
                    </View>
                    {renderChevron(expandedTopics["Botany"])}
                </View>
                {expandedTopics["Botany"] && (
                    <View style={styles.subtopics}>
                        <TouchableOpacity style={styles.subtopicRow} onPress={() => navigation.navigate("Anatomy")}>
                            <Icon name={subtopicIcons.Anatomy} size={17} color="#3C8C3D" style={styles.subtopicIcon} />
                            <Text style={styles.subtopic}>Anatomy of a Gourd Plant</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.subtopicRow} onPress={() => navigation.navigate("LifeCycle")}>
                            <Icon name={subtopicIcons.LifeCycle} size={17} color="#3C8C3D" style={styles.subtopicIcon} />
                            <Text style={styles.subtopic}>Life Cycle of a Gourd Plant</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </TouchableOpacity>

            {/* Understanding Flower Gender in Gourds */}
            <TouchableOpacity style={styles.card} onPress={() => toggleTopic("FlowerGender")}>
                <View style={styles.cardRow}>
                    <View style={styles.iconTitleRow}>
                        <Icon name={topicIcons.FlowerGender} size={23} color="#3C8C3D" style={styles.topicIcon} />
                        <Text style={styles.cardTitle}>Understanding Flower Gender in Gourds</Text>
                    </View>
                    {renderChevron(expandedTopics["FlowerGender"])}
                </View>
                {expandedTopics["FlowerGender"] && (
                    <View style={styles.subtopics}>
                        <TouchableOpacity style={styles.subtopicRow} onPress={() => navigation.navigate("MaleFemaleFlowers")}>
                            <Icon name={subtopicIcons.MaleFemaleFlowers} size={17} color="#3C8C3D" style={styles.subtopicIcon} />
                            <Text style={styles.subtopic}>Male vs. Female Flowers</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.subtopicRow} onPress={() => navigation.navigate("ImportanceFlowers")}>
                            <Icon name={subtopicIcons.ImportanceFlowers} size={17} color="#3C8C3D" style={styles.subtopicIcon} />
                            <Text style={styles.subtopic}>Importance of Male and Female Flowers in Pollination and Fruit Production</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.subtopicRow} onPress={() => navigation.navigate("PollinationProcess")}>
                            <Icon name={subtopicIcons.PollinationProcess} size={17} color="#3C8C3D" style={styles.subtopicIcon} />
                            <Text style={styles.subtopic}>Pollination Process</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.subtopicRow} onPress={() => navigation.navigate("PollinationChallenges")}>
                            <Icon name={subtopicIcons.PollinationChallenges} size={17} color="#3C8C3D" style={styles.subtopicIcon} />
                            <Text style={styles.subtopic}>Challenges in Pollination</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </TouchableOpacity>

            {/* Types of Gourds in the Philippines */}
            <TouchableOpacity style={styles.card} onPress={() => toggleTopic("TypesInPhilippines")}>
                <View style={styles.cardRow}>
                    <View style={styles.iconTitleRow}>
                        <Icon name={topicIcons.TypesInPhilippines} size={23} color="#3C8C3D" style={styles.topicIcon} />
                        <Text style={styles.cardTitle}>Types of Gourds in the Philippines</Text>
                    </View>
                    {renderChevron(expandedTopics["TypesInPhilippines"])}
                </View>
                {expandedTopics["TypesInPhilippines"] && (
                    <View style={styles.subtopics}>
                        <TouchableOpacity style={styles.subtopicRow} onPress={() => navigation.navigate("BitterGourd")}>
                            <Icon name={subtopicIcons.BitterGourd} size={17} color="#3C8C3D" style={styles.subtopicIcon} />
                            <Text style={styles.subtopic}>Bitter Gourd (Ampalaya)</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.subtopicRow} onPress={() => navigation.navigate("SpongeGourd")}>
                            <Icon name={subtopicIcons.SpongeGourd} size={17} color="#3C8C3D" style={styles.subtopicIcon} />
                            <Text style={styles.subtopic}>Sponge Gourd (Patola)</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.subtopicRow} onPress={() => navigation.navigate("BottleGourd")}>
                            <Icon name={subtopicIcons.BottleGourd} size={17} color="#3C8C3D" style={styles.subtopicIcon} />
                            <Text style={styles.subtopic}>Bottle Gourd (Upo)</Text>
                        </TouchableOpacity>
                        {/* <TouchableOpacity style={styles.subtopicRow} onPress={() => navigation.navigate("WaxGourd")}>
                            <Icon name={subtopicIcons.WaxGourd} size={17} color="#3C8C3D" style={styles.subtopicIcon} />
                            <Text style={styles.subtopic}>Wax Gourd (Kundol)</Text>
                        </TouchableOpacity> */}
                    </View>
                )}
            </TouchableOpacity>

            {/* Health Benefits and Nutritional Value */}
            <TouchableOpacity style={styles.card} onPress={() => toggleTopic("HealthBenefits")}>
                <View style={styles.cardRow}>
                    <View style={styles.iconTitleRow}>
                        <Icon name={topicIcons.HealthBenefits} size={23} color="#3C8C3D" style={styles.topicIcon} />
                        <Text style={styles.cardTitle}>Health Benefits and Nutritional Value</Text>
                    </View>
                    {renderChevron(expandedTopics["HealthBenefits"])}
                </View>
                {expandedTopics["HealthBenefits"] && (
                    <View style={styles.subtopics}>
                        <TouchableOpacity style={styles.subtopicRow} onPress={() => navigation.navigate("NutritionalProfile")}>
                            <Icon name={subtopicIcons.NutritionalProfile} size={17} color="#3C8C3D" style={styles.subtopicIcon} />
                            <Text style={styles.subtopic}>Nutritional Profile of Each Gourd</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.subtopicRow} onPress={() => navigation.navigate("MedicinalUses")}>
                            <Icon name={subtopicIcons.MedicinalUses} size={17} color="#3C8C3D" style={styles.subtopicIcon} />
                            <Text style={styles.subtopic}>Medicinal Uses</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </TouchableOpacity>

            {/* Common Issues and Pests Affecting Gourds */}
            <TouchableOpacity style={styles.card} onPress={() => toggleTopic("CommonIssues")}>
                <View style={styles.cardRow}>
                    <View style={styles.iconTitleRow}>
                        <Icon name={topicIcons.CommonIssues} size={23} color="#3C8C3D" style={styles.topicIcon} />
                        <Text style={styles.cardTitle}>Common Issues and Pests Affecting Gourds</Text>
                    </View>
                    {renderChevron(expandedTopics["CommonIssues"])}
                </View>
                {expandedTopics["CommonIssues"] && (
                    <View style={styles.subtopics}>
                        <TouchableOpacity style={styles.subtopicRow} onPress={() => navigation.navigate("Pests")}>
                            <Icon name={subtopicIcons.Pests} size={17} color="#3C8C3D" style={styles.subtopicIcon} />
                            <Text style={styles.subtopic}>Common Pests</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.subtopicRow} onPress={() => navigation.navigate("Diseases")}>
                            <Icon name={subtopicIcons.Diseases} size={17} color="#3C8C3D" style={styles.subtopicIcon} />
                            <Text style={styles.subtopic}>Common Diseases</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.subtopicRow} onPress={() => navigation.navigate("PreventiveMeasures")}>
                            <Icon name={subtopicIcons.PreventiveMeasures} size={17} color="#3C8C3D" style={styles.subtopicIcon} />
                            <Text style={styles.subtopic}>Preventive Measures</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#FFFFFF",
    },
    header: {
        fontSize: 26,
        fontWeight: "700",
        marginBottom: 20,
        color: "#26762A",
        textAlign: "center",
        fontFamily: "serif",
    },
    card: {
        backgroundColor: "#FFFFFF",
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderRadius: 15,
        marginVertical: 10,
        shadowColor: "#4DA55C",
        shadowOpacity: 0.12,
        shadowOffset: { width: 0, height: 5 },
        shadowRadius: 10,
        elevation: 5,
        borderWidth: 1.2,
        borderColor: "#B5E5B8",
    },
    cardRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    iconTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    topicIcon: {
        marginRight: 13,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "500",
        color: "#3C8C3D",
        fontFamily: "serif",
        flexShrink: 1,
    },
    subtopics: {
        marginTop: 10,
        paddingLeft: 10,
        backgroundColor: "#E9F8EB",
        borderRadius: 10,
        padding: 10,
    },
    subtopicRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 5,
        borderRadius: 7,
        marginBottom: 2,
    },
    subtopicIcon: {
        marginRight: 8,
    },
    subtopic: {
        fontSize: 16,
        color: "#2C482D",
    },
});

export default InfoMenu;