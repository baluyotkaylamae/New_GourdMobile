import React, { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AuthGlobal from "../Context/Store/AuthGlobal";
import baseURL from "../assets/common/baseurl";

const UserMonitoringSummary = () => {
    const context = useContext(AuthGlobal);
    const userId = context.stateUser.user?.userId;
    const [monitorings, setMonitorings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMonitoring = async () => {
            setLoading(true);
            try {
                const token = await AsyncStorage.getItem("jwt");
                const res = await axios.get(`${baseURL}Monitoring/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setMonitorings(res.data);
            } catch (err) {
                setMonitorings([]);
            }
            setLoading(false);
        };
        fetchMonitoring();
    }, [context.stateUser.user?.userId]);

    if (loading) return <ActivityIndicator size="large" color="#28A745" style={{ marginTop: 40 }} />;

    const sortedMonitorings = [...monitorings].sort((a, b) => {
        const dateA = new Date(a.dateOfPollination || 0).getTime();
        const dateB = new Date(b.dateOfPollination || 0).getTime();
        return dateB - dateA;
    }).reverse(); // Most recent at the top

    return (
        <View style={styles.container}>
            <FlatList
                data={sortedMonitorings}
                keyExtractor={item => item._id}
                renderItem={({ item }) => {
                    const pollinated = Array.isArray(item.pollinatedFlowerImages) ? item.pollinatedFlowerImages.length : 0;
                    const harvested = Array.isArray(item.fruitHarvestedImages) ? item.fruitHarvestedImages.length : 0;
                    const failed = (status === "Failed" && harvested === 0) ? Math.max(pollinated, 0) : 0;
                    const percent = pollinated > 0 ? ((harvested / pollinated) * 100).toFixed(1) : "0.0";
                    const status = item.status || "Pending";
                    const statusColor =
                        status === "Approved"
                            ? "#28A745"
                            : status === "Rejected"
                                ? "#f44336"
                                : "#f9ab00";
                    return (
                        <View style={styles.card}>
                            <Text style={styles.gourdType}>
                                <Text style={styles.bold}>{item.gourdType?.name || "Unknown"}</Text>
                            </Text>
                            <Text>Date: <Text style={styles.bold}>
                                {item.dateOfPollination ? new Date(item.dateOfPollination).toLocaleDateString() : "N/A"}
                            </Text></Text>
                            <Text>Total Pollinated Flowers: <Text style={styles.bold}>{pollinated}</Text></Text>
                            <Text>
                                Status:{" "}
                                <Text style={[styles.bold, { color: statusColor }]}>
                                    {status}
                                </Text>
                            </Text>
                            {/* Only show these if not Pending or In Progress */}
                            {status !== "Pending"  && (
                                <>
                                    <Text>
                                        Fruits Harvested:{" "}
                                        <Text style={[styles.bold, { color: "#28A745" }]}>{harvested}</Text>
                                    </Text>
                                    <Text>
                                        Failed Pollination:{" "}
                                        <Text style={[styles.bold, { color: "#f44336" }]}>{failed}</Text>
                                    </Text>
                                    <Text>
                                        Success Rate:{" "}
                                        <Text style={styles.bold}>{percent}%</Text>
                                    </Text>
                                </>
                            )}
                            {/* Pollinated Flower Images */}
                            {item.pollinatedFlowerImages && item.pollinatedFlowerImages.length > 0 && (
                                <View style={styles.imageRow}>
                                    <Text style={styles.imageLabel}>Pollinated Flower Images:</Text>
                                    <View style={styles.imageList}>
                                        {item.pollinatedFlowerImages.map((img, idx) => (
                                            <Image
                                                key={idx}
                                                source={{ uri: img.url || img }}
                                                style={styles.imageThumb}
                                            />
                                        ))}
                                    </View>
                                </View>
                            )}
                            {/* Fruits Harvested Images (only if not Pending or In Progress) */}
                            {status !== "Pending" && item.fruitHarvestedImages && item.fruitHarvestedImages.length > 0 && (
                                <View style={styles.imageRow}>
                                    <Text style={styles.imageLabel}>Fruits Harvested Images:</Text>
                                    <View style={styles.imageList}>
                                        {item.fruitHarvestedImages.map((img, idx) => (
                                            <Image
                                                key={idx}
                                                source={{ uri: img.url || img }}
                                                style={styles.imageThumb}
                                            />
                                        ))}
                                    </View>
                                </View>
                            )}
                        </View>
                    );
                }}
                ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 30 }}>No monitoring records found.</Text>}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f7f7f7", padding: 16 },
    header: { fontSize: 22, fontWeight: "bold", marginBottom: 18, textAlign: "center", color: "#333" },
    card: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 18,
        marginBottom: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.07,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    gourdType: { fontSize: 18, fontWeight: "bold", marginBottom: 6, color: "#4A7C59" },
    bold: { fontWeight: "bold" },
    imageRow: {
        marginTop: 8,
    },
    imageLabel: {
        fontWeight: "bold",
        marginBottom: 4,
        color: "#555",
    },
    imageList: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 4,
    },
    imageThumb: {
        width: 60,
        height: 60,
        borderRadius: 6,
        marginRight: 8,
        marginBottom: 8,
        backgroundColor: "#eee",
    },
});

export default UserMonitoringSummary;