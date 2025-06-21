import React, { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image, TouchableOpacity } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AuthGlobal from "../Context/Store/AuthGlobal";
import baseURL from "../assets/common/baseurl";
import Icon from 'react-native-vector-icons/MaterialIcons';

const UserMonitoringSummary = () => {
    const context = useContext(AuthGlobal);
    const userId = context.stateUser.user?.userId;
    const [monitorings, setMonitorings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedCard, setExpandedCard] = useState(null);

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

    // Calculate totals
    const totalMonitorings = monitorings.length;
    const totalPollinated = monitorings.reduce((sum, item) => {
        return sum + (Array.isArray(item.pollinatedFlowerImages) ? item.pollinatedFlowerImages.length : 0);
    }, 0);
    const totalHarvested = monitorings.reduce((sum, item) => {
        return sum + (Array.isArray(item.fruitHarvestedImages) ? item.fruitHarvestedImages.length : 0);
    }, 0);
    const successRate = totalPollinated > 0 ? ((totalHarvested / totalPollinated) * 100).toFixed(1) : 0;

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
            </View>
        );
    }

    const sortedMonitorings = [...monitorings].sort((a, b) => {
        const dateA = new Date(a.dateOfPollination || 0).getTime();
        const dateB = new Date(b.dateOfPollination || 0).getTime();
        return dateB - dateA;
    });

    const toggleExpandCard = (id) => {
        setExpandedCard(expandedCard === id ? null : id);
    };

    const renderItem = ({ item }) => {
        const pollinated = Array.isArray(item.pollinatedFlowerImages) ? item.pollinatedFlowerImages.length : 0;
        const harvested = Array.isArray(item.fruitHarvestedImages) ? item.fruitHarvestedImages.length : 0;
        const failed = pollinated - harvested;
        const percent = pollinated > 0 ? ((harvested / pollinated) * 100).toFixed(1) : "0.0";
        const status = item.status || "Pending";
        
        const statusColor = {
            "Completed": "#4CAF50",
            "Failed": "#F44336",
            "Pending": "#FFC107",
            "In Progress": "#2196F3"
        }[status] || "#9E9E9E";

        const isExpanded = expandedCard === item._id;

        return (
            <TouchableOpacity 
                style={styles.card}
                onPress={() => toggleExpandCard(item._id)}
                activeOpacity={0.9}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.gourdInfo}>
                        <Text style={styles.gourdType}>{item.gourdType?.name || "Unknown"}</Text>
                        <Text style={styles.dateText}>
                            {item.dateOfPollination ? new Date(item.dateOfPollination).toLocaleDateString() : "N/A"}
                        </Text>
                    </View>
                    
                    <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                        <Text style={styles.statusText}>{status}</Text>
                    </View>
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Icon name="local-florist" size={20} color="#4CAF50" />
                        <Text style={styles.statText}>{pollinated}</Text>
                        <Text style={styles.statLabel}>Pollinated</Text>
                    </View>

                    {status !== "Pending" && (
                        <>
                            <View style={styles.statItem}>
                                <Icon name="spa" size={20} color="#4CAF50" />
                                <Text style={styles.statText}>{harvested}</Text>
                                <Text style={styles.statLabel}>Harvested</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Icon name="cancel" size={20} color="#F44336" />
                                <Text style={styles.statText}>{failed}</Text>
                                <Text style={styles.statLabel}>Failed</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Icon name="trending-up" size={20} color="#2196F3" />
                                <Text style={styles.statText}>{percent}%</Text>
                                <Text style={styles.statLabel}>Success</Text>
                            </View>
                        </>
                    )}
                </View>

                {isExpanded && (
                    <View style={styles.expandedContent}>
                        {/* Pollinated Flower Images */}
                        {item.pollinatedFlowerImages?.length > 0 && (
                            <View style={styles.imageSection}>
                                <Text style={styles.sectionTitle}>Pollinated Flowers</Text>
                                <View style={styles.imageGrid}>
                                    {item.pollinatedFlowerImages.map((img, idx) => (
                                        <Image
                                            key={`pollinated-${idx}`}
                                            source={{ uri: img.url || img }}
                                            style={styles.image}
                                        />
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Fruits Harvested Images */}
                        {status !== "Pending" && item.fruitHarvestedImages?.length > 0 && (
                            <View style={styles.imageSection}>
                                <Text style={styles.sectionTitle}>Fruits Harvested</Text>
                                <View style={styles.imageGrid}>
                                    {item.fruitHarvestedImages.map((img, idx) => (
                                        <Image
                                            key={`harvested-${idx}`}
                                            source={{ uri: img.url || img }}
                                            style={styles.image}
                                        />
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>
                )}

                <View style={styles.expandButton}>
                    <Icon 
                        name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                        size={24} 
                        color="#757575" 
                    />
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Your Monitoring History</Text>
            
            {sortedMonitorings.length > 0 && (
                <View style={styles.summaryCard}>
                    <View style={styles.summaryRow}>
                        <View style={styles.summaryItem}>
                            <Icon name="assignment" size={24} color="#4CAF50" />
                            <Text style={styles.summaryNumber}>{totalMonitorings}</Text>
                            <Text style={styles.summaryLabel}>Monitorings</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Icon name="local-florist" size={24} color="#4CAF50" />
                            <Text style={styles.summaryNumber}>{totalPollinated}</Text>
                            <Text style={styles.summaryLabel}>Flowers Pollinated</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Icon name="trending-up" size={24} color="#2196F3" />
                            <Text style={styles.summaryNumber}>{successRate}%</Text>
                            <Text style={styles.summaryLabel}>Success Rate</Text>
                        </View>
                    </View>
                </View>
            )}

            {sortedMonitorings.length === 0 ? (
                <View style={styles.emptyState}>
                    <Icon name="assignment" size={50} color="#BDBDBD" />
                    <Text style={styles.emptyText}>No monitoring records found</Text>
                    <Text style={styles.emptySubtext}>Your pollination records will appear here</Text>
                </View>
            ) : (
                <FlatList
                    data={sortedMonitorings}
                    keyExtractor={item => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
        paddingHorizontal: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#F5F5F5",
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginVertical: 20,
        textAlign: 'center',
    },
    summaryCard: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    summaryItem: {
        alignItems: 'center',
        flex: 1,
    },
    summaryNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginVertical: 4,
    },
    summaryLabel: {
        fontSize: 12,
        color: '#757575',
        textAlign: 'center',
    },
    listContent: {
        paddingBottom: 20,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        marginBottom: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    gourdInfo: {
        flex: 1,
    },
    gourdType: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2E7D32',
    },
    dateText: {
        fontSize: 14,
        color: '#757575',
        marginTop: 4,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 12,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    statItem: {
        alignItems: 'center',
    },
    statText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginVertical: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#757575',
    },
    expandedContent: {
        marginTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        paddingTop: 16,
    },
    imageSection: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    imageGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 8,
        marginBottom: 8,
        backgroundColor: '#EEE',
    },
    expandButton: {
        alignItems: 'center',
        marginTop: 8,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 18,
        color: '#616161',
        marginTop: 16,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 14,
        color: '#9E9E9E',
        marginTop: 8,
        textAlign: 'center',
    },
});

export default UserMonitoringSummary;